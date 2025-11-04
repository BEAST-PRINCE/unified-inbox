// app/(public)/login/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import Link from "next/link"; // <-- 1. IMPORT LINK

// Basic styling for the form (you can replace with Tailwind classes)
const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    backgroundColor: "#f3f4f6",
  },
  form: {
    backgroundColor: "white",
    padding: "2rem",
    borderRadius: "8px",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "400px",
  },
  input: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    marginBottom: "1rem",
  },
  button: {
    width: "100%",
    padding: "0.75rem",
    border: "none",
    borderRadius: "4px",
    backgroundColor: "#3b82f6",
    color: "white",
    fontSize: "1rem",
    cursor: "pointer",
  },
  googleButton: {
    width: "100%",
    padding: "0.75rem",
    border: "1px solid #ccc",
    borderRadius: "4px",
    backgroundColor: "#fff",
    color: "#333",
    fontSize: "1rem",
    cursor: "pointer",
    marginTop: "1rem",
  },
  error: {
    color: "red",
    marginBottom: "1rem",
  },
  divider: {
    textAlign: "center" as "center",
    margin: "1rem 0",
    color: "#888",
  },
  // 2. ADD STYLE FOR THE LINK
  link: {
    display: "block",
    textAlign: "center" as "center",
    marginTop: "1rem",
    color: "#3b82f6",
  },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  // (Your login handlers are all correct...)
  // const handleCredentialsLogin = async (e: React.FormEvent) => {
  //   e.preventDefault();
  //   setError(null);

  //   try {
  //     const response = await authClient.signIn.email({
  //       email,
  //       password,
  //       callbackURL: "/inbox", // <-- Add this line
  //     });

  //     if (response.error) {
  //       setError(response.error.message ?? "Invalid email or password");
  //     } else{
  //       // SUCCESS: Force a full-page reload.
  //       // This makes the browser send the new cookie to the server.
  //       window.location.href = "/inbox";
  //     }
  //   } catch (err) {
  //     setError("An unexpected error occurred.");
  //   }
  // };



  // In your login/page.tsx, replace handleCredentialsLogin with:

  const handleCredentialsLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      const response = await authClient.signIn.email({
        email,
        password,
      });

      if (response.error) {
        setError(response.error.message ?? "Invalid email or password");
      } else {
        // SUCCESS: Use router instead of window.location
        router.push("/inbox");
        router.refresh(); // Refresh to load session
      }
    } catch (err) {
      console.error("Login error:", err);
      setError("An unexpected error occurred.");
    }
  };



  const handleGoogleLogin = async () => {
    setError(null);
    try {
      const response = await authClient.signIn.social({
        provider: "google",
        callbackURL: "/inbox",
      });

      if (response.error) {
        setError(response.error.message || "Failed to sign in with Google.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };


  return (
    <div style={styles.container}>
      <form onSubmit={handleCredentialsLogin} style={styles.form}>
        <h2>Login to Unified Inbox</h2>
        
        {error && <p style={styles.error}>{error}</p>}

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
          placeholder="admin@example.com"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
          placeholder="admin"
        />

        <button type="submit" style={styles.button}>
          Login
        </button>

        <div style={styles.divider}>or</div>

        <button
          type="button"
          onClick={handleGoogleLogin}
          style={styles.googleButton}
        >
          Sign in with Google
        </button>

        {/* 3. ADD THIS LINK AT THE BOTTOM */}
        <Link href="/register" style={styles.link}>
          Don't have an account? Sign Up
        </Link>
      </form>
    </div>
  );
}