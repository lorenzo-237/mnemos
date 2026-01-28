'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const folderSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100, 'Le nom est trop long'),
});

export async function getFolders() {
  return await prisma.folder.findMany({
    include: {
      _count: {
        select: { sites: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

export async function getFolderById(id: number) {
  return await prisma.folder.findUnique({
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
}

export async function createFolder(formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
  };

  const validated = folderSchema.parse(rawData);

  await prisma.folder.create({
    data: validated
  });

  revalidatePath('/sites');
  redirect('/sites');
}

export async function updateFolder(id: number, formData: FormData) {
  const rawData = {
    name: formData.get('name') as string,
  };

  const validated = folderSchema.parse(rawData);

  await prisma.folder.update({
    where: { id },
    data: validated
  });

  revalidatePath('/sites');
}

export async function deleteFolder(id: number) {
  await prisma.folder.delete({
    where: { id }
  });

  revalidatePath('/sites');
  redirect('/sites');
}
