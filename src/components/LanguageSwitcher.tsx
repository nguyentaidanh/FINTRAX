import React from 'react';
import { useI18n } from '../hooks/useI18n';
import Button from './ui/Button';

const LanguageSwitcher: React.FC = () => {
  const { locale, changeLanguage } = useI18n();

  return (
    <div className="flex items-center rounded-md border border-slate-200 dark:border-slate-700 p-1">
      <Button 
        variant={locale === 'en' ? 'default' : 'ghost'} 
        size="sm" 
        onClick={() => changeLanguage('en')}
        className={`px-3 ${locale === 'en' ? 'shadow' : ''}`}
      >
        EN
      </Button>
      <Button 
        variant={locale === 'vi' ? 'default' : 'ghost'} 
        size="sm" 
        onClick={() => changeLanguage('vi')}
        className={`px-3 ${locale === 'vi' ? 'shadow' : ''}`}
      >
        VI
      </Button>
    </div>
  );
};

export default LanguageSwitcher;
