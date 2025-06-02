
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Settings, RefreshCw, ExternalLink, Calendar, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import SubscriptionPlans from './SubscriptionPlans';

interface SubscriptionInfo {
  subscribed: boolean;
  subscription_tier: string | null;
  subscription_end: string | null;
}

const SubscriptionManager: React.FC = () => {
  const [subscriptionInfo, setSubscriptionInfo] = useState<SubscriptionInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);
  const { profile, refreshProfile } = useAuth();
  const { toast } = useToast();

  const checkSubscription = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('check-subscription');
      
      if (error) throw error;
      
      setSubscriptionInfo(data);
      await refreshProfile(); // Refresh profile to get updated subscription info
      
      toast({
        title: "Subscription status updated",
        description: "Your subscription information has been refreshed",
      });
    } catch (error) {
      console.error('Error checking subscription:', error);
      toast({
        title: "Error",
        description: "Failed to check subscription status",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openCustomerPortal = async () => {
    setPortalLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('customer-portal');
      
      if (error) throw error;
      
      if (data?.url) {
        window.open(data.url, '_blank');
      }
    } catch (error) {
      console.error('Error opening customer portal:', error);
      toast({
        title: "Error",
        description: "Failed to open customer portal",
        variant: "destructive",
      });
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    checkSubscription();
  }, []);

  const usagePercentage = profile?.points ? 
    Math.max(0, Math.min(100, ((100 - profile.points) / 100) * 100)) : 0;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Current Subscription
          </CardTitle>
          <CardDescription>
            Manage your subscription and view usage statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">Plan:</span>
                <Badge variant={profile?.subscription_tier === 'free' ? 'secondary' : 'default'}>
                  {profile?.subscription_tier?.toUpperCase() || 'FREE'}
                </Badge>
              </div>
              {subscriptionInfo?.subscription_end && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>Renews on {formatDate(subscriptionInfo.subscription_end)}</span>
                </div>
              )}
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={checkSubscription}
                disabled={loading}
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              {subscriptionInfo?.subscribed && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={openCustomerPortal}
                  disabled={portalLoading}
                >
                  <Settings className="h-4 w-4" />
                  Manage
                  <ExternalLink className="h-3 w-3 ml-1" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Points Used This Month</span>
              <span>{100 - (profile?.points || 0)}/100</span>
            </div>
            <Progress value={usagePercentage} className="h-2" />
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">Available Points:</span>
              <p className="font-medium">{profile?.points || 0}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Max File Size:</span>
              <p className="font-medium">{profile?.max_file_size_mb || 10}MB</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Plans */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Subscription Plans</h2>
        <SubscriptionPlans />
      </div>
    </div>
  );
};

export default SubscriptionManager;
