import React, { useState, useEffect, useRef } from 'react';
import { Sun, Moon, CheckSquare, LogOut, User, ChevronDown, UserCircle, Key } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import PersonalInfoModal from './PersonalInfoModal';
import ChangePasswordModal from './ChangePasswordModal';

const Header = ({ onToggleDarkMode, isDarkMode, onToggleMultiSelect, isMultiSelectMode, user, onLogout, onUserUpdate }) => {
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showPersonalInfo, setShowPersonalInfo] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const dropdownRef = useRef(null);
  const { clearCacheAndReload } = useTasks();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowUserDropdown(false);
      }
    };

    if (showUserDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showUserDropdown]);

  return (
    <header className="bg-white dark:bg-darkBg-secondary border-b border-gray-200 dark:border-dark-700 px-6 py-4 relative z-20 ml-80">
      <div className="flex items-center justify-between">
        {/* Left side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Multi-select toggle */}
          <button
            onClick={onToggleMultiSelect}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors ${
              isMultiSelectMode 
                ? 'text-accent-orange hover:text-accent-orange bg-accent-orange/10' 
                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkBg-tertiary'
            }`}
            title={isMultiSelectMode ? 'Exit multi-select mode' : 'Enter multi-select mode'}
          >
            <CheckSquare className="w-5 h-5" />
            <span className="text-sm font-medium">
              {isMultiSelectMode ? 'Exit' : 'Select Multiple'}
            </span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={onToggleDarkMode}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkBg-tertiary transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDarkMode ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">
              {isDarkMode ? 'Light' : 'Dark'}
            </span>
          </button>
        </div>

        {/* Right side - User info with dropdown */}
        <div className="relative" ref={dropdownRef}>
          {user && (
            <button
              onClick={() => setShowUserDropdown(!showUserDropdown)}
              className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-darkBg-tertiary transition-colors"
            >
              <div className="w-8 h-8 bg-accent-orange rounded-full flex items-center justify-center">
                <User className="w-4 h-4 text-white" />
              </div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {user.name}
              </span>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          )}

          {/* User dropdown menu */}
          {showUserDropdown && (
            <div className="absolute right-0 top-12 bg-white dark:bg-darkBg-tertiary border border-gray-200 dark:border-dark-700 rounded-lg shadow-medium py-2 z-10 min-w-[200px]">
              {/* User info */}
              <div className="px-4 py-3 border-b border-gray-200 dark:border-dark-700">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-accent-orange rounded-full flex items-center justify-center">
                    <User className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-1">
                <button 
                  onClick={() => {
                    setShowPersonalInfo(true);
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkBg-secondary transition-colors"
                >
                  <UserCircle className="w-4 h-4" />
                  <span>Personal Information</span>
                </button>
                
                <button 
                  onClick={() => {
                    setShowChangePassword(true);
                    setShowUserDropdown(false);
                  }}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-darkBg-secondary transition-colors"
                >
                  <Key className="w-4 h-4" />
                  <span>Change Password</span>
                </button>
                
                <div className="border-t border-gray-200 dark:border-dark-700 my-1"></div>
                
                <button 
                  onClick={onLogout}
                  className="w-full flex items-center space-x-3 px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <PersonalInfoModal 
        isOpen={showPersonalInfo}
        onClose={() => setShowPersonalInfo(false)}
        user={user}
        onUserUpdate={onUserUpdate}
      />
      
      <ChangePasswordModal 
        isOpen={showChangePassword}
        onClose={() => setShowChangePassword(false)}
      />
    </header>
  );
};

export default Header;
