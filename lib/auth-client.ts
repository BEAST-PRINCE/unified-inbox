// // lib/auth-client.ts

// import { createAuthClient } from "better-auth/react";

// // This creates all the React-specific hooks and methods.
// // We do not need to pass any configuration.
// export const authClient = createAuthClient();


// lib/auth-client.ts

import { createAuthClient } from "better-auth/react";

// Add configuration with baseURL
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000", // Auth API base URL
});
