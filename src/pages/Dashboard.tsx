
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  User, Camera, Calendar, Star, Heart, MessageCircle, 
  Settings, Upload, Edit, Trash2, Plus, Clock, CheckCircle 
} from "lucide-react";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("overview");

  // Mock user data - will be replaced with real data
  const user = {
    name: "Priya Sharma",
    specialty: "Mehendi Artist",
    location: "Mumbai, Maharashtra",
    rating: 4.9,
    reviews: 127,
    followers: "2.5k",
    totalBookings: 45,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80"
  };

  const recentBookings = [
    { id: 1, client: "Riya Patel", service: "Bridal Mehendi", date: "2024-01-15", status: "confirmed" },
    { id: 2, client: "Anjali Shah", service: "Arabic Design", date: "2024-01-18", status: "pending" },
    { id: 3, client: "Meera Gupta", service: "Simple Pattern", date: "2024-01-20", status: "completed" }
  ];

  const portfolio = [
    { id: 1, image: "https://images.unsplash.com/photo-1583221053175-a6a97bcb5b6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", likes: 45 },
    { id: 2, image: "https://images.unsplash.com/photo-1598300042247-d088f8ab3a91?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", likes: 32 },
    { id: 3, image: "https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&q=80", likes: 28 }
  ];

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
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm">
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
            <Link to={`/artist/${user.name}`}>
              <Button variant="outline" size="sm">
                <User className="w-4 h-4 mr-2" />
                View Profile
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-6">
            <img 
              src={user.image} 
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
            <div>
              <h1 className="text-3xl font-bold">Welcome back, {user.name}!</h1>
              <p className="text-gray-600">{user.specialty} • {user.location}</p>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-full mx-auto mb-2">
                  <Star className="w-6 h-6 text-orange-600" />
                </div>
                <div className="text-2xl font-bold">{user.rating}</div>
                <div className="text-sm text-gray-600">Rating</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-pink-100 rounded-full mx-auto mb-2">
                  <Heart className="w-6 h-6 text-pink-600" />
                </div>
                <div className="text-2xl font-bold">{user.followers}</div>
                <div className="text-sm text-gray-600">Followers</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-full mx-auto mb-2">
                  <Calendar className="w-6 h-6 text-purple-600" />
                </div>
                <div className="text-2xl font-bold">{user.totalBookings}</div>
                <div className="text-sm text-gray-600">Total Bookings</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-full mx-auto mb-2">
                  <MessageCircle className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-2xl font-bold">{user.reviews}</div>
                <div className="text-sm text-gray-600">Reviews</div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="portfolio">Portfolio</TabsTrigger>
            <TabsTrigger value="profile">Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>Recent Bookings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <h4 className="font-medium">{booking.client}</h4>
                          <p className="text-sm text-gray-600">{booking.service}</p>
                          <p className="text-xs text-gray-500">{booking.date}</p>
                        </div>
                        <Badge variant={
                          booking.status === "confirmed" ? "default" : 
                          booking.status === "pending" ? "secondary" : "outline"
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start bg-gradient-to-r from-orange-500 to-pink-500">
                    <Upload className="w-4 h-4 mr-2" />
                    Upload New Work
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Calendar className="w-4 h-4 mr-2" />
                    Manage Availability
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <User className="w-4 h-4 mr-2" />
                    Update Profile
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Account Settings
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentBookings.map((booking) => (
                    <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                            {booking.status === "confirmed" && <CheckCircle className="w-5 h-5 text-green-600" />}
                            {booking.status === "pending" && <Clock className="w-5 h-5 text-yellow-600" />}
                            {booking.status === "completed" && <CheckCircle className="w-5 h-5 text-blue-600" />}
                          </div>
                          <div>
                            <h4 className="font-medium">{booking.client}</h4>
                            <p className="text-sm text-gray-600">{booking.service}</p>
                            <p className="text-xs text-gray-500">{booking.date}</p>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={
                          booking.status === "confirmed" ? "default" : 
                          booking.status === "pending" ? "secondary" : "outline"
                        }>
                          {booking.status}
                        </Badge>
                        <Button size="sm" variant="outline">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="portfolio" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">My Portfolio</h2>
              <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                <Plus className="w-4 h-4 mr-2" />
                Add New Work
              </Button>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {portfolio.map((item) => (
                <Card key={item.id} className="overflow-hidden group">
                  <div className="relative">
                    <img 
                      src={item.image} 
                      alt={`Portfolio ${item.id}`}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex space-x-1">
                        <Button size="sm" variant="secondary" className="bg-white/90">
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="secondary" className="bg-white/90">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="absolute bottom-2 left-2">
                      <div className="flex items-center bg-black/50 text-white px-2 py-1 rounded text-sm">
                        <Heart className="w-3 h-3 mr-1" />
                        {item.likes}
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600">Profile management features will be implemented in the next phase.</p>
                <Button className="bg-gradient-to-r from-orange-500 to-pink-500">
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
