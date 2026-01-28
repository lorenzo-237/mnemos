import { getSoftwares } from '@/lib/actions/softwares';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { EmptyState } from '@/components/shared/empty-state';
import { DynamicIcon, DEFAULT_ICON_NAME } from '@/components/shared/dynamic-icon';
import { SoftwareFormDialog } from '@/components/softwares/software-form-dialog';
import { Button } from '@/components/ui/button';
import { HugeiconsIcon } from '@hugeicons/react';
import { Edit01Icon, EyeIcon } from '@hugeicons/core-free-icons';
import Link from 'next/link';

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
        <SoftwareFormDialog
          trigger={
            <Button>
              <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} data-icon="inline-start" />
              Nouveau logiciel
            </Button>
          }
        />
      </div>

      {softwares.length === 0 ? (
        <EmptyState
          title="Aucun logiciel"
          description="Créez un logiciel ou il sera ajouté automatiquement lors de l'installation sur une machine."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {softwares.map((software) => (
            <Card key={software.id}>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="flex items-center gap-2">
                      <DynamicIcon iconName={software.iconName || DEFAULT_ICON_NAME} className="size-5 text-primary" />
                      {software.name}
                    </CardTitle>
                    {software.description && (
                      <p className="text-sm text-muted-foreground mt-1">{software.description}</p>
                    )}
                    <CardDescription className="mt-2">
                      Créé le {new Date(software.createdAt).toLocaleDateString('fr-FR')}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2">
                  <SoftwareFormDialog
                    software={{
                      id: software.id,
                      name: software.name,
                      description: software.description,
                      iconName: software.iconName,
                      metadata: software.metadata as any,
                      createdAt: software.createdAt,
                    }}
                    trigger={
                      <Button variant="outline" size="sm">
                        <HugeiconsIcon icon={Edit01Icon} strokeWidth={2} data-icon="inline-start" />
                        Modifier
                      </Button>
                    }
                  />
                  <Link href={`/logiciels/${software.id}`}>
                    <Button variant="outline" size="sm">
                      <HugeiconsIcon icon={EyeIcon} strokeWidth={2} data-icon="inline-start" />
                      Utilisation
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
