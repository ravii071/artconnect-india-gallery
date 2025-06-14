
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";

type AuthMode = "sign-in" | "sign-up";

const Auth: React.FC = () => {
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode>("sign-in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  // fields for sign up
  const [userType, setUserType] = useState<"artist" | "client" | "">("");
  const [fullName, setFullName] = useState("");
  const [artType, setArtType] = useState(""); // For artists
  const [district, setDistrict] = useState(""); // For artists
  const [phone, setPhone] = useState(""); // For artists

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
      if (userType === "artist") {
        if (!artType.trim() || !district.trim() || !phone.trim()) {
          setError("Please provide Art Type, District, and Phone.");
          return;
        }
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
      setTimeout(async () => {
        const { data: user } = await supabase.auth.getUser();
        if (!user?.user) return;

        const user_id = user.user.id;
        // Update profiles with full name and user_type
        await supabase
          .from("profiles")
          .update({ full_name: fullName, user_type: userType })
          .eq("id", user_id);
        // If artist, also ensure artist_profiles row exists & update essentials
        if (userType === "artist") {
          await supabase
            .from("artist_profiles")
            .upsert(
              {
                id: user_id,
                specialty: artType,
                location: district,
                phone: phone,
                bio: "",
                portfolio_images: [],
              },
              { onConflict: "id" }
            );
        }

        setLoading(false);
        navigate("/");
      }, 1200);
    }
  };

  // Helper for section titles
  const SectionTitle = ({ title }: { title: string }) => (
    <h2 className="text-2xl font-bold text-center text-gray-900 mb-4 mt-2">{title}</h2>
  );

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Logo/Brand/Header */}
      <div className="flex flex-col items-center mb-6">
        {/* Replace with your logo below if you have one */}
        <div className="w-14 h-14 mb-2 rounded-full bg-gradient-to-tr from-orange-300 to-purple-300 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">AC</span>
        </div>
        <div className="text-lg font-bold tracking-tight text-gray-800 animate-fade-in">ArtConnect</div>
      </div>
      {/* Auth Card */}
      <Card className={cn(
        "w-full max-w-md px-8 py-7 mx-2 animate-fade-in shadow-xl border-0",
        "flex flex-col gap-0",
        "bg-white/90"
      )}>
        <div className="mb-6 flex gap-2 items-center justify-center">
          <Button 
            variant={authMode === "sign-in" ? "default" : "outline"}
            className="w-1/2 font-semibold rounded-full"
            onClick={() => setAuthMode("sign-in")}
          >Sign In</Button>
          <Button
            variant={authMode === "sign-up" ? "default" : "outline"}
            className="w-1/2 font-semibold rounded-full"
            onClick={() => setAuthMode("sign-up")}
          >Sign Up</Button>
        </div>
        {authMode === "sign-in" ? (
          <SectionTitle title="Sign in to your account" />
        ) : (
          <SectionTitle title="Create your account" />
        )}

        {/* Divider */}
        <div className="relative flex items-center py-2">
          <div className="flex-grow border-t border-gray-200" />
          <span className="mx-4 text-xs text-gray-400 uppercase tracking-widest">OR</span>
          <div className="flex-grow border-t border-gray-200" />
        </div>

        {/* Google Sign In/Sign Up */}
        <Button 
          variant="outline" 
          className="w-full mb-4 flex items-center justify-center border-2 border-gray-200 rounded-full shadow-sm transition-all hover:shadow-lg font-medium"
          type="button"
          disabled={loading}
          onClick={() => {
            setLoading(true);
            signInWithGoogle().finally(() => setLoading(false));
          }}>
          <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google Icon" className="h-5 w-5 mr-2" />
          {authMode === "sign-in" ? "Sign in with Google" : "Sign up with Google"}
        </Button>

        {/* Email Form */}
        <form className="flex flex-col gap-4" onSubmit={handleAuth}>
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={email}
              disabled={loading}
              autoComplete="username"
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={password}
              disabled={loading}
              autoComplete={authMode === "sign-in" ? "current-password" : "new-password"}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>
          {authMode === "sign-up" && (
            <>
              {/* Choose user type */}
              <label className="block font-medium text-gray-700 mt-2">
                I am a
              </label>
              <div className="flex gap-4 mb-2">
                <Button
                  type="button"
                  variant={userType === "client" ? "default" : "outline"}
                  onClick={() => setUserType("client")}
                  className="flex-1 rounded-full"
                  disabled={loading}
                >
                  Customer
                </Button>
                <Button
                  type="button"
                  variant={userType === "artist" ? "default" : "outline"}
                  onClick={() => setUserType("artist")}
                  className="flex-1 rounded-full"
                  disabled={loading}
                >
                  Artist
                </Button>
              </div>
              {/* Name is always required */}
              <div className="space-y-2">
                <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <Input
                  id="fullName"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={e => setFullName(e.target.value)}
                  disabled={loading}
                  required
                />
              </div>
              {/* Show these only for artist */}
              {userType === "artist" && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="artType" className="block text-sm font-medium text-gray-700">
                      Art Type <span className="text-gray-400 text-xs">(e.g. Painter, Sculptor)</span>
                    </label>
                    <Input
                      id="artType"
                      placeholder="Art Type (Painter, Sculptor...)"
                      value={artType}
                      onChange={e => setArtType(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="district" className="block text-sm font-medium text-gray-700">
                      District <span className="text-gray-400 text-xs">(e.g. Mumbai, Delhi)</span>
                    </label>
                    <Input
                      id="district"
                      placeholder="District"
                      value={district}
                      onChange={e => setDistrict(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                      Phone
                    </label>
                    <Input
                      id="phone"
                      placeholder="Phone Number"
                      value={phone}
                      onChange={e => setPhone(e.target.value)}
                      disabled={loading}
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}
          {error && (
            <div className="bg-red-100 text-red-700 p-2 rounded text-sm mt-1 animate-fade-in">{error}</div>
          )}
          <Button 
            type="submit"
            className="mt-2 w-full font-bold rounded-full shadow-md transition-all"
            disabled={loading}
          >
            {loading
              ? (authMode === "sign-in" ? "Signing In..." : "Signing Up...")
              : (authMode === "sign-in" ? "Sign In" : "Sign Up")}
          </Button>
        </form>
        <div className="mt-6 flex items-center justify-center">
          <Badge className="bg-gray-100 text-gray-600 text-xs px-4 py-1 rounded-full shadow-sm">
            {authMode === "sign-in"
              ? "Don’t have an account? Sign up above."
              : "Already have an account? Click Sign In above."}
          </Badge>
        </div>
      </Card>
      {/* Footer */}
      <div className="mt-6 text-sm text-gray-400 text-center">
        &copy; {new Date().getFullYear()} ArtConnect. All rights reserved.
      </div>
    </div>
  );
};

export default Auth;
