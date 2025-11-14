
import React, { useState, useEffect } from 'react';

export interface ToastData {
  id: number;
  message: string;
  type: 'success' | 'error';
}

interface ToastProps {
  toast: ToastData | null;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (toast) {
      setIsVisible(true);
      const timer = setTimeout(() => {
        setIsVisible(false);
        // Allow time for the fade-out animation before dismissing
        setTimeout(onDismiss, 300);
      }, 3000); // Toast visible for 3 seconds

      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  const bgColor = toast.type === 'success' ? 'bg-neutral-200' : 'bg-red-500';
  const textColor = toast.type === 'success' ? 'text-neutral-900' : 'text-white';
  const icon = toast.type === 'success' ? 'fa-check-circle text-primary' : 'fa-exclamation-circle';

  return (
    <div
      className={`fixed bottom-24 left-1/2 -translate-x-1/2 z-[100] w-full max-w-sm px-4 transition-all duration-300 ease-in-out ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className={`flex items-center ${bgColor} ${textColor} p-3 rounded-lg shadow-lg`}>
        <i className={`fas ${icon} text-lg`}></i>
        <p className="ml-3 font-medium text-sm">{toast.message}</p>
      </div>
    </div>
  );
};

export default Toast;
