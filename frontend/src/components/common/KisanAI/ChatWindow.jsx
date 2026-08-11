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
        className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isUser
            ? 'bg-gradient-to-br from-emerald-500 to-teal-600'
            : 'bg-gradient-to-br from-white/10 to-white/5 border border-white/20'
        }`}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Sparkles className="w-4 h-4 text-emerald-400" />
        )}
      </div>

      {/* Bubble */}
      <div className={`max-w-[80%] ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        {!isUser && (
          <span className="text-[10px] text-emerald-400/60 font-semibold tracking-wider uppercase px-1">
            Kisan AI
          </span>
        )}
        <div
          className={`px-4 py-3 rounded-2xl text-[14px] leading-relaxed whitespace-pre-wrap ${
            isUser
              ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white rounded-br-sm shadow-lg shadow-emerald-500/20'
              : 'bg-white/8 border border-white/10 text-white/90 rounded-bl-sm backdrop-blur-sm'
          }`}
          style={!isUser ? { background: 'rgba(255,255,255,0.07)' } : {}}
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
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 border border-emerald-400/30 flex items-center justify-center">
                  <Sparkles className="w-9 h-9 text-emerald-400" />
                </div>
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full" />
                </div>
              </div>

              <h2 className="text-2xl font-black text-white mb-2">
                How can I help you today?
              </h2>
              <p className="text-white/40 text-sm max-w-xs font-medium leading-relaxed mb-8">
                Ask me anything about farming, crop prices, market trends, or agricultural best practices.
              </p>

              {/* Suggestion chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-md">
                {SUGGESTIONS.map(({ icon: Icon, text }, i) => (
                  <button
                    key={i}
                    onClick={() => onSendMessage(text)}
                    className="flex items-center gap-3 p-3 rounded-xl border border-white/10 text-left hover:border-emerald-400/40 hover:bg-emerald-400/5 transition-all group"
                    style={{ background: 'rgba(255,255,255,0.04)' }}
                  >
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/10 flex items-center justify-center flex-shrink-0 group-hover:bg-emerald-400/20 transition-colors">
                      <Icon className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-white/60 text-xs font-medium group-hover:text-white/90 transition-colors leading-snug">
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
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/20 flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-4 h-4 text-emerald-400" />
              </div>
              <div
                className="px-5 py-4 rounded-2xl rounded-bl-sm border border-white/10 flex items-center gap-2"
                style={{ background: 'rgba(255,255,255,0.07)' }}
              >
                <div className="w-2 h-2 bg-emerald-400 rounded-full dot-1" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full dot-2" />
                <div className="w-2 h-2 bg-emerald-400 rounded-full dot-3" />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} className="h-2" />
        </div>

        {/* Input Bar */}
        <div className="flex-shrink-0 p-4 border-t border-white/10" style={{ background: 'rgba(0,0,0,0.2)' }}>
          <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
            <div
              className="flex items-end gap-3 rounded-2xl border border-white/10 p-3 transition-all focus-within:border-emerald-400/50"
              style={{ background: 'rgba(255,255,255,0.06)' }}
            >
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
                placeholder="Ask Kisan AI anything..."
                className="flex-1 bg-transparent text-white placeholder-white/30 text-sm resize-none outline-none leading-relaxed"
                style={{ minHeight: '24px', maxHeight: '120px' }}
                rows={1}
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="flex-shrink-0 w-9 h-9 flex items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white transition-all hover:scale-105 active:scale-95 disabled:opacity-40 disabled:scale-100 shadow-lg shadow-emerald-500/30"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-center text-[10px] text-white/20 mt-2 font-medium">
              Kisan AI may make mistakes · Verify important farming decisions
            </p>
          </form>
        </div>
      </div>
    </>
  );
}
