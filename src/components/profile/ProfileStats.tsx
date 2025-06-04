
import React from 'react';
import { Loader2 } from 'lucide-react';
import StatsCards from './stats/StatsCards';
import AccountInfoCard from './stats/AccountInfoCard';
import UsageStatsCard from './stats/UsageStatsCard';
import { useStatsData } from './stats/useStatsData';

const ProfileStats = () => {
  const { stats, loading } = useStatsData();

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <StatsCards stats={stats} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <AccountInfoCard />
        <UsageStatsCard />
      </div>
    </div>
  );
};

export default ProfileStats;
