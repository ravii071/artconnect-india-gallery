-- Create bookings table for customer-artist appointments
CREATE TABLE public.bookings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_id uuid NOT NULL REFERENCES public.profiles(id),
  artist_id uuid NOT NULL REFERENCES public.profiles(id),
  service_name text NOT NULL,
  appointment_date date NOT NULL,
  appointment_time time NOT NULL,
  location text,
  notes text,
  total_amount decimal(10,2),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'completed')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS for bookings
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;

-- Customers can view their own bookings
CREATE POLICY "Customers can view their own bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = customer_id);

-- Artists can view bookings made with them
CREATE POLICY "Artists can view their bookings" 
ON public.bookings 
FOR SELECT 
USING (auth.uid() = artist_id);

-- Customers can create bookings
CREATE POLICY "Customers can create bookings" 
ON public.bookings 
FOR INSERT 
WITH CHECK (auth.uid() = customer_id);

-- Artists can update booking status
CREATE POLICY "Artists can update booking status" 
ON public.bookings 
FOR UPDATE 
USING (auth.uid() = artist_id);

-- Add updated_at trigger for bookings
CREATE TRIGGER update_bookings_updated_at
BEFORE UPDATE ON public.bookings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Add location column to artist_profiles if not exists
ALTER TABLE public.artist_profiles 
ADD COLUMN IF NOT EXISTS location text;

-- Update art_forms table with some default art forms
INSERT INTO public.art_forms (name, description) VALUES
('Mehendi', 'Traditional henna art for hands and feet'),
('Makeup', 'Professional makeup for weddings and events'),
('Nail Art', 'Creative nail designs and manicures'),
('Sketching', 'Portrait and artistic sketching'),
('Face Painting', 'Creative face art for events and parties')
ON CONFLICT (name) DO NOTHING;