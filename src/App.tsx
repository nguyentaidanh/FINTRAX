import React, { useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { DataProvider } from './context/DataContext';
import Sidebar from './components/Sidebar';
import Dashboard from './components/pages/Dashboard';
import TransactionsPage from './components/pages/TransactionsPage';
import TagsPage from './components/pages/TagsPage';
import SettingsPage from './components/pages/SettingsPage';
import LoginPage from './components/pages/LoginPage';
import ProtectedRoute from './components/ProtectedRoute';
import { Toaster } from './components/ui/Toaster';
import RegisterPage from './components/pages/RegisterPage';
import ForgotPasswordPage from './components/pages/ForgotPasswordPage';
import AccountsPage from './components/pages/AccountsPage';
import CalendarPage from './components/pages/CalendarPage';
import RecurringPage from './components/pages/RecurringPage';
import Header from './components/Header';
import ProfilePage from './components/pages/ProfilePage';
import AnalysisPage from './components/pages/AnalysisPage';
import GoalsPage from './components/pages/GoalsPage';

const AppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-slate-50 text-slate-800 dark:bg-slate-900 dark:text-slate-200">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/transactions" element={<TransactionsPage />} />
            <Route path="/accounts" element={<AccountsPage />} />
            <Route path="/recurring" element={<RecurringPage />} />
            <Route path="/calendar" element={<CalendarPage />} />
            <Route path="/goals" element={<GoalsPage />} />
            <Route path="/analysis" element={<AnalysisPage />} />
            <Route path="/tags" element={<TagsPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route 
            path="/*" 
            element={
              <ProtectedRoute>
                <DataProvider>
                  <AppLayout />
                </DataProvider>
              </ProtectedRoute>
            } 
          />
        </Routes>
        <Toaster />
      </HashRouter>
    </AuthProvider>
  );
};

export default App;