'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { folderSchema } from '@/lib/validators';

export async function getFolders() {
  const session = await requireSession();

  return await prisma.folder.findMany({
    where: { organizationId: session.organizationId },
    include: {
      _count: {
        select: { sites: true, updateSessions: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export async function getFolderById(id: number) {
  const session = await requireSession();

  const folder = await prisma.folder.findUnique({
    where: { id },
    include: {
      sites: {
        include: {
          _count: {
            select: { machines: true }
          }
        }
      }
    }
  });

  if (!folder || folder.organizationId !== session.organizationId) {
    return null;
  }

  return folder;
}

export async function createFolder(formData: FormData) {
  const session = await requireSession();

  const rawData = {
    name: formData.get('name') as string,
  };

  const validated = folderSchema.parse(rawData);

  await prisma.folder.create({
    data: {
      ...validated,
      organizationId: session.organizationId,
      createdById: session.userId,
    }
  });

  revalidatePath('/sites');
  redirect('/sites');
}

export async function updateFolder(id: number, formData: FormData) {
  const session = await requireSession();

  const rawData = {
    name: formData.get('name') as string,
  };

  const validated = folderSchema.parse(rawData);

  await prisma.folder.update({
    where: {
      id,
      organizationId: session.organizationId
    },
    data: {
      ...validated,
      updatedById: session.userId
    }
  });

  revalidatePath('/sites');
}

export async function deleteFolder(id: number, skipRedirect = false) {
  const session = await requireSession();

  if (session.role === "UTILISATEUR") {
    throw new Error("Permission insuffisante");
  }

  const folder = await prisma.folder.findUnique({
    where: { id, organizationId: session.organizationId },
  });

  if (!folder) throw new Error("Dossier non trouvé");

  await prisma.folder.delete({ where: { id } });

  revalidatePath('/sites');
  revalidatePath('/parametres');

  if (!skipRedirect) {
    redirect('/sites');
  }
}
