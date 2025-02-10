import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  CurrencyDollarIcon,
  ChartBarIcon,
  FlagIcon,
  CogIcon,
  XMarkIcon,
  Bars3Icon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { useSidebar } from '@/contexts/SidebarContext';

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Transactions', href: '/transactions', icon: CurrencyDollarIcon },
  { name: 'Categories', href: '/categories', icon: TagIcon },
  { name: 'Goals', href: '/goals', icon: FlagIcon },
  { name: 'Analytics', href: '/analytics', icon: ChartBarIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
];

export const Sidebar = () => {
  const { isSidebarOpen, toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleClick = () => {
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  const handleDoubleClick = (href) => {
    navigate(href);
    if (window.innerWidth < 1024) {
      toggleSidebar();
    }
  };

  return (
    <>
      {/* Backdrop - show only on mobile and tablet when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-75 transition-opacity lg:hidden z-40"
          onClick={toggleSidebar}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`fixed lg:sticky top-16 left-0 z-40 h-[calc(100vh-4rem)]
          transform transition-transform duration-200 ease-in-out
          bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700
          ${isSidebarOpen ? 'w-64' : 'w-0 md:w-16'} 
          lg:w-64 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}
      >
        <div className="flex flex-col h-full overflow-hidden">
          {/* Mobile & Tablet header */}
          <div className="flex items-center justify-between p-4 md:justify-center lg:hidden">
            <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
              FT
            </span>
            {/* Close button - only show on mobile */}
            <button
              onClick={toggleSidebar}
              className="rounded-md text-gray-500 hover:text-gray-600 dark:text-gray-400 md:hidden"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          {/* Desktop header */}
          <div className="hidden lg:flex items-center p-4">
            <span className="text-xl font-bold text-gray-900 dark:text-white whitespace-nowrap">
              Finance Tracker
            </span>
          </div>

          {/* Toggle button for tablet */}
          <button
            onClick={toggleSidebar}
            className="hidden md:block lg:hidden fixed left-4 top-[1.35rem] p-2 
              rounded-md bg-white dark:bg-gray-800 shadow-md 
              border border-gray-200 dark:border-gray-700
              hover:bg-gray-50 dark:hover:bg-gray-700
              transition-colors duration-200 z-50"
          >
            {isSidebarOpen ? (
              <XMarkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            ) : (
              <Bars3Icon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
            )}
          </button>

          {/* Navigation */}
          <div className="flex-1 overflow-y-auto">
            <nav className="px-2 lg:px-4 py-4 space-y-1">
              <ul>
                {navigation.map((item) => (
                  <li key={item.name}>
                    <NavLink
                      to={item.href}
                      onDoubleClick={() => handleDoubleClick(item.href)}
                      className={({ isActive }) =>
                        `flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200
                        ${isActive
                          ? 'bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100' 
                          : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
                        } cursor-pointer`
                      }
                    >
                      <item.icon
                        className="h-5 w-5 flex-shrink-0 transition-colors duration-200 text-gray-400 group-hover:text-gray-500 dark:text-gray-400 dark:group-hover:text-gray-300"
                      />
                      <span className={`ml-3 whitespace-nowrap ${!isSidebarOpen ? 'md:hidden' : ''} lg:block`}>
                        {item.name}
                      </span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>
      </aside>
    </>
  );
};
