import React, { useState, useEffect, useRef } from 'react';
import { Bell, Package, CreditCard, Star, Activity, Check, CheckCircle2, ChevronRight, Loader2 } from 'lucide-react';
import { notificationService } from '../../services/notification.service';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const fetchNotifications = async (isBackground = false) => {
    if (!isBackground) setLoading(true);
    try {
      const [allNotifs, unread] = await Promise.all([
        notificationService.getAll(),
        notificationService.getUnreadCount()
      ]);
      setNotifications(allNotifs.slice(0, 5)); // Just top 5 for dropdown
      setUnreadCount(unread.unread_count);
    } catch (err) {
      console.error("Failed to fetch notifications");
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Optimized Short-Polling every 10 seconds for real-time feel
    const interval = setInterval(() => fetchNotifications(true), 10000);
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e.stopPropagation();
    try {
      await notificationService.markAsRead(id);
      fetchNotifications(true);
    } catch (err) {
      console.error("Error marking read");
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'Order': return <Package className="w-5 h-5 text-blue-500" />;
      case 'Payment': return <CreditCard className="w-5 h-5 text-green-500" />;
      case 'Review': return <Star className="w-5 h-5 text-yellow-500" />;
      default: return <Activity className="w-5 h-5 text-gray-500" />;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-500 hover:text-primary transition-colors bg-gray-50 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 z-50 overflow-hidden transform origin-top-right transition-all">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-bold text-gray-900 flex items-center gap-2">
              Notifications {unreadCount > 0 && <span className="bg-red-100 text-red-600 text-xs px-2 py-0.5 rounded-full">{unreadCount}</span>}
            </h3>
            {unreadCount > 0 && (
              <button 
                onClick={async () => {
                  await notificationService.markAllAsRead();
                  fetchNotifications(true);
                }}
                className="text-xs text-primary font-bold hover:underline flex items-center gap-1"
              >
                <CheckCircle2 className="w-3 h-3" /> Mark all read
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {loading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-gray-300" />
                <p className="text-sm">You're all caught up!</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {notifications.map((notif) => (
                  <div 
                    key={notif._id} 
                    className={`p-4 hover:bg-gray-50 transition-colors cursor-pointer group flex gap-3 ${!notif.is_read ? 'bg-blue-50/30' : ''}`}
                    onClick={() => {
                      setIsOpen(false);
                      const base = user?.role === 'Farmer' ? '/farmer' : '/buyer';
                      navigate(`${base}/notifications`);
                    }}
                  >
                    <div className={`p-2 rounded-full h-fit flex-shrink-0 ${!notif.is_read ? 'bg-white shadow-sm border border-gray-100' : 'bg-gray-100'}`}>
                      {getIcon(notif.notification_type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm mb-1 ${!notif.is_read ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                        {notif.title}
                      </p>
                      <p className="text-xs text-gray-500 line-clamp-2">{notif.description}</p>
                      <p className="text-[10px] text-gray-400 mt-2 font-medium">
                        {new Date(notif.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </p>
                    </div>
                    {!notif.is_read && (
                      <button 
                        onClick={(e) => handleMarkAsRead(notif._id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 text-blue-600 hover:bg-blue-100 rounded-full transition-all self-center"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-gray-100 bg-gray-50 text-center">
            <button 
              onClick={() => {
                setIsOpen(false);
                const base = user?.role === 'Farmer' ? '/farmer' : '/buyer';
                navigate(`${base}/notifications`);
              }}
              className="text-sm font-bold text-gray-600 hover:text-primary transition-colors inline-flex items-center gap-1"
            >
              View All Notifications <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
