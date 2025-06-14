
import React, { createContext, useContext, useEffect, useState, useRef } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  user_type: 'artist' | 'client';
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signUp: (email: string, password: string, userType: 'artist' | 'client') => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  
  const hasRedirectedRef = useRef(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
            
            console.log('Profile data:', profileData);
            
            if (profileData) {
              setProfile({
                ...profileData,
                user_type: profileData.user_type as 'artist' | 'client'
              });

              // Simple Google OAuth redirect logic
              const pendingUserType = localStorage.getItem('pendingUserType');
              
              if (pendingUserType && !hasRedirectedRef.current) {
                hasRedirectedRef.current = true;
                
                if (pendingUserType === 'artist') {
                  // Update profile to artist type
                  await supabase
                    .from('profiles')
                    .update({ user_type: 'artist' })
                    .eq('id', session.user.id);
                  
                  // Create artist profile
                  await supabase
                    .from('artist_profiles')
                    .upsert(
                      {
                        id: session.user.id,
                        specialty: '',
                        location: '',
                        phone: '',
                        bio: '',
                        portfolio_images: [],
                      },
                      { onConflict: 'id' }
                    );
                  
                  localStorage.removeItem('pendingUserType');
                  window.location.href = '/complete-profile';
                  return;
                } else if (pendingUserType === 'client') {
                  // Update profile to client type
                  await supabase
                    .from('profiles')
                    .update({ user_type: 'client' })
                    .eq('id', session.user.id);
                  
                  localStorage.removeItem('pendingUserType');
                  window.location.href = '/';
                  return;
                }
              }

              // Check if artist needs to complete profile
              if (profileData.user_type === 'artist' && !hasRedirectedRef.current) {
                const { data: artistProfile } = await supabase
                  .from('artist_profiles')
                  .select('specialty, location, phone')
                  .eq('id', session.user.id)
                  .maybeSingle();

                // If artist profile is incomplete, redirect to complete profile
                if (!artistProfile || !artistProfile.specialty || !artistProfile.location || !artistProfile.phone) {
                  if (window.location.pathname !== '/complete-profile') {
                    hasRedirectedRef.current = true;
                    window.location.href = '/complete-profile';
                    return;
                  }
                }
              }

              // Redirect from auth page to home if user is fully set up
              if (window.location.pathname === '/auth' && !hasRedirectedRef.current) {
                hasRedirectedRef.current = true;
                window.location.href = '/';
              }
            }
          }, 0);
        } else {
          setProfile(null);
          hasRedirectedRef.current = false;
        }
        
        setLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('Initial session:', session);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, userType: 'artist' | 'client') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          user_type: userType
        }
      }
    });

    if (error) {
      toast({
        title: "Sign up failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      toast({
        title: "Check your email",
        description: "We've sent you a confirmation link to complete your registration."
      });
    }

    return { error };
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      toast({
        title: "Sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: redirectUrl
      }
    });

    if (error) {
      toast({
        title: "Google sign in failed",
        description: error.message,
        variant: "destructive"
      });
    }

    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    hasRedirectedRef.current = false;
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) return { error: new Error('No user logged in') };

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id);

    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive"
      });
    } else {
      // Refresh profile data
      const { data: updatedProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      if (updatedProfile) {
        setProfile({
          ...updatedProfile,
          user_type: updatedProfile.user_type as 'artist' | 'client'
        });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully."
      });
    }

    return { error };
  };

  const value = {
    user,
    session,
    profile,
    loading,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
