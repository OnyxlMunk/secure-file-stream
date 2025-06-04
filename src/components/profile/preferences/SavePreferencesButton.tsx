
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { usePreferences } from './PreferencesContext';

const SavePreferencesButton = () => {
  const { saving, savePreferences } = usePreferences();

  return (
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
  );
};

export default SavePreferencesButton;
