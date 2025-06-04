
import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  profile: any;
  refreshProfile: () => Promise<void>;
  isAdmin: boolean;
  userRole: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // ============================================================================
  // TEMPORARY BYPASS: Mock authentication state for testing
  // ============================================================================
  // Use a proper UUID format for the mock user
  const mockUserId = '550e8400-e29b-41d4-a716-446655440000';
  
  const mockUser: User = {
    id: mockUserId,
    email: 'test@example.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    aud: 'authenticated',
    app_metadata: {},
    user_metadata: { full_name: 'Test User' },
    role: 'authenticated',
    email_confirmed_at: new Date().toISOString(),
    phone_confirmed_at: null,
    confirmation_sent_at: null,
    recovery_sent_at: null,
    email_change_sent_at: null,
    new_email: null,
    new_phone: null,
    invited_at: null,
    action_link: null,
    phone: null,
    last_sign_in_at: new Date().toISOString()
  };

  const mockSession: Session = {
    access_token: 'mock-access-token',
    refresh_token: 'mock-refresh-token',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    token_type: 'bearer',
    user: mockUser
  };

  const mockProfile = {
    id: mockUserId,
    email: 'test@example.com',
    full_name: 'Test User',
    subscription_tier: 'free',
    points: 100,
    bio: 'This is a test user for development purposes.',
    phone: '+1-555-0123',
    timezone: 'UTC',
    profile_completed: true,
    avatar_url: null,
    max_file_size_mb: 10,
    max_monthly_encryptions: 10,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    last_login_at: new Date().toISOString()
  };

  // Mock state - always authenticated as admin
  const [user] = useState<User | null>(mockUser);
  const [session] = useState<Session | null>(mockSession);
  const [loading] = useState(false);
  const [profile] = useState<any>(mockProfile);
  const [isAdmin] = useState(true); // Mock as admin for testing
  const [userRole] = useState<string | null>('admin');

  // Mock functions - no-ops for testing
  const { toast } = useToast();

  const signUp = async (email: string, password: string, fullName?: string) => {
    toast({
      title: "Authentication Disabled",
      description: "Sign up is temporarily disabled for testing.",
    });
    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    toast({
      title: "Authentication Disabled", 
      description: "Sign in is temporarily disabled for testing.",
    });
    return { error: null };
  };

  const signOut = async () => {
    toast({
      title: "Authentication Disabled",
      description: "Sign out is temporarily disabled for testing.",
    });
  };

  const refreshProfile = async () => {
    // Mock refresh - no-op
  };

  // ============================================================================
  // ORIGINAL AUTHENTICATION CODE (COMMENTED OUT FOR TEMPORARY BYPASS)
  // ============================================================================
  // const [user, setUser] = useState<User | null>(null);
  // const [session, setSession] = useState<Session | null>(null);
  // const [loading, setLoading] = useState(true);
  // const [profile, setProfile] = useState<any>(null);
  // const [isAdmin, setIsAdmin] = useState(false);
  // const [userRole, setUserRole] = useState<string | null>(null);
  // const { toast } = useToast();

  // const fetchProfile = async (userId: string) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('profiles')
  //       .select('*')
  //       .eq('id', userId)
  //       .single();

  //     if (error) throw error;
  //     setProfile(data);
  //   } catch (error) {
  //     console.error('Error fetching profile:', error);
  //   }
  // };

  // const fetchUserRole = async (userId: string) => {
  //   try {
  //     const { data, error } = await supabase
  //       .from('user_roles')
  //       .select('role')
  //       .eq('user_id', userId)
  //       .single();

  //     if (error) {
  //       console.error('Error fetching user role:', error);
  //       setUserRole('user');
  //       setIsAdmin(false);
  //       return;
  //     }

  //     setUserRole(data.role);
  //     setIsAdmin(data.role === 'admin');
  //   } catch (error) {
  //     console.error('Error fetching user role:', error);
  //     setUserRole('user');
  //     setIsAdmin(false);
  //   }
  // };

  // const refreshProfile = async () => {
  //   if (user) {
  //     await fetchProfile(user.id);
  //     await fetchUserRole(user.id);
  //   }
  // };

  // const checkSubscription = async () => {
  //   if (user) {
  //     try {
  //       await supabase.functions.invoke('check-subscription');
  //       await refreshProfile();
  //     } catch (error) {
  //       console.error('Error checking subscription:', error);
  //     }
  //   }
  // };

  // useEffect(() => {
  //   // Set up auth state listener
  //   const { data: { subscription } } = supabase.auth.onAuthStateChange(
  //     async (event, session) => {
  //       setSession(session);
  //       setUser(session?.user ?? null);
        
  //       if (session?.user) {
  //         // Fetch user profile and role when logged in
  //         setTimeout(async () => {
  //           await fetchProfile(session.user.id);
  //           await fetchUserRole(session.user.id);
  //           // Check subscription status after profile is loaded
  //           setTimeout(() => {
  //             checkSubscription();
  //           }, 1000);
  //         }, 0);
  //       } else {
  //         setProfile(null);
  //         setUserRole(null);
  //         setIsAdmin(false);
  //       }
        
  //       setLoading(false);
  //     }
  //   );

  //   // Check for existing session
  //   supabase.auth.getSession().then(({ data: { session } }) => {
  //     setSession(session);
  //     setUser(session?.user ?? null);
      
  //     if (session?.user) {
  //       fetchProfile(session.user.id).then(() => {
  //         fetchUserRole(session.user.id).then(() => {
  //           checkSubscription();
  //         });
  //       });
  //     }
      
  //     setLoading(false);
  //   });

  //   return () => subscription.unsubscribe();
  // }, []);

  // const signUp = async (email: string, password: string, fullName?: string) => {
  //   const redirectUrl = `${window.location.origin}/`;
    
  //   const { error } = await supabase.auth.signUp({
  //     email,
  //     password,
  //     options: {
  //       emailRedirectTo: redirectUrl,
  //       data: fullName ? { full_name: fullName } : undefined
  //     }
  //   });

  //   if (error) {
  //     toast({
  //       title: "Sign up failed",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   } else {
  //     toast({
  //       title: "Check your email",
  //       description: "We've sent you a confirmation link to complete your registration.",
  //     });
  //   }

  //   return { error };
  // };

  // const signIn = async (email: string, password: string) => {
  //   const { error } = await supabase.auth.signInWithPassword({
  //     email,
  //     password,
  //   });

  //   if (error) {
  //     toast({
  //       title: "Sign in failed",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   }

  //   return { error };
  // };

  // const signOut = async () => {
  //   const { error } = await supabase.auth.signOut();
  //   if (error) {
  //     toast({
  //       title: "Sign out failed",
  //       description: error.message,
  //       variant: "destructive",
  //     });
  //   }
  // };
  // ============================================================================
  // END OF ORIGINAL AUTHENTICATION CODE
  // ============================================================================

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signUp,
      signIn,
      signOut,
      profile,
      refreshProfile,
      isAdmin,
      userRole
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
