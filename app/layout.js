import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Sahwira - Free Task Management & Productivity Platform",
  description: "Boost productivity with Sahwira's free AI-powered platform. Perfect for students, indie hackers, employees, and companies. Features include task management, leaderboards, AI assistance, and achievement badges.",
  keywords: [
    "task management",
    "student productivity",
    "indie hacker tools",
    "team productivity",
    "AI assistant",
    "productivity leaderboard",
    "achievement badges",
    "free productivity platform",
    "student task management",
    "team collaboration",
    "workplace gamification",
    "productivity tracking",
    "personal task assistant",
    "project management",
    "free task tools"
  ],
  openGraph: {
    title: "Sahwira | Free AI-Powered Task Management & Achievement Platform",
    description: "Level up your productivity with Sahwira's free platform. Smart task management, AI assistance, achievement badges, and leaderboards for students, indie hackers, employees, and teams.",
    url: "https://sahwira.vercel.app/",
    siteName: "Sahwira",
    images: [
      {
        url: "/logo.png",
        width: 800,
        height: 600,
        alt: "Sahwira - Your Smart Productivity Assistant",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sahwira | Free Task Management & Achievement Platform",
    description: "Free AI-powered productivity platform with task management, badges, and leaderboards. Perfect for students, indie hackers, employees, and teams.",
    images: ["/logo.png"],
    creator: "@fariraimasocha",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/logo.png" />
      </head>
      <body>
        <Providers>
          <Navbar />
          <main className="pt-14">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  );
}
