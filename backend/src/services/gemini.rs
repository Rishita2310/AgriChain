use reqwest::Client;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use std::fmt;

// ─── API Key ─────────────────────────────────────────────────────────────────
// Hardcoded for development. Move to env var for production.
const GEMINI_API_KEY: &str = "YOUR_GEMINI_API_KEY";

const GEMINI_API_URL: &str =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

const MAX_MESSAGE_LENGTH: usize = 2000;

const SYSTEM_PROMPT: &str = "\
You are Kisan AI, an expert agricultural assistant for Indian farmers and buyers \
on the AgriChain platform. You help with:\n\
- Crop pricing and market trends\n\
- Pest control and disease management\n\
- Weather advisories and irrigation tips\n\
- Best farming practices\n\
- Supply chain and selling strategies\n\
- Government schemes and subsidies\n\n\
Be concise, practical, and use simple language. When relevant, mention prices in INR, \
Indian states, and seasonal crop cycles. Always be encouraging and farmer-friendly.";

// ─── Error Type ───────────────────────────────────────────────────────────────

#[derive(Debug)]
pub enum GeminiError {
    InvalidApiKey,
    RateLimited,
    NetworkError(String),
    Timeout,
    EmptyResponse,
    InvalidJson(String),
    ApiError(u16, String),
}

impl fmt::Display for GeminiError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            GeminiError::InvalidApiKey => write!(f, "Invalid or expired Gemini API key"),
            GeminiError::RateLimited => write!(f, "Gemini API rate limit exceeded. Please try again later."),
            GeminiError::NetworkError(e) => write!(f, "Network error: {}", e),
            GeminiError::Timeout => write!(f, "Request to Gemini API timed out"),
            GeminiError::EmptyResponse => write!(f, "Gemini returned an empty response"),
            GeminiError::InvalidJson(e) => write!(f, "Failed to parse Gemini response: {}", e),
            GeminiError::ApiError(code, msg) => write!(f, "Gemini API error {}: {}", code, msg),
        }
    }
}

// ─── Conversation Entry ────────────────────────────────────────────────────────

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HistoryEntry {
    pub role: String,   // "user" or "model"
    pub text: String,
}

// ─── Gemini Service ───────────────────────────────────────────────────────────

#[derive(Clone)]
pub struct GeminiService {
    client: Client,
}

impl GeminiService {
    pub fn new() -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(30))
            .build()
            .expect("Failed to build reqwest client");

        Self { client }
    }

    /// Validate message before sending to Gemini
    pub fn validate_message(message: &str) -> Result<&str, &'static str> {
        let trimmed = message.trim();
        if trimmed.is_empty() {
            return Err("Message cannot be empty");
        }
        if trimmed.len() > MAX_MESSAGE_LENGTH {
            return Err("Message exceeds maximum length of 2000 characters");
        }
        Ok(trimmed)
    }

    /// Generate an AI reply, optionally with conversation history for context
    pub async fn generate_reply(
        &self,
        history: &[HistoryEntry],
        message: &str,
    ) -> Result<String, GeminiError> {
        // Build the contents array: system prompt + history + current message
        let mut contents: Vec<Value> = Vec::new();

        // Add conversation history for context (last 10 exchanges to stay within token limits)
        let history_slice = if history.len() > 20 { &history[history.len() - 20..] } else { history };
        for entry in history_slice {
            let role = if entry.role == "assistant" { "model" } else { "user" };
            contents.push(json!({
                "role": role,
                "parts": [{ "text": entry.text }]
            }));
        }

        // Add current user message
        contents.push(json!({
            "role": "user",
            "parts": [{ "text": message }]
        }));

        let body = json!({
            "system_instruction": {
                "parts": [{ "text": SYSTEM_PROMPT }]
            },
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7,
                "topK": 40,
                "topP": 0.95,
                "maxOutputTokens": 1024,
                "stopSequences": []
            },
            "safetySettings": [
                { "category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_MEDIUM_AND_ABOVE" },
                { "category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_MEDIUM_AND_ABOVE" }
            ]
        });

        tracing::debug!("Sending request to Gemini API");

        let response = self
            .client
            .post(GEMINI_API_URL)
            .header("Content-Type", "application/json")
            .header("x-goog-api-key", GEMINI_API_KEY)
            .json(&body)
            .send()
            .await
            .map_err(|e| {
                if e.is_timeout() {
                    GeminiError::Timeout
                } else {
                    GeminiError::NetworkError(e.to_string())
                }
            })?;

        let status = response.status();

        if !status.is_success() {
            let err_body = response.text().await.unwrap_or_default();
            tracing::error!("Gemini API error {}: {}", status.as_u16(), err_body);

            return Err(match status.as_u16() {
                400 => GeminiError::ApiError(400, format!("Bad request: {}", err_body)),
                401 | 403 => GeminiError::InvalidApiKey,
                429 => GeminiError::RateLimited,
                code => GeminiError::ApiError(code, err_body),
            });
        }

        let resp_json: Value = response.json().await.map_err(|e| {
            GeminiError::InvalidJson(e.to_string())
        })?;

        tracing::debug!("Gemini raw response: {:?}", resp_json);

        // Parse: candidates[0].content.parts[0].text
        let text = resp_json
            .get("candidates")
            .and_then(|c| c.get(0))
            .and_then(|c| c.get("content"))
            .and_then(|c| c.get("parts"))
            .and_then(|p| p.get(0))
            .and_then(|p| p.get("text"))
            .and_then(|t| t.as_str())
            .map(|s| s.trim().to_string());

        match text {
            Some(t) if !t.is_empty() => Ok(t),
            _ => {
                // Check for blocked content
                if let Some(reason) = resp_json
                    .get("candidates")
                    .and_then(|c| c.get(0))
                    .and_then(|c| c.get("finishReason"))
                    .and_then(|r| r.as_str())
                {
                    if reason == "SAFETY" {
                        return Ok("I'm unable to respond to that message due to safety guidelines.".to_string());
                    }
                }
                Err(GeminiError::EmptyResponse)
            }
        }
    }
}

impl Default for GeminiService {
    fn default() -> Self {
        Self::new()
    }
}
