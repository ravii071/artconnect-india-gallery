
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Search as SearchIcon, Filter, Heart, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

interface ArtistProfileRow {
  id: string;
  specialty: string;
  location: string | null;
  rating: number | null;
  total_reviews: number | null;
  bio: string | null;
  portfolio_images: string[] | null;
  starting_price: string | null;
  profiles: {
    full_name: string | null;
    avatar_url: string | null;
  };
}

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");
  const [artists, setArtists] = useState<ArtistProfileRow[]>([]);
  const [loading, setLoading] = useState(true);

  // Dynamic filter options, fallback to "all" option if no data yet
  const [categoryOptions, setCategoryOptions] = useState<{ id: string, name: string }[]>([
    { id: "all", name: "All Categories" },
  ]);
  const [locationOptions, setLocationOptions] = useState<{ id: string, name: string }[]>([
    { id: "all", name: "All Locations" },
  ]);

  useEffect(() => {
    const fetchArtists = async () => {
      setLoading(true);
      // Fetch artist_profiles with joined profiles data
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
          starting_price,
          profiles:profiles!inner(
            full_name,
            avatar_url
          )
        `)
        .order("created_at", { ascending: false })
        .limit(48);
      if (error) {
        console.error("Error fetching artists", error);
        setArtists([]);
      } else {
        const validArtists = (data || []).filter((artist) => artist.profiles?.full_name); // Only those with profile
        setArtists(validArtists);
        // Dynamically extract unique categories and locations
        const uniqueCategories = Array.from(new Set(validArtists.map(a => a.specialty).filter(Boolean)));
        setCategoryOptions([
          { id: "all", name: "All Categories" },
          ...uniqueCategories.map(c => ({ id: c.toLowerCase().replace(/\s+/g, "-"), name: c })),
        ]);
        const uniqueLocations = Array.from(
          new Set(
            validArtists
              .map(a => a.location)
              .filter(Boolean)
              .map(loc => loc!.split(",")[0].trim()) // Only city, not state
          )
        );
        setLocationOptions([
          { id: "all", name: "All Locations" },
          ...uniqueLocations.map(l => ({ id: l.toLowerCase().replace(/\s+/g, "-"), name: l })),
        ]);
      }
      setLoading(false);
    };

    fetchArtists();

    // Set up realtime subscription for artist profile changes
    const channel = supabase
      .channel('artist-search-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artist_profiles'
        },
        (payload) => {
          console.log('Artist profile changed in search:', payload);
          // Refetch artists when any artist profile changes
          fetchArtists();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Map category and location from id back to value for searching
  const getCategoryName = (id: string) =>
    categoryOptions.find(c => c.id === id)?.name || "";

  const getLocationName = (id: string) =>
    locationOptions.find(l => l.id === id)?.name || "";

  const filteredArtists = artists.filter(artist => {
    const matchesSearch =
      artist.profiles.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.specialty.toLowerCase().includes(searchQuery.toLowerCase()) ||
      artist.location?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory =
      selectedCategory === "all" ||
      artist.specialty.toLowerCase() === getCategoryName(selectedCategory).toLowerCase();
    const artistLocCity =
      artist.location?.split(",")[0]?.trim().toLowerCase() || "";
    const matchesLocation =
      selectedLocation === "all" ||
      artistLocCity === getLocationName(selectedLocation).toLowerCase();

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
                {categoryOptions.map((category) => (
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
                {locationOptions.map((location) => (
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

        {/* Loading spinner */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="animate-spin rounded-full h-14 w-14 border-b-2 border-pink-500"></div>
          </div>
        ) : (
        <>
        {/* Artists Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredArtists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
              <div className="relative">
                {artist.portfolio_images && artist.portfolio_images.length > 0 ? (
                  <img 
                    src={artist.portfolio_images[0]}
                    alt={artist.profiles.full_name || "Portfolio Image"}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="w-full h-48 bg-gray-200 flex items-center justify-center text-gray-400">
                    No Image
                  </div>
                )}
                <div className="absolute top-3 right-3">
                  <Button size="sm" variant="secondary" className="bg-white/90 hover:bg-white">
                    <Heart className="w-4 h-4" />
                  </Button>
                </div>
                <Badge className="absolute bottom-3 left-3 bg-gradient-to-r from-orange-500 to-pink-500">
                  {artist.specialty}
                </Badge>
              </div>
              
              <CardContent className="p-4">
                <Link to={`/artist/${artist.id}`}>
                  <h3 className="font-semibold text-lg mb-2 hover:text-orange-600 transition-colors">
                    {artist.profiles.full_name}
                  </h3>
                </Link>
                {artist.location && (
                  <div className="flex items-center text-gray-600 text-sm mb-2">
                    <MapPin className="w-4 h-4 mr-1" />
                    {artist.location}
                  </div>
                )}
                <div className="flex items-center mb-3">
                  {artist.rating && (
                    <div className="flex items-center mr-3">
                      <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{artist.rating}</span>
                    </div>
                  )}
                  <span className="text-sm text-gray-600">
                    ({artist.total_reviews ?? 0} reviews)
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1 mb-4">
                  {artist.portfolio_images &&
                    artist.portfolio_images.slice(0, 2).map((img, index) => (
                      <img 
                        key={index}
                        src={img}
                        alt={`Portfolio ${index + 1}`}
                        className="w-full h-16 object-cover rounded"
                      />
                    ))}
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-orange-600">
                    {artist.starting_price ? `From ${artist.starting_price}` : ""}
                  </span>
                  <Link to={`/booking/${artist.id}`}>
                    <Button size="sm" className="bg-gradient-to-r from-orange-500 to-pink-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      Book
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
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
        </>
        )}
      </div>
    </div>
  );
};

export default Search;

