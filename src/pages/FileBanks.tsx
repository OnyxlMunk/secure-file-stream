
import React from 'react';
import Header from '@/components/layout/Header';
import FileBankManager from '@/components/FileBankManager';

const FileBanks = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <Header />
      
      <div className="max-w-7xl mx-auto p-4 pt-8">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <FileBankManager />
        </div>
      </div>
    </div>
  );
};

export default FileBanks;
