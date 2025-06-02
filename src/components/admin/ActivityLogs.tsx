
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import type { UserActivityWithProfile } from './types/ActivityTypes';
import { isValidActivity } from './types/ActivityTypes';
import { 
  formatIpAddress, 
  formatDate, 
  formatDescription, 
  getProfileEmail, 
  getActivityBadgeColor 
} from './utils/activityUtils';

const ActivityLogs = () => {
  const { data: activities, isLoading } = useQuery({
    queryKey: ['admin-activities'],
    queryFn: async (): Promise<UserActivityWithProfile[]> => {
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
        throw error;
      }

      // Filter and validate the joined data
      const validActivities = (data || []).filter(isValidActivity);
      return validActivities as UserActivityWithProfile[];
    }
  });

  if (isLoading) {
    return <div className="animate-pulse">Loading activity logs...</div>;
  }

  // Safety check for activities array
  if (!activities || !Array.isArray(activities)) {
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
            <div className="text-center text-muted-foreground">
              No activity logs available
            </div>
          </CardContent>
        </Card>
      </div>
    );
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
              {activities.map((activity) => (
                <TableRow key={activity.id}>
                  <TableCell>
                    {getProfileEmail(activity)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={getActivityBadgeColor(activity.activity_type)}>
                      {activity.activity_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-md truncate">
                    {formatDescription(activity.activity_description)}
                  </TableCell>
                  <TableCell>{formatIpAddress(activity.ip_address)}</TableCell>
                  <TableCell>
                    {formatDate(activity.created_at)}
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
