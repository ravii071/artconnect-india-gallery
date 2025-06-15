
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const CompleteProfile: React.FC = () => {
  const { user, profile, updateProfile } = useAuth();
  const [role, setRole] = useState<"artist" | "client" | "">("");
  const [artType, setArtType] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // If profile is already complete, route accordingly
    if (profile && profile.is_profile_complete) {
      if (profile.user_type === "artist") {
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    }
  }, [profile, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!role) {
      setError("Please select if you are an Artist or Customer.");
      return;
    }
    if (role === "artist" && (!artType.trim() || !district.trim())) {
      setError("Please provide Art Type and District.");
      return;
    }
    if (role === "client" && !district.trim()) {
      setError("Please provide your District.");
      return;
    }

    setLoading(true);

    try {
      // Update profile with user_type and is_profile_complete
      await updateProfile({
        user_type: role,
        is_profile_complete: true,
        ...(profile?.full_name ? {} : { full_name: user?.user_metadata.full_name || "" }),
      });

      // If artist, update or create artist_profiles row
      if (role === "artist" && user) {
        await supabase.from("artist_profiles").upsert({
          id: user.id,
          specialty: artType,
          location: district,
          bio: "",
          phone: "",
          portfolio_images: [],
        }, { onConflict: "id" });
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (err: any) {
      setError(err.message || "Failed to complete profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white/90 rounded-xl shadow-xl p-8 space-y-5"
      >
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">
          Complete Your Profile
        </h2>
        <div className="space-y-2">
          <Label className="text-gray-700 text-base">I am a:</Label>
          <div className="flex gap-3">
            <Button
              type="button"
              variant={role === "client" ? "default" : "outline"}
              onClick={() => setRole("client")}
              className="flex-1 h-11"
              disabled={loading}
            >
              Customer
            </Button>
            <Button
              type="button"
              variant={role === "artist" ? "default" : "outline"}
              onClick={() => setRole("artist")}
              className="flex-1 h-11"
              disabled={loading}
            >
              Artist
            </Button>
          </div>
        </div>
        {role === "artist" && (
          <div className="space-y-2">
            <Label htmlFor="artType" className="text-gray-700">
              Art Specialty
            </Label>
            <Input
              id="artType"
              placeholder="e.g. Mehendi, Tattoo"
              value={artType}
              onChange={e => setArtType(e.target.value)}
              disabled={loading}
              className="h-11"
            />
          </div>
        )}
        {(role === "artist" || role === "client") && (
          <div className="space-y-2">
            <Label htmlFor="district" className="text-gray-700">
              District / Location
            </Label>
            <Input
              id="district"
              placeholder="Your City or District"
              value={district}
              onChange={e => setDistrict(e.target.value)}
              disabled={loading}
              className="h-11"
            />
          </div>
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
          {loading ? "Saving..." : "Save & Continue"}
        </Button>
      </form>
    </div>
  );
};

export default CompleteProfile;
