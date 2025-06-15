
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const Auth: React.FC = () => {
  const { signIn, signUp, profile, user } = useAuth();
  const { handleGoogleSignIn, pendingGoogleSignUp } = useGoogleAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [artistProfile, setArtistProfile] = useState<any>(null);
  const navigate = useNavigate();

  // Fetch artist profile after sign in, if user is an artist
  useEffect(() => {
    const fetchArtistProfile = async () => {
      if (user && profile?.user_type === "artist") {
        const { data, error } = await supabase
          .from("artist_profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        setArtistProfile(data);
      } else {
        setArtistProfile(null);
      }
    };
    fetchArtistProfile();
  }, [user, profile]);

  const handleAuth = async (data: any) => {
    setError(null);
    setLoading(true);

    try {
      if (data.type === "sign-in") {
        const { error } = await signIn(data.email, data.password);
        if (!error) {
          navigate("/");
        } else {
          setError(error.message || "Could not sign in");
        }
      } else {
        // Sign Up Validation
        if (!data.userType) {
          setError("Please select Artist or Customer.");
          return;
        }
        if (!data.email || !data.password) {
          setError("Email and password are required.");
          return;
        }
        if (!data.fullName.trim()) {
          setError("Name is required.");
          return;
        }
        if (data.userType === "artist" && (!data.artType.trim() || !data.district.trim())) {
          setError("Please provide your Art Type and District.");
          return;
        }

        // Register user in Supabase Auth
        const { error } = await signUp(data.email, data.password, data.userType);
        if (error) {
          setError(error.message || "Could not sign up");
          return;
        }

        // After signup, update profile with extra info
        setTimeout(async () => {
          const { data: user } = await supabase.auth.getUser();
          if (!user?.user) return;

          const user_id = user.user.id;

          // Update profiles with full name and user_type
          await supabase
            .from("profiles")
            .update({ full_name: data.fullName, user_type: data.userType })
            .eq("id", user_id);

          // If artist, also ensure artist_profiles row exists
          if (data.userType === "artist") {
            await supabase
              .from("artist_profiles")
              .upsert(
                {
                  id: user_id,
                  specialty: data.artType,
                  location: data.district,
                  bio: "",
                  phone: "",
                  portfolio_images: [],
                },
                { onConflict: "id" }
              );
          }

          navigate("/");
        }, 1200);
      }
    } catch (err: any) {
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setError(null);
    setLoading(true);

    try {
      await handleGoogleSignIn("sign-in");
    } catch (err: any) {
      setError(err.message || "Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  // Handle normal sign-in flow redirection (only if not in Google sign-up flow)
  useEffect(() => {
    if (user && profile && !pendingGoogleSignUp) {
      if (profile.user_type === "artist") {
        // Check for essential info in artist profile
        if (
          !artistProfile ||
          !artistProfile.specialty ||
          !artistProfile.location ||
          artistProfile.specialty.trim() === "" ||
          artistProfile.location.trim() === ""
        ) {
          navigate("/complete-artist-profile");
        } else {
          navigate("/");
        }
      } else if (profile.user_type === "client") {
        navigate("/");
      }
    }
  }, [user, profile, artistProfile, pendingGoogleSignUp, navigate]);

  return (
    <AuthForm
      onSubmit={handleAuth}
      onGoogleSignIn={handleGoogleAuth}
      loading={loading}
      error={error}
    />
  );
};

export default Auth;
