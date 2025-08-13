
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AuthForm } from "@/components/auth/AuthForm";
import { useGoogleAuth } from "@/hooks/useGoogleAuth";

const Auth: React.FC = () => {
  const { signIn, signUp, profile, user } = useAuth();
  const { handleGoogleSignIn } = useGoogleAuth();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Redirect after login based on user type and profile completion
  useEffect(() => {
    if (user && profile) {
      console.log('User authenticated, redirecting...', { user: user.id, profile: profile.user_type, isComplete: profile.is_profile_complete });
      
      if (!profile.is_profile_complete) {
        navigate("/select-role");
      } else {
        // Redirect to appropriate dashboard based on user type
        if (profile.user_type === "artist") {
          navigate("/dashboard");
        } else if (profile.user_type === "client") {
          navigate("/customer-dashboard");
        } else {
          // Default fallback to customer dashboard
          navigate("/customer-dashboard");
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
          setError(error.message || "Invalid email or password");
        }
      } else {
        if (!data.email || !data.password || !data.fullName?.trim()) {
          setError("All fields are required");
          return;
        }
        
        const { error } = await signUp(data.email, data.password, "client");
        if (error) {
          setError(error.message || "Could not create account");
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
    <AuthForm
      onSubmit={handleAuth}
      onGoogleSignIn={handleGoogleAuth}
      loading={loading}
      error={error}
    />
  );
};

export default Auth;
