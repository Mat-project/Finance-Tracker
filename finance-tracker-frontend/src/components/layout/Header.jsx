import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useTheme } from '@/hooks/useTheme';
import { Menu } from '@headlessui/react';
import { UserCircleIcon, SunIcon, MoonIcon, Bars3Icon } from '@heroicons/react/24/outline';
import { useSidebar } from '@/contexts/SidebarContext';
import { mediaURL } from '@/services/api';

export const Header = () => {
  const { user, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const { toggleSidebar } = useSidebar();
  const [imageError, setImageError] = useState(false);

  const getProfileImageUrl = (profilePicture) => {
    if (!profilePicture) return null;
    if (profilePicture.startsWith('http')) return profilePicture;
    const path = profilePicture
      .replace(/^\/?(api\/)?/, '')
      .replace(/^media\//, '')
      .replace(/^\/+/, '');
    return `${mediaURL}/media/${path}`;
  };

  const renderProfileImage = () => {
    if (!user?.profile_picture || imageError) {
      return (
        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-[#1a2234] flex items-center justify-center">
          <UserCircleIcon className="h-6 w-6 text-gray-500 dark:text-gray-400" />
        </div>
      );
    }

    const imageUrl = getProfileImageUrl(user.profile_picture);
    console.log('Header profile image URL:', imageUrl);

    return (
      <div className="relative h-8 w-8 rounded-full overflow-hidden ring-2 ring-gray-200 dark:ring-[#2a334a]">
        <img
          src={imageUrl}
          alt="Profile"
          className="h-full w-full object-cover"
          onError={(e) => {
            console.error('Header profile image error:', {
              src: e.target.src,
              originalPath: user.profile_picture
            });
            setImageError(true);
          }}
        />
      </div>
    );
  };

  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-50 bg-white dark:bg-[#1e2538] border-b border-gray-200 dark:border-[#2a334a]">
      <div className="h-full max-w-7xl mx-auto flex items-center justify-between px-4">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSidebar}
            className="md:hidden p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a334a]"
            aria-label="Toggle Sidebar"
          >
            <Bars3Icon className="h-5 w-5" />
          </button>
          <span className="hidden md:block text-lg font-semibold text-gray-800 dark:text-white">
            Finance Tracker
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Toggle Dark Mode */}
{/*           <button
            onClick={toggleDarkMode}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-[#2a334a]"
            aria-label={isDarkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDarkMode ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button> */}

          {/* User Menu */}
          <Menu as="div" className="relative">
            <Menu.Button className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[#2a334a]">
              {renderProfileImage()}
              <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                {user?.username}
              </span>
            </Menu.Button>
            
            <Menu.Items className="absolute right-0 mt-2 w-48 bg-white dark:bg-[#1e2538] rounded-lg shadow-lg py-1 border border-gray-200 dark:border-[#2a334a]">
              <Menu.Item>
                {({ active }) => (
                  <Link
                    to="/profile"
                    className={`${
                      active ? 'bg-gray-100 dark:bg-[#2a334a]' : ''
                    } flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200`}
                  >
                    <UserCircleIcon className="h-5 w-5 mr-3 text-gray-400 dark:text-gray-500" />
                    Profile
                  </Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={logout}
                    className={`${
                      active ? 'bg-red-50 dark:bg-red-900/20' : ''
                    } flex items-center w-full px-4 py-2 text-sm text-red-600 dark:text-red-400`}
                  >
                    <svg className="h-5 w-5 mr-3" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 3a1 1 0 0 0-1 1v12a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V4a1 1 0 0 0-1-1H3zm11 4.414l-4.293 4.293a1 1 0 0 1-1.414 0L4 7.414l1.414-1.414L8 8.586l3.293-3.293L13 6.414z" clipRule="evenodd" />
                    </svg>
                    Sign out
                  </button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        </div>
      </div>
    </header>
  );
};
