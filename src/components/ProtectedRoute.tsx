
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  userType?: 'artist' | 'client';
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requireAuth = true,
  userType 
}) => {
  const { user, profile, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/auth" replace />;
  }

  // If user is authenticated but profile is not complete, redirect to complete profile
  if (user && profile && !profile.is_profile_complete) {
    return <Navigate to="/complete-profile" replace />;
  }

  // Check user type restrictions
  if (userType && profile?.user_type !== userType) {
    // Redirect to appropriate dashboard based on user type
    if (profile?.user_type === "artist") {
      return <Navigate to="/dashboard" replace />;
    } else if (profile?.user_type === "client") {
      return <Navigate to="/customer-dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
