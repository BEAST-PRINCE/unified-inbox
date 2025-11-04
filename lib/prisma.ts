
import { PrismaClient } from "../app/generated/prisma";


// This helps with type-hinting in development
declare global {
  var prisma: PrismaClient | undefined;
}

// This prevents multiple instances of Prisma Client in development (due to hot-reloading)
export const db =
  globalThis.prisma ||
  new PrismaClient({
    // Optional: Log all queries to the console
    log: ["query", "warn", "error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = db;
}