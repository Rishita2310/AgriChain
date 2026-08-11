use serde::{Deserialize, Serialize};
use rand::RngExt;

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct PricePrediction {
    pub crop_name: String,
    pub recommended_price: f64,
    pub current_market_average: f64,
    pub msp_benchmark: f64,
    pub expected_profit_percentage: f64,
    pub confidence_score: i32,
    pub reason: String,
    pub price_trend_30_days: Vec<f64>,
    pub organic_premium: f64,
    pub suggested_action: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct DemandForecast {
    pub crop_name: String,
    pub demand_level: String,
    pub confidence_score: i32,
    pub forecast_7_days: Vec<i32>,
    pub expected_growth_percentage: i32,
    pub reason: String,
    pub stock_depletion_days: i32,
    pub buyer_inquiries_count: i32,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct BestSellingTime {
    pub best_day: String,
    pub best_time: String,
    pub alternative_time: String,
    pub visibility_increase: i32,
    pub sales_increase: i32,
    pub heatmap_data: Vec<i32>, // 7 days metric
    pub market_activity_peak: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct AgriWeatherAdvisory {
    pub region: String,
    pub temperature: String,
    pub rainfall_probability: String,
    pub soil_moisture_condition: String,
    pub shelf_life_advisory: String,
    pub pest_risk_level: String,
    pub harvest_recommendation: String,
}

pub struct AIEngine;

impl AIEngine {
    /// Returns crop-specific benchmark Mandi price & MSP
    pub fn get_crop_benchmark(crop_name: &str) -> (f64, f64) {
        let name_lower = crop_name.to_lowercase();
        if name_lower.contains("tomato") {
            (42.0, 22.0)
        } else if name_lower.contains("potato") {
            (24.0, 16.0)
        } else if name_lower.contains("onion") {
            (36.0, 20.0)
        } else if name_lower.contains("wheat") {
            (32.5, 24.25)
        } else if name_lower.contains("basmati") || (name_lower.contains("rice") && name_lower.contains("premium")) {
            (95.0, 45.0)
        } else if name_lower.contains("rice") || name_lower.contains("paddy") {
            (42.0, 23.0)
        } else if name_lower.contains("cotton") {
            (72.0, 66.2)
        } else if name_lower.contains("garlic") {
            (145.0, 80.0)
        } else if name_lower.contains("ginger") {
            (115.0, 65.0)
        } else if name_lower.contains("mango") {
            (210.0, 110.0)
        } else if name_lower.contains("apple") {
            (140.0, 75.0)
        } else if name_lower.contains("chana") || name_lower.contains("gram") {
            (78.0, 54.4)
        } else if name_lower.contains("mustard") {
            (64.0, 56.5)
        } else if name_lower.contains("corn") || name_lower.contains("maize") {
            (26.0, 20.9)
        } else if name_lower.contains("sugarcane") {
            (36.0, 31.5)
        } else {
            // General produce default
            (45.0, 25.0)
        }
    }

    pub fn generate_price_prediction(crop_name: &str, current_farmer_price: f64, is_organic: bool) -> PricePrediction {
        let mut rng = rand::rng();
        let (mandi_base, msp) = Self::get_crop_benchmark(crop_name);

        let _base = if current_farmer_price > 5.0 {
            current_farmer_price
        } else {
            mandi_base
        };

        let market_avg = mandi_base * rng.random_range(0.95..1.08);
        let organic_boost = if is_organic { 1.18 } else { 1.05 };
        let recommended = (market_avg * organic_boost).round();

        let mut trend = Vec::new();
        let mut current = market_avg * 0.88;
        for _ in 0..30 {
            current += current * rng.random_range(-0.015..0.025);
            trend.push((current * 100.0).round() / 100.0);
        }

        let profit_pct = (((recommended - market_avg) / market_avg) * 100.0 + 14.5).round();

        let reason = if is_organic {
            format!("Verified organic quality for {} commands a 18-22% premium above regional Mandi average due to strong direct urban buyer demand.", crop_name)
        } else {
            format!("Wholesale Mandi arrivals for {} are stabilizing with expected festive and restaurant procurement surge over the next 14 days.", crop_name)
        };

        let suggested_action = if current_farmer_price < market_avg * 0.85 {
            "Your listing is priced below market benchmark. Increase price to boost revenue.".to_string()
        } else if current_farmer_price > market_avg * 1.35 {
            "Your listing price is significantly higher than regional average. Consider bundle discounts to accelerate sales.".to_string()
        } else {
            "Optimal competitive price positioned right at the profit-maximizing zone.".to_string()
        };

        PricePrediction {
            crop_name: crop_name.to_string(),
            recommended_price: (recommended * 10.0).round() / 10.0,
            current_market_average: (market_avg * 10.0).round() / 10.0,
            msp_benchmark: msp,
            expected_profit_percentage: profit_pct,
            confidence_score: rng.random_range(89..98),
            reason,
            price_trend_30_days: trend,
            organic_premium: if is_organic { 18.5 } else { 0.0 },
            suggested_action,
        }
    }

    pub fn generate_demand_forecast(crop_name: &str) -> DemandForecast {
        let mut rng = rand::rng();
        let mut forecast = Vec::new();
        let mut base = rng.random_range(85..140);
        for _ in 0..7 {
            base += rng.random_range(-5..22);
            forecast.push(base);
        }

        let demand_level = match rng.random_range(1..=3) {
            1 => "High Demand".to_string(),
            2 => "Very High Demand".to_string(),
            _ => "Surging Demand".to_string(),
        };

        let growth = rng.random_range(24..45);

        DemandForecast {
            crop_name: crop_name.to_string(),
            demand_level,
            confidence_score: rng.random_range(88..97),
            forecast_7_days: forecast,
            expected_growth_percentage: growth,
            reason: format!("Marketplace buyer search volume for {} has increased by {}% week-over-week across major Tier-1 & Tier-2 delivery hubs.", crop_name, growth),
            stock_depletion_days: rng.random_range(4..9),
            buyer_inquiries_count: rng.random_range(12..38),
        }
    }

    pub fn generate_best_time() -> BestSellingTime {
        let mut rng = rand::rng();
        let mut heatmap = Vec::new();
        for _ in 0..7 {
            heatmap.push(rng.random_range(45..98));
        }

        BestSellingTime {
            best_day: "Friday & Saturday".to_string(),
            best_time: "07:30 AM - 10:30 AM".to_string(),
            alternative_time: "05:00 PM - 07:30 PM".to_string(),
            visibility_increase: 48,
            sales_increase: 28,
            heatmap_data: heatmap,
            market_activity_peak: "Morning wholesale procurement & weekend consumer batches".to_string(),
        }
    }

    pub fn generate_weather_advisory(location: &str) -> AgriWeatherAdvisory {
        AgriWeatherAdvisory {
            region: location.to_string(),
            temperature: "28°C - 32°C (Optimal for harvest)".to_string(),
            rainfall_probability: "15% - Clear Sky & Dry Weather".to_string(),
            soil_moisture_condition: "Moderate (Ideal for grading & sun drying)".to_string(),
            shelf_life_advisory: "Store in well-ventilated dry crate storage. Shelf life stable for 7-10 days.".to_string(),
            pest_risk_level: "Low Risk (Dry condition reduces fungal incidence)".to_string(),
            harvest_recommendation: "Favorable window for early morning crop harvesting and direct packaging.".to_string(),
        }
    }
}
