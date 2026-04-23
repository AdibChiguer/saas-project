import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "EGW-INSTALLTEC",
  description: "Gestion d'activité et facturation",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} !min-h-[calc(100vh-1px)] flex flex-col antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <main className="relative flex-1 flex flex-col bg-brand-25 text-brand-950 ">
            {children}
            <Toaster />
          </main>
        </Providers>
      </body>
    </html>
  );
}
