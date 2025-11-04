// app/layout.tsx

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// NO SessionProvider import needed

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Unified Inbox",
  description: "Assignment for Attack Capital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      {/* NO SessionProvider wrapper needed */}
      <body className={inter.className}>{children}</body>
    </html>
  );
}