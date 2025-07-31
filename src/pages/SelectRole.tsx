
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Palette, User } from "lucide-react";

interface ArtForm {
  id: number;
  name: string;
  description: string;
}

const SelectRole: React.FC = () => {
  const [role, setRole] = useState<"artist" | "client" | null>(null);
  const [artForms, setArtForms] = useState<ArtForm[]>([]);
  const [selectedArtForm, setSelectedArtForm] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  // Fetch art forms for artist selection
  useEffect(() => {
    const fetchArtForms = async () => {
      const { data } = await supabase
        .from("art_forms")
        .select("*")
        .order("name");
      if (data) setArtForms(data);
    };
    fetchArtForms();
  }, []);

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
    if (role === "artist" && !selectedArtForm) return;
    
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
      // Create artist profile with selected art form
      const selectedArtFormData = artForms.find(af => af.id.toString() === selectedArtForm);
      await supabase.from("artist_profiles").upsert({
        id: user.id,
        specialty: selectedArtFormData?.name || "",
        art_form_id: parseInt(selectedArtForm),
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
        
        {role === "artist" && (
          <div className="space-y-2">
            <Label htmlFor="artForm" className="text-sm font-medium">
              Select your art form
            </Label>
            <Select value={selectedArtForm} onValueChange={setSelectedArtForm}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose your specialty" />
              </SelectTrigger>
              <SelectContent>
                {artForms.map((artForm) => (
                  <SelectItem key={artForm.id} value={artForm.id.toString()}>
                    <div>
                      <div className="font-medium">{artForm.name}</div>
                      <div className="text-sm text-gray-500">{artForm.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <Button
          className="w-full mt-6"
          disabled={!role || (role === "artist" && !selectedArtForm) || loading}
          onClick={handleContinue}
        >
          {loading ? "Saving..." : "Continue"}
        </Button>
      </Card>
    </div>
  );
};

export default SelectRole;
