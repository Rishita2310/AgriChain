/**
 * Extracts and cleans the user role string (removes accidental quotes).
 * @param {Object} user 
 * @returns {string} Clean role string (e.g. 'Farmer', 'Buyer', 'Admin')
 */
export function getCleanRole(user) {
  if (!user || !user.role) return '';
  return String(user.role).replace(/["']/g, '').trim();
}

/**
 * Returns the destination dashboard path for a given user based on their role and profile state.
 * @param {Object} user 
 * @returns {string} URL path for dashboard or complete-profile
 */
export function getUserDashboardPath(user) {
  if (!user) return '/login';
  const role = getCleanRole(user);

  if (role === 'Farmer') {
    const completion = user.farmer_details?.profile_completion_percentage || 0;
    if (completion < 100) {
      return '/farmer/complete-profile';
    }
    return '/farmer/dashboard';
  }

  if (role === 'Buyer') {
    return '/marketplace';
  }

  if (role === 'Admin') {
    return '/admin/dashboard';
  }

  return '/login';
}
