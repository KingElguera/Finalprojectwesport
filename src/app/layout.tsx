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
  description: "Plus qu'une app de sport une communauté en mouvement, partage tes entrainements, rencontre des sportifs près de toi et transforme ton sport en un véritable mode de vie.",
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
