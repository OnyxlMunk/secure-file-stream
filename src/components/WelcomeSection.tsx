
import React from 'react';
import { NeomorphicCard } from '@/components/ui/neomorphic-card';
import { Lock, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const WelcomeSection = () => {
  const { profile } = useAuth();

  return (
    <div className="text-center space-y-4 pt-8">
      <NeomorphicCard className="inline-block p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Lock className="h-12 w-12 text-retro-purple animate-pulse" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-br from-retro-cyan to-retro-green rounded-full animate-float" />
          </div>
          <div>
            <h2 className="text-2xl font-retro font-bold text-retro-purple">
              WELCOME_BACK
            </h2>
            <p className="font-pixel text-retro-cyan">
              {'>'} {profile?.full_name || 'USER'}
            </p>
          </div>
        </div>
      </NeomorphicCard>
      
      <NeomorphicCard variant="inset" className="inline-block p-4">
        <div className="flex items-center justify-center gap-6 text-sm font-pixel">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-retro-cyan animate-pulse" />
            <span className="text-retro-purple">POINTS: {profile?.points || 0}</span>
          </div>
          <span className="text-retro-pink">•</span>
          <span className="text-retro-green">PLAN: {profile?.subscription_tier || 'FREE'}</span>
        </div>
      </NeomorphicCard>
    </div>
  );
};

export default WelcomeSection;
