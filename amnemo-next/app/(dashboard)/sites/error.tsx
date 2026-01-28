'use client';

import { useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon } from '@hugeicons/core-free-icons';

export default function SitesError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Sites error:', error);
  }, [error]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md">
        <CardHeader>
          <div className="flex items-center gap-2 text-destructive">
            <HugeiconsIcon icon={AlertCircleIcon} strokeWidth={2} className="size-6" />
            <CardTitle>Une erreur est survenue</CardTitle>
          </div>
          <CardDescription>
            Impossible de charger les sites. Veuillez réessayer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {error.message && (
              <div className="p-3 bg-destructive/10 text-destructive text-sm rounded">
                {error.message}
              </div>
            )}
            <Button onClick={reset} className="w-full">
              Réessayer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
