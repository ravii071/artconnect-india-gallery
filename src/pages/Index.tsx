import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Heart, User, Search } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  const [activeService, setActiveService] = useState("all");

  const featuredArtists = [
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
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
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
        "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
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
        "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
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
        "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1456327102063-fb5054efe647?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ],
      startingPrice: "₹1,500",
      category: "sketching"
    }
  ];

  const services = [
    { id: "mehendi", name: "Mehendi", count: "500+ Artists", icon: "🌸" },
    { id: "makeup", name: "Makeup", count: "300+ Artists", icon: "💄" },
    { id: "nails", name: "Nail Art", count: "200+ Artists", icon: "💅" },
    { id: "sketching", name: "Sketching", count: "150+ Artists", icon: "🎨" }
  ];

  const filteredArtists = activeService === "all" 
    ? featuredArtists 
    : featuredArtists.filter(artist => artist.category === activeService);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              ArtConnect
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/auth">
              <Button variant="outline" className="hidden md:flex">
                <User className="w-4 h-4 mr-2" />
                Sign In
              </Button>
            </Link>
            <Link to="/auth">
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600">
                Join as Artist
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Discover Amazing
            <br />
            Indian Artists
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Connect with talented mehendi artists, makeup artists, nail artists, and sketchers. 
            Book appointments, explore portfolios, and celebrate creativity.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/search">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 px-8 py-3 text-lg">
                Explore Artists
              </Button>
            </Link>
            <Link to="/search">
              <Button size="lg" variant="outline" className="px-8 py-3 text-lg border-orange-300 text-orange-600">
                <Search className="w-5 h-5 mr-2" />
                Find Services
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
            Browse by Category
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {services.map((service) => (
              <Card 
                key={service.id}
                className={`cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 ${
                  activeService === service.id ? 'ring-2 ring-orange-400 shadow-lg' : ''
                }`}
                onClick={() => setActiveService(service.id)}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-4xl mb-3">{service.icon}</div>
                  <h3 className="font-semibold text-lg mb-2">{service.name}</h3>
                  <p className="text-gray-600 text-sm">{service.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-16 px-4 bg-white/50">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Featured Artists</h2>
            <div className="flex gap-2">
              <Button 
                variant={activeService === "all" ? "default" : "outline"} 
                size="sm"
                onClick={() => setActiveService("all")}
                className={activeService === "all" ? "bg-gradient-to-r from-orange-500 to-pink-500" : ""}
              >
                All
              </Button>
              {services.map((service) => (
                <Button 
                  key={service.id}
                  variant={activeService === service.id ? "default" : "outline"} 
                  size="sm"
                  onClick={() => setActiveService(service.id)}
                  className={activeService === service.id ? "bg-gradient-to-r from-orange-500 to-pink-500" : ""}
                >
                  {service.name}
                </Button>
              ))}
            </div>
          </div>
          
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

                  <div className="grid grid-cols-3 gap-1 mb-4">
                    {artist.portfolio.slice(0, 3).map((img, index) => (
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
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-gradient-to-r from-orange-500 to-pink-500 rounded-3xl p-12 text-white">
            <h2 className="text-4xl font-bold mb-6">
              Ready to showcase your talent?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of artists who are building their careers on ArtConnect
            </p>
            <Link to="/auth">
              <Button size="lg" className="bg-white text-orange-600 hover:bg-gray-100 px-8 py-3 text-lg">
                Start Your Journey
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="text-2xl font-bold">ArtConnect</span>
          </div>
          <p className="text-gray-400 mb-6">
            Connecting amazing Indian artists with clients who appreciate their craft
          </p>
          <div className="flex justify-center space-x-8 text-sm">
            <a href="#" className="hover:text-orange-400 transition-colors">About</a>
            <Link to="/search" className="hover:text-orange-400 transition-colors">Artists</Link>
            <a href="#" className="hover:text-orange-400 transition-colors">Services</a>
            <a href="#" className="hover:text-orange-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
