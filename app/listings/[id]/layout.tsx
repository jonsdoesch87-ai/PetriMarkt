import { Metadata } from 'next';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  
  if (!db) {
    return {
      title: 'Inserat | PetriMarkt',
      description: 'Fischereiartikel auf PetriMarkt',
    };
  }
  
  try {
    const listingDoc = await getDoc(doc(db, 'listings', id));
    
    if (listingDoc.exists()) {
      const listing = listingDoc.data();
      const title = `${listing.title} | PetriMarkt`;
      const description = listing.description 
        ? `${listing.description.substring(0, 160)}...`
        : `Fischereiartikel auf PetriMarkt - ${listing.category} in ${listing.canton}`;
      
      return {
        title,
        description,
        openGraph: {
          title,
          description,
          images: listing.imageUrls?.[0] ? [listing.imageUrls[0]] : [],
        },
      };
    }
  } catch (error) {
    console.error('Error generating metadata:', error);
  }
  
  return {
    title: 'Inserat | PetriMarkt',
    description: 'Fischereiartikel auf PetriMarkt',
  };
}

export default function ListingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}


