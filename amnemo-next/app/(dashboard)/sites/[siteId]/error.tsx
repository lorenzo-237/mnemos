'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';

export default function SiteDetailError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error('Site detail error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-6" />
            <CardTitle>Site introuvable</CardTitle>
          </div>
          <CardDescription>
            Le site demandé n'existe pas ou a été supprimé.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error.message && (
            <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
              {error.message}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/sites')} className="flex-1">
            <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} data-icon="inline-start" />
            Retour aux sites
          </Button>
          <Button onClick={reset} className="flex-1">
            Réessayer
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
