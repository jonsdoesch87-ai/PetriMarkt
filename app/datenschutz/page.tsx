export const metadata = {
  title: 'Datenschutz | PetriMarkt',
  description: 'Datenschutzerklärung gemäß Schweizer nDSG',
};

export default function DatenschutzPage() {
  return (
    <div className="bg-background min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Datenschutzerklärung</h1>
        
        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">1. Verantwortliche Stelle</h2>
            <div className="space-y-2 text-muted-foreground">
              <p>
                Die verantwortliche Stelle für die Datenverarbeitung auf dieser Website ist:
              </p>
              <p>
                <strong>Jonas Oesch</strong><br />
                Bärenfelserstrasse 25<br />
                4057 Basel<br />
                Schweiz
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">2. Datenerhebung und -verwendung</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>2.1 Firebase Authentication</strong><br />
                Für die Authentifizierung unserer Nutzer verwenden wir Firebase Authentication von Google. 
                Dabei werden folgende Daten erfasst:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>E-Mail-Adresse</li>
                <li>Passwort (verschlüsselt gespeichert)</li>
                <li>Registrierungsdatum</li>
              </ul>
              
              <p>
                <strong>2.2 Firebase Firestore</strong><br />
                Für die Speicherung Ihrer Inserate und Profildaten nutzen wir Firebase Firestore. 
                Folgende Daten werden gespeichert:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Inserat-Daten (Titel, Beschreibung, Preis, Bilder, etc.)</li>
                <li>Profil-Daten (Standard-Kanton)</li>
                <li>Chat-Nachrichten</li>
              </ul>
              
              <p>
                <strong>2.3 Firebase Storage</strong><br />
                Hochgeladene Bilder werden in Firebase Storage gespeichert. 
                Die Bilder werden vor dem Upload auf eine maximale Breite von 1200px komprimiert.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">3. Rechtsgrundlage</h2>
            <p className="text-muted-foreground">
              Die Verarbeitung Ihrer personenbezogenen Daten erfolgt auf Grundlage des Schweizerischen Datenschutzgesetzes (nDSG) 
              und der Datenschutz-Grundverordnung (DSGVO), soweit diese anwendbar ist. 
              Die Datenverarbeitung erfolgt zur Erfüllung der Vertragserfüllung und zur Bereitstellung unserer Dienstleistungen.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">4. Ihre Rechte</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Sie haben jederzeit folgende Rechte:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Auskunftsrecht:</strong> Sie können Auskunft über Ihre bei uns gespeicherten personenbezogenen Daten verlangen.
                </li>
                <li>
                  <strong>Berichtigungsrecht:</strong> Sie können die Berichtigung unrichtiger Daten verlangen.
                </li>
                <li>
                  <strong>Löschungsrecht:</strong> Sie können die Löschung Ihrer Daten verlangen, sofern keine gesetzlichen Aufbewahrungspflichten entgegenstehen.
                </li>
                <li>
                  <strong>Widerspruchsrecht:</strong> Sie können der Verarbeitung Ihrer Daten widersprechen.
                </li>
                <li>
                  <strong>Datenübertragbarkeit:</strong> Sie können die Übertragung Ihrer Daten in einem strukturierten, 
                  gängigen und maschinenlesbaren Format verlangen.
                </li>
              </ul>
              <p>
                Um Ihre Rechte auszuüben, kontaktieren Sie uns bitte über die im Impressum angegebenen Kontaktdaten.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">5. Datenweitergabe</h2>
            <p className="text-muted-foreground">
              Ihre Daten werden an Google Firebase (Google LLC, 1600 Amphitheatre Parkway, Mountain View, CA 94043, USA) 
              weitergegeben, da wir deren Dienste für die Bereitstellung unserer Plattform nutzen. 
              Google Firebase unterliegt den Datenschutzbestimmungen von Google. 
              Weitere Informationen finden Sie in der Datenschutzerklärung von Google: 
              <a 
                href="https://policies.google.com/privacy" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline ml-1"
              >
                https://policies.google.com/privacy
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">6. Datensicherheit</h2>
            <p className="text-muted-foreground">
              Wir setzen technische und organisatorische Maßnahmen ein, um Ihre Daten vor Verlust, 
              Manipulation oder unberechtigtem Zugriff zu schützen. 
              Die Datenübertragung erfolgt verschlüsselt (HTTPS). 
              Firebase verwendet moderne Sicherheitsstandards für die Speicherung und Übertragung von Daten.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">7. Speicherdauer</h2>
            <p className="text-muted-foreground">
              Wir speichern Ihre personenbezogenen Daten nur so lange, wie dies für die Erfüllung der Zwecke, 
              für die sie erhoben wurden, erforderlich ist, oder solange gesetzliche Aufbewahrungspflichten bestehen. 
              Nach Ablauf dieser Fristen werden die entsprechenden Daten routinemäßig gelöscht.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">8. Änderungen dieser Datenschutzerklärung</h2>
            <p className="text-muted-foreground">
              Wir behalten uns vor, diese Datenschutzerklärung anzupassen, damit sie stets den aktuellen rechtlichen 
              Anforderungen entspricht oder um Änderungen unserer Leistungen in der Datenschutzerklärung umzusetzen. 
              Für Ihren erneuten Besuch gilt dann die neue Datenschutzerklärung.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">9. Kontakt</h2>
            <p className="text-muted-foreground">
              Bei Fragen zum Datenschutz können Sie uns jederzeit über die im Impressum angegebenen Kontaktdaten erreichen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
