
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  price: number;
  priceId: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  maxFiles: number;
  maxFileSize: string;
  popular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    priceId: '',
    description: 'Perfect for getting started',
    features: [
      '10 encryptions per month',
      '10MB max file size',
      'Basic file banks',
      'Community support'
    ],
    icon: <Shield className="h-6 w-6" />,
    maxFiles: 10,
    maxFileSize: '10MB'
  },
  {
    id: 'basic',
    name: 'Basic',
    price: 7.99,
    priceId: 'price_basic_monthly',
    description: 'For regular users',
    features: [
      '100 encryptions per month',
      '50MB max file size',
      'Advanced file banks',
      'Priority support',
      'Bulk operations'
    ],
    icon: <Zap className="h-6 w-6" />,
    maxFiles: 100,
    maxFileSize: '50MB'
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 19.99,
    priceId: 'price_premium_monthly',
    description: 'For power users',
    features: [
      '500 encryptions per month',
      '200MB max file size',
      'Unlimited file banks',
      'Priority support',
      'API access',
      'Advanced analytics'
    ],
    icon: <Crown className="h-6 w-6" />,
    maxFiles: 500,
    maxFileSize: '200MB',
    popular: true
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 49.99,
    priceId: 'price_enterprise_monthly',
    description: 'For teams and businesses',
    features: [
      'Unlimited encryptions',
      '1GB max file size',
      'Unlimited file banks',
      '24/7 phone support',
      'API access',
      'Custom integrations',
      'Team management'
    ],
    icon: <Crown className="h-6 w-6" />,
    maxFiles: -1,
    maxFileSize: '1GB'
  }
];

const SubscriptionPlans: React.FC = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const { profile } = useAuth();
  const { toast } = useToast();

  const handleSubscribe = async (priceId: string, planName: string) => {
    if (!priceId) return;
    
    setLoading(priceId);
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { priceId }
      });

      if (error) throw error;

      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast({
        title: "Error",
        description: "Failed to start checkout process",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  const isCurrentPlan = (planId: string) => {
    return profile?.subscription_tier === planId;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {plans.map((plan) => (
        <Card key={plan.id} className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
          {plan.popular && (
            <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
              Most Popular
            </Badge>
          )}
          <CardHeader>
            <div className="flex items-center gap-2">
              {plan.icon}
              <CardTitle>{plan.name}</CardTitle>
            </div>
            <CardDescription>{plan.description}</CardDescription>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold">${plan.price}</span>
              {plan.price > 0 && <span className="text-muted-foreground">/month</span>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center gap-2">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="text-sm">{feature}</span>
                </li>
              ))}
            </ul>
            {isCurrentPlan(plan.id) ? (
              <Button className="w-full" disabled variant="secondary">
                Current Plan
              </Button>
            ) : (
              <Button 
                className="w-full" 
                onClick={() => handleSubscribe(plan.priceId, plan.name)}
                disabled={loading === plan.priceId || !plan.priceId}
              >
                {loading === plan.priceId ? 'Processing...' : plan.price === 0 ? 'Current Plan' : 'Subscribe'}
              </Button>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default SubscriptionPlans;
