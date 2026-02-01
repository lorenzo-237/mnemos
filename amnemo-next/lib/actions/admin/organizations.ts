'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { organizationSchema } from '@/lib/validators';

// Vérifie que l'utilisateur est ADMIN
async function requireAdmin() {
  const session = await requireSession();
  if (session.role !== 'ADMIN') {
    throw new Error('Accès réservé aux administrateurs');
  }
  return session;
}

export async function getAllOrganizations() {
  await requireAdmin();

  return prisma.organization.findMany({
    include: {
      _count: {
        select: {
          users: true,
          sites: true,
          softwares: true,
          tasks: true,
        }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export async function getOrganizationById(id: number) {
  await requireAdmin();

  return prisma.organization.findUnique({
    where: { id },
    include: {
      users: {
        include: {
          user: true
        }
      },
      _count: {
        select: {
          sites: true,
          softwares: true,
          tasks: true,
          folders: true,
          tags: true,
        }
      }
    }
  });
}

export async function createOrganization(formData: FormData) {
  await requireAdmin();

  const rawData = {
    name: formData.get('name') as string,
  };

  const validated = organizationSchema.parse(rawData);

  const org = await prisma.organization.create({
    data: validated
  });

  revalidatePath('/admin/organizations');
  redirect(`/admin/organizations/${org.id}`);
}

export async function updateOrganization(id: number, formData: FormData) {
  await requireAdmin();

  const rawData = {
    name: formData.get('name') as string,
  };

  const validated = organizationSchema.parse(rawData);

  await prisma.organization.update({
    where: { id },
    data: validated
  });

  revalidatePath('/admin/organizations');
  revalidatePath(`/admin/organizations/${id}`);
}

export async function deleteOrganization(id: number) {
  await requireAdmin();

  // Vérifier qu'il reste au moins une organisation
  const count = await prisma.organization.count();
  if (count <= 1) {
    throw new Error('Impossible de supprimer la dernière organisation');
  }

  await prisma.organization.delete({ where: { id } });

  revalidatePath('/admin/organizations');
  redirect('/admin/organizations');
}
