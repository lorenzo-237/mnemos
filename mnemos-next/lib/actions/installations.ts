'use server';

import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { installationSchema, updateSoftwareSchema } from '@/lib/validators';

export async function getActiveInstallations(machineId: number) {
  return prisma.installation.findMany({
    where: {
      machineId,
      removedAt: null
    },
    include: { software: true },
    orderBy: { installedAt: 'desc' }
  });
}

export async function getInstallationHistory(machineId: number) {
  return prisma.installation.findMany({
    where: { machineId },
    include: { software: true },
    orderBy: { installedAt: 'desc' }
  });
}

export async function addInstallation(machineId: number, formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const validatedData = installationSchema.parse(rawData);

  // Créer le logiciel s'il n'existe pas
  let software = await prisma.software.findUnique({
    where: { name: validatedData.softwareName }
  });

  if (!software) {
    software = await prisma.software.create({
      data: { name: validatedData.softwareName }
    });
  }

  await prisma.installation.create({
    data: {
      machineId,
      softwareId: software.id,
      version: validatedData.version,
    }
  });

  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    select: { siteId: true }
  });

  if (machine) {
    revalidatePath(`/sites/${machine.siteId}/machines/${machineId}`);
    revalidatePath(`/sites/${machine.siteId}/machines/${machineId}/historique`);
  }
}

export async function updateSoftwareVersion(machineId: number, formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const validatedData = updateSoftwareSchema.parse(rawData);

  await prisma.$transaction(async (tx) => {
    // Clôturer l'ancienne installation
    await tx.installation.update({
      where: { id: validatedData.oldInstallationId },
      data: { removedAt: new Date() }
    });

    // Créer la nouvelle installation
    await tx.installation.create({
      data: {
        machineId,
        softwareId: validatedData.softwareId,
        version: validatedData.newVersion,
      }
    });
  });

  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    select: { siteId: true }
  });

  if (machine) {
    revalidatePath(`/sites/${machine.siteId}/machines/${machineId}`);
    revalidatePath(`/sites/${machine.siteId}/machines/${machineId}/historique`);
  }
}

export async function removeInstallation(installationId: number, machineId: number) {
  await prisma.installation.update({
    where: { id: installationId },
    data: { removedAt: new Date() }
  });

  const machine = await prisma.machine.findUnique({
    where: { id: machineId },
    select: { siteId: true }
  });

  if (machine) {
    revalidatePath(`/sites/${machine.siteId}/machines/${machineId}`);
    revalidatePath(`/sites/${machine.siteId}/machines/${machineId}/historique`);
  }
}
