import Link from 'next/link';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { SearchIcon, ArrowLeft01Icon } from '@hugeicons/core-free-icons';

export default function MachineNotFound() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-muted rounded-full">
              <HugeiconsIcon icon={SearchIcon} strokeWidth={2} className="size-12 text-muted-foreground" />
            </div>
          </div>
          <CardTitle>Machine introuvable</CardTitle>
          <CardDescription>
            La machine que vous recherchez n'existe pas ou a été supprimée.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/sites">
            <Button className="w-full">
              <HugeiconsIcon icon={ArrowLeft01Icon} strokeWidth={2} data-icon="inline-start" />
              Retour aux sites
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
