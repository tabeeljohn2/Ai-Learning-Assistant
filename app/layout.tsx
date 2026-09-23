// app/layout.tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Internee.pk Tutor",
  description: "Your personalized learning assistant",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-chalkboard text-chalk antialiased">
        {children}
      </body>
    </html>
  );
}