import type { Metadata } from "next";

import "@/src/app/globals.css";

export const metadata: Metadata = {
  title: "Ask Alex",
  description:
    "Chat with Alex Muzyka's AI assistant about projects, architecture, and delivery decisions.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
