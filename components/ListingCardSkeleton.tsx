import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function ListingCardSkeleton() {
  return (
    <Card className="h-full border border-gray-200 shadow-md rounded-2xl">
      <div className="relative h-48 w-full overflow-hidden rounded-t-2xl bg-muted">
        <Skeleton className="h-full w-full" />
      </div>
      <CardContent className="pt-4">
        <Skeleton className="h-6 w-3/4 mb-2" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-2/3 mb-3" />
        <div className="flex items-center gap-2 mb-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-5 w-24" />
      </CardContent>
      <CardFooter>
        <Skeleton className="h-8 w-32" />
      </CardFooter>
    </Card>
  );
}


