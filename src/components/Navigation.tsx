import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoSrc from '/logo.svg';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-12 sm:h-16">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-1 sm:gap-2 cursor-pointer"
          >
            <img src={logoSrc} alt="logo" className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="font-bold text-base sm:text-2xl text-gray-600">My CodePen</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1 sm:gap-4">
            <button
              onClick={() => navigate('/')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-base rounded transition-colors ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              案例列表
            </button>
            <button
              onClick={() => navigate('/upload')}
              className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-base rounded transition-colors ${
                isActive('/upload')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              新增案例
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
