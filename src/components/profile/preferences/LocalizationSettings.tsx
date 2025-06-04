
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePreferences } from './PreferencesContext';

const LocalizationSettings = () => {
  const { preferences, setPreferences } = usePreferences();

  return (
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
  );
};

export default LocalizationSettings;
