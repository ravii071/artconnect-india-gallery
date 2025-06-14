
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CompleteProfile: React.FC = () => {
  const { user, profile } = useAuth();
  const [artType, setArtType] = useState("");
  const [district, setDistrict] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Redirect if user is not logged in
    if (!user) {
      navigate("/auth");
      return;
    }

    // Redirect if user is not an artist or already has complete profile
    if (profile?.user_type !== "artist") {
      navigate("/");
      return;
    }

    // Check if artist profile already exists and is complete
    const checkExistingProfile = async () => {
      const { data } = await supabase
        .from("artist_profiles")
        .select("specialty, location, phone")
        .eq("id", user.id)
        .maybeSingle();

      if (data && data.specialty && data.location && data.phone) {
        // Profile is already complete, redirect to home
        navigate("/");
      }
    };

    checkExistingProfile();
  }, [user, profile, navigate]);

  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!artType.trim() || !district.trim() || !phone.trim()) {
      setError("Please fill in all required fields.");
      return;
    }

    if (!user) return;

    setLoading(true);

    try {
      // Update or create artist profile
      const { error } = await supabase
        .from("artist_profiles")
        .upsert(
          {
            id: user.id,
            specialty: artType,
            location: district,
            phone: phone,
            bio: "",
            portfolio_images: [],
          },
          { onConflict: "id" }
        );

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      toast({
        title: "Profile completed!",
        description: "Welcome to ArtConnect! Your artist profile has been set up.",
      });

      navigate("/");
    } catch (err) {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <div className="flex flex-col items-center mb-6">
        <div className="w-14 h-14 mb-2 rounded-full bg-gradient-to-tr from-orange-300 to-purple-300 flex items-center justify-center">
          <span className="text-2xl font-bold text-white">AC</span>
        </div>
        <div className="text-lg font-bold tracking-tight text-gray-800">ArtConnect</div>
      </div>

      {/* Profile Completion Card */}
      <Card className="w-full max-w-md px-8 py-7 mx-2 shadow-xl border-0 bg-white/90">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Artist Profile</h2>
          <p className="text-gray-600">
            Hi {profile.full_name}! Please provide a few more details to complete your artist profile.
          </p>
        </div>

        <form onSubmit={handleCompleteProfile} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="artType" className="block text-sm font-medium text-gray-700">
              Art Type <span className="text-red-500">*</span>
            </label>
            <Input
              id="artType"
              placeholder="e.g. Painter, Sculptor, Digital Artist"
              value={artType}
              onChange={(e) => setArtType(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="district" className="block text-sm font-medium text-gray-700">
              Location/District <span className="text-red-500">*</span>
            </label>
            <Input
              id="district"
              placeholder="e.g. Mumbai, Delhi, Bangalore"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <Input
              id="phone"
              placeholder="Your phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={loading}
              required
            />
          </div>

          {error && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md text-sm">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full font-semibold rounded-full mt-6"
            disabled={loading}
          >
            {loading ? "Completing Profile..." : "Complete Profile"}
          </Button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            You can update this information later in your profile settings.
          </p>
        </div>
      </Card>
    </div>
  );
};

export default CompleteProfile;
