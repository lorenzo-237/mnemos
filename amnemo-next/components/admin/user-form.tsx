'use client';

import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

function SubmitButton({ isEdit }: { isEdit?: boolean }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? 'En cours...' : isEdit ? 'Modifier le mot de passe' : 'Créer l\'utilisateur'}
    </Button>
  );
}

interface UserFormProps {
  action: (formData: FormData) => Promise<void>;
  defaultValues?: {
    username?: string;
  };
  isEdit?: boolean;
}

export function UserForm({ action, defaultValues, isEdit }: UserFormProps) {
  return (
    <form action={action} className="space-y-6">
      {!isEdit && (
        <div className="space-y-2">
          <Label htmlFor="username">Nom d'utilisateur</Label>
          <Input
            id="username"
            name="username"
            type="text"
            required
            defaultValue={defaultValues?.username}
            placeholder="utilisateur"
            minLength={3}
            maxLength={50}
          />
          <p className="text-xs text-muted-foreground">
            Minimum 3 caractères
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">{isEdit ? 'Nouveau mot de passe' : 'Mot de passe'}</Label>
        <Input
          id="password"
          name="password"
          type="password"
          required
          placeholder="••••••••"
          minLength={8}
        />
        <p className="text-xs text-muted-foreground">
          Minimum 8 caractères
        </p>
      </div>

      <div className="flex gap-2">
        <SubmitButton isEdit={isEdit} />
      </div>
    </form>
  );
}
