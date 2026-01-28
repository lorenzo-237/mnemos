'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { softwareSchema } from '@/lib/validators';

export async function getSoftwares() {
  return prisma.software.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getSoftwareById(id: number) {
  return prisma.software.findUnique({
    where: { id }
  });
}

export async function getSoftwareCaseInsensitive(name: string) {
  return prisma.software.findFirst({
    where: {
      name: {
        contains: name,
        mode: 'insensitive'
      }
    }
  });
}

export async function getSoftwareByName(name: string) {
  return prisma.software.findUnique({
    where: { name }
  });
}

export async function createSoftware(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const validated = softwareSchema.parse(rawData);

  // Vérifier si un logiciel avec le même nom existe déjà (case-insensitive)
  const existing = await getSoftwareCaseInsensitive(validated.name);
  if (existing) {
    return existing;
  }

  const software = await prisma.software.create({
    data: {
      name: validated.name,
      description: validated.description || null,
      iconName: validated.iconName || null,
      metadata: (validated.metadata as any) ?? null,
    }
  });

  revalidatePath('/logiciels');
  return software;
}

export async function updateSoftware(id: number, formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const validated = softwareSchema.parse(rawData);

  await prisma.software.update({
    where: { id },
    data: {
      description: validated.description || null,
      iconName: validated.iconName || null,
      metadata: (validated.metadata as any) ?? null,
    }
  });

  revalidatePath('/logiciels');
}

export async function getSoftwareUsage(softwareId: number) {
  const installations = await prisma.installation.findMany({
    where: {
      softwareId,
      removedAt: null
    },
    include: {
      machine: {
        include: {
          site: true
        }
      }
    },
    orderBy: [
      { machine: { site: { name: 'asc' } } },
      { machine: { name: 'asc' } }
    ]
  });

  return installations;
}
