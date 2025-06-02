
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AdminSettings = () => {
  const { toast } = useToast();

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('admin_settings')
        .select('*');

      if (error) throw error;
      return data || [];
    }
  });

  const updateSetting = async (key: string, value: any) => {
    try {
      const { error } = await supabase
        .from('admin_settings')
        .upsert({
          setting_key: key,
          setting_value: value,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Setting updated successfully',
      });
    } catch (error) {
      console.error('Error updating setting:', error);
      toast({
        title: 'Error',
        description: 'Failed to update setting',
        variant: 'destructive',
      });
    }
  };

  const getSetting = (key: string, defaultValue: any = null) => {
    const setting = settings?.find(s => s.setting_key === key);
    return setting ? setting.setting_value : defaultValue;
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading settings...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            System Settings
          </CardTitle>
          <CardDescription>
            Configure system-wide settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                <Input
                  id="max-file-size"
                  type="number"
                  defaultValue={getSetting('max_file_size_mb', 100)}
                  onBlur={(e) => updateSetting('max_file_size_mb', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="free-encryptions">Free Plan Monthly Encryptions</Label>
                <Input
                  id="free-encryptions"
                  type="number"
                  defaultValue={getSetting('max_monthly_encryptions_free', 10)}
                  onBlur={(e) => updateSetting('max_monthly_encryptions_free', parseInt(e.target.value))}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="premium-encryptions">Premium Plan Monthly Encryptions</Label>
                <Input
                  id="premium-encryptions"
                  type="number"
                  defaultValue={getSetting('max_monthly_encryptions_premium', 1000)}
                  onBlur={(e) => updateSetting('max_monthly_encryptions_premium', parseInt(e.target.value))}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Public File Sharing</Label>
                  <div className="text-sm text-muted-foreground">
                    Allow users to share files publicly
                  </div>
                </div>
                <Switch
                  checked={getSetting('public_file_sharing_enabled', true)}
                  onCheckedChange={(checked) => updateSetting('public_file_sharing_enabled', checked)}
                />
              </div>

              <div className="pt-4">
                <Button onClick={() => window.location.reload()}>
                  Refresh Settings
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminSettings;
