import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wordle",
  description: "Wordle game created using nextjs",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
