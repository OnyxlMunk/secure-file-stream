
import React from 'react';
import Header from '@/components/layout/Header';
import AdminRoute from '@/components/AdminRoute';
import AdminDashboard from '@/components/admin/AdminDashboard';

const Administrator = () => {
  return (
    <AdminRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <Header />
        <AdminDashboard />
      </div>
    </AdminRoute>
  );
};

export default Administrator;
