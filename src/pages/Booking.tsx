
import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Star, MapPin, ArrowLeft, Clock, IndianRupee } from "lucide-react";

const Booking = () => {
  const { id } = useParams();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedService, setSelectedService] = useState<number | null>(null);

  // Mock artist data
  const artist = {
    id: 1,
    name: "Priya Sharma",
    specialty: "Mehendi Artist",
    location: "Mumbai, Maharashtra",
    rating: 4.9,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&q=80",
    services: [
      { id: 1, name: "Bridal Mehendi", price: 3000, duration: "3-4 hours", description: "Complete bridal mehendi with intricate designs" },
      { id: 2, name: "Arabic Design", price: 800, duration: "1-2 hours", description: "Beautiful Arabic patterns" },
      { id: 3, name: "Simple Pattern", price: 500, duration: "30-45 mins", description: "Simple and elegant designs" }
    ]
  };

  const timeSlots = [
    "09:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "02:00 PM", "03:00 PM", "04:00 PM", "05:00 PM", "06:00 PM"
  ];

  const selectedServiceDetails = artist.services.find(s => s.id === selectedService);

  const handleBooking = () => {
    if (!selectedService || !selectedDate || !selectedTime) {
      alert("Please select a service, date, and time");
      return;
    }
    // TODO: Implement actual booking logic with Supabase
    alert("Booking request sent! The artist will confirm your appointment.");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-pink-50 to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-orange-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to={`/artist/${id}`}>
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Profile
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
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Artist Info */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Book Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <img 
                    src={artist.image} 
                    alt={artist.name}
                    className="w-16 h-16 rounded-full object-cover"
                  />
                  <div>
                    <h3 className="font-semibold text-lg">{artist.name}</h3>
                    <Badge className="mb-2 bg-gradient-to-r from-orange-500 to-pink-500">
                      {artist.specialty}
                    </Badge>
                    <div className="flex items-center text-gray-600 text-sm">
                      <MapPin className="w-4 h-4 mr-1" />
                      {artist.location}
                    </div>
                    <div className="flex items-center mt-1">
                      <Star className="w-4 h-4 fill-current text-yellow-400 mr-1" />
                      <span className="text-sm font-medium">{artist.rating}</span>
                      <span className="text-sm text-gray-600 ml-1">({artist.reviews} reviews)</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Service Selection */}
            <Card>
              <CardHeader>
                <CardTitle>Select Service</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {artist.services.map((service) => (
                    <div 
                      key={service.id}
                      className={`border rounded-lg p-4 cursor-pointer transition-all ${
                        selectedService === service.id 
                          ? 'border-orange-400 bg-orange-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedService(service.id)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h4 className="font-medium">{service.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{service.description}</p>
                          <div className="flex items-center mt-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-1" />
                            {service.duration}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center text-orange-600 font-semibold">
                            <IndianRupee className="w-4 h-4" />
                            {service.price}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Date & Time Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Select Date</CardTitle>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    disabled={(date) => date < new Date()}
                    className="rounded-md border"
                  />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-2">
                    {timeSlots.map((time) => (
                      <Button
                        key={time}
                        variant={selectedTime === time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedTime(time)}
                        className={selectedTime === time ? "bg-gradient-to-r from-orange-500 to-pink-500" : ""}
                      >
                        {time}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Booking Summary */}
          <div>
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Booking Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedServiceDetails && (
                  <>
                    <div>
                      <h4 className="font-medium">{selectedServiceDetails.name}</h4>
                      <p className="text-sm text-gray-600">{selectedServiceDetails.description}</p>
                      <div className="flex items-center mt-1 text-sm text-gray-600">
                        <Clock className="w-4 h-4 mr-1" />
                        {selectedServiceDetails.duration}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between items-center">
                        <span>Service Fee:</span>
                        <div className="flex items-center font-semibold">
                          <IndianRupee className="w-4 h-4" />
                          {selectedServiceDetails.price}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                
                {selectedDate && (
                  <div className="border-t pt-4">
                    <span className="font-medium">Date:</span>
                    <p className="text-sm text-gray-600">{selectedDate.toDateString()}</p>
                  </div>
                )}
                
                {selectedTime && (
                  <div className="border-t pt-4">
                    <span className="font-medium">Time:</span>
                    <p className="text-sm text-gray-600">{selectedTime}</p>
                  </div>
                )}

                <Button 
                  onClick={handleBooking}
                  className="w-full bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600"
                  disabled={!selectedService || !selectedDate || !selectedTime}
                >
                  Book Appointment
                </Button>
                
                <p className="text-xs text-center text-gray-500">
                  Your booking request will be sent to the artist for confirmation
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
