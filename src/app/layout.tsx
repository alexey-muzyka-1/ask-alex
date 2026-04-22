import type { Metadata } from "next";

import "@/src/app/globals.css";

export const metadata: Metadata = {
  title: "Ask Alex",
  description:
    "Диалог с AI-ассистентом Алекса Музыки о проектах, архитектуре и delivery-решениях.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">{children}</body>
    </html>
  );
}
