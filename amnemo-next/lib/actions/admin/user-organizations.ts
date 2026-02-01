'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { z } from 'zod';

// Vérifie que l'utilisateur est ADMIN
async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== 'ADMIN') {
    throw new Error('Accès réservé aux administrateurs');
  }
  return session;
}

const userOrgSchema = z.object({
  userId: z.coerce.number(),
  organizationId: z.coerce.number(),
  role: z.enum(['UTILISATEUR', 'GESTIONNAIRE', 'ADMIN']),
});

export async function addUserToOrganization(formData: FormData) {
  await requireAdmin();

  const rawData = {
    userId: formData.get('userId'),
    organizationId: formData.get('organizationId'),
    role: formData.get('role') as string,
  };

  const validated = userOrgSchema.parse(rawData);

  await prisma.userOrganization.create({
    data: validated
  });

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${validated.userId}`);
  revalidatePath('/admin/organizations');
  revalidatePath(`/admin/organizations/${validated.organizationId}`);
}

export async function updateUserOrganizationRole(
  userId: number,
  organizationId: number,
  formData: FormData
) {
  await requireAdmin();

  const role = formData.get('role') as 'UTILISATEUR' | 'GESTIONNAIRE' | 'ADMIN';

  if (!['UTILISATEUR', 'GESTIONNAIRE', 'ADMIN'].includes(role)) {
    throw new Error('Rôle invalide');
  }

  await prisma.userOrganization.update({
    where: {
      userId_organizationId: {
        userId,
        organizationId
      }
    },
    data: { role }
  });

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin/organizations');
  revalidatePath(`/admin/organizations/${organizationId}`);
}

export async function removeUserFromOrganization(
  userId: number,
  organizationId: number
) {
  const session = await requireAdmin();

  // Empêcher de se retirer de sa propre organisation courante
  if (session.userId === userId && session.organizationId === organizationId) {
    throw new Error('Vous ne pouvez pas vous retirer de votre organisation courante');
  }

  // Vérifier que l'utilisateur a au moins une autre organisation
  const userOrgs = await prisma.userOrganization.findMany({
    where: { userId }
  });

  if (userOrgs.length <= 1) {
    throw new Error('Un utilisateur doit appartenir à au moins une organisation');
  }

  await prisma.userOrganization.delete({
    where: {
      userId_organizationId: {
        userId,
        organizationId
      }
    }
  });

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${userId}`);
  revalidatePath('/admin/organizations');
  revalidatePath(`/admin/organizations/${organizationId}`);
}
