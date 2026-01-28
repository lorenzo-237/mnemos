'use client';

import { useState, useTransition, ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
  AlertDialogFooter,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import { Field, FieldLabel, FieldGroup } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { addInstallation } from '@/lib/actions/installations';
import { getSoftwares } from '@/lib/actions/softwares';

interface AddInstallationDialogProps {
  machineId: number;
  trigger: ReactNode;
}

interface SoftwareOption {
  id: number;
  name: string;
}

export function AddInstallationDialog({ machineId, trigger }: AddInstallationDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [softwares, setSoftwares] = useState<SoftwareOption[]>([]);
  const router = useRouter();

  // Onglet actif : 'create' ou 'existing'
  const [activeTab, setActiveTab] = useState<'create' | 'existing'>('create');
  const [selectedSoftwareId, setSelectedSoftwareId] = useState<string>('');

  useEffect(() => {
    if (open) {
      getSoftwares().then((data) => {
        setSoftwares(data.map(s => ({ id: s.id, name: s.name })));
      });
    }
  }, [open]);

  const handleSubmit = async (formData: FormData) => {
    // Si onglet "existant", on remplace softwareName par le nom du logiciel sélectionné
    if (activeTab === 'existing' && selectedSoftwareId) {
      const selected = softwares.find(s => s.id === parseInt(selectedSoftwareId));
      if (selected) {
        formData.set('softwareName', selected.name);
      }
    }

    startTransition(async () => {
      try {
        await addInstallation(machineId, formData);
        toast.success('Logiciel ajouté avec succès');
        setOpen(false);
        setActiveTab('create');
        setSelectedSoftwareId('');
        router.refresh();
      } catch (error) {
        console.error('Form error:', error);
        toast.error('Erreur lors de l\'ajout du logiciel');
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        {trigger}
      </AlertDialogTrigger>

      <AlertDialogContent className="max-w-3xl">
        <form action={handleSubmit}>
          <AlertDialogHeader>
            <AlertDialogTitle>Ajouter un logiciel</AlertDialogTitle>
          </AlertDialogHeader>

          {/* Onglets */}
          <div className="flex gap-1 mt-4 mb-2 bg-muted p-1 rounded-lg">
            <button
              type="button"
              onClick={() => setActiveTab('create')}
              className={`flex-1 text-sm px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'create' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Créer un logiciel
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('existing')}
              className={`flex-1 text-sm px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'existing' ? 'bg-background shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              Logiciel existant
            </button>
          </div>

          <FieldGroup className="mt-4">
            {activeTab === 'create' ? (
              <Field>
                <FieldLabel htmlFor="softwareName">Nom du logiciel</FieldLabel>
                <Input
                  id="softwareName"
                  name="softwareName"
                  placeholder="Saisir le nom du nouveau logiciel"
                  autoComplete="off"
                  required
                />
              </Field>
            ) : (
              <Field>
                <FieldLabel htmlFor="softwareName">Sélectionner un logiciel</FieldLabel>
                <Select value={selectedSoftwareId} onValueChange={setSelectedSoftwareId} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Choisir un logiciel existant" />
                  </SelectTrigger>
                  <SelectContent>
                    {softwares.map((software) => (
                      <SelectItem key={software.id} value={software.id.toString()}>
                        {software.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {/* Campo cachado pour FormData */}
                <input type="hidden" name="softwareName" value={softwares.find(s => s.id === parseInt(selectedSoftwareId))?.name || ''} />
              </Field>
            )}

            <Field>
              <FieldLabel htmlFor="version">Version</FieldLabel>
              <Input
                id="version"
                name="version"
                placeholder="1.0.0"
                autoComplete="off"
                required
              />
            </Field>
          </FieldGroup>

          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <Button
              type="submit"
              disabled={isPending || (activeTab === 'existing' && !selectedSoftwareId)}
            >
              {isPending ? 'Ajout...' : 'Ajouter'}
            </Button>
          </AlertDialogFooter>
        </form>
      </AlertDialogContent>
    </AlertDialog>
  );
}
