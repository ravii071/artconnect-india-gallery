
import { useState } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Calendar, Heart, Phone, Mail, Share2, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const ArtistProfile = () => {
  const { id } = useParams();
  const [isFollowing, setIsFollowing] = useState(false);

  // Mock artist data - will be replaced with real data later
  const artist = {
    id: 1,
    name: "Priya Sharma",
    specialty: "Mehendi Artist",
    location: "Mumbai, Maharashtra",
    rating: 4.9,
    reviews: 127,
    followers: "2.5k",
    following: "450",
    bio: "Professional mehendi artist with 8+ years of experience. Specializing in bridal mehendi, Arabic designs, and contemporary patterns. Available for weddings, festivals, and special occasions.",
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    phone: "+91 98765 43210",
    email: "priya.mehendi@email.com",
    portfolio: [
      "https://images.unsplash.com/photo-1583221053175-a6a97bcb5b6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1583221053175-a6a97bcb5b6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80",
      "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80"
    ],
    services: [
      { id: 1, name: "Bridal Mehendi", price: "₹3,000", duration: "3-4 hours" },
      { id: 2, name: "Arabic Design", price: "₹800", duration: "1-2 hours" },
      { id: 3, name: "Simple Pattern", price: "₹500", duration: "30-45 mins" }
    ]
  };

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
              <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center">
                <span className="text-white font-bold text-sm">AC</span>
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
                ArtConnect
              </span>
            </div>
          </div>
          <Button variant="outline" size="sm">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Artist Info */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Card className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <img 
                  src={artist.image} 
                  alt={artist.name}
                  className="w-32 h-32 rounded-full object-cover mx-auto md:mx-0"
                />
                <div className="flex-1 text-center md:text-left">
                  <h1 className="text-3xl font-bold mb-2">{artist.name}</h1>
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
                    >
                      <Heart className={`w-4 h-4 mr-2 ${isFollowing ? 'fill-current' : ''}`} />
                      {isFollowing ? 'Following' : 'Follow'}
                    </Button>
                    <Link to={`/booking/${artist.id}`}>
                      <Button variant="outline" className="w-full">
                        <Calendar className="w-4 h-4 mr-2" />
                        Book Appointment
                      </Button>
                    </Link>
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
            {artist.portfolio.map((img, index) => (
              <div key={index} className="aspect-square rounded-lg overflow-hidden group cursor-pointer">
                <img 
                  src={img} 
                  alt={`Portfolio ${index + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
