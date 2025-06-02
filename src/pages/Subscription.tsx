
import React from 'react';
import Header from '@/components/layout/Header';
import SubscriptionManager from '@/components/subscription/SubscriptionManager';

const Subscription = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-7xl mx-auto p-4 pt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Subscription</h1>
            <p className="text-gray-600 mt-2">
              Manage your subscription plan and billing information
            </p>
          </div>
          
          <SubscriptionManager />
        </div>
      </div>
    </div>
  );
};

export default Subscription;
