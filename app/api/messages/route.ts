// app/api/messages/route.ts

import { NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";
import { db } from "@/lib/prisma";
import twilio from "twilio";

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

// Your main Twilio number
// In a real app, you'd pull this from a database
const TWILIO_NUMBER = process.env.TWILIO_NUMBER!; // <-- Add this to your .env

/**
 * Handles sending a new outbound message
 */
export async function POST(request: Request) {
  try {
    // 1. Authenticate the user
    const session = await getCookieCache(request);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Validate the request body
    const body = await request.json();
    const { contactId, messageBody } = body;

    if (!contactId || !messageBody) {
      return new NextResponse("Missing contactId or messageBody", {
        status: 400,
      });
    }

    // 3. Get the contact's phone number
    const contact = await db.contact.findUnique({
      where: { id: contactId },
    });

    if (!contact || !contact.phone) {
      return new NextResponse("Contact not found or has no phone number", {
        status: 404,
      });
    }

    // 4. Send the message via Twilio
    // 'from' is your Twilio number, 'to' is the contact's number
    const twilioMessage = await twilioClient.messages.create({
      body: messageBody,
      from: TWILIO_NUMBER,
      to: contact.phone,
    });

    // 5. Save the outbound message to our database
    const newDbMessage = await db.message.create({
      data: {
        contactId: contact.id,
        content: messageBody,
        // Determine channel from the 'to' number format
        channel: contact.phone.startsWith("whatsapp:") ? "WHATSAPP" : "SMS",
        direction: "OUTBOUND",
        status: "SENT", // Or use twilioMessage.status
        twilioSid: twilioMessage.sid,
        userId: session.user.id, // Link the message to the sending user
      },
    });

    return NextResponse.json(newDbMessage, { status: 201 });
  } catch (error) {
    console.error("Failed to send message:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}