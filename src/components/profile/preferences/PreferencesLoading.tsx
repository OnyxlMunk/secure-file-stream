
import React from 'react';
import { Loader2 } from 'lucide-react';

const PreferencesLoading = () => {
  return (
    <div className="flex items-center justify-center p-8">
      <Loader2 className="h-8 w-8 animate-spin" />
    </div>
  );
};

export default PreferencesLoading;
