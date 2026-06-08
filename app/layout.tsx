import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
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
  title: "Pickles",
  description: "Pittsburgh pickleball court availability at a glance",
  icons: { icon: "/favicon.svg" },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100">
        <main className="flex-1 max-w-3xl mx-auto w-full px-3 py-4">
          <Suspense fallback={<p className="text-sm text-zinc-400 animate-pulse">Loading...</p>}>
            {children}
          </Suspense>
        </main>
      </body>
    </html>
  );
}
