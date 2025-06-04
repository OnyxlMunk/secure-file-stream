
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { preferencesService } from './preferencesService';

interface UserPreferences {
  email_notifications: boolean;
  theme: string;
  language: string;
}

interface PreferencesContextType {
  preferences: UserPreferences;
  setPreferences: React.Dispatch<React.SetStateAction<UserPreferences>>;
  loading: boolean;
  saving: boolean;
  error: string | null;
  savePreferences: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const usePreferences = () => {
  const context = useContext(PreferencesContext);
  if (!context) {
    throw new Error('usePreferences must be used within a PreferencesProvider');
  }
  return context;
};

interface PreferencesProviderProps {
  children: ReactNode;
}

export const PreferencesProvider: React.FC<PreferencesProviderProps> = ({ children }) => {
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
      
      const data = await preferencesService.fetchPreferences(user.id);

      if (data) {
        console.log('Loaded preferences:', data);
        setPreferences({
          email_notifications: data.email_notifications,
          theme: data.theme,
          language: data.language
        });
      } else {
        console.log('No preferences found, using defaults');
        await preferencesService.createDefaultPreferences(user.id);
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

  const savePreferences = async () => {
    if (!user) return;

    setSaving(true);
    setError(null);
    
    try {
      console.log('Saving preferences:', preferences);
      
      await preferencesService.savePreferences(user.id, preferences);

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

  const value = {
    preferences,
    setPreferences,
    loading,
    saving,
    error,
    savePreferences
  };

  return (
    <PreferencesContext.Provider value={value}>
      {children}
    </PreferencesContext.Provider>
  );
};
