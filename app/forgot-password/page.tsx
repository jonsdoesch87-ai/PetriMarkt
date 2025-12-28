'use client';

import { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Mail } from 'lucide-react';
import Link from 'next/link';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!auth) {
        throw new Error('Firebase Auth ist nicht initialisiert');
      }
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-md">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-2">
            <Mail className="h-6 w-6 text-primary" />
            Passwort zurücksetzen
          </CardTitle>
          <CardDescription>
            Geben Sie Ihre E-Mail-Adresse ein, um einen Link zum Zurücksetzen des Passworts zu erhalten.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="space-y-4">
              <div className="bg-primary/10 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-foreground">
                  Falls ein Account existiert, wurde ein Link zum Zurücksetzen des Passworts an Ihre E-Mail-Adresse gesendet.
                </p>
              </div>
              <Link href="/">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Zurück zur Startseite
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail-Adresse</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="ihre@email.ch"
                />
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <Button type="submit" disabled={loading} className="w-full">
                  {loading ? 'Wird gesendet...' : 'Link senden'}
                </Button>
                <Link href="/">
                  <Button type="button" variant="ghost" className="w-full">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Zurück
                  </Button>
                </Link>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

