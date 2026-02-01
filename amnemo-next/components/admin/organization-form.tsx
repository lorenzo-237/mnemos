'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'En cours...' : isEdit ? 'Mettre à jour' : 'Créer'}
    </Button>
  );
}

interface OrganizationFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    name: string;
  };
  isEdit?: boolean;
}

export function OrganizationForm({ action, defaultValues, isEdit }: OrganizationFormProps) {
  return (
    <form action={action} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="name">Nom de l'organisation</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          defaultValue={defaultValues?.name}
          placeholder="Mon Organisation"
        />
      </div>

      <div className="flex gap-2">
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
