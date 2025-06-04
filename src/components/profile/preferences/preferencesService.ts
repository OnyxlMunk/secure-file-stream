
import { supabase } from '@/integrations/supabase/client';

interface UserPreferences {
  email_notifications: boolean;
  theme: string;
  language: string;
}

export const preferencesService = {
  async fetchPreferences(userId: string) {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('Error fetching preferences:', error);
      throw error;
    }

    return data;
  },

  async createDefaultPreferences(userId: string) {
    const { error } = await supabase
      .from('user_preferences')
      .insert({
        user_id: userId,
        email_notifications: true,
        theme: 'light',
        language: 'en'
      });

    if (error) {
      console.error('Error creating default preferences:', error);
      throw error;
    }

    console.log('Default preferences created successfully');
  },

  async savePreferences(userId: string, preferences: UserPreferences) {
    const { error } = await supabase
      .from('user_preferences')
      .upsert({
        user_id: userId,
        ...preferences,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error('Error saving preferences:', error);
      throw error;
    }
  }
};
