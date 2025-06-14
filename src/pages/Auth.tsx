
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";

type AuthMode = "sign-in" | "sign-up";

const Auth: React.FC = () => {
  const { signIn, signUp } = useAuth();
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      <Card className="max-w-md w-full p-8 mx-2">
        <div className="mb-6 flex gap-2">
          <Button 
            variant={authMode === "sign-in" ? "default" : "outline"}
            className="w-1/2"
            onClick={() => setAuthMode("sign-in")}
          >Sign In</Button>
          <Button
            variant={authMode === "sign-up" ? "default" : "outline"}
            className="w-1/2"
            onClick={() => setAuthMode("sign-up")}
          >Sign Up</Button>
        </div>

        <form className="flex flex-col gap-4" onSubmit={handleAuth}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            disabled={loading}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            disabled={loading}
            onChange={e => setPassword(e.target.value)}
            required
          />

          {authMode === "sign-up" && (
            <>
              {/* Choose user type */}
              <label className="block font-medium text-gray-700">
                I am a:
              </label>
              <div className="flex gap-4 mb-2">
                <Button
                  type="button"
                  variant={userType === "client" ? "default" : "outline"}
                  onClick={() => setUserType("client")}
                  className="flex-1"
                  disabled={loading}
                >
                  Customer
                </Button>
                <Button
                  type="button"
                  variant={userType === "artist" ? "default" : "outline"}
                  onClick={() => setUserType("artist")}
                  className="flex-1"
                  disabled={loading}
                >
                  Artist
                </Button>
              </div>

              {/* Name is always required */}
              <Input
                placeholder="Full Name"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={loading}
              />

              {/* Show these only for artist */}
              {userType === "artist" && (
                <>
                  <Input
                    placeholder="Art Type (e.g. Painter, Sculptor)"
                    value={artType}
                    onChange={e => setArtType(e.target.value)}
                    disabled={loading}
                  />
                  <Input
                    placeholder="District"
                    value={district}
                    onChange={e => setDistrict(e.target.value)}
                    disabled={loading}
                  />
                </>
              )}
            </>
          )}

          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm">{error}</div>
          )}

          <Button type="submit" loading={loading} className="mt-2 w-full">
            {authMode === "sign-in" ? "Sign In" : "Sign Up"}
          </Button>
        </form>
        <div className="mt-4">
          <Badge>
            {authMode === "sign-in"
              ? "Don’t have an account? Sign up above."
              : "Already have an account? Click Sign In above."}
          </Badge>
        </div>
      </Card>
    </div>
  );
};

export default Auth;
