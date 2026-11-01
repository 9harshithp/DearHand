import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../api/client';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  Clock,
  MessageSquare,
  Mail,
  Smartphone,
  ExternalLink,
  Check
} from 'lucide-react';

export default function NotificationBell({ onNavigateBookingDetail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await apiRequest('/notifications/me');
      setUnreadCount(res.unreadCount || 0);
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 15000); // Poll every 15s
    return () => clearInterval(interval);
  }, []);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMarkAsRead = async (id, e) => {
    e?.stopPropagation();
    try {
      await apiRequest(`/notifications/${id}/read`, { method: 'PUT' });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, status: 'READ' } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (err) {
      console.error('Failed to mark read', err);
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await apiRequest('/notifications/mark-all-read', { method: 'POST' });
      setNotifications((prev) => prev.map((n) => ({ ...n, status: 'READ' })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Failed to mark all read', err);
    }
  };

  const getChannelIcon = (channel) => {
    switch (channel) {
      case 'WHATSAPP':
        return <span className="text-emerald-600 font-bold text-xs bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">WhatsApp</span>;
      case 'SMS':
        return <span className="text-blue-600 font-bold text-xs bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">SMS</span>;
      case 'EMAIL':
        return <span className="text-purple-600 font-bold text-xs bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">Email</span>;
      default:
        return <span className="text-teal-700 font-bold text-xs bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">In-App</span>;
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => {
          setIsOpen(!isOpen);
          if (!isOpen) fetchNotifications();
        }}
        title="Notifications"
        className="relative p-2.5 rounded-xl text-slate-700 hover:text-teal-800 hover:bg-slate-100 min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors focus:outline-none"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 bg-red-600 text-white text-[11px] font-black px-1.5 py-0.2 rounded-full min-w-[18px] text-center shadow-sm animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-teal-400" />
              <h4 className="font-bold text-base">Notifications</h4>
              {unreadCount > 0 && (
                <span className="bg-teal-500/30 text-teal-300 text-xs px-2 py-0.5 rounded-full font-bold">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-semibold text-teal-300 hover:text-white flex items-center gap-1 min-h-[30px]"
              >
                <Check className="w-3.5 h-3.5" /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-slate-100">
            {loading && notifications.length === 0 ? (
              <div className="p-6 text-center text-slate-500 text-sm">Loading notifications...</div>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500 space-y-2">
                <CheckCircle2 className="w-8 h-8 text-slate-400 mx-auto" />
                <p className="text-sm font-semibold">You're all caught up!</p>
                <p className="text-xs text-slate-400">Booking and visit alerts will appear here</p>
              </div>
            ) : (
              notifications.map((n) => {
                const isUnread = n.status !== 'READ';
                return (
                  <div
                    key={n.id}
                    onClick={() => {
                      if (isUnread) handleMarkAsRead(n.id);
                    }}
                    className={`p-4 transition-colors cursor-pointer flex gap-3 ${
                      isUnread ? 'bg-teal-50/60 hover:bg-teal-100/50' : 'bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        {getChannelIcon(n.channel)}
                        <span className="text-[11px] font-semibold text-slate-400">
                          {formatTime(n.createdAt)}
                        </span>
                      </div>
                      <p
                        className={`text-sm leading-snug ${
                          isUnread ? 'font-bold text-slate-900' : 'text-slate-700'
                        }`}
                      >
                        {n.template}
                      </p>
                    </div>

                    {isUnread && (
                      <button
                        onClick={(e) => handleMarkAsRead(n.id, e)}
                        title="Mark as read"
                        className="self-center p-1.5 text-teal-700 hover:bg-teal-200 rounded-lg min-h-[32px] min-w-[32px] flex items-center justify-center"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 bg-slate-50 text-center text-xs text-slate-500 border-t border-slate-100">
            Verified updates from DearHand dispatch
          </div>
        </div>
      )}
    </div>
  );
}
