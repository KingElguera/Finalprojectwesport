import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
});

export const metadata: Metadata = {
  title: "WeSport - Le réseau social des sportifs",
  description: "Trouve ton partenaire de sport, partage tes accomplissements et rejoins la communauté sportive la plus motivée.",
  keywords: ["sport", "réseau social", "partenaire", "fitness", "football", "basketball", "gym"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body className={`${outfit.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  );
}
