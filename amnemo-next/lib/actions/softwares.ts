'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { softwareSchema } from '@/lib/validators';

export async function getSoftwares() {
  const session = await requireSession();

  return prisma.software.findMany({
    where: { organizationId: session.organizationId },
    orderBy: { name: 'asc' }
  });
}

export async function getSoftwareById(id: number) {
  const session = await requireSession();

  const software = await prisma.software.findUnique({
    where: { id }
  });

  if (!software || software.organizationId !== session.organizationId) {
    return null;
  }

  return software;
}

export async function getSoftwareCaseInsensitive(name: string) {
  const session = await requireSession();

  return prisma.software.findFirst({
    where: {
      organizationId: session.organizationId,
      name: {
        contains: name,
        mode: 'insensitive'
      }
    }
  });
}

export async function getSoftwareByName(name: string) {
  const session = await requireSession();

  return prisma.software.findFirst({
    where: {
      organizationId: session.organizationId,
      name: name
    }
  });
}

export async function createSoftware(formData: FormData) {
  const session = await requireSession();
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
      organizationId: session.organizationId,
      createdById: session.userId,
    }
  });

  revalidatePath('/logiciels');
  return software;
}

export async function updateSoftware(id: number, formData: FormData) {
  const session = await requireSession();
  const rawData = Object.fromEntries(formData);
  const validated = softwareSchema.parse(rawData);

  await prisma.software.update({
    where: {
      id,
      organizationId: session.organizationId
    },
    data: {
      description: validated.description || null,
      iconName: validated.iconName || null,
      metadata: (validated.metadata as any) ?? null,
      updatedById: session.userId,
    }
  });

  revalidatePath('/logiciels');
}

export async function getSoftwareUsage(softwareId: number) {
  const session = await requireSession();

  const installations = await prisma.installation.findMany({
    where: {
      softwareId,
      removedAt: null,
      software: {
        organizationId: session.organizationId
      }
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
