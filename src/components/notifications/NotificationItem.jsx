import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell, CheckCircle, AlertTriangle, FileText, MessageSquare, Calendar, FolderOpen, ArrowRight
} from 'lucide-react';

/**
 * Reusable NotificationItem Component
 */
export default function NotificationItem({
  notification,
  onRead = null,
  onCloseDropdown = null
}) {
  const navigate = useNavigate();

  if (!notification) return null;

  const id = notification._id || notification.id;
  const isRead = Boolean(notification.isRead || notification.read);
  const type = (notification.type || 'SYSTEM').toUpperCase();
  const rawTitle = notification.title;
  const message = notification.message || notification.body || notification.text || '';
  const createdAt = notification.createdAt || notification.time || new Date().toISOString();
  const deepLink = notification.deepLink || notification.link || null;

  // Format type title fallback
  const title = rawTitle || type.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, l => l.toUpperCase());

  // Type Icon Selection
  const getIcon = () => {
    if (type.includes('DRAWING') || type.includes('BLUEPRINT')) return <PenToolIcon className="w-4 h-4 text-emerald-600" />;
    if (type.includes('LEAVE') || type.includes('ATTENDANCE')) return <Calendar className="w-4 h-4 text-indigo-600" />;
    if (type.includes('CHAT') || type.includes('MESSAGE') || type.includes('QUERY')) return <MessageSquare className="w-4 h-4 text-brand-dark" />;
    if (type.includes('TASK') || type.includes('DOCUMENT')) return <FileText className="w-4 h-4 text-amber-600" />;
    if (type.includes('ALERT') || type.includes('ERROR') || type.includes('EXCEPT')) return <AlertTriangle className="w-4 h-4 text-rose-600" />;
    return <Bell className="w-4 h-4 text-brand-dark" />;
  };

  // Safe Deep Link Click Handler
  const handleClick = (e) => {
    e.stopPropagation();
    if (!isRead && onRead && id) {
      onRead(id);
    }
    if (onCloseDropdown) onCloseDropdown();

    if (deepLink && typeof deepLink === 'string' && deepLink.startsWith('/')) {
      navigate(deepLink);
    }
  };

  const formattedTime = new Date(createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div
      onClick={handleClick}
      className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer border-b border-slate-100/70 font-sans ${
        !isRead ? 'bg-brand-soft/50 hover:bg-brand-soft/80' : 'bg-white hover:bg-slate-50'
      }`}
    >
      {/* Type Icon Avatar */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-3xs ${
        !isRead ? 'bg-white border border-brand-secondary/60' : 'bg-slate-100 border border-slate-200'
      }`}>
        {getIcon()}
      </div>

      {/* Main Content */}
      <div className="min-w-0 flex-1">
        <div className="flex justify-between items-baseline mb-0.5">
          <h4 className={`text-xs truncate ${!isRead ? 'font-black text-slate-900' : 'font-semibold text-slate-700'}`}>
            {title}
          </h4>
          <span className="text-[9px] text-slate-400 shrink-0 ml-2">{formattedTime}</span>
        </div>

        <p className="text-[11px] text-slate-600 font-medium line-clamp-2 leading-relaxed">
          {message}
        </p>

        {deepLink && (
          <span className="text-[10px] text-brand-dark font-bold flex items-center gap-1 mt-1 hover:underline">
            View Details <ArrowRight className="w-2.5 h-2.5" />
          </span>
        )}
      </div>

      {/* Unread Indicator Dot */}
      {!isRead && (
        <span className="w-2 h-2 rounded-full bg-brand-secondary shrink-0 mt-1.5 shadow-2xs" />
      )}
    </div>
  );
}

function PenToolIcon(props) {
  return <FolderOpen {...props} />;
}
