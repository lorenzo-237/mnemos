"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import {
  encryptTeamViewerPassword,
  decryptTeamViewerPassword,
} from "@/lib/crypto";
import { machineSchema } from "@/lib/validators";

export async function getAllMachines() {
  const session = await requireSession();

  return prisma.machine.findMany({
    where: {
      site: {
        organizationId: session.organizationId
      }
    },
    include: {
      site: {
        include: {
          tags: { include: { tag: true } },
        },
      },
      installations: {
        where: { removedAt: null },
        include: { software: true },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getMachinesBySiteId(siteId: number) {
  const session = await requireSession();

  // Verify site belongs to organization
  const site = await prisma.site.findUnique({
    where: { id: siteId, organizationId: session.organizationId },
  });

  if (!site) return [];

  return prisma.machine.findMany({
    where: { siteId },
    include: {
      _count: {
        select: {
          installations: {
            where: { removedAt: null },
          },
        },
      },
    },
    orderBy: { name: "asc" },
  });
}

export async function getMachineById(id: number) {
  const session = await requireSession();

  const machine = await prisma.machine.findUnique({
    where: { id },
    include: {
      site: true,
      installations: {
        where: { removedAt: null },
        include: { software: true },
        orderBy: { installedAt: "desc" },
      },
    },
  });

  if (!machine || machine.site.organizationId !== session.organizationId) {
    return null;
  }

  // Déchiffrer le mot de passe TeamViewer seulement pour GESTIONNAIRE et ADMIN
  const canViewPassword = session.role !== "UTILISATEUR";

  return {
    ...machine,
    teamviewerPwdDecrypted: canViewPassword && machine.teamviewerPwd
      ? decryptTeamViewerPassword(machine.teamviewerPwd)
      : null,
  };
}

export async function createMachine(siteId: number, formData: FormData) {
  const session = await requireSession();
  const rawData = Object.fromEntries(formData);
  const validatedData = machineSchema.parse(rawData);

  // Verify site belongs to organization
  const site = await prisma.site.findUnique({
    where: { id: siteId, organizationId: session.organizationId },
  });

  if (!site) throw new Error("Site non trouvé");

  const encryptedPwd = validatedData.teamviewerPwd
    ? encryptTeamViewerPassword(validatedData.teamviewerPwd)
    : null;

  const machine = await prisma.machine.create({
    data: {
      name: validatedData.name,
      type: validatedData.type,
      siteId,
      teamviewerId: validatedData.teamviewerId || null,
      teamviewerPwd: encryptedPwd,
    },
  });

  revalidatePath(`/sites/${siteId}`);
}

export async function updateMachine(id: number, formData: FormData) {
  const session = await requireSession();
  const rawData = Object.fromEntries(formData);
  const validatedData = machineSchema.parse(rawData);

  const machine = await prisma.machine.findUnique({
    where: { id },
    include: { site: true },
  });

  if (!machine || machine.site.organizationId !== session.organizationId) {
    throw new Error("Machine non trouvée");
  }

  const encryptedPwd = validatedData.teamviewerPwd
    ? encryptTeamViewerPassword(validatedData.teamviewerPwd)
    : null;

  await prisma.machine.update({
    where: { id },
    data: {
      name: validatedData.name,
      type: validatedData.type,
      teamviewerId: validatedData.teamviewerId || null,
      teamviewerPwd: encryptedPwd,
    },
  });

  revalidatePath(`/sites/${machine.siteId}/machines/${id}`);
  revalidatePath(`/sites/${machine.siteId}`);
}

export async function deleteMachine(id: number) {
  const session = await requireSession();

  if (session.role === "UTILISATEUR") {
    throw new Error("Permission insuffisante");
  }

  const machine = await prisma.machine.findUnique({
    where: { id },
    include: { site: true },
  });

  if (!machine || machine.site.organizationId !== session.organizationId) {
    throw new Error("Machine non trouvée");
  }

  await prisma.machine.delete({ where: { id } });

  revalidatePath(`/sites/${machine.siteId}`);
  redirect(`/sites/${machine.siteId}`);
}
