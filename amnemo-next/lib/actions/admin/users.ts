'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { hashPassword } from '@/lib/auth/password';
import { z } from 'zod';

// Vérifie que l'utilisateur est ADMIN
async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== 'ADMIN') {
    throw new Error('Accès réservé aux administrateurs');
  }
  return session;
}

const createUserSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit avoir au moins 3 caractères").max(50),
  password: z.string().min(8, "Le mot de passe doit avoir au moins 8 caractères"),
});

const updatePasswordSchema = z.object({
  password: z.string().min(8, "Le mot de passe doit avoir au moins 8 caractères"),
});

export async function getAllUsers() {
  await requireAdmin();

  return prisma.user.findMany({
    include: {
      organizations: {
        include: {
          organization: true
        }
      }
    },
    orderBy: { username: 'asc' }
  });
}

export async function getUserById(id: number) {
  await requireAdmin();

  return prisma.user.findUnique({
    where: { id },
    include: {
      organizations: {
        include: {
          organization: true
        }
      }
    }
  });
}

export async function createUser(formData: FormData) {
  await requireAdmin();

  const rawData = {
    username: formData.get('username') as string,
    password: formData.get('password') as string,
  };

  const validated = createUserSchema.parse(rawData);

  const passwordHash = await hashPassword(validated.password);

  const user = await prisma.user.create({
    data: {
      username: validated.username,
      passwordHash,
    }
  });

  revalidatePath('/admin/users');
  redirect(`/admin/users/${user.id}`);
}

export async function updateUserPassword(id: number, formData: FormData) {
  await requireAdmin();

  const rawData = {
    password: formData.get('password') as string,
  };

  const validated = updatePasswordSchema.parse(rawData);

  const passwordHash = await hashPassword(validated.password);

  await prisma.user.update({
    where: { id },
    data: { passwordHash }
  });

  revalidatePath('/admin/users');
  revalidatePath(`/admin/users/${id}`);
}

export async function deleteUser(id: number) {
  const session = await requireAdmin();

  // Empêcher la suppression de son propre compte
  if (session.userId === id) {
    throw new Error('Vous ne pouvez pas supprimer votre propre compte');
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath('/admin/users');
  redirect('/admin/users');
}
