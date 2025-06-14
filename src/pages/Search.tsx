import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Search as SearchIcon, Filter, Heart, Calendar } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [artists, setArtists] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const categories = [
    { id: "all", name: "All Categories" },
    { id: "mehendi", name: "Mehendi" },
    { id: "makeup", name: "Makeup" },
    { id: "nails", name: "Nail Art" },
    { id: "sketching", name: "Sketching" }
  ];
  const locations = [
    { id: "all", name: "All Locations" },
    { id: "mumbai", name: "Mumbai" },
    { id: "delhi", name: "Delhi" },
    { id: "bangalore", name: "Bangalore" },
    { id: "jaipur", name: "Jaipur" },
    { id: "pune", name: "Pune" }
  ];

  // Fetch live artist data from Supabase
  useEffect(() => {
    async function fetchArtists() {
      setLoading(true);
      const { data, error } = await supabase
        .from("artist_profiles")
        .select("id, specialty, location, phone, portfolio_images, rating, total_reviews, profiles:profiles(id, full_name, avatar_url)");
      if (!error) {
        setArtists(data || []);
      }
      setLoading(false);
    }
    fetchArtists();
  }, []);

  // Filtering
  const filteredArtists = artists.filter((artist) => {
    const profile = artist.profiles || {};
    const matchesSearch =
      (profile.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || "") ||
      (artist.specialty?.toLowerCase().includes(searchQuery.toLowerCase()) || "");
    const matchesCategory =
      selectedCategory === "all" ||
      (artist.specialty && artist.specialty.toLowerCase().includes(selectedCategory));
    const matchesLocation =
      selectedLocation === "all" ||
      (artist.location && artist.location.toLowerCase().includes(selectedLocation));
    return matchesSearch && matchesCategory && matchesLocation;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              ArtConnect
            </span>
          </Link>
          <Link to="/auth">
            <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
              Sign In
            </Button>
          </Link>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search and Filters */}
        <div className="mb-8 space-y-4">
          <div className="relative">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <Input
              placeholder="Search artists, services, or locations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Category Filter */}
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Category:</span>
              <div className="flex space-x-2">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                    className={selectedCategory === category.id ? "bg-gradient-to-r from-orange-500 to-pink-500" : ""}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>

            {/* Location Filter */}
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium">Location:</span>
              <div className="flex space-x-2">
                {locations.map((location) => (
                  <Button
                    key={location.id}
                    variant={selectedLocation === location.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLocation(location.id)}
                    className={selectedLocation === location.id ? "bg-gradient-to-r from-orange-500 to-pink-500" : ""}
                  >
                    {location.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {filteredArtists.length} Artists Found
          </h2>
          {searchQuery && (
            <p className="text-gray-600 mt-2">
              Results for "<span className="font-medium">{searchQuery}</span>"
            </p>
          )}
        </div>

        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center items-center py-8">
              <span className="text-gray-600">Loading artists...</span>
            </div>
          ) : (
            filteredArtists.map((artist) => (
              <Card key={artist.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
                <div className="relative">
                  <img 
                    src={artist.profiles?.avatar_url || "/placeholder.svg"} 
                    alt={artist.profiles?.full_name || "Artist"}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 right-3">
                    <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                      <Heart className="w-4 h-4" />
                    </Button>
                  </div>
                  <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-pink-500">
                    {artist.specialty || "Specialty"}
                  </Badge>
                </div>
                <CardContent className="p-4">
                  <Link to={`/artist/${artist.id}`}>
                    <h3 className="font-semibold text-lg mb-2 hover:text-orange-600 transition-colors">
                      {artist.profiles?.full_name || "Unnamed Artist"}
                    </h3>
                  </Link>
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {artist.location}
                  </div>
                  <div className="flex items-center mb-3">
                    <div className="flex items-center mr-3">
                      <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{artist.rating ?? 0}</span>
                    </div>
                    <span className="text-sm text-gray-600">
                      ({artist.total_reviews ?? 0} reviews)
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1 mb-4">
                    {(artist.portfolio_images || []).slice(0, 2).map((img, index) => (
                      <img 
                        key={index}
                        src={img}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-16 object-cover rounded"
                      />
                    ))}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-lg font-semibold text-orange-600 mb-1">
                      {artist.phone ? `Phone: ${artist.phone}` : ""}
                    </span>
                    <Link to={`/booking/${artist.id}`}>
                      <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500 mt-2">
                        <Calendar className="w-4 h-4 mr-1" />
                        Book
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {filteredArtists.length === 0 && !loading && (
          <div className="text-center py-12">
            <div className="text-gray-400 mb-4">
              <SearchIcon className="w-16 h-16 mx-auto" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No artists found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Search;
