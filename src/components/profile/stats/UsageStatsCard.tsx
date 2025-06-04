
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const UsageStatsCard = () => {
  const { profile } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Usage Statistics</CardTitle>
        <CardDescription>Your platform usage overview</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Max File Size:</span>
          <span className="text-sm">{profile?.max_file_size_mb || 10} MB</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Monthly Encryptions:</span>
          <span className="text-sm">{profile?.max_monthly_encryptions || 10}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Profile Completed:</span>
          <span className="text-sm">{profile?.profile_completed ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Last Login:</span>
          <span className="text-sm">
            {profile?.last_login_at 
              ? new Date(profile.last_login_at).toLocaleDateString()
              : 'Not recorded'
            }
          </span>
        </div>
      </CardContent>
    </Card>
  );
};

export default UsageStatsCard;
