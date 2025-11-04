import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import twilio from "twilio";
import { headers } from "next/headers";

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

/**
 * This is the main webhook handler for all incoming Twilio messages
 * (SMS and WhatsApp).
 */
export async function POST(request: Request) {
  // 1. Parse the incoming form data
  // Twilio sends data as 'application/x-www-form-urlencoded'
  const body = await request.text();
  const params = new URLSearchParams(body);

  // 2. Security: Validate the Twilio Signature
  // This verifies the request is ACTUALLY from Twilio
  const twilioSignature = request.headers.get("X-Twilio-Signature");
  const authToken = process.env.TWILIO_AUTH_TOKEN!;
  const url = request.url; // The full URL of this webhook

  // Convert URLSearchParams to a plain object for validation
  const paramsObject = Object.fromEntries(params);

  const isValid = twilio.validateRequest(
    authToken,
    twilioSignature!,
    url,
    paramsObject
  );

  if (!isValid) {
    return new NextResponse("Invalid Twilio Signature", { status: 401 });
  }

  // 3. Extract Message Data
  const from = params.get("From"); // e.g., 'whatsapp:+14155238886' or '+15551234567'
  const to = params.get("To"); // Your Twilio number
  const messageBody = params.get("Body"); // The message content
  const twilioSid = params.get("MessageSid"); // Unique message ID

  if (!from || !messageBody || !twilioSid || !to) {
    return new NextResponse("Missing required fields", { status: 400 });
  }

  // 4. Database Logic: Find Contact and Create Message
  try {
    // TODO: In a real multi-tenant app, you would look up the 'to' number
    // to find which 'teamId' it belongs to.
    // For this assignment, we'll assume one team or a default team.
    // Let's create a placeholder teamId. You should seed this in your DB.
    const TEMP_TEAM_ID = "cl_default_team"; // <--- REPLACE THIS

    // Find or create the contact
    let contact = await db.contact.findFirst({
      where: { phone: from, teamId: TEMP_TEAM_ID },
    });

    if (!contact) {
      contact = await db.contact.create({
        data: {
          phone: from,
          teamId: TEMP_TEAM_ID,
          // You could try to parse a name if one comes in
          // e.g., from WhatsApp profile
        },
      });
    }

    // Determine the channel
    const channel = from.startsWith("whatsapp:") ? "WHATSAPP" : "SMS";

    // Create the inbound message
    await db.message.create({
      data: {
        contactId: contact.id,
        content: messageBody,
        channel: channel,
        direction: "INBOUND",
        status: "UNREAD",
        twilioSid: twilioSid,
        // userId is null because this is an inbound message
      },
    });

    // 5. Respond to Twilio
    // We send an empty TwiML response to acknowledge receipt.
    // If you wanted to send an auto-reply, you'd add it here.
    const twiml = new twilio.twiml.MessagingResponse();
    // Example auto-reply:
    // twiml.message("Thanks for contacting us! We'll reply soon.");

    return new NextResponse(twiml.toString(), {
      headers: { "Content-Type": "text/xml" },
    });
  } catch (error) {
    console.error("Failed to process webhook:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}