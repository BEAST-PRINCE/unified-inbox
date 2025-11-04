// app/api/contacts/route.ts

import { NextResponse } from "next/server";
import { getCookieCache } from "better-auth/cookies";
import { db } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    // 1. Authenticate the user
    const session = await getCookieCache(request);
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 2. Find the user's team
    let teamMembership = await db.teamMembership.findFirst({
      where: { userId: session.user.id },
    });

    let teamId: string;

    // --- NEW LOGIC ---
    // 3. If no team is found, create one!
    if (!teamMembership) {
      // This is a brand new user.
      const newTeam = await db.team.create({
        data: {
          // Use the user's name for their first team
          name: `${session.user.name || session.user.email}'s Team`,
        },
      });

      // Link the user to this new team as an ADMIN
      const newMembership = await db.teamMembership.create({
        data: {
          userId: session.user.id,
          teamId: newTeam.id,
          role: "ADMIN",
        },
      });
      
      teamId = newMembership.teamId;
    } else {
      // User already has a team
      teamId = teamMembership.teamId;
    }
    // --- END NEW LOGIC ---


    // 4. Fetch contacts (This logic is the same as before)
    const contacts = await db.contact.findMany({
      where: { teamId: teamId }, // Use the (now guaranteed) teamId
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });

    // ... (rest of the file is the same)
    const conversations = contacts.map((contact) => ({
      id: contact.id,
      phone: contact.phone,
      firstName: contact.firstName,
      lastName: contact.lastName,
      lastMessage: contact.messages[0]?.content || "No messages yet",
      lastMessageAt: contact.messages[0]?.createdAt,
    }));

    conversations.sort((a, b) => {
      if (!a.lastMessageAt) return 1;
      if (!b.lastMessageAt) return -1;
      return b.lastMessageAt.getTime() - a.lastMessageAt.getTime();
    });

    return NextResponse.json(conversations);
  } catch (error) {
    console.error("Failed to fetch contacts:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}