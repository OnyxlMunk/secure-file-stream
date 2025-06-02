
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';

const ActivityLogs = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_activities')
        .select(`
          *,
          profiles!user_activities_user_id_fkey (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) {
        console.error('Error fetching activities:', error);
        // If the direct join fails, try a simpler approach
        const { data: simpleData, error: simpleError } = await supabase
          .from('user_activities')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(100);
        
        if (simpleError) throw simpleError;
        return simpleData || [];
      }
      return data || [];
    }
  });

  const getActivityBadgeColor = (type: string): "default" | "secondary" | "destructive" | "outline" => {
    switch (type.toLowerCase()) {
      case 'login':
        return 'default';
      case 'logout':
        return 'secondary';
      case 'file_upload':
        return 'default';
      case 'file_download':
        return 'default';
      case 'admin_action':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (isLoading) {
    return <div className="animate-pulse">Loading activity logs...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Activity Logs
          </CardTitle>
          <CardDescription>
            Monitor user activities and system events
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Activity Type</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Timestamp</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activities?.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    {(activity as any).profiles?.email || activity.user_id || 'Unknown'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActivityBadgeColor(activity.activity_type)}>
                      {activity.activity_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {activity.activity_description ? String(activity.activity_description) : ''}
                  </TableCell>
                  <TableCell>{activity.ip_address || 'N/A'}</TableCell>
                  <TableCell>
                    {new Date(activity.created_at).toLocaleString()}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default ActivityLogs;
