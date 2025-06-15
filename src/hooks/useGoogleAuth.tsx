import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useGoogleAuth = () => {
  const { user, profile, signInWithGoogle } = useAuth();
  const navigate = useNavigate();
  const [pendingGoogleSignUp, setPendingGoogleSignUp] = useState(false);
  const [showRoleSelection, setShowRoleSelection] = useState(false);

  const handleGoogleSignIn = async (authMode: "sign-in" | "sign-up", userType?: "artist" | "client") => {
    if (authMode === "sign-up" && userType) {
      localStorage.setItem("pendingUserType", userType);
      localStorage.setItem("pendingGoogleSignUp", "true");
      setPendingGoogleSignUp(true);
    }

    const { error } = await signInWithGoogle();
    if (error) {
      localStorage.removeItem("pendingUserType");
      localStorage.removeItem("pendingGoogleSignUp");
      setPendingGoogleSignUp(false);
      throw error;
    }
  };

  useEffect(() => {
    const handleGoogleSignUpFlow = async () => {
      if (!user) return;

      const pendingUserType = localStorage.getItem("pendingUserType");
      const isGoogleSignUp = localStorage.getItem("pendingGoogleSignUp") === "true";

      if (isGoogleSignUp && pendingUserType && profile) {
        // New Google user, assign role and route accordingly
        try {
          await supabase
            .from("profiles")
            .update({
              user_type: pendingUserType,
              is_profile_complete: pendingUserType === "client"
            })
            .eq("id", user.id);

          if (pendingUserType === "artist") {
            await supabase.from("artist_profiles").upsert({
              id: user.id,
              specialty: "",
              location: "",
              bio: "",
              phone: "",
              portfolio_images: []
            }, { onConflict: "id" });

            localStorage.removeItem("pendingUserType");
            localStorage.removeItem("pendingGoogleSignUp");
            setPendingGoogleSignUp(false);

            navigate("/complete-artist-profile");
            return;
          } else {
            localStorage.removeItem("pendingUserType");
            localStorage.removeItem("pendingGoogleSignUp");
            setPendingGoogleSignUp(false);

            navigate("/home");
            return;
          }
        } catch (error) {
          console.error("Error in Google sign-up flow:", error);
        }
      }

      // Normal Google login (existing user), if no role, go to /select-role
      if (user && profile && !profile.user_type) {
        navigate("/select-role");
      }
    };

    handleGoogleSignUpFlow();
    // eslint-disable-next-line
  }, [user, profile, navigate]);

  return {
    handleGoogleSignIn,
    pendingGoogleSignUp,
    showRoleSelection: false // not needed, just for compatibility
  };
};
