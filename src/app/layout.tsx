import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { ConditionalCitizenNav } from "@/components/ConditionalCitizenNav";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Nagrik — Civic Accountability Platform",
  description: "Report civic issues. Hold authorities accountable. Jaipur.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,   // prevents iOS zoom on input focus
  themeColor: "#09090b",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { userId, sessionClaims } = await auth();
  const role = (sessionClaims?.metadata as { role?: string } | undefined)?.role;
  // Citizens get a desktop sidebar → push content right on md+ screens
  const isCitizen = !!userId && role !== "authority" && role !== "admin";

  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className={`min-h-full flex flex-col${isCitizen ? " md:pl-56" : ""}`}>
          {children}
          <ConditionalCitizenNav />
        </body>
      </html>
    </ClerkProvider>
  );
}
