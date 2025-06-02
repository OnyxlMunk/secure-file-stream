
import type { UserActivityWithProfile } from '../types/ActivityTypes';

export const formatIpAddress = (ipAddress: unknown | null): string => {
  if (!ipAddress) return 'N/A';
  try {
    return String(ipAddress);
  } catch {
    return 'N/A';
  }
};

export const formatDate = (dateValue: string | null): string => {
  if (!dateValue) return 'N/A';
  try {
    const date = new Date(dateValue);
    return isNaN(date.getTime()) ? 'Invalid Date' : date.toLocaleString();
  } catch {
    return 'Invalid Date';
  }
};

export const formatDescription = (description: string): string => {
  if (!description) return '';
  return String(description);
};

export const getProfileEmail = (activity: UserActivityWithProfile): string => {
  if (activity.profiles?.email) {
    return activity.profiles.email;
  }
  return activity.user_id || 'Unknown';
};

export const getActivityBadgeColor = (type: string): "default" | "secondary" | "destructive" | "outline" => {
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
