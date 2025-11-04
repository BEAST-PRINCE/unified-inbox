
// 1. Import NextRequest
import { NextRequest, NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";
import { db } from "@/lib/prisma";

/**
 * Fetches all messages for a specific contact.
 * The contact ID is passed as a URL parameter.
 */
export async function GET(
  // 2. Use NextRequest
  request: NextRequest,
  // 3. The second argument is a 'context' object
  context: { params: { contactId: string } }
) {
  try {
    // 1. Authenticate the user
    const session = await getCookieCache(request);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 4. Get contactId from context.params
    const { contactId } = context.params;
    if (!contactId) {
      return new NextResponse("Missing contactId", { status: 400 });
    }

    // (The rest of your code is correct)
    
    // 2. TODO: Authorize user
    // (e.g., check if user's teamId matches contact.teamId)

    // 3. Fetch messages for this contact
    const messages = await db.message.findMany({
      where: {
        contactId: contactId,
      },
      orderBy: {
        createdAt: "asc", // Order chronologically
      },
      include: {
        user: {
          select: { name: true, email: true },
        },
      },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}