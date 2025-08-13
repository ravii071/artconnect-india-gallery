
import React from "react";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { 
  ArrowRight, 
  Palette, 
  Users, 
  Calendar, 
  Star,
  ChevronRight,
  Play
} from "lucide-react";

const Index = () => {
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (user && profile) {
      if (profile.user_type === "artist") {
        navigate("/dashboard");
      } else {
        navigate("/customer-dashboard");
      }
    } else {
      navigate("/auth");
    }
  };

  const handleBrowseArtists = () => {
    if (user && profile) {
      navigate("/customer-dashboard");
    } else {
      navigate("/auth");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Navigation */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2 group cursor-pointer">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ArtConnect
            </span>
          </div>
          
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Welcome, {profile?.full_name || user.email}</span>
                {profile?.user_type === "client" ? (
                  <Button 
                    onClick={handleBrowseArtists}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                  >
                    My Dashboard
                  </Button>
                ) : (
                  <Button 
                    onClick={() => navigate("/dashboard")}
                    className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300"
                  >
                    Artist Dashboard
                  </Button>
                )}
              </div>
            ) : (
              <Link to="/auth">
                <Button variant="outline" className="border-blue-200 hover:bg-blue-50 transition-colors duration-300">
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-6 animate-fade-in">
              Connect with Amazing Artists
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto animate-fade-in-delay">
              Discover talented artists, book personalized services, and bring your creative visions to life. Join thousands of satisfied customers who found their perfect artist match.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center animate-fade-in-delay-2">
              <Button 
                size="lg" 
                onClick={handleGetStarted}
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white px-8 py-4 rounded-full text-lg font-semibold shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300"
              >
                Get Started
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              
              <Button 
                variant="outline" 
                size="lg"
                onClick={handleBrowseArtists}
                className="border-2 border-blue-200 hover:bg-blue-50 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 hover:scale-105"
              >
                <Play className="mr-2 w-5 h-5" />
                Browse Artists
              </Button>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full opacity-20 animate-float"></div>
        <div className="absolute top-40 right-20 w-16 h-16 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full opacity-20 animate-float-delay"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full opacity-20 animate-float"></div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">Why Choose ArtConnect?</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We make it easy to find, connect, and work with talented artists for all your creative needs.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <Palette className="w-8 h-8" />,
                title: "Diverse Talent Pool",
                description: "From painters to digital artists, find specialists in every art form"
              },
              {
                icon: <Users className="w-8 h-8" />,
                title: "Verified Artists",
                description: "All artists are verified with portfolios and customer reviews"
              },
              {
                icon: <Calendar className="w-8 h-8" />,
                title: "Easy Booking",
                description: "Simple scheduling system with real-time availability"
              },
              {
                icon: <Star className="w-8 h-8" />,
                title: "Quality Guaranteed",
                description: "Customer satisfaction backed by our quality guarantee"
              }
            ].map((feature, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-2xl bg-white/70 backdrop-blur-sm border border-white/30 hover:shadow-lg transition-all duration-300 hover:scale-105 group"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                  <div className="text-white">{feature.icon}</div>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-4xl font-bold mb-4">Ready to Start Your Creative Journey?</h2>
            <p className="text-xl mb-8 text-blue-100">
              Join thousands of satisfied customers who found their perfect artist match
            </p>
            <Button 
              size="lg" 
              onClick={handleGetStarted}
              className="bg-white text-blue-600 hover:bg-gray-50 px-8 py-4 rounded-full text-lg font-semibold hover:scale-105 transition-all duration-300"
            >
              Get Started Now
              <ChevronRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
