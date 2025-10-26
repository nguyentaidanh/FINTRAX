import React, { useEffect, useRef } from 'react';
import { useData } from '../hooks/useData';
import { useI18n } from '../hooks/useI18n';
import Button from './ui/Button';
import { formatDate } from '../utils/formatters';
import { Link } from 'react-router-dom';

interface NotificationsPopoverProps {
  isOpen: boolean;
  onClose: () => void;
}

const NotificationsPopover: React.FC<NotificationsPopoverProps> = ({ isOpen, onClose }) => {
  const { notifications, markAllNotificationsAsRead } = useData();
  const { t } = useI18n();
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={popoverRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50"
    >
      <div className="flex items-center justify-between p-3 border-b dark:border-slate-700">
        <h4 className="font-semibold">{t('notifications')}</h4>
        <Button variant="link" size="sm" onClick={markAllNotificationsAsRead} className="text-xs p-0 h-auto">
          {t('markAllAsRead')}
        </Button>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-slate-500 text-center p-6">{t('noNotifications')}</p>
        ) : (
          <ul className="divide-y dark:divide-slate-700">
            {notifications.map(notification => (
              <li key={notification.id} className={`p-3 ${!notification.read ? 'bg-primary-50 dark:bg-slate-800' : ''}`}>
                 <Link to={notification.linkTo || '#'} onClick={onClose} className="block hover:bg-slate-50 dark:hover:bg-slate-700/50 -m-3 p-3 rounded-lg">
                    <p className="text-sm text-slate-800 dark:text-slate-200">{notification.message}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{formatDate(notification.date)}</p>
                 </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default NotificationsPopover;