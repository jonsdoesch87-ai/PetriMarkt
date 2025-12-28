'use client';

import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Fish, PlusCircle, MessageSquare, LogOut, User, Heart, BookOpen, Settings } from 'lucide-react';
import AuthDialog from './AuthDialog';
import { useState } from 'react';
import { useUnreadChatsCount } from '@/lib/hooks';

const MAX_NOTIFICATION_DISPLAY = 9;

export default function Header() {
  const { user, userProfile, signOut } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const unreadCount = useUnreadChatsCount(user?.uid);

  return (
    <header className="border-b bg-primary sticky top-0 z-40 shadow-sm">
      <div className="container mx-auto px-3 md:px-4 py-3 md:py-4">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 text-2xl font-bold text-primary-foreground">
            <Fish className="h-8 w-8" />
            <span>PetriMarkt</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/blog" className="hidden md:block">
              <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 gap-2">
                <BookOpen className="h-4 w-4" />
                <span>Blog</span>
              </Button>
            </Link>
            {user ? (
              <>
                {userProfile?.role === 'admin' && (
                  <Link href="/admin/blog" className="hidden md:block">
                    <Button variant="ghost" className="text-primary-foreground hover:bg-primary-foreground/10 gap-2">
                      <Settings className="h-4 w-4" />
                      <span>Admin</span>
                    </Button>
                  </Link>
                )}
                <Link href="/listings/create">
                  <Button variant="secondary" className="gap-2">
                    <PlusCircle className="h-4 w-4" />
                    <span className="hidden sm:inline">Inserat erstellen</span>
                  </Button>
                </Link>
                <Link href="/chat" className="relative">
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <MessageSquare className="h-5 w-5" />
                  </Button>
                  {unreadCount > 0 && (
                    <Badge variant="notification" className="absolute -top-1 -right-1 px-1.5 min-w-[1.25rem] h-5">
                      {unreadCount > MAX_NOTIFICATION_DISPLAY ? `${MAX_NOTIFICATION_DISPLAY}+` : unreadCount}
                    </Badge>
                  )}
                </Link>
                <Link href="/favorites">
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <Heart className="h-5 w-5" />
                  </Button>
                </Link>
                <Link href="/profile">
                  <Button variant="ghost" size="icon" className="text-primary-foreground hover:bg-primary-foreground/10">
                    <User className="h-5 w-5" />
                  </Button>
                </Link>
                <Button variant="ghost" size="icon" onClick={signOut} className="text-primary-foreground hover:bg-primary-foreground/10">
                  <LogOut className="h-5 w-5" />
                </Button>
              </>
            ) : (
              <Button onClick={() => setShowAuthDialog(true)} variant="secondary">
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
