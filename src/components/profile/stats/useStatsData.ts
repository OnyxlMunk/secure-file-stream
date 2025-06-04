
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { AccountStats } from './types';

export const useStatsData = () => {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<AccountStats>({
    totalFiles: 0,
    totalFileBanks: 0,
    storageUsed: 0,
    accountAge: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    if (!user) return;

    try {
      // Get file count
      const { count: fileCount } = await supabase
        .from('encrypted_files')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get file bank count
      const { count: bankCount } = await supabase
        .from('file_banks')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get storage usage
      const { data: files } = await supabase
        .from('encrypted_files')
        .select('file_size')
        .eq('user_id', user.id);

      const storageUsed = files?.reduce((total, file) => total + (file.file_size || 0), 0) || 0;

      // Calculate account age
      const createdAt = new Date(profile?.created_at || user.created_at);
      const accountAge = Math.floor((Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24));

      setStats({
        totalFiles: fileCount || 0,
        totalFileBanks: bankCount || 0,
        storageUsed,
        accountAge
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return { stats, loading };
};
