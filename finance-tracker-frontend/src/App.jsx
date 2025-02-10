import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { LoginForm } from '@/components/auth/LoginForm';
import { SignUpForm } from '@/components/auth/SignUpForm';
import { AuthProvider } from '@/contexts/AuthContext';
import { SidebarProvider } from '@/contexts/SidebarContext';

// Lazy load page components
const DashboardPage = React.lazy(() => import('@/pages/DashboardPage').then(module => ({ 
  default: module.default || module.DashboardPage 
})));
const GoalsPage = React.lazy(() => import('@/pages/GoalsPage').then(module => ({ 
  default: module.default || module.GoalsPage 
})));
const TransactionsPage = React.lazy(() => import('@/pages/TransactionsPage').then(module => ({ 
  default: module.default || module.TransactionsPage 
})));
const AnalyticsPage = React.lazy(() => import('@/pages/AnalyticsPage').then(module => ({ 
  default: module.default || module.AnalyticsPage 
})));
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage').then(module => ({ 
  default: module.default || module.SettingsPage 
})));
const ProfilePage = React.lazy(() => import('@/pages/ProfilePage').then(module => ({ 
  default: module.default || module.ProfilePage 
})));
const CategoriesPage = React.lazy(() => import('@/pages/CategoriesPage').then(module => ({ 
  default: module.default || module.CategoriesPage 
})));

// Error Boundary Component
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Something went wrong</h2>
          <button
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={() => {
              this.setState({ hasError: false });
              window.location.reload();
            }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
    <LoadingSpinner size="lg" />
  </div>
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

const App = () => {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SidebarProvider>
            <BrowserRouter>
              <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={<LoginForm />} />
                <Route path="/signup" element={<SignUpForm />} />

                {/* Protected Routes */}
                <Route path="/" element={<Layout />}>
                  <Route index element={
                    <Suspense fallback={<LoadingFallback />}>
                      <DashboardPage />
                    </Suspense>
                  } />
                  <Route path="transactions" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <TransactionsPage />
                    </Suspense>
                  } />
                  <Route path="goals" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <GoalsPage />
                    </Suspense>
                  } />
                  <Route path="analytics" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <AnalyticsPage />
                    </Suspense>
                  } />
                  <Route path="settings" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <SettingsPage />
                    </Suspense>
                  } />
                  <Route path="profile" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <ProfilePage />
                    </Suspense>
                  } />
                  <Route path="categories" element={
                    <Suspense fallback={<LoadingFallback />}>
                      <CategoriesPage />
                    </Suspense>
                  } />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </SidebarProvider>
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
};

export default App;
