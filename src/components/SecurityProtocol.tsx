
import React from 'react';
import { NeomorphicCard, NeomorphicCardContent } from '@/components/ui/neomorphic-card';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const SecurityProtocol = () => {
  return (
    <NeomorphicCard variant="inset" className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-transparent to-cyan-50/50" />
      <NeomorphicCardContent className="relative">
        <div className="text-center mb-4">
          <h3 className="font-retro font-bold text-retro-purple text-lg mb-2">
            SECURITY_PROTOCOL
          </h3>
          <div className="flex justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-retro-cyan via-retro-purple to-retro-pink" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-pixel text-sm">
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-retro-cyan cursor-help hover:text-retro-cyan/80 transition-colors border-b border-dotted border-retro-cyan/30 hover:border-retro-cyan/60">
                  {'>'} Local browser encryption
                </p>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3 bg-gradient-to-br from-gray-50 to-gray-100 shadow-neomorphic-outset border-0 font-pixel text-xs">
                <p className="text-retro-purple">
                  All files are encrypted directly in your browser using Web Crypto API before any data leaves your device
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-retro-green cursor-help hover:text-retro-green/80 transition-colors border-b border-dotted border-retro-green/30 hover:border-retro-green/60">
                  {'>'} Secure Supabase storage
                </p>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3 bg-gradient-to-br from-gray-50 to-gray-100 shadow-neomorphic-outset border-0 font-pixel text-xs">
                <p className="text-retro-purple">
                  Encrypted files are stored using Supabase's enterprise-grade infrastructure with automatic backups and redundancy
                </p>
              </TooltipContent>
            </Tooltip>
          </div>
          <div className="space-y-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-retro-pink cursor-help hover:text-retro-pink/80 transition-colors border-b border-dotted border-retro-pink/30 hover:border-retro-pink/60">
                  {'>'} Zero password transmission
                </p>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs p-3 bg-gradient-to-br from-gray-50 to-gray-100 shadow-neomorphic-outset border-0 font-pixel text-xs">
                <p className="text-retro-purple">
                  Your passwords never leave your device - they're only used locally to generate encryption keys
                </p>
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <p className="text-retro-purple cursor-help hover:text-retro-purple/80 transition-colors border-b border-dotted border-retro-purple/30 hover:border-retro-purple/60">
                  {'>'} AES-256-GCM + PBKDF2
                </p>
              </TooltipTrigger>
              <TooltipContent className="max-w-sm p-3 bg-gradient-to-br from-gray-50 to-gray-100 shadow-neomorphic-outset border-0 font-pixel text-xs">
                <div className="space-y-2 text-retro-purple">
                  <p><strong>AES-256-GCM:</strong> Advanced Encryption Standard with 256-bit keys using Galois/Counter Mode for authenticated encryption</p>
                  <p><strong>PBKDF2:</strong> Password-Based Key Derivation Function 2 for secure key generation from passwords</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
        
        <div className="text-center mt-4">
          <p className="text-xs font-pixel text-retro-cyan opacity-75">
            {'>'} Each operation costs 1 point from your account
          </p>
        </div>
      </NeomorphicCardContent>
    </NeomorphicCard>
  );
};

export default SecurityProtocol;
