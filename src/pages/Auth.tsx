import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import SelectRole from "./SelectRole";
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
        const { data } = await supabase
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
          setLoading(false);
          return;
        }
        if (!data.email || !data.password) {
          setError("Email and password are required.");
          setLoading(false);
          return;
        }
        if (!data.fullName.trim()) {
          setError("Name is required.");
          setLoading(false);
          return;
        }
        if (data.userType === "artist" && (!data.artType.trim() || !data.district.trim())) {
          setError("Please provide your Art Type and District.");
          setLoading(false);
          return;
        }
        // Register user in Supabase Auth
        const { error } = await signUp(data.email, data.password, data.userType);
        if (error) {
          setError(error.message || "Could not sign up");
          setLoading(false);
          return;
        }

        // After signup, update profile with extra info and route
        setTimeout(async () => {
          const { data: user } = await supabase.auth.getUser();
          if (!user?.user) return;

          const user_id = user.user.id;

          await supabase
            .from("profiles")
            .update({ 
              full_name: data.fullName, 
              user_type: data.userType,
              is_profile_complete: data.userType === "client"
            })
            .eq("id", user_id);

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
            navigate("/complete-artist-profile");
          } else {
            navigate("/home");
          }
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

  // All role selection is now handled on the /select-role page
  // Routing after sign in
  useEffect(() => {
    if (user && profile && !pendingGoogleSignUp) {
      if (!profile.user_type) {
        navigate("/select-role");
      } else if (profile.user_type === "artist") {
        if (
          !profile.is_profile_complete ||
          !artistProfile ||
          !artistProfile.specialty ||
          !artistProfile.location ||
          artistProfile.specialty.trim() === "" ||
          artistProfile.location.trim() === ""
        ) {
          navigate("/complete-artist-profile");
        } else {
          navigate("/dashboard");
        }
      } else if (profile.user_type === "client") {
        navigate("/home");
      }
    }
  }, [user, profile, artistProfile, pendingGoogleSignUp, navigate]);

  return (
    <>
      <AuthForm
        onSubmit={handleAuth}
        onGoogleSignIn={handleGoogleAuth}
        loading={loading}
        error={error}
      />
      {/* Role selection UI is now a page, not a modal */}
    </>
  );
};

export default Auth;
