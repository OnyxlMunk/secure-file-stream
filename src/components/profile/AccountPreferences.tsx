
import React from 'react';
import { PreferencesProvider, usePreferences } from './preferences/PreferencesContext';
import NotificationSettings from './preferences/NotificationSettings';
import AppearanceSettings from './preferences/AppearanceSettings';
import LocalizationSettings from './preferences/LocalizationSettings';
import PreferencesError from './preferences/PreferencesError';
import PreferencesLoading from './preferences/PreferencesLoading';
import SavePreferencesButton from './preferences/SavePreferencesButton';

const AccountPreferencesContent = () => {
  const { loading, error } = usePreferences();

  if (loading) {
    return <PreferencesLoading />;
  }

  return (
    <div className="space-y-6">
      {error && <PreferencesError error={error} />}

      <NotificationSettings />
      <AppearanceSettings />
      <LocalizationSettings />
      <SavePreferencesButton />
    </div>
  );
};

const AccountPreferences = () => {
  return (
    <PreferencesProvider>
      <AccountPreferencesContent />
    </PreferencesProvider>
  );
};

export default AccountPreferences;
