
import React from 'react';

export const FloatingGraphics = () => {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Floating geometric shapes */}
      <div className="absolute top-10 right-10 w-20 h-20 bg-gradient-to-br from-retro-pink to-retro-purple rounded-blob animate-float opacity-20" />
      <div className="absolute bottom-20 left-10 w-16 h-16 bg-gradient-to-br from-retro-cyan to-retro-green rounded-full animate-blob opacity-30" />
      <div className="absolute top-1/2 right-1/4 w-12 h-12 bg-gradient-to-br from-retro-purple to-retro-pink transform rotate-45 animate-float opacity-25" style={{ animationDelay: '1s' }} />
      
      {/* Organic blob shapes */}
      <svg className="absolute top-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="blobGradient1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF6B9D" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#A855F7" stopOpacity="0.05" />
          </linearGradient>
          <linearGradient id="blobGradient2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#10B981" stopOpacity="0.05" />
          </linearGradient>
        </defs>
        
        <path 
          d="M60,20 C100,10 120,50 100,80 C80,110 40,100 20,70 C0,40 20,30 60,20 Z" 
          fill="url(#blobGradient1)"
          className="animate-blob"
        />
        
        <path 
          d="M300,150 C340,140 360,180 340,210 C320,240 280,230 260,200 C240,170 260,160 300,150 Z" 
          fill="url(#blobGradient2)"
          className="animate-blob"
          style={{ animationDelay: '2s' }}
        />
      </svg>
    </div>
  );
};

export const RetroGraphicOverlay = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative">
      {children}
      
      {/* Retro scan lines effect */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-transparent to-black opacity-5" 
           style={{
             backgroundImage: `repeating-linear-gradient(
               0deg,
               transparent,
               transparent 2px,
               rgba(0,0,0,0.03) 2px,
               rgba(0,0,0,0.03) 4px
             )`
           }} />
      
      {/* Corner decorative elements */}
      <div className="absolute top-2 left-2 w-4 h-4 border-l-2 border-t-2 border-retro-cyan opacity-60" />
      <div className="absolute top-2 right-2 w-4 h-4 border-r-2 border-t-2 border-retro-pink opacity-60" />
      <div className="absolute bottom-2 left-2 w-4 h-4 border-l-2 border-b-2 border-retro-green opacity-60" />
      <div className="absolute bottom-2 right-2 w-4 h-4 border-r-2 border-b-2 border-retro-purple opacity-60" />
    </div>
  );
};

export const OrganicDivider = () => {
  return (
    <div className="my-8 relative">
      <svg className="w-full h-4" viewBox="0 0 400 20" xmlns="http://www.w3.org/2000/svg">
        <path 
          d="M0,10 Q100,2 200,10 T400,10" 
          stroke="url(#dividerGradient)" 
          strokeWidth="2" 
          fill="none"
          className="animate-pulse"
        />
        <defs>
          <linearGradient id="dividerGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF6B9D" />
            <stop offset="25%" stopColor="#A855F7" />
            <stop offset="50%" stopColor="#06B6D4" />
            <stop offset="75%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#FF6B9D" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};
