'use server';

import { prisma } from '@/lib/prisma';

export async function getSoftwares() {
  return prisma.software.findMany({
    orderBy: { name: 'asc' }
  });
}

export async function getSoftwareByName(name: string) {
  return prisma.software.findUnique({
    where: { name }
  });
}

export async function createSoftware(name: string) {
  return prisma.software.create({
    data: { name }
  });
}
