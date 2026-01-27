import { getSoftwares } from '@/lib/actions/softwares';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/shared/empty-state';
import { HugeiconsIcon } from '@hugeicons/react';
import { ComputerIcon } from '@hugeicons/core-free-icons';

export default async function LogicielsPage() {
  const softwares = await getSoftwares();


  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Logiciels</h1>
          <p className="text-muted-foreground mt-1">
            Liste de tous les logiciels référencés dans le parc
          </p>
        </div>
      </div>

      {softwares.length === 0 ? (
        <EmptyState
          title="Aucun logiciel"
          description="Les logiciels seront ajoutés automatiquement lors de l'installation sur une machine."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {softwares.map((software) => (
            <Card key={software.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <HugeiconsIcon icon={ComputerIcon} strokeWidth={2} className="size-5 text-primary" />
                      {software.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      Créé le {new Date(software.createdAt).toLocaleDateString('fr-FR')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 bg-muted/50 rounded-lg border border-dashed">
        <p className="text-sm text-muted-foreground">
          <strong>Note :</strong> Les logiciels sont créés automatiquement lorsque vous les ajoutez à une machine.
          Cette page permet de consulter tous les logiciels référencés dans votre parc informatique.
        </p>
      </div>
    </div>
  );
}
