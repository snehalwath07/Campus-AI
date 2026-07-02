import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import { AuthProvider, useAuth } from './context/AuthContext';
import AuthLayout from './layouts/AuthLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Home from './pages/Home';
import AiChat from './pages/AiChat';
import AdmissionPlanner from './pages/AdmissionPlanner';
import CompareColleges from './pages/CompareColleges';
import SavedColleges from './pages/SavedColleges';
import Profile from './pages/Profile';

// Create TanStack Query Client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

// Public Route Component (restricts access to login/signup for authenticated users)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen w-screen bg-dark-bg flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-primary" />
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Redirect root to /home (which redirects to /login if unauthenticated) */}
            <Route path="/" element={<Navigate to="/home" replace />} />

            {/* Authentication Pages (Public, Wrapped in AuthLayout) */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <AuthLayout>
                    <Login />
                  </AuthLayout>
                </PublicRoute>
              }
            />
            <Route
              path="/signup"
              element={
                <PublicRoute>
                  <AuthLayout>
                    <Signup />
                  </AuthLayout>
                </PublicRoute>
              }
            />
            <Route
              path="/forgot-password"
              element={
                <PublicRoute>
                  <AuthLayout>
                    <ForgotPassword />
                  </AuthLayout>
                </PublicRoute>
              }
            />
            <Route
              path="/reset-password"
              element={
                <PublicRoute>
                  <AuthLayout>
                    <ResetPassword />
                  </AuthLayout>
                </PublicRoute>
              }
            />

            {/* Home Page (Protected) */}
            <Route
              path="/home"
              element={
                <ProtectedRoute>
                  <Home />
                </ProtectedRoute>
              }
            />

            {/* AI Counselor Page (Protected) */}
            <Route
              path="/ai-chat"
              element={
                <ProtectedRoute>
                  <AiChat />
                </ProtectedRoute>
              }
            />

            {/* Admission Planner Page (Protected) */}
            <Route
              path="/planner"
              element={
                <ProtectedRoute>
                  <AdmissionPlanner />
                </ProtectedRoute>
              }
            />

            {/* Compare Colleges Page (Protected) */}
            <Route
              path="/compare"
              element={
                <ProtectedRoute>
                  <CompareColleges />
                </ProtectedRoute>
              }
            />

            {/* Saved Colleges Page (Protected) */}
            <Route
              path="/saved"
              element={
                <ProtectedRoute>
                  <SavedColleges />
                </ProtectedRoute>
              }
            />

            {/* Profile Page (Protected) */}
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              }
            />

            {/* Fallback routing */}
            <Route path="*" element={<Navigate to="/home" replace />} />
          </Routes>
        </BrowserRouter>
        
        {/* Toast Notification Container */}
        <Toaster position="top-right" theme="dark" richColors closeButton />
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
