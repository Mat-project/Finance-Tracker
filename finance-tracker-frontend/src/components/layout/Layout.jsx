import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const Layout = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <Header />
      <div className="pt-16">
        <div className="flex">
          <Sidebar />
          <div className="flex-1 w-full lg:ml-64 md:ml-16">
            <main className="p-4 lg:p-6">
              <div className="max-w-[calc(100vw-2rem)] md:max-w-[calc(100vw-18rem)] lg:max-w-[calc(100vw-19rem)] mx-auto">
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 lg:p-6 min-h-[calc(100vh-8rem)] transition-colors duration-200">
                  <Outlet />
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
}; 