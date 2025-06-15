import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

export const useGoogleAuth = () => {
  const { signInWithGoogle } = useAuth();
  const [loading, setLoading] = useState(false);
  const handleGoogleSignIn = async () => {
    setLoading(true);
    await signInWithGoogle();
    setLoading(false);
  };
  return { handleGoogleSignIn, loading };
};
