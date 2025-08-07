import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Calendar, Heart, MapPin, Clock, Star, 
  Settings, LogOut, Search, BookOpen, History, Plus
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";

interface Booking {
  id: string;
  artist_id: string;
  service_name: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  total_amount: number;
  location: string;
  notes: string;
  artist_profile?: {
    specialty: string;
    profiles?: {
      full_name: string;
      avatar_url: string;
    };
  } | null;
}

const CustomerDashboard = () => {
  const { user, profile, signOut } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    fetchBookings();
    
    // Real-time subscription for bookings
    const channel = supabase
      .channel('customer-bookings')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'bookings',
          filter: `customer_id=eq.${user?.id}`
        },
        () => {
          fetchBookings();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  const fetchBookings = async () => {
    if (!user?.id) return;
    
    try {
      const { data, error } = await supabase
        .from('bookings')
        .select(`
          *,
          artist_profile:artist_profiles(
            specialty,
            profiles:profiles(full_name, avatar_url)
          )
        `)
        .eq('customer_id', user.id)
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
    } finally {
      setLoading(false);
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
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    upcomingBookings: bookings.filter(b => b.status === 'confirmed').length,
    totalSpent: bookings
      .filter(b => b.status === 'completed')
      .reduce((sum, b) => sum + (b.total_amount || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 transition-all duration-700">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-blue-100 sticky top-0 z-50 transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
              <span className="text-white font-bold text-sm">AC</span>
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              ArtConnect
            </span>
          </Link>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" className="hover:scale-105 transition-transform duration-200">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
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
            <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
              <User className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Welcome back, {profile?.full_name || 'Customer'}!</h1>
              <p className="text-gray-600">Discover amazing artists and book your next service</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                  <BookOpen className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold text-blue-600">{stats.totalBookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">{stats.upcomingBookings}</div>
                <div className="text-sm text-gray-600">Upcoming</div>
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                  <History className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold text-purple-600">{stats.completedBookings}</div>
                <div className="text-sm text-gray-600">Completed</div>
              </CardContent>
            </Card>
            
            <Card className="hover:scale-105 transition-all duration-300 hover:shadow-lg">
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-yellow-100 rounded-full mx-auto mb-2">
                  <Star className="w-6 h-6 text-yellow-600" />
                </div>
                <div className="text-2xl font-bold text-yellow-600">₹{stats.totalSpent}</div>
                <div className="text-sm text-gray-600">Total Spent</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/50 backdrop-blur-sm">
            <TabsTrigger value="overview" className="transition-all duration-200">Overview</TabsTrigger>
            <TabsTrigger value="bookings" className="transition-all duration-200">My Bookings</TabsTrigger>
            <TabsTrigger value="discover" className="transition-all duration-200">Discover Artists</TabsTrigger>
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
                    {bookings.slice(0, 3).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border border-white/30 rounded-lg backdrop-blur-sm bg-white/50 hover:bg-white/60 transition-all duration-200">
                        <div>
                          <h4 className="font-medium">{booking.artist_profile?.profiles?.full_name || 'Artist'}</h4>
                          <p className="text-sm text-gray-600">{booking.service_name}</p>
                          <p className="text-xs text-gray-500">{booking.appointment_date}</p>
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
                  <Link to="/home">
                    <Button className="w-full justify-start bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                      <Search className="w-4 h-4 mr-2" />
                      Browse Artists
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <Calendar className="w-4 h-4 mr-2" />
                    View Calendar
                  </Button>
                  <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                    <Heart className="w-4 h-4 mr-2" />
                    Favorite Artists
                  </Button>
                  <Link to="/profile">
                    <Button variant="outline" className="w-full justify-start hover:scale-105 transition-transform duration-200">
                      <User className="w-4 h-4 mr-2" />
                      Update Profile
                    </Button>
                  </Link>
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
                            <h4 className="font-medium">{booking.artist_profile?.profiles?.full_name || 'Artist'}</h4>
                            <p className="text-sm text-gray-600">{booking.service_name}</p>
                            <div className="flex items-center text-xs text-gray-500 space-x-4">
                              <span className="flex items-center">
                                <Calendar className="w-3 h-3 mr-1" />
                                {booking.appointment_date}
                              </span>
                              <span className="flex items-center">
                                <Clock className="w-3 h-3 mr-1" />
                                {booking.appointment_time}
                              </span>
                              {booking.location && (
                                <span className="flex items-center">
                                  <MapPin className="w-3 h-3 mr-1" />
                                  {booking.location}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline" className="capitalize">
                          {booking.status}
                        </Badge>
                        {booking.total_amount && (
                          <span className="text-sm font-medium">₹{booking.total_amount}</span>
                        )}
                      </div>
                    </div>
                  ))}
                  {bookings.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-gray-500 mb-4">No bookings yet</p>
                      <Link to="/home">
                        <Button className="bg-gradient-to-r from-blue-500 to-purple-500">
                          <Plus className="w-4 h-4 mr-2" />
                          Book Your First Service
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="discover" className="space-y-6 animate-fade-in">
            <Card className="backdrop-blur-sm bg-white/70 border-white/20">
              <CardHeader>
                <CardTitle>Discover Amazing Artists</CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="mb-4">
                  <Search className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-medium mb-2">Find Perfect Artists</h3>
                  <p className="text-gray-600 mb-6">Browse through our curated list of talented artists</p>
                </div>
                <Link to="/home">
                  <Button className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 transition-all duration-300">
                    <Search className="w-4 h-4 mr-2" />
                    Browse All Artists
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

export default CustomerDashboard;