'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CANTONS, CANTON_NAMES, Canton } from '@/lib/constants';

export default function ProfilePage() {
  const router = useRouter();
  const { user, userProfile, loading: authLoading } = useAuth();
  const [canton, setCanton] = useState<Canton>('ZH');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (userProfile?.defaultCanton) {
      setCanton(userProfile.defaultCanton);
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;

    setLoading(true);
    setSuccess(false);

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        defaultCanton: canton,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Fehler beim Speichern des Profils');
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>Lade...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">Mein Profil</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>E-Mail</Label>
            <div className="text-sm text-muted-foreground">{user.email}</div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="canton">Standard-Kanton</Label>
            <Select value={canton} onValueChange={(value) => setCanton(value as Canton)}>
              <SelectTrigger id="canton">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CANTONS.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c} - {CANTON_NAMES[c]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Dieser Kanton wird beim Erstellen neuer Inserate vorausgewählt
            </p>
          </div>

          {success && (
            <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">
              Profil erfolgreich aktualisiert!
            </div>
          )}

          <Button onClick={handleSave} disabled={loading} className="w-full">
            {loading ? 'Wird gespeichert...' : 'Änderungen speichern'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
