import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { authApi } from '../api/auth';
import { LoadingSpinner } from '../components/LoadingSpinner';

export interface ProtectedRouteProps {
  children: React.ReactElement;
  allowedRoles?: Array<'candidate' | 'recruiter' | 'admin'>;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles
}) => {
  const { user, isAuthenticated, setAuth } = useAuthStore();
  const [checking, setChecking] = useState(!isAuthenticated);
  const location = useLocation();

  useEffect(() => {
    let isMounted = true;
    if (!isAuthenticated) {
      authApi.me()
        .then((res) => {
          if (isMounted && res.user) {
            // Restore session
            setAuth(res.user, '');
          }
        })
        .catch(() => {
          // Unauthenticated
        })
        .finally(() => {
          if (isMounted) setChecking(false);
        });
    } else {
      setChecking(false);
    }
    return () => { isMounted = false; };
  }, [isAuthenticated, setAuth]);

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <LoadingSpinner label="Authenticating session..." size="lg" />
      </div>
    );
  }

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

