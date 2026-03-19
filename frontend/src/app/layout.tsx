import type { Metadata } from "next";
import { Plus_Jakarta_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import AppLayout from "@/components/layout/AppLayout";

const sansFont = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

const monoFont = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Codexis — AI Code Intelligence",
  description: "Chat with your codebase using AI. Index repositories, ask questions, and get instant answers powered by Codexis.",
};

import { AuthProvider } from "@/components/auth/AuthProvider";
import { ThemeProvider } from "@/components/providers/ThemeProvider";
import { ThemedToaster } from "@/components/providers/ThemedToaster";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${sansFont.variable} ${monoFont.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          <ThemeProvider>
            <AppLayout>{children}</AppLayout>
          </ThemeProvider>
        </AuthProvider>
        <ThemedToaster />
      </body>
    </html>
  );
}
