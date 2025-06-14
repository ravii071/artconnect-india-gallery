import React, { createContext, useContext, useEffect, useState } from 'react';
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

              // Handle Google OAuth redirect for artists
              const pendingUserType = localStorage.getItem('pendingUserType');
              
              if (event === 'SIGNED_IN' && pendingUserType === 'artist') {
                // Update profile with artist user type if not set
                if (!profileData.user_type || profileData.user_type !== 'artist') {
                  await supabase
                    .from('profiles')
                    .update({ user_type: 'artist' })
                    .eq('id', session.user.id);
                }
                
                // Create empty artist profile
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
                setTimeout(() => {
                  window.location.href = '/complete-profile';
                }, 500);
                return;
              } else if (event === 'SIGNED_IN' && pendingUserType === 'client') {
                // Update profile with client user type if not set
                if (!profileData.user_type || profileData.user_type !== 'client') {
                  await supabase
                    .from('profiles')
                    .update({ user_type: 'client' })
                    .eq('id', session.user.id);
                }
                
                localStorage.removeItem('pendingUserType');
                setTimeout(() => {
                  window.location.href = '/';
                }, 500);
                return;
              }

              // Check if this is an artist who needs to complete profile
              if (profileData.user_type === 'artist') {
                const { data: artistProfile } = await supabase
                  .from('artist_profiles')
                  .select('specialty, location, phone')
                  .eq('id', session.user.id)
                  .maybeSingle();

                console.log('Artist profile data:', artistProfile);

                // If artist profile doesn't exist or is incomplete, redirect to complete profile
                if (!artistProfile || !artistProfile.specialty || !artistProfile.location || !artistProfile.phone) {
                  if (window.location.pathname !== '/complete-profile') {
                    console.log('Redirecting to complete profile');
                    setTimeout(() => {
                      window.location.href = '/complete-profile';
                    }, 500);
                  }
                  return;
                }
              }

              // If we're on auth page and user is fully set up, redirect to home
              if (window.location.pathname === '/auth') {
                setTimeout(() => {
                  window.location.href = '/';
                }, 500);
              }
            } else if (session?.user && event === 'SIGNED_IN') {
              // No profile exists - this shouldn't happen with the trigger but handle it
              console.log('No profile found for user, this is unexpected');
            }
          }, 0);
        } else {
          setProfile(null);
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
