import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import logoSrc from '/logo.svg';

export const Navigation: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm">
      <div className="mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div
            onClick={() => navigate('/')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <img src={logoSrc} alt="logo" className="w-8 h-8" />
            <span className="font-bold text-2xl text-gray-600">My CodePen</span>
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/')}
              className={`px-4 py-2 rounded transition-colors ${
                isActive('/')
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              案例列表
            </button>
            <button
              onClick={() => navigate('/upload')}
              className={`px-4 py-2 rounded transition-colors ${
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
