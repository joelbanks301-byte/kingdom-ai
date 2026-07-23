import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Kingdom AI Studio",
  description: "Create, assemble, and edit video — all in one studio.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
