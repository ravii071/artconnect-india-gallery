
import React from "react";
import { Button } from "@/components/ui/button";

interface GoogleSignInButtonProps {
  authMode: "sign-in" | "sign-up";
  onGoogleSignIn: () => Promise<void>;
  loading: boolean;
}

export const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({
  authMode,
  onGoogleSignIn,
  loading
}) => {
  return (
    <div className="flex items-center justify-center mt-4">
      <Button
        type="button"
        className="w-full h-11 flex items-center gap-2 bg-white border border-gray-200 text-gray-700 shadow hover:bg-blue-50 transition"
        onClick={onGoogleSignIn}
        disabled={loading}
      >
        <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
        {authMode === "sign-in" ? "Sign in with Google" : "Sign up with Google"}
      </Button>
    </div>
  );
};
