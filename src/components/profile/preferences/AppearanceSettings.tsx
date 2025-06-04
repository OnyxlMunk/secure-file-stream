
import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { usePreferences } from './PreferencesContext';

const AppearanceSettings = () => {
  const { preferences, setPreferences } = usePreferences();

  return (
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
  );
};

export default AppearanceSettings;
