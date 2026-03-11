import React, { useEffect, useState, useCallback } from 'react';

type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  onClose?: () => void;
}

export const Toast: React.FC<ToastProps> = ({
  message,
  type = 'info',
  duration = 3000,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // 使用 useCallback 避免 onClose 每次都是新引用
  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    // Mount animation
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      // Wait for animation to finish before calling onClose
      setTimeout(() => handleClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const bgColor = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  }[type];

  return (
    <div 
      className={`fixed top-0 left-1/2 -translate-x-1/2 transition-transform duration-300 ease-in-out z-50 ${
        isVisible ? 'translate-y-4' : '-translate-y-full'
      }`}
    >
      <div className={`${bgColor} text-white px-6 py-3 rounded-lg shadow-lg`}>
        {message}
      </div>
    </div>
  );
};

export const useToast = () => {
  const [toast, setToast] = useState<ToastProps | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info', duration = 3000) => {
    setToast({ message, type, duration });
  }, []);

  const closeToast = useCallback(() => {
    setToast(null);
  }, []);

  return { toast, showToast, closeToast };
};
