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
            <footer className="bg-primary/5 border-t border-primary/10 py-8 mt-12">
              <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-3 text-primary">PetriMarkt</h3>
                    <p className="text-sm text-muted-foreground">
                      Der Online-Marktplatz für Fischereiartikel in der Schweiz
                    </p>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Links</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="/impressum" className="text-muted-foreground hover:text-primary transition-colors">
                          Impressum
                        </a>
                      </li>
                      <li>
                        <a href="/sicherheit" className="text-muted-foreground hover:text-primary transition-colors">
                          Sicherheitshinweise
                        </a>
                      </li>
                      <li>
                        <a href="/kontakt" className="text-muted-foreground hover:text-primary transition-colors">
                          Kontakt
                        </a>
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-3">Folgen Sie uns</h3>
                    <p className="text-sm text-muted-foreground">
                      Bleiben Sie auf dem Laufenden über neue Inserate und Updates
                    </p>
                  </div>
                </div>
                <div className="border-t border-primary/10 pt-6 text-center text-muted-foreground text-sm">
                  <p>&copy; 2024 PetriMarkt. Alle Rechte vorbehalten.</p>
                </div>
              </div>
            </footer>
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
