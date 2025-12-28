'use client';

import { useEffect, useState } from 'react';

export default function ImpressumPage() {
  const [email, setEmail] = useState('');

  useEffect(() => {
    // Bot-Schutz: E-Mail wird clientseitig generiert
    const emailParts = ['petri', '.', 'markt', '@', 'gmail', '.', 'com'];
    setEmail(emailParts.join(''));
  }, []);

  return (
    <div className="bg-background min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Impressum</h1>
        
        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Angaben gemäß Art. 2 ZGB</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>Verantwortlich:</strong><br />
                Jonas Oesch<br />
                Bärenfelserstrasse 25<br />
                4057 Basel<br />
                Schweiz
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Kontakt</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                <strong>E-Mail:</strong>{' '}
                {email ? (
                  <a 
                    href={`mailto:${email}`}
                    className="text-primary hover:underline"
                  >
                    {email}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Wird geladen...</span>
                )}
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Haftungsausschluss</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Die Inhalte unserer Seiten wurden mit größter Sorgfalt erstellt. 
                Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen.
              </p>
              <p>
                Als Diensteanbieter sind wir gemäß Art. 2 ZGB für eigene Inhalte auf diesen Seiten verantwortlich. 
                Von diesen eigenen Inhalten sind Links zu den Seiten Dritter zu unterscheiden. 
                Wir haben keinen Einfluss auf die Inhalte der verlinkten Seiten.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">Urheberrecht</h2>
            <p className="text-muted-foreground">
              Die durch die Seitenbetreiber erstellten Inhalte und Werke auf diesen Seiten unterliegen dem schweizerischen Urheberrecht. 
              Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des Urheberrechtes 
              bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
