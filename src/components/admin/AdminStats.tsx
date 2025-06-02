
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, FileText, Activity, Database } from 'lucide-react';

const AdminStats = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const [
        { count: totalUsers },
        { count: totalFiles },
        { count: totalActivities },
        { count: totalFileBanks }
      ] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('encrypted_files').select('*', { count: 'exact', head: true }),
        supabase.from('user_activities').select('*', { count: 'exact', head: true }),
        supabase.from('file_banks').select('*', { count: 'exact', head: true })
      ]);

      return {
        totalUsers: totalUsers || 0,
        totalFiles: totalFiles || 0,
        totalActivities: totalActivities || 0,
        totalFileBanks: totalFileBanks || 0
      };
    }
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading statistics...</div>;
  }

  const statCards = [
    {
      title: 'Total Users',
      value: stats?.totalUsers || 0,
      description: 'Registered users in the system',
      icon: Users,
      color: 'text-blue-600'
    },
    {
      title: 'Total Files',
      value: stats?.totalFiles || 0,
      description: 'Encrypted files stored',
      icon: FileText,
      color: 'text-green-600'
    },
    {
      title: 'File Banks',
      value: stats?.totalFileBanks || 0,
      description: 'File banks created',
      icon: Database,
      color: 'text-purple-600'
    },
    {
      title: 'Activities',
      value: stats?.totalActivities || 0,
      description: 'Logged user activities',
      icon: Activity,
      color: 'text-orange-600'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>System Overview</CardTitle>
          <CardDescription>
            Welcome to the administrator dashboard. Use the sidebar to navigate between different management sections.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">User Management</h3>
                <p className="text-sm text-muted-foreground">
                  View, edit, and manage user accounts and roles
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">File Management</h3>
                <p className="text-sm text-muted-foreground">
                  Monitor and manage encrypted files and file banks
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">AI Assistant</h3>
                <p className="text-sm text-muted-foreground">
                  Interactive chatbot for administrative tasks
                </p>
              </div>
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold mb-2">API Manager</h3>
                <p className="text-sm text-muted-foreground">
                  Test and manage API endpoints for admin operations
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminStats;
