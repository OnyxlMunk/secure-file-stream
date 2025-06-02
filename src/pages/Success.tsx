
import React, { useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { refreshProfile } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (sessionId) {
      // Check subscription status after successful payment
      const checkSubscription = async () => {
        try {
          await supabase.functions.invoke('check-subscription');
          await refreshProfile();
          
          toast({
            title: "Subscription activated!",
            description: "Your subscription has been successfully activated",
          });
        } catch (error) {
          console.error('Error checking subscription after payment:', error);
        }
      };

      // Delay to allow Stripe to process the payment
      setTimeout(checkSubscription, 2000);
    }
  }, [sessionId, refreshProfile, toast]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <CardDescription>
            Thank you for your subscription. Your account has been upgraded.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h3 className="font-semibold text-green-900 mb-2">What's Next?</h3>
            <ul className="text-sm text-green-800 space-y-1">
              <li>• Your subscription is now active</li>
              <li>• Increased file size limits</li>
              <li>• More encryption points available</li>
              <li>• Access to premium features</li>
            </ul>
          </div>
          
          <div className="flex gap-2">
            <Link to="/" className="flex-1">
              <Button className="w-full">
                Start Encrypting
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
            <Link to="/subscription" className="flex-1">
              <Button variant="outline" className="w-full">
                View Subscription
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Success;
