
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { SignInForm } from "./SignInForm";
import { SignUpForm } from "./SignUpForm";
import { GoogleSignInButton } from "./GoogleSignInButton";

type AuthMode = "sign-in" | "sign-up";

interface AuthFormProps {
  onSubmit: (data: any) => Promise<void>;
  onGoogleSignIn: () => Promise<void>;
  loading: boolean;
  error: string | null;
}

export const AuthForm: React.FC<AuthFormProps> = ({
  onSubmit,
  onGoogleSignIn,
  loading,
  error
}) => {
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome to ArtSpace
          </h1>
          <p className="text-gray-600">
            {authMode === "sign-in" 
              ? "Sign in to your account" 
              : "Create your account"
            }
          </p>
        </div>

        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex gap-1">
              <Button 
                variant={authMode === "sign-in" ? "default" : "ghost"}
                className={`flex-1 ${authMode === "sign-in" ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                onClick={() => setAuthMode("sign-in")}
              >
                Sign In
              </Button>
              <Button
                variant={authMode === "sign-up" ? "default" : "ghost"}
                className={`flex-1 ${authMode === "sign-up" ? 'bg-blue-600 hover:bg-blue-700' : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'}`}
                onClick={() => setAuthMode("sign-up")}
              >
                Sign Up
              </Button>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {authMode === "sign-in" ? (
              <SignInForm onSubmit={onSubmit} loading={loading} error={error} />
            ) : (
              <SignUpForm onSubmit={onSubmit} loading={loading} error={error} />
            )}

            <GoogleSignInButton 
              authMode={authMode}
              onGoogleSignIn={onGoogleSignIn}
              loading={loading}
            />

            <div className="text-center text-sm text-gray-600 mt-6">
              {authMode === "sign-in" ? (
                <>
                  Don't have an account?{" "}
                  <button
                    onClick={() => setAuthMode("sign-up")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign up
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button
                    onClick={() => setAuthMode("sign-in")}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Sign in
                  </button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
