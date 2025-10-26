import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useData } from '../hooks/useData';
import { useAuth } from '../hooks/useAuth';
import { useI18n } from '../hooks/useI18n';
import Button from './ui/Button';
import NotificationsPopover from './NotificationsPopover';
import UserDropdown from './UserDropdown';
import AddTransactionModal from './AddTransactionModal';
import AddRecurringTransactionModal from './AddRecurringTransactionModal';

// FIX: Corrected typo in viewBox attribute.
const IconMenu = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>;
const IconBell = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>;

interface HeaderProps {
  onMenuClick: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick }) => {
  const { notifications } = useData();
  const { currentUser } = useAuth();
  const { t } = useI18n();
  const location = useLocation();

  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isAddTxnModalOpen, setIsAddTxnModalOpen] = useState(false);
  const [isAddRecurringModalOpen, setIsAddRecurringModalOpen] = useState(false);

  const unreadCount = notifications.filter(n => !n.read).length;

  const getPageTitle = (pathname: string): string => {
    const path = pathname.split('/')[1];
    switch (path) {
        case '': return t('dashboard');
        case 'transactions': return t('transactions');
        case 'accounts': return t('accounts');
        case 'recurring': return t('recurring');
        case 'calendar': return t('calendar');
        case 'goals': return t('goals');
        case 'analysis': return t('analysis');
        case 'tags': return t('tags');
        case 'profile': return t('profile');
        case 'settings': return t('settings');
        default: return 'FinTrax';
    }
  }

  if (!currentUser) return null;

  return (
    <>
      <header className="flex items-center justify-between h-16 border-b bg-white px-4 sm:px-6 lg:px-8 dark:bg-slate-800 dark:border-slate-700 flex-shrink-0">
        {/* Left side */}
        <div className="flex items-center gap-4">
          <button onClick={onMenuClick} className="p-2 -ml-2 rounded-md text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-400 dark:hover:text-slate-50 dark:hover:bg-slate-700 md:hidden" aria-label="Open menu">
            <IconMenu />
          </button>
          <h1 className="hidden md:block text-xl font-semibold text-slate-900 dark:text-slate-100 capitalize">
              {getPageTitle(location.pathname)}
          </h1>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Button size="sm" onClick={() => setIsAddTxnModalOpen(true)}>{t('addTransaction')}</Button>
            <Button size="sm" variant="outline" onClick={() => setIsAddRecurringModalOpen(true)}>{t('addRecurring')}</Button>
          </div>
          
          <div className="relative">
            <Button variant="ghost" size="icon" onClick={() => setIsNotificationsOpen(p => !p)}>
              <IconBell />
              {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 block h-2.5 w-2.5 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-800" />
              )}
            </Button>
            <NotificationsPopover isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
          </div>

          <div className="relative">
              <button onClick={() => setIsUserDropdownOpen(p => !p)} className="rounded-full focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-slate-800">
                  <img src={currentUser.avatar} alt={currentUser.name} className="w-9 h-9 rounded-full" />
              </button>
              <UserDropdown isOpen={isUserDropdownOpen} onClose={() => setIsUserDropdownOpen(false)} />
          </div>
        </div>
      </header>
      
      <AddTransactionModal
        isOpen={isAddTxnModalOpen}
        onClose={() => setIsAddTxnModalOpen(false)}
        transactionToEdit={null}
      />
      <AddRecurringTransactionModal
        isOpen={isAddRecurringModalOpen}
        onClose={() => setIsAddRecurringModalOpen(false)}
        templateToEdit={null}
      />
    </>
  );
};

export default Header;