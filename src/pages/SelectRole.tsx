import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface ArtForm {
  id: number;
  name: string;
}

const SelectRole = () => {
  const { user, updateProfile } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedRole, setSelectedRole] = useState<"client" | "artist" | null>(null);
  const [loading, setLoading] = useState(false);
  const [artForms, setArtForms] = useState<ArtForm[]>([]);
  
  // Artist-specific fields
  const [artistData, setArtistData] = useState({
    artFormId: "",
    specialty: "",
    bio: "",
    location: "",
    phone: "",
    startingPrice: ""
  });

  useEffect(() => {
    fetchArtForms();
  }, []);

  const fetchArtForms = async () => {
    try {
      const { data, error } = await supabase
        .from("art_forms")
        .select("id, name")
        .order("name");
      
      if (error) throw error;
      setArtForms(data || []);
    } catch (error) {
      console.error("Error fetching art forms:", error);
      toast({
        title: "Error",
        description: "Failed to load art forms",
        variant: "destructive",
      });
    }
  };

  const handleRoleSelect = async () => {
    if (!selectedRole) return;
    
    setLoading(true);
    try {
      // Update user type in profiles
      await updateProfile({
        user_type: selectedRole,
        is_profile_complete: selectedRole === "client"
      });

      if (selectedRole === "artist") {
        // Validate artist data
        if (!artistData.artFormId || !artistData.specialty || !artistData.location) {
          toast({
            title: "Missing Information",
            description: "Please fill in all required fields for artist profile",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        // Create artist profile
        const { error: artistError } = await supabase
          .from("artist_profiles")
          .insert({
            id: user?.id,
            art_form_id: parseInt(artistData.artFormId),
            specialty: artistData.specialty,
            bio: artistData.bio,
            location: artistData.location,
            phone: artistData.phone,
            starting_price: artistData.startingPrice
          });

        if (artistError) throw artistError;
        
        navigate("/dashboard");
      } else {
        navigate("/home");
      }
    } catch (error: any) {
      console.error("Error updating role:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Choose Your Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Button
              variant={selectedRole === "client" ? "default" : "outline"}
              onClick={() => setSelectedRole("client")}
              className="h-20 flex flex-col"
            >
              <span className="text-2xl mb-1">👥</span>
              <span>Client</span>
            </Button>
            <Button
              variant={selectedRole === "artist" ? "default" : "outline"}
              onClick={() => setSelectedRole("artist")}
              className="h-20 flex flex-col"
            >
              <span className="text-2xl mb-1">🎨</span>
              <span>Artist</span>
            </Button>
          </div>

          {selectedRole === "artist" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="artForm">Art Form *</Label>
                <Select value={artistData.artFormId} onValueChange={(value) => setArtistData(prev => ({ ...prev, artFormId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your art form" />
                  </SelectTrigger>
                  <SelectContent>
                    {artForms.map((form) => (
                      <SelectItem key={form.id} value={form.id.toString()}>
                        {form.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="specialty">Specialty *</Label>
                <Input
                  id="specialty"
                  placeholder="e.g., Bridal Makeup, Wedding Mehendi"
                  value={artistData.specialty}
                  onChange={(e) => setArtistData(prev => ({ ...prev, specialty: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="location">Location *</Label>
                <Input
                  id="location"
                  placeholder="e.g., Mumbai, Maharashtra"
                  value={artistData.location}
                  onChange={(e) => setArtistData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  placeholder="Your contact number"
                  value={artistData.phone}
                  onChange={(e) => setArtistData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="startingPrice">Starting Price</Label>
                <Input
                  id="startingPrice"
                  placeholder="e.g., ₹2000 onwards"
                  value={artistData.startingPrice}
                  onChange={(e) => setArtistData(prev => ({ ...prev, startingPrice: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  placeholder="Tell customers about yourself and your work..."
                  value={artistData.bio}
                  onChange={(e) => setArtistData(prev => ({ ...prev, bio: e.target.value }))}
                />
              </div>
            </div>
          )}

          <Button 
            onClick={handleRoleSelect}
            disabled={!selectedRole || loading}
            className="w-full"
          >
            {loading ? "Setting up..." : "Continue"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default SelectRole;