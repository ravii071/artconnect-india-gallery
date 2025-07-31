import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

interface ArtistProfileData {
  bio: string | null;
  specialty: string;
  location: string | null;
  phone: string | null;
  portfolio_images: string[] | null;
  art_form_id: number | null;
  art_form_name?: string;
}

const Profile = () => {
  const { profile, user, loading: authLoading } = useAuth();
  const [artistProfile, setArtistProfile] = useState<ArtistProfileData | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [bio, setBio] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [portfolioImages, setPortfolioImages] = useState<string[]>([]);
  const [uploadImageURL, setUploadImageURL] = useState("");
  const { toast } = useToast();

  // Fetch artist profile for this user, if artist
  useEffect(() => {
    if (profile?.user_type === "artist" && user) {
      supabase
        .from("artist_profiles")
        .select(`
          *,
          art_forms (
            name
          )
        `)
        .eq("id", user.id)
        .maybeSingle()
        .then(({ data }) => {
          if (data) {
            setArtistProfile({
              bio: data.bio || "",
              specialty: data.specialty || "",
              location: data.location || "",
              phone: data.phone || "",
              portfolio_images: data.portfolio_images || [],
              art_form_id: data.art_form_id,
              art_form_name: data.art_forms?.name,
            });
            setBio(data.bio || "");
            setSpecialty(data.specialty || "");
            setLocation(data.location || "");
            setPhone(data.phone || "");
            setPortfolioImages(data.portfolio_images || []);
          }
        });
    }
    // For clients, nothing extra needed
    if (profile?.user_type === "client") {
      setArtistProfile(null);
    }
  }, [profile, user]);

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (!user || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="p-8 flex flex-col items-center">
          <h1 className="text-2xl font-bold mb-2">Please Sign In</h1>
          <p className="text-gray-500">You need to be logged in to view your profile.</p>
        </Card>
      </div>
    );
  }

  // Save artist profile (for artist users)
  const saveArtistProfile = async () => {
    if (!user) return;
    const { error } = await supabase
      .from("artist_profiles")
      .update({
        bio, specialty, location, phone,
        portfolio_images: portfolioImages,
      })
      .eq("id", user.id);

    if (!error) {
      toast({ title: "Profile updated" });
      setEditMode(false);
    } else {
      toast({ title: "Error updating", description: error.message, variant: "destructive" });
    }
  };

  // Add Image URL to portfolio
  const addPortfolioImage = () => {
    if (uploadImageURL.trim()) {
      setPortfolioImages([...portfolioImages, uploadImageURL]);
      setUploadImageURL("");
    }
  };
  // Remove image from portfolio
  const removePortfolioImage = (idx: number) => {
    setPortfolioImages(portfolioImages.filter((_, i) => i !== idx));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 py-10">
      <div className="container mx-auto max-w-2xl">
        <Card className="p-8 mb-10">
          <div className="flex flex-col items-center">
            <img
              src={profile.avatar_url || "/placeholder.svg"}
              className="w-28 h-28 rounded-full object-cover mb-4"
              alt={profile.full_name || "Avatar"}
            />
            <h2 className="text-2xl font-bold mb-1">{profile.full_name || "No Name"}</h2>
            <p className="mb-2 text-gray-600">{profile.email}</p>
            <Badge>{profile.user_type === "artist" ? "Artist" : "Client"}</Badge>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => setEditMode((e) => !e)}
              disabled={profile.user_type !== "artist"}
            >
              {editMode ? "Cancel" : "Edit Profile"}
            </Button>
          </div>
        </Card>

        {profile.user_type === "artist" && (
          <Card className="p-8">
            <h3 className="font-bold text-xl mb-6">Artist Profile</h3>
            {editMode ? (
              <div>
                <label className="block mb-2 font-medium">Bio</label>
                <textarea className="w-full mb-4 border rounded px-3 py-2" 
                  value={bio} onChange={(e) => setBio(e.target.value)} rows={4} />

                <label className="block mb-2 font-medium">Specialty</label>
                <Input className="mb-4" value={specialty} onChange={e => setSpecialty(e.target.value)} />

                <label className="block mb-2 font-medium">Location</label>
                <Input className="mb-4" value={location} onChange={e => setLocation(e.target.value)} />

                <label className="block mb-2 font-medium">Phone</label>
                <Input className="mb-4" value={phone} onChange={e => setPhone(e.target.value)} />

                {/* Images */}
                <label className="block mb-2 font-medium">Portfolio Images</label>
                <div className="flex gap-3 mb-2 flex-wrap">
                  {portfolioImages.map((img, i) => (
                    <div key={i} className="relative group">
                      <img src={img} alt={`Portfolio ${i + 1}`} className="w-20 h-20 rounded object-cover" />
                      <Button size="icon" className="absolute -top-2 -right-2" variant="destructive" onClick={() => removePortfolioImage(i)}>✖</Button>
                    </div>
                  ))}
                  <div className="flex gap-2 items-center">
                    <Input
                      placeholder="Paste image URL"
                      value={uploadImageURL}
                      onChange={e => setUploadImageURL(e.target.value)}
                      className="w-44"
                    />
                    <Button type="button" onClick={addPortfolioImage}>Add</Button>
                  </div>
                </div>
                <Button className="mt-6" onClick={saveArtistProfile}>Save</Button>
              </div>
            ) : (
              <div>
                <div className="mb-3"><b>Art Form:</b> <span className="text-gray-700">{artistProfile?.art_form_name || specialty || "Not set"}</span></div>
                <div className="mb-3"><b>Bio:</b> <span className="text-gray-700">{bio || "No bio"}</span></div>
                <div className="mb-3"><b>Location:</b> <span className="text-gray-700">{location || "Not set"}</span></div>
                <div className="mb-3"><b>Phone:</b> <span className="text-gray-700">{phone || "Not set"}</span></div>
                <div className="my-6">
                  <b>Portfolio</b>
                  <div className="grid grid-cols-3 gap-4 mt-2">
                    {portfolioImages.map((img, idx) => (
                      <img key={idx} src={img} alt={`Portfolio ${idx + 1}`} className="rounded-lg w-full h-32 object-cover" />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        )}

        {profile.user_type === "client" && (
          <Card className="p-8 text-center text-lg">
            <b>Client Profile</b>
            <div className="mt-3">Your account info is visible only to you.</div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
