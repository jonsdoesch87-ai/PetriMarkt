import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "PetriMarkt - Marktplatz für Fischereiartikel",
  description: "Online-Marktplatz für gebrauchte, selbstgemachte und neue Fischereiartikel",
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
            <footer className="bg-muted py-8 mt-12">
              <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
                <p>&copy; 2024 PetriMarkt. Alle Rechte vorbehalten.</p>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
