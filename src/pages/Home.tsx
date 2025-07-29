
import React, { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Star } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ArtistProfile {
  id: string;
  specialty: string;
  location: string;
  bio: string;
  portfolio_images: string[];
  rating: number;
  total_reviews: number;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const Home = () => {
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [artists, setArtists] = useState<ArtistProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchArtists();

    // Set up realtime subscription for artist profile changes
    const channel = supabase
      .channel('artist-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artist_profiles'
        },
        (payload) => {
          console.log('Artist profile changed:', payload);
          // Refetch artists when any artist profile changes
          fetchArtists();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchArtists = async () => {
    try {
      const { data, error } = await supabase
        .from("artist_profiles")
        .select(`
          id,
          specialty,
          location,
          bio,
          portfolio_images,
          rating,
          total_reviews,
          profiles!inner(
            full_name,
            avatar_url
          )
        `)
        .limit(12);

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error("Error fetching artists:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtists = artists.filter(artist =>
    artist.specialty.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    artist.profiles.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">ArtSpace</h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600">Welcome, {profile?.full_name}</span>
            <Button variant="outline" onClick={signOut}>
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Discover Amazing Artists
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Browse through our talented community of artists and find the perfect match for your project.
          </p>
        </div>

        {/* Search */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search by specialty, location, or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-square relative">
                {artist.portfolio_images && artist.portfolio_images.length > 0 ? (
                  <img
                    src={artist.portfolio_images[0]}
                    alt={`${artist.profiles.full_name}'s work`}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-400">No portfolio image</span>
                  </div>
                )}
              </div>
              
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src={artist.profiles.avatar_url || "/placeholder.svg"}
                    alt={artist.profiles.full_name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <CardTitle className="text-lg truncate">
                    {artist.profiles.full_name}
                  </CardTitle>
                </div>
                <Badge variant="secondary">{artist.specialty}</Badge>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2">
                  {artist.location && (
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <MapPin className="w-3 h-3" />
                      {artist.location}
                    </div>
                  )}
                  
                  {artist.rating > 0 && (
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                      <span>{artist.rating.toFixed(1)}</span>
                      <span className="text-gray-500">({artist.total_reviews} reviews)</span>
                    </div>
                  )}
                  
                  {artist.bio && (
                    <p className="text-sm text-gray-600 line-clamp-2">
                      {artist.bio}
                    </p>
                  )}
                  
                  <Button 
                    className="w-full mt-3"
                    onClick={() => navigate(`/artist/${artist.id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredArtists.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">No artists found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;
