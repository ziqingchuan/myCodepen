import React from 'react';

interface LoadingProps {
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ text = '加载中...' }) => {
  return (
    <div className="fixed inset-0 bg-dark-800 flex items-center justify-center z-50">
      <div className="flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-dark-500 border-t-primary rounded-full animate-spin"></div>
        <span className="text-dark-300">{text}</span>
      </div>
    </div>
  );
};
