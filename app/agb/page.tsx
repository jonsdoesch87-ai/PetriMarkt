export const metadata = {
  title: 'AGB | PetriMarkt',
  description: 'Allgemeine Geschäftsbedingungen von PetriMarkt',
};

export default function AGBPage() {
  return (
    <div className="bg-background min-h-screen py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl font-bold text-primary mb-8">Allgemeine Geschäftsbedingungen (AGB)</h1>
        
        <div className="space-y-8 text-foreground">
          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">1. Geltungsbereich</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Diese Allgemeinen Geschäftsbedingungen (AGB) gelten für die Nutzung der Online-Plattform PetriMarkt 
                (nachfolgend &quot;Plattform&quot; genannt) durch Nutzer (nachfolgend &quot;Nutzer&quot; oder &quot;Sie&quot; genannt).
              </p>
              <p>
                Die Plattform wird betrieben von Jonas Oesch, Bärenfelserstrasse 25, 4057 Basel, Schweiz.
              </p>
              <p>
                Durch die Registrierung und Nutzung der Plattform erkennen Sie diese AGB an. 
                Sollten Sie mit einzelnen Bestimmungen nicht einverstanden sein, 
                ist die Nutzung der Plattform nicht gestattet.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">2. Vermittlerrolle von PetriMarkt</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                PetriMarkt ist eine reine Vermittlungsplattform. Wir bieten lediglich die technische Infrastruktur 
                für die Veröffentlichung von Inseraten und die Kommunikation zwischen Verkäufern und Käufern an.
              </p>
              <p>
                <strong>2.1 Keine Vertragspartei</strong><br />
                PetriMarkt ist weder Verkäufer noch Käufer der auf der Plattform angebotenen Artikel. 
                Wir schließen keine Kaufverträge zwischen Nutzern ab und übernehmen keine Verantwortung 
                für die Erfüllung solcher Verträge.
              </p>
              <p>
                <strong>2.2 Keine Gewährleistung</strong><br />
                Wir übernehmen keine Gewährleistung für die Richtigkeit, Vollständigkeit oder Aktualität 
                der von Nutzern eingestellten Informationen, insbesondere nicht für:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Die Beschreibung der angebotenen Artikel</li>
                <li>Die Qualität oder den Zustand der Artikel</li>
                <li>Die Verfügbarkeit der Artikel</li>
                <li>Die Identität oder Zuverlässigkeit der Nutzer</li>
              </ul>
              <p>
                <strong>2.3 Keine Haftung</strong><br />
                PetriMarkt haftet nicht für Schäden, die im Zusammenhang mit der Nutzung der Plattform 
                oder dem Abschluss von Geschäften zwischen Nutzern entstehen, es sei denn, 
                es liegt Vorsatz oder grobe Fahrlässigkeit vor.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">3. Pflichten der Nutzer</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                <strong>3.1 Registrierung und Altersbeschränkung</strong><br />
                Für die Nutzung bestimmter Funktionen der Plattform ist eine Registrierung erforderlich. 
                Die Nutzung der Plattform ist grundsätzlich für Personen ab 18 Jahren vorgesehen. 
                Sie verpflichten sich, bei der Registrierung wahrheitsgemäße und vollständige Angaben zu machen 
                und diese bei Änderungen aktuell zu halten.
              </p>
              <p>
                <strong>3.2 Inserate</strong><br />
                Bei der Erstellung von Inseraten verpflichten Sie sich:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Nur Artikel anzubieten, die Sie tatsächlich besitzen und verkaufen möchten</li>
                <li>Wahrheitsgemäße und vollständige Angaben zu machen</li>
                <li>Artikel korrekt zu kategorisieren</li>
                <li>Preise in Schweizer Franken (CHF) anzugeben</li>
                <li>Mindestens ein aussagekräftiges Bild des Artikels hochzuladen</li>
                <li>Keine rechtswidrigen, anstößigen oder irreführenden Inhalte zu veröffentlichen</li>
              </ul>
              <p>
                <strong>3.3 Kommunikation</strong><br />
                Sie verpflichten sich, in der Kommunikation mit anderen Nutzern höflich und respektvoll zu sein 
                und keine beleidigenden, diskriminierenden oder rechtswidrigen Inhalte zu übermitteln.
              </p>
              <p>
                <strong>3.4 Verbotene Inhalte</strong><br />
                Es ist untersagt, folgende Inhalte auf der Plattform zu veröffentlichen:
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Illegale Waren oder Dienstleistungen</li>
                <li>Gefälschte oder nachgemachte Produkte</li>
                <li>Inhalte, die Rechte Dritter verletzen (z.B. Urheberrechte)</li>
                <li>Spam oder betrügerische Angebote</li>
                <li>Inhalte, die gegen die guten Sitten verstoßen</li>
                <li>Geschützte Arten im Sinne des Artenschutzes sowie illegales Fischereigerät, 
                    das gegen geltende Fischereigesetze oder Artenschutzbestimmungen verstößt</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">4. Kosten und Gebühren</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Das Inserieren von Artikeln auf der Plattform ist für Privatnutzer aktuell kostenlos. 
                Wir behalten uns vor, in Zukunft Gebühren für bestimmte Funktionen oder Premium-Features einzuführen. 
                Über Änderungen der Gebührenstruktur werden Nutzer rechtzeitig informiert.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">5. Verträge zwischen Nutzern</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Verträge über die auf der Plattform angebotenen Artikel kommen ausschließlich zwischen 
                dem Verkäufer und dem Käufer zustande. PetriMarkt ist nicht Vertragspartei.
              </p>
              <p>
                Verkäufer und Käufer sind selbst für die Abwicklung des Geschäfts verantwortlich, 
                einschließlich Zahlung, Versand und Gewährleistung.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">6. Kündigung und Sperrung</h2>
            <div className="space-y-4 text-muted-foreground">
              <p>
                Wir behalten uns vor, Nutzerkonten ohne Vorankündigung zu sperren oder zu löschen, 
                wenn gegen diese AGB verstoßen wird oder rechtswidriges Verhalten vorliegt.
              </p>
              <p>
                Sie können Ihr Nutzerkonto jederzeit löschen, indem Sie uns kontaktieren.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">7. Änderungen der AGB</h2>
            <p className="text-muted-foreground">
              Wir behalten uns vor, diese AGB jederzeit zu ändern. 
              Änderungen werden auf der Plattform veröffentlicht. 
              Bei fortgesetzter Nutzung der Plattform nach Veröffentlichung der Änderungen 
              gelten diese als akzeptiert.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">8. Anwendbares Recht und Gerichtsstand</h2>
            <p className="text-muted-foreground">
              Auf diese AGB und die Nutzung der Plattform findet schweizerisches Recht Anwendung. 
              Gerichtsstand ist Basel, Schweiz, sofern nicht zwingende gesetzliche Bestimmungen etwas anderes vorschreiben.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-primary mb-4">9. Kontakt</h2>
            <p className="text-muted-foreground">
              Bei Fragen zu diesen AGB können Sie uns über die im Impressum angegebenen Kontaktdaten erreichen.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}

