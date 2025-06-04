
import React from 'react';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileDashboard from '@/components/profile/ProfileDashboard';

const Profile = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-purple-50 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-gradient-to-br from-retro-pink/20 to-retro-purple/20 rounded-blob animate-blob" />
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-gradient-to-br from-retro-cyan/20 to-retro-green/20 rounded-blob animate-blob" style={{ animationDelay: '2s' }} />
          <div className="absolute top-3/4 left-1/3 w-32 h-32 bg-gradient-to-br from-retro-purple/20 to-retro-pink/20 rounded-full animate-float" style={{ animationDelay: '1s' }} />
        </div>
        
        {/* Grid pattern overlay */}
        <div 
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `
              linear-gradient(rgba(168, 85, 247, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(168, 85, 247, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '20px 20px'
          }}
        />
        
        <Header />
        <div className="relative z-10">
          <ProfileDashboard />
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
