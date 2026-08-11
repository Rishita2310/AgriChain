import React, { useState, useEffect, useRef } from 'react';
import { X, Bot, MessageSquare, ChevronLeft } from 'lucide-react';
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
        className="fixed bottom-6 right-6 z-50 group outline-none"
        aria-label="Open Kisan AI Chat"
      >
        <div className="relative flex items-center justify-center">
          <div className="relative flex items-center gap-2.5 bg-emerald-600 text-white px-5 py-3.5 rounded-full shadow-lg transition-all duration-200 hover:bg-emerald-700 hover:shadow-xl active:scale-95 border border-emerald-500">
            {isOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <>
                <MessageSquare className="w-5 h-5 text-white" />
                <span className="text-[15px] font-semibold tracking-wide">
                  Kisan AI
                </span>
              </>
            )}
          </div>
        </div>
      </button>

      {/* Backdrop blur overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-zinc-950/60 backdrop-blur-sm transition-opacity duration-300"
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
          {/* Professional Window */}
          <div className="relative h-full rounded-2xl overflow-hidden shadow-2xl border border-zinc-800 flex flex-col bg-zinc-900">
            {/* Header */}
            <div className="relative flex-shrink-0 px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950">
              <div className="flex items-center gap-3">
                {/* Mobile sidebar toggle */}
                <button
                  className="md:hidden p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  {isSidebarOpen ? <X className="w-5 h-5" /> : <MessageSquare className="w-5 h-5" />}
                </button>

                <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-emerald-600/10 border border-emerald-500/20">
                  <Bot className="w-5 h-5 text-emerald-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-zinc-100 text-[15px] tracking-tight">Kisan AI</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                    <p className="text-[11px] text-zinc-400 font-medium tracking-wide">Assistant · Online</p>
                  </div>
                </div>
              </div>
              <button
                onClick={handleClose}
                className="p-2 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="flex flex-1 overflow-hidden relative">
              {/* Mobile sidebar overlay */}
              {isSidebarOpen && (
                <div
                  className="absolute inset-0 bg-black/50 z-20 md:hidden"
                  onClick={() => setIsSidebarOpen(false)}
                />
              )}

              {/* Sidebar */}
              <div
                className={`absolute md:static inset-y-0 left-0 w-72 z-30 border-r border-zinc-800 transform transition-transform duration-300 flex flex-col bg-zinc-950/50
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}
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
