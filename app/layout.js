import "./globals.css";
import Providers from "@/components/providers";
import Navbar from "@/components/Navbar";

export const metadata = {
  title: "Sahwira AI",
  description: "Your Sidekick AI Assistant",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
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
