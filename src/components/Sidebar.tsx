import React from 'react';
import { NavLink } from 'react-router-dom';
import { useI18n } from '../hooks/useI18n';

const IconDashboard = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"></rect><rect width="7" height="5" x="14" y="3" rx="1"></rect><rect width="7" height="9" x="14" y="12" rx="1"></rect><rect width="7" height="5" x="3" y="16" rx="1"></rect></svg>;
const IconTransactions = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10H6"></path><path d="M18 20V4H12"></path></svg>;
const IconTags = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2H2v10l9.29 9.29a1 1 0 0 0 1.41 0L22 13.41a1 1 0 0 0 0-1.41L12 2z"></path><path d="M7 7h.01"></path></svg>;
const IconSettings = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0-2l.15.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>;
const IconAccounts = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const IconCalendar = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>;
const IconRecurring = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 2.7a2.7 2.7 0 0 1 4 4L14 13H7v-7Z"/><path d="m18 13 4-4"/><path d="M22 17a2.7 2.7 0 0 1-4 4L8 11H1v7l6 6 7-7"/></svg>;
const IconProfile = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>;
const IconAnalysis = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>;
const IconGoals = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>;

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { t } = useI18n();
  
  const navLinkClasses = 'flex items-center space-x-3 rounded-lg px-3 py-2 text-slate-500 transition-all hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-50';
  const activeNavLinkClasses = 'bg-slate-200/60 dark:bg-slate-700 text-slate-900 dark:text-slate-50';
  
  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="flex h-16 items-center border-b px-6 dark:border-slate-700 flex-shrink-0">
        <h1 className="text-lg font-bold text-primary-600 dark:text-primary-400">FinTrax</h1>
      </div>
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <NavLink to="/" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} end onClick={onClose}>
          <IconDashboard /><span>{t('dashboard')}</span>
        </NavLink>
        <NavLink to="/transactions" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onClose}>
          <IconTransactions /><span>{t('transactions')}</span>
        </NavLink>
        <NavLink to="/accounts" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onClose}>
          <IconAccounts /><span>{t('accounts')}</span>
        </NavLink>
        <NavLink to="/recurring" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onClose}>
          <IconRecurring /><span>{t('recurring')}</span>
        </NavLink>
        <NavLink to="/calendar" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onClose}>
          <IconCalendar /><span>{t('calendar')}</span>
        </NavLink>
        <NavLink to="/goals" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onClose}>
          <IconGoals /><span>{t('goals')}</span>
        </NavLink>
        <NavLink to="/analysis" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onClose}>
          <IconAnalysis /><span>{t('analysis')}</span>
        </NavLink>
        <NavLink to="/tags" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onClose}>
          <IconTags /><span>{t('tags')}</span>
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onClose}>
          <IconProfile /><span>{t('profile')}</span>
        </NavLink>
        <NavLink to="/settings" className={({ isActive }) => `${navLinkClasses} ${isActive ? activeNavLinkClasses : ''}`} onClick={onClose}>
          <IconSettings /><span>{t('settings')}</span>
        </NavLink>
      </nav>
    </div>
  );

  return (
    <>
      {/* --- Desktop Sidebar --- */}
      <aside className="hidden w-64 flex-shrink-0 border-r bg-white dark:border-slate-700 dark:bg-slate-800 md:flex">
        <SidebarContent />
      </aside>

      {/* --- Mobile Sidebar --- */}
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 z-30 bg-black/60 transition-opacity md:hidden ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      ></div>
      {/* Panel */}
      <aside 
        className={`fixed inset-y-0 left-0 z-40 flex h-full w-64 transform flex-col bg-white transition-transform duration-300 ease-in-out dark:bg-slate-800 md:hidden ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
        role="dialog"
        aria-modal="true"
      >
        <SidebarContent />
      </aside>
    </>
  );
};

export default Sidebar;