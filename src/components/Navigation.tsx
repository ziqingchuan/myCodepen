import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoSrc from '/logo.svg';
import {
  HomeIcon,
  PlusCircleIcon,
} from '@heroicons/react/24/outline';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-dark-700 border-b border-dark-500 shadow-lg">
      <div className="mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center h-12 sm:h-16">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <img src={logoSrc} alt="logo" className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="font-bold text-base sm:text-2xl text-gray-200">My CodePen</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => navigate('/')}
              className={`p-2 sm:p-2.5 rounded-lg transition-all ${
                isActive('/')
                  ? 'bg-primary/20 text-primary'
                  : 'text-dark-200 hover:text-primary hover:bg-dark-600'
              }`}
              title="案例列表"
            >
              <HomeIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
            <button
              onClick={() => navigate('/upload')}
              className={`p-2 sm:p-2.5 rounded-lg transition-all ${
                isActive('/upload')
                  ? 'bg-primary/20 text-primary'
                  : 'text-dark-200 hover:text-primary hover:bg-dark-600'
              }`}
              title="新增案例"
            >
              <PlusCircleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};
