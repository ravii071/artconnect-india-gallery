
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Palette, User } from "lucide-react";

const SelectRole: React.FC = () => {
  const [role, setRole] = useState<"artist" | "client" | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Only accessible to authenticated users without a role
  if (!user) {
    navigate("/auth");
    return null;
  }
  if (profile && profile.user_type) {
    // Already have a role assigned
    if (profile.user_type === "artist") {
      navigate("/dashboard");
    } else {
      navigate("/home");
    }
    return null;
  }

  const handleContinue = async () => {
    if (!role) return;
    setLoading(true);

    // Update role in Supabase
    await supabase
      .from("profiles")
      .update({
        user_type: role,
        is_profile_complete: role === "client"
      })
      .eq("id", user.id);

    if (role === "artist") {
      // Make sure artist_profiles exists for this artist
      await supabase.from("artist_profiles").upsert({
        id: user.id,
        specialty: "",
        location: "",
        bio: "",
        phone: "",
        portfolio_images: []
      }, { onConflict: "id" });

      navigate("/complete-artist-profile");
    } else {
      navigate("/home");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-4">
      <Card className="w-full max-w-md p-8 rounded-lg shadow-lg space-y-6">
        <h1 className="text-2xl font-bold text-center mb-2">Welcome! Who are you?</h1>
        <p className="text-center text-gray-600 mb-4">
          Please select your role to continue.
        </p>
        <div className="flex flex-col gap-4">
          <button
            className={`w-full transition-all rounded-lg border p-4 flex flex-col items-center cursor-pointer ${
              role === "artist"
                ? "ring-2 ring-blue-500 bg-blue-50"
                : "hover:bg-gray-50 border-gray-200"
            }`}
            onClick={() => setRole("artist")}
            type="button"
            disabled={loading}
          >
            <Palette className="text-blue-600 w-10 h-10 mb-1" />
            <div className="font-semibold">I'm an Artist</div>
            <div className="text-gray-500 text-sm mt-1">Showcase your art and get bookings</div>
          </button>
          <button
            className={`w-full transition-all rounded-lg border p-4 flex flex-col items-center cursor-pointer ${
              role === "client"
                ? "ring-2 ring-green-500 bg-green-50"
                : "hover:bg-gray-50 border-gray-200"
            }`}
            onClick={() => setRole("client")}
            type="button"
            disabled={loading}
          >
            <User className="text-green-600 w-10 h-10 mb-1" />
            <div className="font-semibold">I'm a Customer</div>
            <div className="text-gray-500 text-sm mt-1">Find and book great artists</div>
          </button>
        </div>
        <Button
          className="w-full mt-6"
          disabled={!role || loading}
          onClick={handleContinue}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
      </Card>
    </div>
  );
};

export default SelectRole;
