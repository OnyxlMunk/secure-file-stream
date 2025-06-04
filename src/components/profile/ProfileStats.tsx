
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { Loader2, FileText, Folder, Calendar, Shield } from 'lucide-react';

interface AccountStats {
  totalFiles: number;
  totalFileBanks: number;
  storageUsed: number;
  accountAge: number;
}

const ProfileStats = () => {
  const { user, profile, isAdmin } = useAuth();
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

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Encrypted Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              Total files encrypted
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Banks</CardTitle>
            <Folder className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFileBanks}</div>
            <p className="text-xs text-muted-foreground">
              Organized collections
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatFileSize(stats.storageUsed)}</div>
            <p className="text-xs text-muted-foreground">
              Total storage consumed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Age</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.accountAge}</div>
            <p className="text-xs text-muted-foreground">
              Days since creation
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
            <CardDescription>Your account details and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Email:</span>
              <span className="text-sm">{user?.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Full Name:</span>
              <span className="text-sm">{profile?.full_name || 'Not set'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Subscription:</span>
              <span className="text-sm capitalize">{profile?.subscription_tier || 'free'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Points:</span>
              <span className="text-sm">{profile?.points || 0}</span>
            </div>
            {isAdmin && (
              <div className="flex justify-between">
                <span className="text-sm font-medium">Role:</span>
                <span className="text-sm text-orange-600 font-medium flex items-center gap-1">
                  <Shield className="h-3 w-3" />
                  Administrator
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Usage Statistics</CardTitle>
            <CardDescription>Your platform usage overview</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Max File Size:</span>
              <span className="text-sm">{profile?.max_file_size_mb || 10} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Monthly Encryptions:</span>
              <span className="text-sm">{profile?.max_monthly_encryptions || 10}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Profile Completed:</span>
              <span className="text-sm">{profile?.profile_completed ? 'Yes' : 'No'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Last Login:</span>
              <span className="text-sm">
                {profile?.last_login_at 
                  ? new Date(profile.last_login_at).toLocaleDateString()
                  : 'Not recorded'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfileStats;
