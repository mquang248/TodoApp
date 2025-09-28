import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check localStorage for saved theme preference
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    // Apply dark mode class to document
    const html = document.documentElement;
    if (isDarkMode) {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    
    // Save preference to localStorage (debounced)
    const timeoutId = setTimeout(() => {
      localStorage.setItem('darkMode', JSON.stringify(isDarkMode));
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    // Add class to disable transitions during theme change
    document.documentElement.classList.add('theme-transitioning');
    
    // Use requestAnimationFrame to ensure smooth transition
    requestAnimationFrame(() => {
      setIsDarkMode(!isDarkMode);
      
      // Remove the transition-disabling class after a short delay
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning');
      }, 50);
    });
  };

  const value = {
    isDarkMode,
    toggleDarkMode
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
