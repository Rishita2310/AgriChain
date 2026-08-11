import React, { useEffect, useState } from 'react';
import { notificationService } from '../../../../services/notification.service';
import { Bell, Package, CreditCard, Star, Activity, Check, Trash2, CheckCircle2, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  const fetchNotifications = async () => {
    try {
      const data = await notificationService.getAll();
      setNotifications(data);
    } catch (err) {
      toast.error('Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(notifications.map(n => n._id === id ? { ...n, is_read: true } : n));
    } catch (err) {
      toast.error('Error marking as read');
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(notifications.map(n => ({ ...n, is_read: true })));
      toast.success('All marked as read');
    } catch (err) {
      toast.error('Error updating notifications');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm("Are you sure you want to delete all notifications?")) return;
    try {
      await notificationService.clearAll();
      setNotifications([]);
      toast.success('Notifications cleared');
    } catch (err) {
      toast.error('Error clearing notifications');
    }
  };

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'Unread') return !n.is_read;
    if (filter === 'Read') return n.is_read;
    if (filter === 'Orders') return n.notification_type === 'Order';
    if (filter === 'Payments') return n.notification_type === 'Payment';
    if (filter === 'Reviews') return n.notification_type === 'Review';
    return true; // 'All'
  });

  const getIcon = (type) => {
    switch (type) {
      case 'Order': return <Package className="w-6 h-6 text-blue-500" />;
      case 'Payment': return <CreditCard className="w-6 h-6 text-green-500" />;
      case 'Review': return <Star className="w-6 h-6 text-yellow-500" />;
      default: return <Activity className="w-6 h-6 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
        <p className="text-gray-500">Loading notifications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" /> Notifications
          </h1>
          <p className="text-sm text-gray-500 mt-1">Manage your alerts and activities.</p>
        </div>
        
        <div className="flex items-center gap-2">
           <button 
             onClick={handleMarkAllRead} 
             className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
           >
             <CheckCircle2 className="w-4 h-4" /> Mark All Read
           </button>
           <button 
             onClick={handleClearAll} 
             className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center gap-2 transition-colors"
           >
             <Trash2 className="w-4 h-4" /> Clear All
           </button>
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {['All', 'Unread', 'Read', 'Orders', 'Payments', 'Reviews'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-colors border ${
              filter === f ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
            }`}
          >
            {f} {f === 'Unread' && notifications.filter(n => !n.is_read).length > 0 && `(${notifications.filter(n => !n.is_read).length})`}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filteredNotifications.length === 0 ? (
          <div className="p-12 text-center text-gray-500 flex flex-col items-center">
            <Bell className="w-12 h-12 text-gray-300 mb-4" />
            <p className="text-lg font-bold text-gray-900">No Notifications</p>
            <p className="text-sm mt-1">You're all caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {filteredNotifications.map((notif) => (
              <div 
                key={notif._id} 
                className={`p-6 flex items-start gap-4 transition-colors ${!notif.is_read ? 'bg-blue-50/20' : 'hover:bg-gray-50'}`}
              >
                <div className={`p-3 rounded-full flex-shrink-0 ${!notif.is_read ? 'bg-white shadow-sm border border-gray-100' : 'bg-gray-50'}`}>
                  {getIcon(notif.notification_type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className={`text-base mb-1 ${!notif.is_read ? 'font-bold text-gray-900' : 'font-semibold text-gray-700'}`}>
                    {notif.title}
                  </h4>
                  <p className="text-sm text-gray-600 mb-2 leading-relaxed">
                    {notif.description}
                  </p>
                  <p className="text-xs text-gray-400 font-medium flex items-center gap-2">
                    {new Date(notif.created_at).toLocaleString()}
                    {notif.related_order_id && (
                      <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded font-mono">
                        #{notif.related_order_id.substring(notif.related_order_id.length - 6)}
                      </span>
                    )}
                  </p>
                </div>
                
                {!notif.is_read && (
                  <button 
                    onClick={() => handleMarkAsRead(notif._id)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors font-bold text-xs flex items-center gap-1 border border-transparent hover:border-blue-100"
                  >
                    <Check className="w-4 h-4" /> Mark Read
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
