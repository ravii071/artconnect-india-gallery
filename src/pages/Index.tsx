import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Phone, Calendar, Search, User, LogOut } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Index = () => {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  // Mock artist data - will be replaced with real data from Supabase
  const artists = [
    {
      id: 1,
      name: "Priya Sharma",
      specialty: "Mehendi Artist",
      location: "Mumbai, Maharashtra",
      rating: 4.9,
      reviews: 127,
      price: "₹2,000 onwards",
      image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1583221053175-a6a97bcb5b6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ]
    },
    {
      id: 2,
      name: "Rajesh Kumar",
      specialty: "Makeup Artist",
      location: "Delhi, NCR",
      rating: 4.7,
      reviews: 95,
      price: "₹3,500 onwards",
      image: "https://images.unsplash.com/photo-1542596768-5d1d21f1cf98?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1519638374633-49a93c46ca6e?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1606214178313-051121c5b51c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ]
    },
    {
      id: 3,
      name: "Sneha Desai",
      specialty: "Nail Artist",
      location: "Bangalore, Karnataka",
      rating: 4.8,
      reviews: 112,
      price: "₹800 onwards",
      image: "https://images.unsplash.com/photo-1617144574795-ca9919953981?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
      portfolioImages: [
        "https://images.unsplash.com/photo-1591998498494-8d9804657a4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
        "https://images.unsplash.com/photo-1624967943974-3c8817475882?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
      ]
    }
  ];

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
          
          <nav className="flex items-center space-x-4">
            <Link to="/search">
              <Button variant="ghost" size="sm">
                <Search className="w-4 h-4 mr-2" />
                Search Artists
              </Button>
            </Link>
            
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  Welcome, {profile?.full_name || user.email}
                </span>
                {profile?.user_type === 'artist' && (
                  <Link to="/dashboard">
                    <Button variant="outline" size="sm">
                      Dashboard
                    </Button>
                  </Link>
                )}
                <Button variant="outline" size="sm" onClick={handleSignOut}>
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
                </Button>
              </div>
            ) : (
              <Link to="/auth">
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                  <User className="w-4 h-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 bg-clip-text text-transparent">
            Discover Amazing Indian Artists
          </h1>
          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            Connect with talented mehendi artists, makeup artists, nail artists, and sketchers across India. 
            Book appointments and explore beautiful portfolios.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/search">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500 text-lg px-8 py-3">
                <Search className="w-5 h-5 mr-2" />
                Find Artists
              </Button>
            </Link>
            {!user && (
              <Link to="/auth">
                <Button size="lg" variant="outline" className="text-lg px-8 py-3">
                  Join as Artist
                </Button>
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Featured Artists */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">Featured Artists</h2>
          <p className="text-gray-600">Discover talented artists in your area</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {artists.map((artist) => (
            <Card key={artist.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300 group">
              <div className="relative">
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                />
                <Badge className="absolute top-4 left-4 bg-white/90 text-gray-800">
                  {artist.specialty}
                </Badge>
              </div>
              
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <span>{artist.name}</span>
                  <div className="flex items-center">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400 mr-1" />
                    <span className="text-sm font-medium">{artist.rating}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-3">
                <div className="flex items-center text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  <span className="text-sm">{artist.location}</span>
                </div>
                
                <div className="text-lg font-semibold text-orange-600">
                  {artist.price}
                </div>
                
                <p className="text-sm text-gray-500">{artist.reviews} reviews</p>
                
                <div className="grid grid-cols-2 gap-2">
                  {artist.portfolioImages.map((img, index) => (
                    <img 
                      key={index}
                      src={img} 
                      alt={`${artist.name} work ${index + 1}`}
                      className="w-full h-20 object-cover rounded"
                    />
                  ))}
                </div>
                
                <div className="flex gap-2 pt-2">
                  <Link to={`/artist/${artist.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View Profile
                    </Button>
                  </Link>
                  {user && (
                    <Link to={`/booking/${artist.id}`} className="flex-1">
                      <Button className="w-full bg-gradient-to-r from-orange-500 to-pink-500">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Now
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link to="/search">
            <Button size="lg" variant="outline">
              View All Artists
            </Button>
          </Link>
        </div>
      </section>

      {/* Categories */}
      <section className="bg-white/50 py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Browse by Category</h2>
            <p className="text-gray-600">Find the perfect artist for your needs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { name: "Mehendi Artists", icon: "🎨", count: "150+ artists" },
              { name: "Makeup Artists", icon: "💄", count: "89+ artists" },
              { name: "Nail Artists", icon: "💅", count: "65+ artists" },
              { name: "Sketch Artists", icon: "✏️", count: "45+ artists" }
            ].map((category) => (
              <Card key={category.name} className="text-center hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-6">
                  <div className="text-4xl mb-4">{category.icon}</div>
                  <h3 className="font-semibold mb-2">{category.name}</h3>
                  <p className="text-sm text-gray-500">{category.count}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-16 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">
            Ready to showcase your talent?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of artists already earning through ArtConnect. 
            Create your profile and start accepting bookings today.
          </p>
          {!user ? (
            <Link to="/auth">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500">
                Join as Artist
              </Button>
            </Link>
          ) : profile?.user_type === 'artist' ? (
            <Link to="/dashboard">
              <Button size="lg" className="bg-gradient-to-r from-orange-500 to-pink-500">
                Go to Dashboard
              </Button>
            </Link>
          ) : (
            <p className="text-gray-600">You're signed in as a client. Switch to artist mode to start earning!</p>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">AC</span>
                </div>
                <span className="text-xl font-bold">ArtConnect</span>
              </div>
              <p className="text-gray-400 text-sm">
                Connecting talented artists with clients across India.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Artists</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/auth" className="hover:text-white">Join ArtConnect</Link></li>
                <li><Link to="#" className="hover:text-white">Artist Resources</Link></li>
                <li><Link to="#" className="hover:text-white">Success Stories</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">For Clients</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="/search" className="hover:text-white">Find Artists</Link></li>
                <li><Link to="#" className="hover:text-white">How it Works</Link></li>
                <li><Link to="#" className="hover:text-white">Safety</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><Link to="#" className="hover:text-white">Help Center</Link></li>
                <li><Link to="#" className="hover:text-white">Contact Us</Link></li>
                <li><Link to="#" className="hover:text-white">Terms & Privacy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; 2024 ArtConnect. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
