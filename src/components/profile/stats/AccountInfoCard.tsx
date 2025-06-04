
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const AccountInfoCard = () => {
  const { user, profile, isAdmin } = useAuth();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account Information</CardTitle>
        <CardDescription>Your account details and status</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between">
          <span className="text-sm font-medium">Email:</span>
          <span className="text-sm">{user?.email}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Full Name:</span>
          <span className="text-sm">{profile?.full_name || 'Not set'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Subscription:</span>
          <span className="text-sm capitalize">{profile?.subscription_tier || 'free'}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-sm font-medium">Points:</span>
          <span className="text-sm">{profile?.points || 0}</span>
        </div>
        {isAdmin && (
          <div className="flex justify-between">
            <span className="text-sm font-medium">Role:</span>
            <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
              <Shield className="h-3 w-3" />
              Administrator
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AccountInfoCard;
