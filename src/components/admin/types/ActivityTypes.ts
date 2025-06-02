
// Database types for user activities
export interface UserActivity {
  id: string;
  user_id: string;
  activity_type: string;
  activity_description: string;
  ip_address: unknown | null;
  user_agent: string | null;
  metadata: Record<string, any> | null;
  created_at: string | null;
}

export interface ProfileData {
  email: string;
  full_name: string | null;
}

export interface UserActivityWithProfile extends UserActivity {
  profiles?: ProfileData | null;
}

// Type guards
export const isValidActivity = (activity: any): activity is UserActivity => {
  return (
    activity &&
    typeof activity.id === 'string' &&
    typeof activity.user_id === 'string' &&
    typeof activity.activity_type === 'string' &&
    typeof activity.activity_description === 'string'
  );
};

export const hasProfile = (activity: UserActivityWithProfile): activity is UserActivityWithProfile & { profiles: ProfileData } => {
  return activity.profiles !== null && activity.profiles !== undefined;
};
