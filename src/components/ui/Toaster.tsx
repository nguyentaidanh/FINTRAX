
import React, { useState, useEffect } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

export const toast = (message: string, type: ToastType = 'info') => {
  const event = new CustomEvent('add-toast', { detail: { message, type } });
  window.dispatchEvent(event);
};

const Toast: React.FC<ToastMessage & { onDismiss: (id: number) => void }> = ({ id, message, type, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [id, onDismiss]);

  const baseClasses = 'w-full max-w-sm p-4 text-white rounded-lg shadow-lg flex items-center space-x-3';
  const typeClasses = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-primary-500',
  };

  return (
    <div className={`${baseClasses} ${typeClasses[type]}`}>
      <span>{message}</span>
      <button onClick={() => onDismiss(id)} className="ml-auto -mx-1.5 -my-1.5 bg-white/20 text-white hover:bg-white/30 rounded-lg p-1.5 inline-flex h-8 w-8 items-center justify-center">
        &times;
      </button>
    </div>
  );
};

export const Toaster: React.FC = () => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    const addToast = (e: Event) => {
      const { message, type } = (e as CustomEvent).detail;
      setToasts((prevToasts) => [
        ...prevToasts,
        { id: Date.now(), message, type },
      ]);
    };

    window.addEventListener('add-toast', addToast);
    return () => {
      window.removeEventListener('add-toast', addToast);
    };
  }, []);

  const handleDismiss = (id: number) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  };

  return (
    <div className="fixed top-5 right-5 z-50 space-y-2">
      {toasts.map((toast) => (
        <Toast key={toast.id} {...toast} onDismiss={handleDismiss} />
      ))}
    </div>
  );
};
