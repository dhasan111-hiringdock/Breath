import { useState, useCallback } from 'react';
import Toast from '@/react-app/components/Toast';

interface ToastConfig {
  message: string;
  type: 'success' | 'error' | 'info';
  duration?: number;
}

export function useToast() {
  const [toasts, setToasts] = useState<Array<ToastConfig & { id: number }>>([]);

  const showToast = useCallback((config: ToastConfig) => {
    const id = Date.now();
    setToasts(prev => [...prev, { ...config, id }]);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const ToastContainer = useCallback(() => (
    <>
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </>
  ), [toasts, removeToast]);

  return { showToast, ToastContainer };
}
