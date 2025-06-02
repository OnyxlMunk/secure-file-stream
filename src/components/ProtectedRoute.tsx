
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import AuthPage from '@/components/auth/AuthPage';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  // ============================================================================
  // TEMPORARY BYPASS: Authentication disabled for testing
  // ============================================================================
  // To re-enable authentication, comment out the line below and uncomment the original logic
  return <>{children}</>;

  // ============================================================================
  // ORIGINAL AUTHENTICATION CODE (COMMENTED OUT FOR TEMPORARY BYPASS)
  // ============================================================================
  // const { user, loading } = useAuth();

  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  // if (!user) {
  //   return <AuthPage />;
  // }

  // return <>{children}</>;
  // ============================================================================
  // END OF ORIGINAL AUTHENTICATION CODE
  // ============================================================================
};

export default ProtectedRoute;
