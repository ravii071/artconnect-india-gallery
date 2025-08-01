import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Phone, Star, ArrowLeft } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface Artist {
  id: string;
  specialty: string;
  location: string;
  bio: string;
  phone: string;
  starting_price: string;
  rating: number;
  total_reviews: number;
  art_forms: { name: string } | null;
  profiles: {
    full_name: string;
    avatar_url: string;
  };
}

const BookingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingData, setBookingData] = useState({
    serviceName: "",
    location: "",
    notes: "",
    totalAmount: ""
  });

  // Available time slots
  const timeSlots = [
    "09:00", "10:00", "11:00", "12:00", 
    "14:00", "15:00", "16:00", "17:00", "18:00"
  ];

  useEffect(() => {
    if (id) {
      fetchArtist();
    }
  }, [id]);

  const fetchArtist = async () => {
    try {
      const { data, error } = await supabase
        .from("artist_profiles")
        .select(`
          id,
          specialty,
          location,
          bio,
          phone,
          starting_price,
          rating,
          total_reviews,
          art_forms (name),
          profiles!inner(
            full_name,
            avatar_url
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      setArtist(data);
    } catch (error) {
      console.error("Error fetching artist:", error);
      toast({
        title: "Error",
        description: "Failed to load artist details",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBooking = async () => {
    if (!selectedDate || !selectedTime || !bookingData.serviceName || !user) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setBookingLoading(true);
    try {
      // Create booking
      const { error: bookingError } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          artist_id: id,
          service_name: bookingData.serviceName,
          appointment_date: selectedDate.toISOString().split('T')[0],
          appointment_time: selectedTime,
          location: bookingData.location || artist?.location,
          notes: bookingData.notes,
          total_amount: bookingData.totalAmount ? parseFloat(bookingData.totalAmount) : null
        });

      if (bookingError) throw bookingError;

      // Send email notification to artist
      await supabase.functions.invoke('send-booking-notification', {
        body: {
          artistEmail: artist?.profiles?.full_name, // We'll need artist email
          customerName: user.email,
          serviceName: bookingData.serviceName,
          appointmentDate: selectedDate.toISOString().split('T')[0],
          appointmentTime: selectedTime,
          location: bookingData.location || artist?.location,
          notes: bookingData.notes
        }
      });

      toast({
        title: "Booking Confirmed!",
        description: "Your appointment has been booked successfully. The artist will contact you soon.",
      });

      navigate("/home");
    } catch (error: any) {
      console.error("Error creating booking:", error);
      toast({
        title: "Booking Failed",
        description: error.message || "Failed to create booking",
        variant: "destructive",
      });
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Artist Not Found</h2>
          <Button onClick={() => navigate("/home")}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Book Appointment</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Artist Info */}
          <div>
            <Card>
              <CardHeader>
                <div className="flex items-center gap-4">
                  <img
                    src={artist.profiles.avatar_url || "/placeholder.svg"}
                    alt={artist.profiles.full_name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <CardTitle>{artist.profiles.full_name}</CardTitle>
                    <Badge className="mt-1">{artist.art_forms?.name || artist.specialty}</Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-gray-500" />
                  <span>{artist.location}</span>
                </div>
                
                {artist.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-500" />
                    <span>{artist.phone}</span>
                  </div>
                )}
                
                {artist.rating > 0 && (
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                    <span>{artist.rating.toFixed(1)} ({artist.total_reviews} reviews)</span>
                  </div>
                )}
                
                {artist.starting_price && (
                  <div className="text-lg font-semibold text-green-600">
                    {artist.starting_price}
                  </div>
                )}
                
                {artist.bio && (
                  <p className="text-gray-600">{artist.bio}</p>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Booking Form */}
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Book Your Appointment</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Service Name *</Label>
                  <Input
                    placeholder="e.g., Bridal Makeup, Wedding Mehendi"
                    value={bookingData.serviceName}
                    onChange={(e) => setBookingData(prev => ({ ...prev, serviceName: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Select Date *</Label>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </div>

                <div>
                  <Label>Select Time *</Label>
                  <Select value={selectedTime} onValueChange={setSelectedTime}>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose time slot" />
                    </SelectTrigger>
                    <SelectContent>
                      {timeSlots.map((time) => (
                        <SelectItem key={time} value={time}>
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            {time}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Location</Label>
                  <Input
                    placeholder={`Default: ${artist.location}`}
                    value={bookingData.location}
                    onChange={(e) => setBookingData(prev => ({ ...prev, location: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Budget (Optional)</Label>
                  <Input
                    placeholder="Enter your budget"
                    value={bookingData.totalAmount}
                    onChange={(e) => setBookingData(prev => ({ ...prev, totalAmount: e.target.value }))}
                  />
                </div>

                <div>
                  <Label>Additional Notes</Label>
                  <Textarea
                    placeholder="Any special requirements or details..."
                    value={bookingData.notes}
                    onChange={(e) => setBookingData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>

                <Button 
                  onClick={handleBooking}
                  disabled={bookingLoading}
                  className="w-full"
                  size="lg"
                >
                  {bookingLoading ? "Booking..." : "Confirm Booking"}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingPage;