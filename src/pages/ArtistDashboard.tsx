import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Camera, Calendar, Star, TrendingUp, DollarSign,
  Settings, LogOut, Upload, Edit, Eye, CheckCircle, Clock, Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface ArtistProfile {
  id: string;
  specialty: string;
  bio: string;
  location: string;
  phone: string;
  portfolio_images: string[];
  rating: number;
  total_reviews: number;
  starting_price: string;
}

interface Booking {
  id: string;
  customer_id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  total_amount: number;
  location: string;
  notes: string;
  profiles?: {
    full_name: string;
    email: string;
  } | null;
}

const ArtistDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [artistProfile, setArtistProfile] = useState<ArtistProfile | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchArtistData();
    
    // Real-time subscription for bookings
    const bookingsChannel = supabase
      .channel('artist-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `artist_id=eq.${user?.id}`
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    // Real-time subscription for artist profile updates
    const profileChannel = supabase
      .channel('artist-profile')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'artist_profiles',
          filter: `id=eq.${user?.id}`
        },
        () => {
          fetchArtistProfile();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(bookingsChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [user?.id]);

  const fetchArtistData = async () => {
    await Promise.all([
      fetchArtistProfile(),
      fetchBookings()
    ]);
    setLoading(false);
  };

  const fetchArtistProfile = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('artist_profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') throw error;
      setArtistProfile(data);
    } catch (error) {
      console.error('Error fetching artist profile:', error);
    }
  };

  const fetchBookings = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          profiles:profiles(full_name, email)
        `)
        .eq('artist_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setBookings((data as any) || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
      toast({
        title: "Error",
        description: "Failed to fetch bookings",
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'completed': return 'bg-blue-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    totalEarnings: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0),
    rating: artistProfile?.rating || 0,
    totalReviews: artistProfile?.total_reviews || 0
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50 transition-all duration-700">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-600 to-pink-600 bg-clip-text text-transparent">
              ArtConnect
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Link to="/profile">
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </Link>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleSignOut}
              className="hover:scale-105 transition-transform duration-200 text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center space-x-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-pink-500 flex items-center justify-center">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome back, {profile?.full_name || 'Artist'}!</h1>
              <p className="text-gray-600">{artistProfile?.specialty || 'Artist'} • {artistProfile?.location || 'Location not set'}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Card className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold text-orange-600">{stats.rating.toFixed(1)}</div>
                <div className="text-sm text-gray-600">Rating</div>
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mx-auto mb-2">
                  <TrendingUp className="w-6 h-6 text-pink-600" />
                </div>
                <div className="text-2xl font-bold text-pink-600">{stats.totalReviews}</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingBookings}</div>
                <div className="text-sm text-gray-600">Pending</div>
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.completedBookings}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                  <DollarSign className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">₹{stats.totalEarnings}</div>
                <div className="text-sm text-gray-600">Earnings</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="bookings" className="transition-all duration-200">Bookings</TabsTrigger>
            <TabsTrigger value="portfolio" className="transition-all duration-200">Portfolio</TabsTrigger>
            <TabsTrigger value="profile" className="transition-all duration-200">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card className="backdrop-blur-sm bg-white/70 border-white/20">
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border border-white/30 rounded-lg backdrop-blur-sm bg-white/50 hover:bg-white/60 transition-all duration-200">
                        <div>
                          <h4 className="font-medium">{booking.profiles?.full_name || 'Customer'}</h4>
                          <p className="text-sm text-gray-600">{booking.service_name}</p>
                          <p className="text-xs text-gray-500">{booking.appointment_date} at {booking.appointment_time}</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${getStatusColor(booking.status)}`}></div>
                          <Badge variant="outline" className="capitalize">
                            {booking.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    {bookings.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No bookings yet</p>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card className="backdrop-blur-sm bg-white/70 border-white/20">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-300">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Work
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Availability
                  </Button>
                  <Link to="/profile">
                    <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                      <Edit className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <Eye className="w-4 h-4 mr-2" />
                    Preview Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6 animate-fade-in">
            <Card className="backdrop-blur-sm bg-white/70 border-white/20">
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border border-white/30 rounded-lg backdrop-blur-sm bg-white/50 hover:bg-white/60 transition-all duration-200">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className={`w-4 h-4 rounded-full ${getStatusColor(booking.status)}`}></div>
                          <div>
                            <h4 className="font-medium">{booking.profiles?.full_name || 'Customer'}</h4>
                            <p className="text-sm text-gray-600">{booking.service_name}</p>
                            <p className="text-xs text-gray-500">{booking.appointment_date} at {booking.appointment_time}</p>
                            {booking.notes && (
                              <p className="text-xs text-gray-400 mt-1">Note: {booking.notes}</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {booking.status}
                        </Badge>
                        {booking.total_amount && (
                          <span className="text-sm font-medium text-green-600">₹{booking.total_amount}</span>
                        )}
                        <Button size="sm" variant="outline" className="hover:scale-105 transition-transform duration-200">
                          Manage
                        </Button>
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-center py-8">
                      <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-4">No bookings yet</p>
                      <p className="text-sm text-gray-400">Complete your profile to start receiving bookings</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Portfolio</h2>
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-300">
                <Plus className="w-4 h-4 mr-2" />
                Add New Work
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {artistProfile?.portfolio_images?.map((image, index) => (
                <Card key={index} className="overflow-hidden group backdrop-blur-sm bg-white/70 border-white/20">
                  <div className="relative">
                    <img 
                      src={image} 
                      alt={`Portfolio ${index + 1}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="secondary" className="bg-white/90 hover:scale-110 transition-transform duration-200">
                          <Edit className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              )) || []}
              
              {(!artistProfile?.portfolio_images || artistProfile.portfolio_images.length === 0) && (
                <div className="col-span-full text-center py-12">
                  <Camera className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 mb-4">No portfolio images yet</p>
                  <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload Your First Work
                  </Button>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6 animate-fade-in">
            <Card className="backdrop-blur-sm bg-white/70 border-white/20">
              <CardHeader>
                <CardTitle>Profile Management</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium mb-2">Profile Completion</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Basic Info</span>
                        <span className="text-green-600">✓</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Specialty</span>
                        <span className={artistProfile?.specialty ? "text-green-600" : "text-red-600"}>
                          {artistProfile?.specialty ? "✓" : "✗"}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Portfolio</span>
                        <span className={artistProfile?.portfolio_images?.length ? "text-green-600" : "text-red-600"}>
                          {artistProfile?.portfolio_images?.length ? "✓" : "✗"}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Quick Stats</h3>
                    <div className="space-y-2 text-sm">
                      <div>Profile Views: Coming Soon</div>
                      <div>Response Rate: Coming Soon</div>
                      <div>Booking Rate: Coming Soon</div>
                    </div>
                  </div>
                </div>
                <Link to="/profile">
                  <Button className="bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 transition-all duration-300">
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ArtistDashboard;