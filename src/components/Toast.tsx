import React, { useEffect, useState, useCallback } from 'react';
import {
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon,
} from '@heroicons/react/24/solid';

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

  const handleClose = useCallback(() => {
    onClose?.();
  }, [onClose]);

  useEffect(() => {
    setIsVisible(true);

    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => handleClose(), 300);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, handleClose]);

  const config = {
    success: {
      icon: CheckCircleIcon,
      borderColor: 'border-green-500/50',
      bgColor: 'bg-green-500/10',
      textColor: 'text-green-400',
      iconColor: 'text-green-400',
    },
    error: {
      icon: XCircleIcon,
      borderColor: 'border-red-500/50',
      bgColor: 'bg-red-500/10',
      textColor: 'text-red-400',
      iconColor: 'text-red-400',
    },
    info: {
      icon: InformationCircleIcon,
      borderColor: 'border-cyan-500/50',
      bgColor: 'bg-cyan-500/10',
      textColor: 'text-cyan-400',
      iconColor: 'text-cyan-400',
    },
  };

  const { icon: Icon, borderColor, bgColor, textColor, iconColor } = config[type];

  return (
    <div
      className={`fixed top-4 left-1/2 -translate-x-1/2 transition-all duration-300 ease-out z-50 ${
        isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
      }`}
    >
      <div
        className={`
          flex items-center gap-3 px-5 py-3.5 rounded-xl
          border ${borderColor} ${bgColor}
          backdrop-blur-sm shadow-lg
        `}
      >
        <Icon className={`w-5 h-5 shrink-0 ${iconColor}`} />
        <span className={`text-sm font-medium ${textColor}`}>{message}</span>
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
