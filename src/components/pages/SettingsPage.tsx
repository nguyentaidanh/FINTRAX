
import React, { useState, useEffect } from 'react';
import Card, { CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../ui/Card';
import Button from '../ui/Button';
import { toast } from '../ui/Toaster';
import { useAuth } from '../../hooks/useAuth';
import { useI18n } from '../../hooks/useI18n';
import Select from '../ui/Select';
import { UserNotificationSettings } from '@/src/types/types';
import LanguageSwitcher from '../LanguageSwitcher';
import ThemeToggle from '../ThemeToggle';

const defaultSettings: UserNotificationSettings = {
  reminders: {
    recurring: {
      enabled: false,
      daysBefore: 3
    }
  },
  pagination: {
    itemsPerPage: 10
  }
};

const SettingsPage: React.FC = () => {
  const { currentUser, updateUser } = useAuth();
  const { t } = useI18n();
  const [notificationSettings, setNotificationSettings] = useState<UserNotificationSettings>(defaultSettings);
  const [itemsPerPage, setItemsPerPage] = useState<number>(10);

  useEffect(() => {
    if (currentUser) {
      const settings = currentUser.notificationSettings || defaultSettings;
      setNotificationSettings(settings);
      setItemsPerPage(settings.pagination?.itemsPerPage || 10);
    }
  }, [currentUser]);

  const handleUpdateNotifications = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
        updateUser({
            ...currentUser,
            notificationSettings,
        });
        toast(t('notificationSettingsUpdated'), 'success');
    }
  }

  const handleUpdateDisplay = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      updateUser({
        ...currentUser,
        notificationSettings: {
          ...notificationSettings,
          pagination: { itemsPerPage: itemsPerPage }
        }
      });
      toast(t('displaySettingsUpdated'), 'success');
    }
  }

  if (!currentUser) {
    return <div>Loading settings...</div>
  }

  return (
    <div className="space-y-6 max-w-2xl mx-auto">
        <Card>
            <CardHeader>
            <CardTitle>{t('appearance')}</CardTitle>
            <CardDescription>{t('appearanceDescription')}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label className="block text-sm font-medium mb-2">{t('language')}</label>
                    <LanguageSwitcher />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">{t('theme')}</label>
                    <div className="flex items-center space-x-2">
                        <ThemeToggle />
                        <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{document.documentElement.classList.contains('dark') ? 'Dark' : 'Light'} Mode</span>
                    </div>
                </div>
            </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('display')}</CardTitle>
            <CardDescription>{t('displayDescription')}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleUpdateDisplay} className="space-y-4">
              <div>
                <label htmlFor="itemsPerPage" className="block text-sm font-medium mb-1">{t('itemsPerPage')}</label>
                <Select 
                  id="itemsPerPage"
                  value={itemsPerPage}
                  onChange={e => setItemsPerPage(parseInt(e.target.value, 10))}
                >
                  <option value="10">10</option>
                  <option value="25">25</option>
                  <option value="50">50</option>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button type="submit">{t('saveChanges')}</Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
            <CardHeader>
            <CardTitle>{t('notifications')}</CardTitle>
            <CardDescription>{t('reminders')}</CardDescription>
            </CardHeader>
            <CardContent>
            <form onSubmit={handleUpdateNotifications} className="space-y-4">
                <h4 className="font-semibold text-sm">{t('upcomingRecurring')}</h4>
                <div className="flex items-center space-x-3">
                    <input 
                        type="checkbox"
                        id="recurringReminders"
                        className="h-4 w-4 rounded border-slate-300 dark:border-slate-600 text-primary-600 focus:ring-primary-500"
                        checked={notificationSettings.reminders.recurring.enabled}
                        onChange={e => setNotificationSettings(prev => ({...prev, reminders: {...prev.reminders, recurring: { ...prev.reminders.recurring, enabled: e.target.checked }}}))}
                    />
                    <label htmlFor="recurringReminders" className="text-sm font-medium">{t('enableRecurringReminders')}</label>
                </div>
                {notificationSettings.reminders.recurring.enabled && (
                    <div>
                    <label htmlFor="daysBefore" className="block text-sm font-medium mb-1">{t('daysBeforeDueDate')}</label>
                    <Select 
                        id="daysBefore"
                        value={notificationSettings.reminders.recurring.daysBefore}
                        onChange={e => setNotificationSettings(prev => ({...prev, reminders: {...prev.reminders, recurring: { ...prev.reminders.recurring, daysBefore: parseInt(e.target.value, 10) }}}))}
                    >
                        <option value="1">1 {t('day')}</option>
                        <option value="3">3 {t('days')}</option>
                        <option value="5">5 {t('days')}</option>
                        <option value="7">7 {t('days')}</option>
                    </Select>
                    </div>
                )}
                <div className="flex justify-end">
                <Button type="submit">{t('saveChanges')}</Button>
                </div>
            </form>
            </CardContent>
        </Card>
    </div>
  );
};

export default SettingsPage;
