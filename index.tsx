import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './src/App';
import { I18nProvider } from './src/context/I18nContext';
import { ThemeProvider } from './src/context/ThemeContext';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <I18nProvider>
      <ThemeProvider>
        <App />
      </ThemeProvider>
    </I18nProvider>
  </React.StrictMode>
);
