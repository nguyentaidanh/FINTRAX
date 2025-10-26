import React from 'react';
import { useTheme } from '../hooks/useTheme';
import Button from './ui/Button';

const IconSun = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" y2="3"></line><line x1="12" y1="21" y2="23"></line><line x1="4.22" y1="4.22" y2="5.64"></line><line x1="18.36" y1="18.36" y2="19.78"></line><line x1="1" y1="12" y2="3"></line><line x1="21" y1="12" y2="23"></line><line x1="4.22" y1="19.78" y2="5.64"></line><line x1="18.36" y1="5.64" y2="19.78"></line></svg>;
const IconMoon = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>;

const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
      {theme === 'light' ? <IconMoon /> : <IconSun />}
    </Button>
  );
};

export default ThemeToggle;
