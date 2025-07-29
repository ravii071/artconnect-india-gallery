
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { AuthForm } from "@/components/auth/AuthForm";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const Auth: React.FC = () => {
  const { signIn, signUp, profile, user } = useAuth();
  const { handleGoogleSignIn } = useGoogleAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect after login if profile NOT complete
  useEffect(() => {
    if (user) {
      // If profile missing or profile.is_profile_complete === false, require completion
      if (!profile || !profile.is_profile_complete) {
        navigate("/complete-profile");
      } else {
        // Route by user type
        if (profile.user_type === "artist") {
          navigate("/dashboard");
        } else {
          navigate("/home");
        }
      }
    }
  }, [user, profile, navigate]);

  const handleAuth = async (data: any) => {
    setError(null);
    setLoading(true);
    try {
      if (data.type === "sign-in") {
        const { error } = await signIn(data.email, data.password);
        if (error) {
          setError(error.message || "Could not sign in");
        } else if (data.userType) {
          // Update user type after successful sign-in
          const { data: userData } = await supabase.auth.getUser();
          if (userData?.user) {
            await supabase
              .from("profiles")
              .update({ user_type: data.userType })
              .eq("id", userData.user.id);
          }
        }
      } else {
        // Email/password sign up flow
        if (!data.email || !data.password) {
          setError("Email and password are required.");
          setLoading(false);
          return;
        }
        if (!data.fullName || !data.fullName.trim()) {
          setError("Full name is required.");
          setLoading(false);
          return;
        }
        const { error } = await signUp(data.email, data.password, "client"); // store as client for now
        if (!error) {
          // After successful signup, update full_name
          setTimeout(async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (userData?.user) {
              const user_id = userData.user.id;
              await supabase
                .from("profiles")
                .update({ full_name: data.fullName })
                .eq("id", user_id);
            }
          }, 1000);
        } else {
          setError(error.message || "Could not sign up");
        }
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
      await handleGoogleSignIn();
    } catch (err: any) {
      setError(err.message || "Google Sign-in failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <AuthForm
        onSubmit={handleAuth}
        onGoogleSignIn={handleGoogleAuth}
        loading={loading}
        error={error}
      />
    </>
  );
};

export default Auth;
