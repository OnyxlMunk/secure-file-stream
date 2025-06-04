
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { NeomorphicCard, NeomorphicCardContent, NeomorphicCardDescription, NeomorphicCardHeader, NeomorphicCardTitle } from '@/components/ui/neomorphic-card';
import { FloatingGraphics, RetroGraphicOverlay, OrganicDivider } from '@/components/ui/organic-graphics';
import { User, Settings, Shield, BarChart3 } from 'lucide-react';
import ProfileInfo from './ProfileInfo';
import SecuritySettings from './SecuritySettings';
import AccountPreferences from './AccountPreferences';
import ProfileStats from './ProfileStats';

const ProfileDashboard = () => {
  return (
    <div className="max-w-6xl mx-auto p-6 relative">
      <FloatingGraphics />
      
      <RetroGraphicOverlay>
        <div className="mb-8 relative z-10">
          <h1 className="text-4xl font-bold mb-2 font-retro bg-gradient-to-r from-retro-pink via-retro-purple to-retro-cyan bg-clip-text text-transparent animate-pulse">
            PROFILE.EXE
          </h1>
          <p className="text-muted-foreground font-pixel text-retro-cyan">
            > Manage your account settings and preferences_
          </p>
        </div>
      </RetroGraphicOverlay>

      <OrganicDivider />

      <Tabs defaultValue="info" className="space-y-6 relative z-10">
        <TabsList className="grid w-full grid-cols-4 bg-gradient-to-r from-gray-100 to-gray-200 shadow-neomorphic-inset rounded-2xl p-2">
          <TabsTrigger 
            value="info" 
            className="flex items-center gap-2 font-pixel text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-retro-pink data-[state=active]:to-retro-purple data-[state=active]:text-white data-[state=active]:shadow-neomorphic-outset rounded-xl transition-all duration-300"
          >
            <User className="h-4 w-4" />
            INFO.DAT
          </TabsTrigger>
          <TabsTrigger 
            value="security" 
            className="flex items-center gap-2 font-pixel text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-retro-cyan data-[state=active]:to-retro-green data-[state=active]:text-black data-[state=active]:shadow-neomorphic-outset rounded-xl transition-all duration-300"
          >
            <Shield className="h-4 w-4" />
            SEC.SYS
          </TabsTrigger>
          <TabsTrigger 
            value="preferences" 
            className="flex items-center gap-2 font-pixel text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-retro-purple data-[state=active]:to-retro-pink data-[state=active]:text-white data-[state=active]:shadow-neomorphic-outset rounded-xl transition-all duration-300"
          >
            <Settings className="h-4 w-4" />
            PREF.CFG
          </TabsTrigger>
          <TabsTrigger 
            value="stats" 
            className="flex items-center gap-2 font-pixel text-xs data-[state=active]:bg-gradient-to-r data-[state=active]:from-retro-green data-[state=active]:to-retro-cyan data-[state=active]:text-black data-[state=active]:shadow-neomorphic-outset rounded-xl transition-all duration-300"
          >
            <BarChart3 className="h-4 w-4" />
            STATS.LOG
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <NeomorphicCard className="hover:shadow-neomorphic-pressed transition-all duration-500">
            <NeomorphicCardHeader>
              <NeomorphicCardTitle>Profile Information</NeomorphicCardTitle>
              <NeomorphicCardDescription>
                > Update your personal information and profile picture
              </NeomorphicCardDescription>
            </NeomorphicCardHeader>
            <NeomorphicCardContent>
              <ProfileInfo />
            </NeomorphicCardContent>
          </NeomorphicCard>
        </TabsContent>

        <TabsContent value="security">
          <NeomorphicCard className="hover:shadow-neomorphic-pressed transition-all duration-500">
            <NeomorphicCardHeader>
              <NeomorphicCardTitle>Security Settings</NeomorphicCardTitle>
              <NeomorphicCardDescription>
                > Manage your password and account security
              </NeomorphicCardDescription>
            </NeomorphicCardHeader>
            <NeomorphicCardContent>
              <SecuritySettings />
            </NeomorphicCardContent>
          </NeomorphicCard>
        </TabsContent>

        <TabsContent value="preferences">
          <NeomorphicCard className="hover:shadow-neomorphic-pressed transition-all duration-500">
            <NeomorphicCardHeader>
              <NeomorphicCardTitle>Account Preferences</NeomorphicCardTitle>
              <NeomorphicCardDescription>
                > Customize your account settings and notifications
              </NeomorphicCardDescription>
            </NeomorphicCardHeader>
            <NeomorphicCardContent>
              <AccountPreferences />
            </NeomorphicCardContent>
          </NeomorphicCard>
        </TabsContent>

        <TabsContent value="stats">
          <NeomorphicCard className="hover:shadow-neomorphic-pressed transition-all duration-500">
            <NeomorphicCardHeader>
              <NeomorphicCardTitle>Account Statistics</NeomorphicCardTitle>
              <NeomorphicCardDescription>
                > View your account activity and usage statistics
              </NeomorphicCardDescription>
            </NeomorphicCardHeader>
            <NeomorphicCardContent>
              <ProfileStats />
            </NeomorphicCardContent>
          </NeomorphicCard>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProfileDashboard;
