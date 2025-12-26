'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Fish, PlusCircle, MessageSquare, LogOut, User } from 'lucide-react';
import AuthDialog from './AuthDialog';
import { useState } from 'react';

export default function Header() {
  const { user, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);

  return (
    <header className="border-b bg-white sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary">
            <Fish className="h-8 w-8" />
            <span>PetriMarkt</span>
          </Link>

          <nav className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/listings/create">
                  <Button variant="default" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Inserat erstellen</span>
                  </Button>
                </Link>
                <Link href="/chat">
                  <Button variant="ghost" size="icon">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="icon">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={signOut}>
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowAuthDialog(true)}>
                Anmelden / Registrieren
              </Button>
            )}
          </nav>
        </div>
      </div>
      
      {showAuthDialog && (
        <AuthDialog onClose={() => setShowAuthDialog(false)} />
      )}
    </header>
  );
}
