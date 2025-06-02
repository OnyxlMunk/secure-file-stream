
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
      // First, get all activities
      const { data: activitiesData, error: activitiesError } = await supabase
        .from('user_activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (activitiesError) {
        console.error('Error fetching activities:', activitiesError);
        throw activitiesError;
      }

      if (!activitiesData || activitiesData.length === 0) {
        return [];
      }

      // Get unique user IDs from activities
      const userIds = [...new Set(activitiesData.map(activity => activity.user_id))];

      // Fetch profiles for these user IDs
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .in('id', userIds);

      if (profilesError) {
        console.error('Error fetching profiles:', profilesError);
        // Continue without profiles data
      }

      // Create a map of user_id to profile for quick lookup
      const profilesMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          profilesMap.set(profile.id, {
            email: profile.email,
            full_name: profile.full_name
          });
        });
      }

      // Combine activities with profile data
      const activitiesWithProfiles = activitiesData
        .filter(isValidActivity)
        .map(activity => ({
          ...activity,
          profiles: profilesMap.get(activity.user_id) || null
        }));

      return activitiesWithProfiles as UserActivityWithProfile[];
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
