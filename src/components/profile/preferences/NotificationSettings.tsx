
import React from 'react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { usePreferences } from './PreferencesContext';

const NotificationSettings = () => {
  const { preferences, setPreferences } = usePreferences();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Notification Settings</h3>
      
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label>Email Notifications</Label>
          <p className="text-sm text-muted-foreground">
            Receive email notifications about your account activity
          </p>
        </div>
        <Switch
          checked={preferences.email_notifications}
          onCheckedChange={(checked) => 
            setPreferences(prev => ({ ...prev, email_notifications: checked }))
          }
        />
      </div>
    </div>
  );
};

export default NotificationSettings;
