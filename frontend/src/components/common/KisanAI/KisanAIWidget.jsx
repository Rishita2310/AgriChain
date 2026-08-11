import React, { useState, useEffect, useRef } from 'react';
import { X, Sparkles, MessageSquare, ChevronLeft } from 'lucide-react';
import ChatSidebar from './ChatSidebar';
import ChatWindow from './ChatWindow';
import { kisanAIService } from '../../../services/kisanAI.service';
import toast from 'react-hot-toast';

export default function KisanAIWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingConversations, setIsFetchingConversations] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 10);
      loadConversations();
    } else {
      setIsVisible(false);
    }
  }, [isOpen]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => setIsOpen(false), 300);
  };

  const loadConversations = async () => {
    try {
      setIsFetchingConversations(true);
      const data = await kisanAIService.getConversations();
      setConversations(data);
      if (data.length > 0 && !activeConversation) {
        loadConversationHistory(data[0]._id?.$oid || data[0].id?.$oid || data[0]._id);
      } else if (data.length === 0) {
        startNewConversation();
      }
    } catch (error) {
      console.error('Failed to load conversations', error);
      toast.error('Could not load chat history');
    } finally {
      setIsFetchingConversations(false);
    }
  };

  const loadConversationHistory = async (id) => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await kisanAIService.getConversationHistory(id);
      setActiveConversation(data.conversation);
      setMessages(data.messages);
      if (window.innerWidth < 768) setIsSidebarOpen(false);
    } catch (error) {
      console.error('Failed to load conversation history', error);
      toast.error('Could not load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const startNewConversation = () => {
    setActiveConversation(null);
    setMessages([]);
    if (window.innerWidth < 768) setIsSidebarOpen(false);
  };

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;

    const tempUserMsg = {
      _id: Date.now().toString(),
      sender: 'user',
      message: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    setIsLoading(true);

    try {
      let convId = activeConversation
        ? activeConversation._id?.$oid || activeConversation.id?.$oid || activeConversation._id
        : null;
      const isNewConversation = !convId;
      const data = await kisanAIService.sendMessage(text, convId);

      setMessages((prev) => [...prev, data.message]);

      if (isNewConversation && data.conversation_id) {
        setActiveConversation({ _id: data.conversation_id });
        try {
          const convs = await kisanAIService.getConversations();
          setConversations(convs);
        } catch (e) {
          console.error('Failed to refresh conversations', e);
        }
      }
    } catch (error) {
      console.error('Failed to send message', error);
      toast.error('Error communicating with Kisan AI');
      setMessages((prev) => prev.filter((m) => m._id !== tempUserMsg._id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteConversation = async (id) => {
    try {
      await kisanAIService.deleteConversation(id);
      toast.success('Conversation deleted');
      if (
        activeConversation &&
        (activeConversation._id?.$oid || activeConversation.id?.$oid || activeConversation._id) === id
      ) {
        startNewConversation();
      }
      loadConversations();
    } catch (error) {
      toast.error('Failed to delete conversation');
    }
  };

  const handleRenameConversation = async (id, newTitle) => {
    try {
      await kisanAIService.renameConversation(id, newTitle);
      loadConversations();
    } catch (error) {
      toast.error('Failed to rename conversation');
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 group"
        aria-label="Open Kisan AI Chat"
      >
        <div className="relative">
          {/* Pulse ring */}
          <div className="absolute inset-0 rounded-full bg-emerald-500 opacity-30 animate-ping" />
          <div className="relative flex items-center gap-2 bg-gradient-to-br from-emerald-500 to-teal-600 text-white px-4 py-3 rounded-full shadow-2xl shadow-emerald-500/40 hover:shadow-emerald-500/60 transition-all duration-300 hover:scale-105 active:scale-95">
            {isOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <>
                <Sparkles className="w-5 h-5 text-yellow-300" />
                <span className="text-sm font-bold tracking-wide">Kisan AI</span>
              </>
            )}
          </div>
        </div>
      </button>

      {/* Backdrop blur overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] transition-opacity duration-300"
          style={{ opacity: isVisible ? 1 : 0 }}
          onClick={handleClose}
        />
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className="fixed bottom-24 right-6 z-50 w-[95vw] md:w-[860px] h-[85vh] md:h-[640px] transition-all duration-300"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0) scale(1)' : 'translateY(20px) scale(0.97)',
          }}
        >
          {/* Glass card */}
          <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl shadow-black/30 border border-white/20 flex flex-col"
            style={{
              background: 'linear-gradient(135deg, #0f1117 0%, #111827 50%, #0d1f17 100%)',
            }}
          >
            {/* Decorative background glow */}
            <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="relative flex-shrink-0 px-5 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                {/* Mobile sidebar toggle */}
                <button
                  className="md:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  {isSidebarOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </button>

                <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 border border-emerald-400/30">
                  <Sparkles className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base leading-tight">Kisan AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    <p className="text-[11px] text-emerald-400/80 font-medium">Smart Farming Assistant · Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden relative">
              {/* Mobile sidebar overlay */}
              {isSidebarOpen && (
                <div
                  className="absolute inset-0 bg-black/60 z-20 md:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}

              {/* Sidebar */}
              <div
                className={`absolute md:static inset-y-0 left-0 w-72 z-30 border-r border-white/10 transform transition-transform duration-300 flex flex-col
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
                style={{ background: 'rgba(255,255,255,0.03)' }}
              >
                <ChatSidebar
                  conversations={conversations}
                  activeConversation={activeConversation}
                  onSelectConversation={loadConversationHistory}
                  onNewConversation={startNewConversation}
                  onDelete={handleDeleteConversation}
                  onRename={handleRenameConversation}
                  isFetching={isFetchingConversations}
                />
              </div>

              {/* Chat Window */}
              <div className="flex-1 flex flex-col min-w-0 relative">
                <ChatWindow
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={handleSendMessage}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
