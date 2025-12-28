import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-background min-h-screen py-12 px-4">
      <div className="container mx-auto max-w-2xl">
        <Card className="border-0 shadow-md">
          <CardContent className="p-12 text-center">
            <BookOpen className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h1 className="text-3xl font-bold text-primary mb-4">
              Artikel nicht gefunden
            </h1>
            <p className="text-muted-foreground mb-6">
              Der angeforderte Blog-Artikel konnte nicht gefunden werden.
            </p>
            <Link href="/blog">
              <Button variant="outline" className="gap-2">
                <ArrowLeft className="h-4 w-4" />
                Zur Blog-Übersicht
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

