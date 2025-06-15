

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

type AuthMode = "sign-in" | "sign-up";

const Auth: React.FC = () => {
  // Move this line here: MUST be placed at the top before any usage of user or profile!
  const { signIn, signUp, signInWithGoogle, profile, user } = useAuth();

  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // fields for sign up
  const [userType, setUserType] = useState<"artist" | "client" | "">("");
  const [fullName, setFullName] = useState("");
  const [artType, setArtType] = useState(""); // For artists
  const [district, setDistrict] = useState(""); // For artists

  // UI/UX
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // new state for tracking Google sign-in with artist selection
  const [pendingGoogleSignUp, setPendingGoogleSignUp] = useState(false);

  const [artistProfile, setArtistProfile] = useState<any>(null);

  // Fetch artist profile after sign in, if user is an artist
  useEffect(() => {
    const fetchArtistProfile = async () => {
      if (user && profile?.user_type === "artist") {
        // Query artist_profiles
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
    // we only want to refetch when user or profile changes
  }, [user, profile]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (authMode === "sign-in") {
      setLoading(true);
      const { error } = await signIn(email, password);
      setLoading(false);

      if (!error) {
        navigate("/");
      } else {
        setError(error.message || "Could not sign in");
      }
    } else {
      // Sign Up Validation
      if (!userType) {
        setError("Please select Artist or Customer.");
        return;
      }
      if (!email || !password) {
        setError("Email and password are required.");
        return;
      }
      if (!fullName.trim()) {
        setError("Name is required.");
        return;
      }
      if (userType === "artist" && (!artType.trim() || !district.trim())) {
        setError("Please provide your Art Type and District.");
        return;
      }

      setLoading(true);

      // 1. Register user in Supabase Auth
      const { error } = await signUp(email, password, userType);
      if (error) {
        setLoading(false);
        setError(error.message || "Could not sign up");
        return;
      }

      // 2. After signup, update profile with extra info (and create artist_profile)
      // Supabase Auth will trigger the row insert for `profiles` automatically.
      // But we need to update with full_name, user_type, etc.

      // Wait for user to exist (small delay for Supabase signup process)
      setTimeout(async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return;

        const user_id = user.user.id;

        // Update profiles with full name and user_type
        await supabase
          .from("profiles")
          .update({ full_name: fullName, user_type: userType })
          .eq("id", user_id);

        // If artist, also ensure artist_profiles row exists
        if (userType === "artist") {
          await supabase
            .from("artist_profiles")
            .upsert(
              {
                id: user_id,
                specialty: artType,
                location: district,
                bio: "",
                phone: "",
                portfolio_images: [],
              },
              { onConflict: "id" }
            );
        }

        setLoading(false);
        navigate("/");
      }, 1200);

      // Show a toast or message: "Check your email to confirm registration." (handled in AuthContext)
    }
  };

  const handleGoogleLogin = async () => {
    if (authMode === "sign-up" && userType === "") {
      setError("Please select Artist or Customer before signing up with Google.");
      return;
    }

    // Store the user type in localStorage for Google signup flow
    if (authMode === "sign-up") {
      localStorage.setItem("pendingUserType", userType);
      setPendingGoogleSignUp(true);
    }

    setLoading(true);
    const { error } = await signInWithGoogle(); // using AuthContext
    setLoading(false);

    if (error) {
      setError(error.message || "Google Sign-in failed");
      localStorage.removeItem("pendingUserType");
      setPendingGoogleSignUp(false);
    }
  };

  // Handle redirection after Google authentication
  useEffect(() => {
    if (user && profile) {
      const pendingUserType = localStorage.getItem("pendingUserType");
      
      // If this was a Google sign-up flow
      if (pendingGoogleSignUp && pendingUserType) {
        // Update the user's profile with the selected user type
        const updateGoogleUserProfile = async () => {
          // Update the profile first
          await supabase
            .from("profiles")
            .update({ user_type: pendingUserType })
            .eq("id", user.id);

          // If artist, create artist profile entry and redirect to complete profile
          if (pendingUserType === "artist") {
            await supabase
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
            
            // Clean up first
            localStorage.removeItem("pendingUserType");
            setPendingGoogleSignUp(false);
            
            // Force redirect to complete artist profile
            navigate("/complete-artist-profile");
            return;
          } else {
            // Customer - redirect to home
            localStorage.removeItem("pendingUserType");
            setPendingGoogleSignUp(false);
            navigate("/");
            return;
          }
        };

        updateGoogleUserProfile();
        return;
      }

      // Normal sign-in flow redirection (only if not in Google sign-up flow)
      if (!pendingGoogleSignUp) {
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
    }
  }, [user, profile, artistProfile, pendingGoogleSignUp, navigate]);

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
            <form className="space-y-4" onSubmit={handleAuth}>
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  disabled={loading}
                  onChange={e => setEmail(e.target.value)}
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  disabled={loading}
                  onChange={e => setPassword(e.target.value)}
                  className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>

              {authMode === "sign-up" && (
                <>
                  <div className="space-y-3">
                    <Label className="text-sm font-medium text-gray-700">
                      I am a:
                    </Label>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        type="button"
                        variant={userType === "client" ? "default" : "outline"}
                        onClick={() => setUserType("client")}
                        className={`h-11 ${userType === "client" ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                        disabled={loading}
                      >
                        Customer
                      </Button>
                      <Button
                        type="button"
                        variant={userType === "artist" ? "default" : "outline"}
                        onClick={() => setUserType("artist")}
                        className={`h-11 ${userType === "artist" ? 'bg-blue-600 hover:bg-blue-700' : 'border-gray-200 hover:bg-gray-50'}`}
                        disabled={loading}
                      >
                        Artist
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-gray-700">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      placeholder="Enter your full name"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      disabled={loading}
                      className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>

                  {userType === "artist" && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="artType" className="text-sm font-medium text-gray-700">
                          Art Specialty
                        </Label>
                        <Input
                          id="artType"
                          placeholder="e.g. Painter, Sculptor, Digital Artist"
                          value={artType}
                          onChange={e => setArtType(e.target.value)}
                          disabled={loading}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="district" className="text-sm font-medium text-gray-700">
                          Location
                        </Label>
                        <Input
                          id="district"
                          placeholder="Your city or district"
                          value={district}
                          onChange={e => setDistrict(e.target.value)}
                          disabled={loading}
                          className="h-11 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                        />
                      </div>
                    </>
                  )}
                </>
              )}

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white font-medium"
                disabled={loading}
              >
                {loading
                  ? (authMode === "sign-in" ? "Signing in..." : "Creating account...")
                  : (authMode === "sign-in" ? "Sign In" : "Create Account")}
              </Button>

              {/* Google Sign-In Button */}
              <div className="flex items-center justify-center mt-4">
                <Button
                  type="button"
                  className="w-full h-11 flex items-center gap-2 bg-white border border-gray-200 text-gray-700 shadow hover:bg-blue-50 transition"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  {authMode === "sign-in" ? "Sign in with Google" : "Sign up with Google"}
                </Button>
              </div>
            </form>

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
export default Auth;
