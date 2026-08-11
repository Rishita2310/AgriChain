import React, { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, User, Sparkles, Leaf, TrendingUp, ShoppingCart, CloudSun } from 'lucide-react';

const SUGGESTIONS = [
  { icon: TrendingUp, text: 'What is the current price of tomatoes?' },
  { icon: Leaf, text: 'How do I protect my crops from pests?' },
  { icon: ShoppingCart, text: 'Best time to sell wheat?' },
  { icon: CloudSun, text: 'What crops grow best in monsoon?' },
];

function MessageBubble({ msg, index }) {
  const isUser = msg.sender === 'user';
  return (
    <div
      className={`flex items-end gap-3 max-w-3xl mx-auto w-full ${isUser ? 'flex-row-reverse' : ''}`}
      style={{
        animation: `fadeSlideIn 0.3s ease forwards`,
        animationDelay: `${index * 0.03}s`,
        opacity: 0,
      }}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-emerald-600'
            : 'bg-zinc-800 border border-zinc-700'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-emerald-500" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isUser && (
          <span className="text-[11px] text-zinc-500 font-medium tracking-wide px-1">
            Kisan AI
          </span>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap shadow-sm ${
            isUser
              ? 'bg-emerald-600 text-white rounded-br-sm'
              : 'bg-zinc-800 border border-zinc-700 text-zinc-200 rounded-bl-sm'
          }`}
        >
          {msg.message}
        </div>
      </div>
    </div>
  );
}

export default function ChatWindow({ messages, isLoading, onSendMessage }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSubmit = (e) => {
    e?.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim());
      setInput('');
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    }
  };

  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
  };

  return (
    <>
      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-6px); opacity: 1; }
        }
        .dot-1 { animation: dotBounce 1.4s infinite; }
        .dot-2 { animation: dotBounce 1.4s infinite 0.2s; }
        .dot-3 { animation: dotBounce 1.4s infinite 0.4s; }
      `}</style>

      <div className="flex flex-col h-full">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-6 space-y-5 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              {/* Hero icon */}
              <div className="mb-6 flex justify-center">
                <div className="w-16 h-16 rounded-2xl bg-emerald-600/10 border border-emerald-500/20 flex items-center justify-center">
                  <Bot className="w-8 h-8 text-emerald-500" />
                </div>
              </div>

              <h2 className="text-xl font-semibold text-zinc-100 mb-2">
                How can I help you today?
              </h2>
              <p className="text-zinc-400 text-sm max-w-xs leading-relaxed mb-8">
                Ask me anything about farming, crop prices, market trends, or agricultural best practices.
              </p>

              {/* Suggestion chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTIONS.map(({ icon: Icon, text }, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(text)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/80 hover:border-zinc-700 text-left transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center flex-shrink-0">
                      <Icon className="w-4 h-4 text-emerald-500" />
                    </div>
                    <span className="text-zinc-300 text-xs font-medium leading-snug">
                      {text}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => (
                <MessageBubble key={msg._id || index} msg={msg} index={index} />
              ))}
            </>
          )}

          {/* Loading indicator */}
          {isLoading && (
            <div className="flex items-end gap-3 max-w-3xl mx-auto w-full">
              <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="px-4 py-3 rounded-2xl rounded-bl-sm border border-zinc-700 bg-zinc-800 flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full dot-1" />
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full dot-2" />
                <div className="w-1.5 h-1.5 bg-zinc-500 rounded-full dot-3" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0 p-4 bg-zinc-950 border-t border-zinc-800">
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 rounded-xl border border-zinc-700 bg-zinc-900 p-2 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500/50 transition-all">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleTextareaChange}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Message Kisan AI..."
                className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm resize-none outline-none leading-relaxed py-1.5 px-2"
                style={{ minHeight: '32px', maxHeight: '120px' }}
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:hover:bg-emerald-600 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5 ml-0.5" />
                )}
              </button>
            </div>
            <p className="text-center text-[11px] text-zinc-500 mt-2">
              Kisan AI can make mistakes. Verify important farming decisions.
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
