'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { CANTONS, CANTON_NAMES, Canton } from '@/lib/constants';

interface AuthDialogProps {
  onClose: () => void;
}

export default function AuthDialog({ onClose }: AuthDialogProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [canton, setCanton] = useState<Canton>('ZH');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        await signUp(email, password, canton);
      } else {
        await signIn(email, password);
      }
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ein Fehler ist aufgetreten');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isSignUp ? 'Registrieren' : 'Anmelden'}</DialogTitle>
          <DialogDescription>
            {isSignUp
              ? 'Erstellen Sie ein neues Konto'
              : 'Melden Sie sich mit Ihrem Konto an'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="ihre@email.ch"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="Mindestens 6 Zeichen"
            />
          </div>

          {isSignUp && (
            <div className="space-y-2">
              <Label htmlFor="canton">Standard-Kanton</Label>
              <Select value={canton} onValueChange={(value) => setCanton(value as Canton)}>
                <SelectTrigger>
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
            </div>
          )}

          {error && (
            <div className="text-sm text-destructive">{error}</div>
          )}

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={loading} className="w-full">
              {loading ? 'Bitte warten...' : isSignUp ? 'Registrieren' : 'Anmelden'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setIsSignUp(!isSignUp);
                setError('');
              }}
              className="w-full"
            >
              {isSignUp ? 'Bereits ein Konto? Anmelden' : 'Kein Konto? Registrieren'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
