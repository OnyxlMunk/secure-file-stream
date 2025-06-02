
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Zap, Crown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';

interface UsageLimitsProps {
  fileSize?: number;
  onUpgradeNeeded?: () => void;
}

const UsageLimits: React.FC<UsageLimitsProps> = ({ fileSize, onUpgradeNeeded }) => {
  const { profile } = useAuth();

  const remainingPoints = profile?.points || 0;
  const maxFileSize = (profile?.max_file_size_mb || 10) * 1024 * 1024; // Convert MB to bytes
  const usagePercentage = Math.max(0, Math.min(100, ((100 - remainingPoints) / 100) * 100));
  
  const isFileTooLarge = fileSize && fileSize > maxFileSize;
  const isOutOfPoints = remainingPoints <= 0;
  const isLowOnPoints = remainingPoints <= 10 && remainingPoints > 0;

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'basic': return 'text-blue-600';
      case 'premium': return 'text-purple-600';
      case 'enterprise': return 'text-amber-600';
      default: return 'text-gray-600';
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'basic': return <Zap className="h-4 w-4" />;
      case 'premium':
      case 'enterprise': return <Crown className="h-4 w-4" />;
      default: return null;
    }
  };

  if (isOutOfPoints || isFileTooLarge || isLowOnPoints) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-800">
            <AlertTriangle className="h-5 w-5" />
            {isOutOfPoints ? 'Out of Points' : isFileTooLarge ? 'File Too Large' : 'Low on Points'}
          </CardTitle>
          <CardDescription className="text-amber-700">
            {isOutOfPoints && 'You need more points to encrypt files.'}
            {isFileTooLarge && `File size exceeds your ${(profile?.max_file_size_mb || 10)}MB limit.`}
            {isLowOnPoints && 'You\'re running low on encryption points.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Current Plan:</span>
              <div className="flex items-center gap-1">
                {getTierIcon(profile?.subscription_tier || 'free')}
                <Badge variant="outline" className={getTierColor(profile?.subscription_tier || 'free')}>
                  {(profile?.subscription_tier || 'free').toUpperCase()}
                </Badge>
              </div>
            </div>
            <div>
              <span className="text-muted-foreground">Remaining Points:</span>
              <p className="font-medium">{remainingPoints}</p>
            </div>
          </div>
          
          <Link to="/subscription">
            <Button className="w-full">
              <Crown className="h-4 w-4 mr-2" />
              Upgrade Plan
            </Button>
          </Link>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Usage Overview</span>
          <Badge variant="outline" className={getTierColor(profile?.subscription_tier || 'free')}>
            {getTierIcon(profile?.subscription_tier || 'free')}
            {(profile?.subscription_tier || 'free').toUpperCase()}
          </Badge>
        </CardTitle>
        <CardDescription>
          Track your current usage and limits
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Points Used This Month</span>
            <span>{100 - remainingPoints}/100</span>
          </div>
          <Progress value={usagePercentage} className="h-2" />
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-muted-foreground">Available Points:</span>
            <p className="font-medium">{remainingPoints}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Max File Size:</span>
            <p className="font-medium">{profile?.max_file_size_mb || 10}MB</p>
          </div>
        </div>

        {profile?.subscription_tier === 'free' && (
          <div className="pt-2 border-t">
            <Link to="/subscription">
              <Button variant="outline" size="sm" className="w-full">
                <Crown className="h-4 w-4 mr-2" />
                Upgrade for More Features
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UsageLimits;
