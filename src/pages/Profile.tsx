import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { LogOut, Edit3, Save, X, Camera, MapPin, Phone, Briefcase } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

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
  const { profile, user, loading: authLoading, signOut } = useAuth();
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
    <div className="min-h-screen bg-[var(--gradient-portfolio)] py-10">
      <div className="container mx-auto max-w-4xl">
        {/* Header Card */}
        <Card className="mb-8 shadow-[var(--portfolio-shadow)]">
          <CardHeader>
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img
                    src={profile.avatar_url || "/placeholder.svg"}
                    className="w-24 h-24 rounded-full object-cover border-4 border-background shadow-lg"
                    alt={profile.full_name || "Avatar"}
                  />
                  {profile.user_type === "artist" && (
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-[var(--gradient-artist)] rounded-full flex items-center justify-center">
                      <Camera className="w-4 h-4 text-white" />
                    </div>
                  )}
                </div>
                <div>
                  <CardTitle className="text-3xl mb-2">{profile.full_name || "No Name"}</CardTitle>
                  <p className="text-muted-foreground mb-3">{profile.email}</p>
                  <Badge variant={profile.user_type === "artist" ? "default" : "secondary"} className="text-sm">
                    {profile.user_type === "artist" ? "🎨 Artist" : "👤 Client"}
                  </Badge>
                </div>
              </div>
              <div className="flex gap-2">
                {profile.user_type === "artist" && (
                  <Button
                    variant={editMode ? "destructive" : "outline"}
                    size="sm"
                    onClick={() => setEditMode(!editMode)}
                  >
                    {editMode ? <X className="w-4 h-4 mr-2" /> : <Edit3 className="w-4 h-4 mr-2" />}
                    {editMode ? "Cancel" : "Edit"}
                  </Button>
                )}
                <Button variant="outline" size="sm" onClick={signOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </Button>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Artist Profile Section */}
        {profile.user_type === "artist" && (
          <>
            {editMode ? (
              <Card className="shadow-[var(--portfolio-shadow)]">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Edit Artist Profile
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Specialty
                    </label>
                    <Input 
                      value={specialty} 
                      onChange={e => setSpecialty(e.target.value)}
                      placeholder="e.g., Portrait Photography, Wedding Photography"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Bio</label>
                    <Textarea 
                      value={bio} 
                      onChange={(e) => setBio(e.target.value)} 
                      rows={4}
                      placeholder="Tell potential clients about your artistic journey, experience, and style..."
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Location
                      </label>
                      <Input 
                        value={location} 
                        onChange={e => setLocation(e.target.value)}
                        placeholder="City, State/Country"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2 flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        Phone
                      </label>
                      <Input 
                        value={phone} 
                        onChange={e => setPhone(e.target.value)}
                        placeholder="+1 (555) 123-4567"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-4 flex items-center gap-2">
                      <Camera className="w-4 h-4" />
                      Portfolio Gallery
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {portfolioImages.map((img, i) => (
                        <div key={i} className="relative group">
                          <img 
                            src={img} 
                            alt={`Portfolio ${i + 1}`} 
                            className="w-full h-24 rounded-lg object-cover border-2 border-border hover:border-primary transition-colors" 
                          />
                          <Button 
                            size="icon" 
                            variant="destructive"
                            className="absolute -top-2 -right-2 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" 
                            onClick={() => removePortfolioImage(i)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Paste image URL to add to portfolio"
                        value={uploadImageURL}
                        onChange={e => setUploadImageURL(e.target.value)}
                        className="flex-1"
                      />
                      <Button type="button" onClick={addPortfolioImage} disabled={!uploadImageURL.trim()}>
                        Add Image
                      </Button>
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <Button onClick={saveArtistProfile} className="flex-1">
                      <Save className="w-4 h-4 mr-2" />
                      Save Profile
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {/* Artist Info Card */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Briefcase className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Specialty</h3>
                      </div>
                      <p className="text-muted-foreground">{specialty || "Not specified"}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Location</h3>
                      </div>
                      <p className="text-muted-foreground">{location || "Location not set"}</p>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3 mb-2">
                        <Phone className="w-5 h-5 text-primary" />
                        <h3 className="font-semibold">Contact</h3>
                      </div>
                      <p className="text-muted-foreground">{phone || "Phone not provided"}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Bio Section */}
                {bio && (
                  <Card className="mb-8">
                    <CardHeader>
                      <CardTitle>About the Artist</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground leading-relaxed">{bio}</p>
                    </CardContent>
                  </Card>
                )}

                {/* Portfolio Gallery */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Camera className="w-5 h-5" />
                      Portfolio Gallery
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {portfolioImages.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {portfolioImages.map((img, idx) => (
                          <div key={idx} className="group relative">
                            <img 
                              src={img} 
                              alt={`Portfolio ${idx + 1}`} 
                              className="w-full h-48 rounded-lg object-cover shadow-md hover:shadow-lg transition-shadow group-hover:scale-105 transition-transform duration-300" 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors rounded-lg" />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 text-muted-foreground">
                        <Camera className="w-12 h-12 mx-auto mb-4 opacity-50" />
                        <p>No portfolio images yet</p>
                        <p className="text-sm">Click "Edit" to add your work</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </>
            )}
          </>
        )}

        {/* Client Profile Section */}
        {profile.user_type === "client" && (
          <Card className="text-center">
            <CardHeader>
              <CardTitle>Client Profile</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Welcome! Your account is set up for booking artists and managing your appointments.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Profile;
