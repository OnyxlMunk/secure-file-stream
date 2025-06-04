
import React from 'react';
import Header from '@/components/layout/Header';
import ProtectedRoute from '@/components/ProtectedRoute';
import ProfileDashboard from '@/components/profile/ProfileDashboard';

const Profile = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <ProfileDashboard />
      </div>
    </ProtectedRoute>
  );
};

export default Profile;
