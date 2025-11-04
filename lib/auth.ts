// lib/auth.ts

import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { toNextJsHandler } from "better-auth/next-js";
import { db } from "./prisma";

// 1. IMPORT THE COOKIE PLUGIN
import { nextCookies } from "better-auth/next-js";

export const auth = betterAuth({
  database: prismaAdapter(db, { provider: "postgresql" }),
  secret: process.env.AUTH_SECRET!,
  pages: {
    signIn: "/login",
  },
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET
      ? {
          google: {
            clientId: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          },
        }
      : {}),
  },

  // 3. UPDATE THE AUTHORIZE FUNCTION
  async authorize(credentials: Record<string, any>) {
    if (!credentials.email || !credentials.password) {
      return null;
    }
    
    // Find the user in the database
    const user = await db.user.findUnique({
      where: { email: credentials.email as string },
    });

    // If no user, fail
    if (!user) {
      return null;
    }

    // This is our temporary password check.
    // In a real app, you would hash and compare the password.
    if (credentials.password === "admin") {
      return { id: user.id, email: user.email, name: user.name };
    }

    // Password was incorrect
    return null;
  },

  // 2. ADD THE PLUGINS ARRAY
  plugins: [
    nextCookies(), // This is essential for Next.js
  ],
});

export const { GET, POST } = toNextJsHandler(auth.handler);