import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "CalSync — Schedule meetings without the back-and-forth",
  description:
    "A Calendly alternative for easy appointment booking. Set your availability, share your link, and let people book time with you.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 3000,
            style: {
              borderRadius: "0.5rem",
              padding: "0.75rem 1rem",
              fontSize: "0.875rem",
            },
          }}
        />
      </body>
    </html>
  );
}
