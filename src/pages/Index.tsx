
import React from 'react';
import { TooltipProvider } from '@/components/ui/tooltip';
import Header from '@/components/layout/Header';
import { FloatingGraphics, OrganicDivider } from '@/components/ui/organic-graphics';
import WelcomeSection from '@/components/WelcomeSection';
import FileProcessor from '@/components/FileProcessor';
import SecurityProtocol from '@/components/SecurityProtocol';

const Index = () => {
  return (
    <TooltipProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-100 relative overflow-hidden">
        <FloatingGraphics />
        <Header />
        
        <div className="max-w-4xl mx-auto p-4 space-y-8 relative z-10">
          <WelcomeSection />
          <OrganicDivider />
          <FileProcessor />
          <SecurityProtocol />
        </div>
      </div>
    </TooltipProvider>
  );
};

export default Index;
