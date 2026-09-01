import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "katex/dist/katex.min.css";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "Mock Test Portal — Real-time Competitive Exam Prep",
    template: "%s | Mock Test Portal",
  },
  description:
    "Online competitive MCQ mock-test and examination portal with realistic timing, negative marking, answer reviews, and student analytics.",
  keywords: [
    "mock test",
    "exam preparation",
    "online test portal",
    "competitive exams",
    "SSC CGL",
    "Banking mock tests",
    "TCS iON practice",
    "MCQ tests",
  ],
  authors: [{ name: "Mock Test Portal Team" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "Mock Test Portal",
    title: "Mock Test Portal — Real-time Competitive Exam Preparation",
    description:
      "Practice full-length competitive mock tests with instant server-side scoring, detailed answer keys, and weak topic analytics.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mock Test Portal — Real-time Competitive Exam Preparation",
    description:
      "Practice full-length competitive mock tests with instant server-side scoring, detailed answer keys, and weak topic analytics.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
