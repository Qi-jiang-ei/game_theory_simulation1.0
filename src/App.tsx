import React, { useEffect, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Auth } from './components/Auth';
import { useAuthStore } from './store/authStore';
import { Layout } from './components/Layout';
import { ToastContainer } from './components/Toast';
import { ErrorBoundary } from './components/ErrorBoundary.tsx';

// Lazy load pages
const Simulator = React.lazy(() => import('./pages/Simulator').then(m => ({ default: m.Simulator })));
const AdminModels = React.lazy(() => import('./pages/admin/AdminModels').then(m => ({ default: m.AdminModels })));
const AdminResults = React.lazy(() => import('./pages/admin/AdminResults').then(m => ({ default: m.AdminResults })));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100">
    <div className="text-xl font-semibold text-gray-600">加载中...</div>
  </div>
);

function App() {
  const { user, loading, checkAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <>
        <Auth />
        <ToastContainer />
      </>
    );
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route
              index
              element={
                <Suspense fallback={<PageLoader />}>
                  <Simulator />
                </Suspense>
              }
            />
            <Route path="admin">
              <Route
                path="models"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminModels />
                  </Suspense>
                }
              />
              <Route
                path="results"
                element={
                  <Suspense fallback={<PageLoader />}>
                    <AdminResults />
                  </Suspense>
                }
              />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <ToastContainer />
    </ErrorBoundary>
  );
}

export default App;
