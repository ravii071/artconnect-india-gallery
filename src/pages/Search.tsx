
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Search as SearchIcon, Filter, Heart, Calendar } from "lucide-react";
import { Link } from "react-router-dom";

const Search = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedLocation, setSelectedLocation] = useState("all");

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

  // Mock artists data
  const allArtists = [
    {
      id: 1,
      name: "Priya Sharma",
      specialty: "Mehendi Artist",
      location: "Mumbai, Maharashtra",
      rating: 4.9,
      reviews: 127,
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      portfolio: [
        "https://images.unsplash.com/photo-1583221053175-a6a97bcb5b6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ],
      startingPrice: "₹500",
      category: "mehendi"
    },
    {
      id: 2,
      name: "Aarti Patel",
      specialty: "Makeup Artist",
      location: "Delhi, India",
      rating: 4.8,
      reviews: 89,
      image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      portfolio: [
        "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ],
      startingPrice: "₹2,000",
      category: "makeup"
    },
    {
      id: 3,
      name: "Kavya Singh",
      specialty: "Nail Artist",
      location: "Bangalore, Karnataka",
      rating: 4.9,
      reviews: 156,
      image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      portfolio: [
        "https://images.unsplash.com/photo-1604654894610-df63bc138bb8?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ],
      startingPrice: "₹800",
      category: "nails"
    },
    {
      id: 4,
      name: "Ravi Kumar",
      specialty: "Portrait Artist",
      location: "Jaipur, Rajasthan",
      rating: 4.7,
      reviews: 73,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      portfolio: [
        "https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ],
      startingPrice: "₹1,500",
      category: "sketching"
    }
  ];

  const filteredArtists = allArtists.filter(artist => {
    const matchesSearch = artist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         artist.specialty.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || artist.category === selectedCategory;
    const matchesLocation = selectedLocation === "all" || 
                           artist.location.toLowerCase().includes(selectedLocation);
    
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
          {filteredArtists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
              <div className="relative">
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
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
                    {artist.name}
                  </h3>
                </Link>
                <div className="flex items-center text-gray-600 text-sm mb-2">
                  <MapPin className="w-4 h-4 mr-1" />
                  {artist.location}
                </div>
                
                <div className="flex items-center mb-3">
                  <div className="flex items-center mr-3">
                    <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{artist.rating}</span>
                  </div>
                  <span className="text-sm text-gray-600">({artist.reviews} reviews)</span>
                </div>

                <div className="grid grid-cols-2 gap-1 mb-4">
                  {artist.portfolio.slice(0, 2).map((img, index) => (
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
                    From {artist.startingPrice}
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

        {filteredArtists.length === 0 && (
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
