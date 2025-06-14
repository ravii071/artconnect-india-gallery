import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Heart, Phone, Mail, Share2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const ArtistProfile = () => {
  const { id } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);
  const [artist, setArtist] = useState<any>(null);
  const { user, profile } = useAuth();

  useEffect(() => {
    // Get artist_profile for this id
    if (id) {
      supabase
        .from("artist_profiles")
        .select("*")
        .eq("id", id)
        .maybeSingle()
        .then(async ({ data }) => {
          if (data) {
            // Get general profile info too
            const { data: userProfile } = await supabase
              .from("profiles")
              .select("full_name, avatar_url")
              .eq("id", id)
              .maybeSingle();
            setArtist({
              ...data,
              ...userProfile,
            });
          }
        });
    }
  }, [id]);

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">
        Loading artist profile...
      </div>
    );
  }

  // Only allow signed-in users to interact (follow, book, share)
  const canInteract = !!user && !!profile;

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center overflow-hidden">
                {artist.avatar_url ? (
                  <img src={artist.avatar_url} alt="avatar" className="w-8 h-8 object-cover rounded-full" />
                ) : (
                  <span className="text-white font-bold text-sm">AC</span>
                )}
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                ArtConnect
              </span>
            </div>
          </div>
          {canInteract && (
            <Button variant="outline" size="sm">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Artist Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <img 
                  src={artist.avatar_url || artist.image || "/placeholder.svg"} 
                  alt={artist.full_name}
                  className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                />
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{artist.full_name}</h1>
                  <Badge className="mb-3 bg-gradient-to-r from-orange-500 to-pink-500">
                    {artist.specialty}
                  </Badge>
                  <div className="flex items-center justify-center md:justify-start text-gray-600 mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {artist.location}
                  </div>
                  <div className="flex items-center justify-center md:justify-start mb-4">
                    <div className="flex items-center mr-4">
                      <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                      <span className="font-medium">{artist.rating}</span>
                      <span className="text-gray-600 ml-1">({artist.reviews} reviews)</span>
                    </div>
                  </div>
                  <div className="flex justify-center md:justify-start space-x-4 mb-4">
                    <div className="text-center">
                      <div className="font-bold">{artist.followers}</div>
                      <div className="text-sm text-gray-600">Followers</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">{artist.following}</div>
                      <div className="text-sm text-gray-600">Following</div>
                    </div>
                  </div>
                  <p className="text-gray-700 mb-6">{artist.bio}</p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                      onClick={() => setIsFollowing(!isFollowing)}
                      disabled={!canInteract}
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    {canInteract && (
                      <Link to={`/booking/${artist.id}`}>
                        <Button variant="outline" className="w-full">
                          <Calendar className="w-4 h-4 mr-2" />
                          Book Appointment
                        </Button>
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          </div>

          {/* Contact & Services */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Contact</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Phone className="w-4 h-4 mr-3 text-gray-600" />
                  <span className="text-sm">{artist.phone}</span>
                </div>
                <div className="flex items-center">
                  <Mail className="w-4 h-4 mr-3 text-gray-600" />
                  <span className="text-sm">{artist.email}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold text-lg mb-4">Services</h3>
              <div className="space-y-3">
                {artist.services.map((service) => (
                  <div key={service.id} className="border-b border-gray-100 pb-3 last:border-b-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-medium">{service.name}</h4>
                      <span className="text-orange-600 font-semibold">{service.price}</span>
                    </div>
                    <p className="text-sm text-gray-600">{service.duration}</p>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>

        {/* Portfolio */}
        <Card className="p-6">
          <h3 className="font-semibold text-xl mb-6">Portfolio</h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Images */}
            {artist.portfolio_images && artist.portfolio_images.map((img: string, index: number) => (
              <div key={"img" + index} className="aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src={img} 
                  alt={`Portfolio Image ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ))}
            {/* Videos */}
            {artist.portfolio_videos && artist.portfolio_videos.map((vid: string, index: number) => (
              <div key={"vid" + index} className="aspect-square rounded-lg overflow-hidden group cursor-pointer bg-black flex items-center justify-center">
                <video 
                  src={vid} 
                  controls
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ArtistProfile;
