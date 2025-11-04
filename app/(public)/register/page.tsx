// app/(public)/register/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/lib/auth-client";

// Using the same styles as the login page
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
  error: {
    color: "red",
    marginBottom: "1rem",
  },
  link: {
    display: "block",
    textAlign: "center" as "center",
    marginTop: "1rem",
    color: "#3b82f6",
  },
};

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      // Use the 'signUp.email' method from better-auth
      const response = await authClient.signUp.email({
        name,
        email,
        password,
      });

      if (response.error) {
        // Show error (e.g., "User already exists")
        setError(response.error.message ?? "An unknown error occurred.");
      } else {
        // Success! Better-auth signs them in automatically
        // and redirects to the inbox.
        router.push("/inbox");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleRegister} style={styles.form}>
        <h2>Create an Account</h2>
        
        {error && <p style={styles.error}>{error}</p>}

        <label htmlFor="name">Name</label>
        <input
          id="name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={styles.input}
          placeholder="Your Name"
        />

        <label htmlFor="email">Email</label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={styles.input}
          placeholder="you@example.com"
        />

        <label htmlFor="password">Password</label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={styles.input}
          placeholder="Min 8 characters"
        />

        <button type="submit" style={styles.button}>
          Sign Up
        </button>

        <Link href="/login" style={styles.link}>
          Already have an account? Login
        </Link>
      </form>
    </div>
  );
}