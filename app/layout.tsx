import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "IT DEPENDS | Advokat Frida",
  description:
    "Make the call, reveal one missing fact, and make the call again.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
