import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/useAuthStore';
import { getCleanRole, getUserDashboardPath } from '../../utils/auth';
import { Loader2 } from 'lucide-react';

export default function RoleProtectedRoute({ allowedRoles }) {
  const { isAuthenticated, user, isProfileLoading } = useAuthStore();

  if (isProfileLoading && !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const cleanRole = getCleanRole(user);

  if (!allowedRoles.includes(cleanRole)) {
    // If not allowed, redirect to their proper dashboard or login
    return <Navigate to={getUserDashboardPath(user)} replace />;
  }

  // Check if Farmer needs to complete profile
  if (cleanRole === 'Farmer') {
    const completion = user?.farmer_details?.profile_completion_percentage || 0;
    const isCompleteRoute = window.location.pathname === '/farmer/complete-profile';
    
    if (completion < 100 && !isCompleteRoute) {
      return <Navigate to="/farmer/complete-profile" replace />;
    }
  }

  return <Outlet />;
}
