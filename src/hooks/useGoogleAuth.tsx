
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

  const handleRoleSelection = async (userType: "artist" | "client") => {
    if (!user) return;

    try {
      // Update profile with user type
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ 
          user_type: userType,
          is_profile_complete: userType === "client" // clients are complete by default
        })
        .eq("id", user.id);

      if (profileError) {
        console.error("Error updating profile:", profileError);
        return;
      }

      // If artist, create artist profile and redirect to complete profile
      if (userType === "artist") {
        const { error: artistError } = await supabase
          .from("artist_profiles")
          .upsert(
            {
              id: user.id,
              specialty: "",
              location: "",
              bio: "",
              phone: "",
              portfolio_images: [],
            },
            { onConflict: "id" }
          );

        if (artistError) {
          console.error("Error creating artist profile:", artistError);
        }

        setShowRoleSelection(false);
        navigate("/complete-artist-profile");
      } else {
        // Customer - redirect to home
        setShowRoleSelection(false);
        navigate("/home");
      }
    } catch (error) {
      console.error("Error in role selection:", error);
    }
  };

  // Handle Google sign-up flow after authentication
  useEffect(() => {
    const handleGoogleSignUpFlow = async () => {
      if (!user || !profile) return;

      const pendingUserType = localStorage.getItem("pendingUserType");
      const isGoogleSignUp = localStorage.getItem("pendingGoogleSignUp") === "true";

      if (isGoogleSignUp && pendingUserType) {
        console.log("Processing Google sign-up flow", { pendingUserType, userId: user.id });

        try {
          // Update profile with user type
          const { error: profileError } = await supabase
            .from("profiles")
            .update({ 
              user_type: pendingUserType,
              is_profile_complete: pendingUserType === "client" // clients are complete by default
            })
            .eq("id", user.id);

          if (profileError) {
            console.error("Error updating profile:", profileError);
            return;
          }

          // If artist, create artist profile and redirect to complete profile
          if (pendingUserType === "artist") {
            const { error: artistError } = await supabase
              .from("artist_profiles")
              .upsert(
                {
                  id: user.id,
                  specialty: "",
                  location: "",
                  bio: "",
                  phone: "",
                  portfolio_images: [],
                },
                { onConflict: "id" }
              );

            if (artistError) {
              console.error("Error creating artist profile:", artistError);
            }

            // Clean up and redirect to complete profile
            localStorage.removeItem("pendingUserType");
            localStorage.removeItem("pendingGoogleSignUp");
            setPendingGoogleSignUp(false);
            
            console.log("Redirecting artist to complete profile");
            navigate("/complete-artist-profile");
            return;
          } else {
            // Customer - redirect to home
            localStorage.removeItem("pendingUserType");
            localStorage.removeItem("pendingGoogleSignUp");
            setPendingGoogleSignUp(false);
            
            console.log("Redirecting customer to home");
            navigate("/home");
            return;
          }
        } catch (error) {
          console.error("Error in Google sign-up flow:", error);
        }
      }

      // Check if user needs role selection (Google OAuth without prior role selection)
      if (user && profile && !profile.user_type && !isGoogleSignUp) {
        setShowRoleSelection(true);
      }
    };

    handleGoogleSignUpFlow();
  }, [user, profile, navigate]);

  return {
    handleGoogleSignIn,
    handleRoleSelection,
    pendingGoogleSignUp,
    showRoleSelection
  };
};
