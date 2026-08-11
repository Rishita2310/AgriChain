import React, { useState } from 'react';
import { Plus, MessageSquare, Trash2, Edit2, Check, X, Loader2, Search } from 'lucide-react';

function timeAgo(dateValue) {
  if (!dateValue) return '';
  const date = new Date(dateValue?.$date || dateValue);
  if (isNaN(date)) return '';
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
}

export default function ChatSidebar({
  conversations,
  activeConversation,
  onSelectConversation,
  onNewConversation,
  onDelete,
  onRename,
  isFetching,
}) {
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const startEdit = (e, conv) => {
    e.stopPropagation();
    setEditingId(conv._id?.$oid || conv.id?.$oid || conv._id);
    setEditTitle(conv.title);
  };

  const saveEdit = (e, id) => {
    e.stopPropagation();
    if (editTitle.trim()) onRename(id, editTitle.trim());
    setEditingId(null);
  };

  const cancelEdit = (e) => {
    e.stopPropagation();
    setEditingId(null);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Delete this conversation?')) onDelete(id);
  };

  const filteredConversations = conversations.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-3 border-b border-white/10 flex-shrink-0">
        {/* New Chat Button */}
        <button
          onClick={onNewConversation}
          className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-emerald-400/30 text-emerald-400 text-sm font-bold hover:bg-emerald-400/10 hover:border-emerald-400/50 transition-all group"
          style={{ background: 'rgba(52, 211, 153, 0.05)' }}
        >
          <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
          New Chat
        </button>

        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/30" />
          <input
            type="text"
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 text-white/80 placeholder-white/25 text-xs rounded-lg pl-8 pr-3 py-2 outline-none focus:border-emerald-400/40 focus:bg-white/8 transition-all"
          />
        </div>
      </div>

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {isFetching ? (
          <div className="flex justify-center p-6">
            <Loader2 className="w-5 h-5 animate-spin text-emerald-400/50" />
          </div>
        ) : filteredConversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-6 text-center">
            <MessageSquare className="w-8 h-8 text-white/10 mb-2" />
            <p className="text-xs text-white/25 font-medium">
              {searchQuery ? 'No results found' : 'No conversations yet'}
            </p>
          </div>
        ) : (
          filteredConversations.map((conv) => {
            const id = conv._id?.$oid || conv.id?.$oid || conv._id;
            const isActive =
              activeConversation &&
              (activeConversation._id?.$oid ||
                activeConversation.id?.$oid ||
                activeConversation._id) === id;

            return (
              <div
                key={id}
                onClick={() => onSelectConversation(id)}
                className={`group relative flex flex-col p-3 rounded-xl cursor-pointer transition-all ${
                  isActive
                    ? 'border border-emerald-400/30 text-white'
                    : 'border border-transparent hover:border-white/10 text-white/70 hover:text-white'
                }`}
                style={
                  isActive
                    ? { background: 'rgba(52, 211, 153, 0.08)' }
                    : { background: 'transparent' }
                }
              >
                {editingId === id ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') saveEdit(e, id);
                        if (e.key === 'Escape') cancelEdit(e);
                      }}
                      className="flex-1 bg-white/10 border border-emerald-400/50 text-white rounded-lg px-2 py-1 text-xs outline-none font-medium"
                      autoFocus
                    />
                    <button
                      onClick={(e) => saveEdit(e, id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="p-1 text-white/40 hover:text-white/70 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2.5 pr-12">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          isActive ? 'bg-emerald-400/20' : 'bg-white/5'
                        }`}
                      >
                        <MessageSquare
                          className={`w-3 h-3 ${isActive ? 'text-emerald-400' : 'text-white/30'}`}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs font-semibold truncate">{conv.title}</h4>
                        {conv.updated_at && (
                          <p className="text-[10px] text-white/30 mt-0.5">
                            {timeAgo(conv.updated_at)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => startEdit(e, conv)}
                        className="p-1.5 text-white/30 hover:text-emerald-400 rounded-lg hover:bg-emerald-400/10 transition-all"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, id)}
                        className="p-1.5 text-white/30 hover:text-red-400 rounded-lg hover:bg-red-400/10 transition-all"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 flex-shrink-0">
        <p className="text-[10px] text-white/20 text-center font-medium">
          Powered by Google Gemini AI
        </p>
      </div>
    </div>
  );
}
