
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface UserPreferences {
  email_notifications: boolean;
  theme: string;
  language: string;
}

const AccountPreferences = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [preferences, setPreferences] = useState<UserPreferences>({
    email_notifications: true,
    theme: 'light',
    language: 'en'
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchPreferences();
    }
  }, [user]);

  const fetchPreferences = async () => {
    if (!user) return;

    try {
      setError(null);
      console.log('Fetching preferences for user:', user.id);
      
      const { data, error } = await supabase
        .from('user_preferences')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error fetching preferences:', error);
        throw error;
      }

      if (data) {
        console.log('Loaded preferences:', data);
        setPreferences({
          email_notifications: data.email_notifications,
          theme: data.theme,
          language: data.language
        });
      } else {
        console.log('No preferences found, using defaults');
        // No preferences found, create default ones
        await createDefaultPreferences();
      }
    } catch (error: any) {
      console.error('Failed to load preferences:', error);
      setError(`Failed to load preferences: ${error.message}`);
      toast({
        title: "Warning",
        description: "Could not load your preferences. Using defaults.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createDefaultPreferences = async () => {
    if (!user) return;

    try {
      console.log('Creating default preferences for user:', user.id);
      
      const { error } = await supabase
        .from('user_preferences')
        .insert({
          user_id: user.id,
          email_notifications: true,
          theme: 'light',
          language: 'en'
        });

      if (error) {
        console.error('Error creating default preferences:', error);
        throw error;
      }

      console.log('Default preferences created successfully');
    } catch (error: any) {
      console.error('Failed to create default preferences:', error);
      // Don't throw here, just log the error
    }
  };

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    
    try {
      console.log('Saving preferences:', preferences);
      
      const { error } = await supabase
        .from('user_preferences')
        .upsert({
          user_id: user.id,
          ...preferences,
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error saving preferences:', error);
        throw error;
      }

      console.log('Preferences saved successfully');
      toast({
        title: "Success",
        description: "Preferences saved successfully",
      });
    } catch (error: any) {
      console.error('Failed to save preferences:', error);
      setError(`Failed to save preferences: ${error.message}`);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Appearance</h3>
        
        <div className="space-y-2">
          <Label>Theme</Label>
          <Select
            value={preferences.theme}
            onValueChange={(value) => 
              setPreferences(prev => ({ ...prev, theme: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="light">Light</SelectItem>
              <SelectItem value="dark">Dark</SelectItem>
              <SelectItem value="system">System</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-medium">Localization</h3>
        
        <div className="space-y-2">
          <Label>Language</Label>
          <Select
            value={preferences.language}
            onValueChange={(value) => 
              setPreferences(prev => ({ ...prev, language: value }))
            }
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="es">Español</SelectItem>
              <SelectItem value="fr">Français</SelectItem>
              <SelectItem value="de">Deutsch</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button onClick={savePreferences} disabled={saving}>
        {saving ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving...
          </>
        ) : (
          'Save Preferences'
        )}
      </Button>
    </div>
  );
};

export default AccountPreferences;
