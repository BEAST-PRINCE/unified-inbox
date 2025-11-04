// app/(protected)/layout.tsx
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
// 1. Import React Query components
import {
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";

// Simple styles (unchanged)
const styles = {
  layout: {
    display: "flex",
    height: "100vh",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#1f2937",
    color: "white",
    padding: "1rem",
  },
  content: {
    flex: 1,
    padding: "2rem",
    overflowY: "auto" as "auto", // Casted type
    backgroundColor: "#f9fafb",
  },
  signOutButton: {
    width: "100%",
    padding: "0.5rem",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#ef4444",
    color: "white",
    cursor: "pointer",
    marginTop: "2rem",
  },
};

// 2. Create a QueryClient instance
// We use useState to ensure it's only created once per component instance
function MyQueryClientProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
}

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { data: session, isPending } = authClient.useSession();

  const handleSignOut = async () => {
    await authClient.signOut();
    router.push("/login");
  };

  if (isPending) {
    return <div>Loading session...</div>;
  }

  return (
    // 3. Wrap your layout in the QueryClient provider
    <MyQueryClientProvider>
      <div style={styles.layout}>
        <aside style={styles.sidebar}>
          <h3>Unified Inbox</h3>
          <p>Welcome, {session?.user?.email || "User"}</p>
          <ul>
            <li>Inbox</li>
            <li>Contacts</li>
            <li>Dashboard</li>
          </ul>
          <button onClick={handleSignOut} style={styles.signOutButton}>
            Sign Out
          </button>
        </aside>
        <main style={styles.content}>{children}</main>
      </div>
    </MyQueryClientProvider>
  );
}