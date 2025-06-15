
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";

const CompleteArtistProfile = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [artType, setArtType] = useState("");
  const [district, setDistrict] = useState("");
  const [loading, setLoading] = useState(false);

  if (!user || (profile && profile.user_type !== "artist")) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-10 text-center">
          <p>Only artist users can access this page.</p>
        </Card>
      </div>
    );
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Update artist_profiles table
      const { error: artistError } = await supabase
        .from("artist_profiles")
        .upsert({
          id: user.id,
          specialty: artType,
          location: district,
          bio: "",
          phone: "",
          portfolio_images: [],
        }, { onConflict: "id" });

      if (artistError) throw artistError;

      // Mark profile as complete
      const { error: profileError } = await supabase
        .from("profiles")
        .update({ is_profile_complete: true })
        .eq("id", user.id);

      if (profileError) throw profileError;

      toast({ title: "Profile updated successfully!" });
      navigate("/dashboard");
    } catch (error: any) {
      toast({
        title: "Failed to save artist info",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-100">
      <Card className="p-10 w-full max-w-lg shadow-xl">
        <h1 className="text-2xl font-bold mb-6">Complete Your Artist Profile</h1>
        <form className="space-y-4" onSubmit={handleSave}>
          <div>
            <Label htmlFor="artType">Art Specialty</Label>
            <Input 
              id="artType" 
              placeholder="e.g. Painter, Sculptor, Digital Artist"
              value={artType} 
              onChange={e => setArtType(e.target.value)} 
              required 
            />
          </div>
          <div>
            <Label htmlFor="district">Location</Label>
            <Input 
              id="district" 
              placeholder="Your city or district"
              value={district} 
              onChange={e => setDistrict(e.target.value)} 
              required 
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Saving..." : "Save and Continue"}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default CompleteArtistProfile;
