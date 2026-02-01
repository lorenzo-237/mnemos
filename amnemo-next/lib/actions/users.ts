'use server';

import { z } from 'zod';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { comparePassword, hashPassword } from '@/lib/auth/password';

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères'),
  confirmPassword: z.string().min(1, 'La confirmation est requise'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
});

export async function changePassword(formData: FormData) {
  const session = await requireSession();

  const rawData = Object.fromEntries(formData);
  const validated = changePasswordSchema.parse(rawData);

  // Fetch current user
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: { passwordHash: true },
  });

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  // Verify current password
  const isValidPassword = await comparePassword(validated.currentPassword, user.passwordHash);
  if (!isValidPassword) {
    throw new Error('Le mot de passe actuel est incorrect');
  }

  // Hash and update new password
  const newPasswordHash = await hashPassword(validated.newPassword);
  await prisma.user.update({
    where: { id: session.userId },
    data: { passwordHash: newPasswordHash },
  });
}
