import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { getUserDashboardPath } from '../../utils/auth';
import { Loader2 } from 'lucide-react';

/**
 * PublicRoute prevents already authenticated users from viewing guest-only pages
 * such as the Landing page, Login page, and Register page.
 * If the user is logged in, it automatically redirects them directly to their role-specific dashboard.
 */
export default function PublicRoute() {
  const { isAuthenticated, user, isProfileLoading } = useAuthStore();

  if (isProfileLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-primary">
        <Loader2 className="w-10 h-10 animate-spin mb-3" />
        <span className="text-sm font-medium text-gray-500">Connecting to AgriChain...</span>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return <Navigate to={getUserDashboardPath(user)} replace />;
  }

  return <Outlet />;
}
