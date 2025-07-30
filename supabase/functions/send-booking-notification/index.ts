import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface BookingNotificationRequest {
  artistEmail: string;
  artistName: string;
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  appointmentDate: string;
  appointmentTime: string;
  service: string;
  notes?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const bookingData: BookingNotificationRequest = await req.json();

    console.log("Sending booking notification to:", bookingData.artistEmail);

    const emailResponse = await resend.emails.send({
      from: "ArtSpace <onboarding@resend.dev>",
      to: [bookingData.artistEmail],
      subject: `New Booking Request from ${bookingData.customerName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
          <div style="background-color: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h1 style="color: #2563eb; margin-bottom: 20px;">New Booking Request</h1>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Hello ${bookingData.artistName},
            </p>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              You have received a new booking request through ArtSpace!
            </p>
            
            <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h2 style="color: #374151; margin-bottom: 15px;">Booking Details</h2>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #1f2937;">Customer:</strong> ${bookingData.customerName}
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #1f2937;">Email:</strong> ${bookingData.customerEmail}
              </div>
              
              ${bookingData.customerPhone ? `
                <div style="margin-bottom: 10px;">
                  <strong style="color: #1f2937;">Phone:</strong> ${bookingData.customerPhone}
                </div>
              ` : ''}
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #1f2937;">Date:</strong> ${bookingData.appointmentDate}
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #1f2937;">Time:</strong> ${bookingData.appointmentTime}
              </div>
              
              <div style="margin-bottom: 10px;">
                <strong style="color: #1f2937;">Service:</strong> ${bookingData.service}
              </div>
              
              ${bookingData.notes ? `
                <div style="margin-bottom: 10px;">
                  <strong style="color: #1f2937;">Notes:</strong> ${bookingData.notes}
                </div>
              ` : ''}
            </div>
            
            <p style="font-size: 16px; color: #333; margin-bottom: 20px;">
              Please contact the customer to confirm the appointment details.
            </p>
            
            <div style="text-align: center; margin-top: 30px;">
              <a href="mailto:${bookingData.customerEmail}" 
                 style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
                Reply to Customer
              </a>
            </div>
            
            <p style="color: #6b7280; font-size: 14px; margin-top: 30px; text-align: center;">
              This email was sent from ArtSpace booking system.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify({ success: true, emailResponse }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error sending booking notification:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);