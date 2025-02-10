import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '@/services/api';

// Create the context
export const ThemeContext = createContext(null);

// Custom hook to use the theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [isDarkMode, setIsDarkMode] = useState(() => {
    // Check if we're in the browser
    if (typeof window === 'undefined') return false;
    
    // Check localStorage first
    const storedTheme = localStorage.getItem('theme');
    if (storedTheme) {
      return storedTheme === 'dark';
    }
    
    // Fall back to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Update document class and localStorage when theme changes
  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('theme', 'dark');
      // Update user preferences in backend
      api.users.updateSettings({ theme_preference: 'dark' }).catch(console.error);
    } else {
      root.classList.remove('dark');
      localStorage.setItem('theme', 'light');
      // Update user preferences in backend
      api.users.updateSettings({ theme_preference: 'light' }).catch(console.error);
    }
  }, [isDarkMode]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => {
      const storedTheme = localStorage.getItem('theme');
      if (!storedTheme || storedTheme === 'system') {
        setIsDarkMode(e.matches);
        // Update user preferences in backend
        api.users.updateSettings({ theme_preference: 'system' }).catch(console.error);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Sync with user preferences from backend
  useEffect(() => {
    const syncUserPreferences = async () => {
      try {
        const response = await api.auth.getProfile();
        const { theme_preference } = response.data;
        
        if (theme_preference === 'system') {
          setIsDarkMode(window.matchMedia('(prefers-color-scheme: dark)').matches);
        } else {
          setIsDarkMode(theme_preference === 'dark');
        }
      } catch (error) {
        console.error('Failed to sync theme preferences:', error);
      }
    };

    syncUserPreferences();
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleDarkMode }}>
      <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'dark' : ''}`}>
        {children}
      </div>
    </ThemeContext.Provider>
  );
}; 