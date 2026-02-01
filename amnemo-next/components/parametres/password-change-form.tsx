'use client';

import { useState, useTransition } from 'react';
import { changePassword } from '@/lib/actions/users';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useError } from '@/components/error-provider';
import { toast } from 'sonner';

export function PasswordChangeForm() {
  const [isPending, startTransition] = useTransition();
  const { showError } = useError();
  const [formKey, setFormKey] = useState(0);

  const handleSubmit = (formData: FormData) => {
    startTransition(async () => {
      try {
        await changePassword(formData);
        toast.success('Mot de passe modifié avec succès');
        setFormKey((prev) => prev + 1); // Reset form
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Une erreur est survenue';
        showError(message);
      }
    });
  };

  return (
    <form key={formKey} action={handleSubmit} className="space-y-4 max-w-md">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">
          Mot de passe actuel <span className="text-destructive">*</span>
        </Label>
        <Input
          id="currentPassword"
          name="currentPassword"
          type="password"
          required
          autoComplete="current-password"
          disabled={isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="newPassword">
          Nouveau mot de passe <span className="text-destructive">*</span>
        </Label>
        <Input
          id="newPassword"
          name="newPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={isPending}
        />
        <p className="text-xs text-muted-foreground">Minimum 8 caractères</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">
          Confirmer le nouveau mot de passe <span className="text-destructive">*</span>
        </Label>
        <Input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          required
          minLength={8}
          autoComplete="new-password"
          disabled={isPending}
        />
      </div>

      <Button type="submit" disabled={isPending}>
        {isPending ? 'Modification...' : 'Modifier le mot de passe'}
      </Button>
    </form>
  );
}
