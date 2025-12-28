import type { Metadata } from "next";
import Link from "next/link";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "PetriMarkt - Marktplatz für Fischereiartikel",
  description: "Online-Marktplatz für gebrauchte, selbstgemachte und neue Fischereiartikel",
  manifest: "/manifest.json",
  themeColor: "#93c5fd",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="de">
      <body className="font-sans antialiased">
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <footer className="bg-muted py-8 mt-12 border-t">
              <div className="container mx-auto px-4">
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-muted-foreground text-sm">
                  <p>&copy; 2024 PetriMarkt. Alle Rechte vorbehalten.</p>
                  <div className="flex flex-wrap gap-4 md:gap-6 justify-center md:justify-end">
                    <Link href="/impressum" className="hover:text-primary transition-colors">
                      Impressum
                    </Link>
                    <Link href="/datenschutz" className="hover:text-primary transition-colors">
                      Datenschutz
                    </Link>
                    <Link href="/agb" className="hover:text-primary transition-colors">
                      AGB
                    </Link>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
