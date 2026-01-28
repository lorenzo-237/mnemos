"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import {
  encryptTeamViewerPassword,
  decryptTeamViewerPassword,
} from "@/lib/crypto";
import { machineSchema } from "@/lib/validators";

export async function getAllMachines() {
  return prisma.machine.findMany({
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

  if (!machine) return null;

  // Déchiffrer le mot de passe TeamViewer pour l'affichage
  return {
    ...machine,
    teamviewerPwdDecrypted: machine.teamviewerPwd
      ? decryptTeamViewerPassword(machine.teamviewerPwd)
      : null,
  };
}

export async function createMachine(siteId: number, formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const validatedData = machineSchema.parse(rawData);

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
  const rawData = Object.fromEntries(formData);
  const validatedData = machineSchema.parse(rawData);

  const machine = await prisma.machine.findUnique({
    where: { id },
    select: { siteId: true },
  });

  if (!machine) throw new Error("Machine not found");

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
  const machine = await prisma.machine.findUnique({
    where: { id },
    select: { siteId: true },
  });

  if (!machine) throw new Error("Machine not found");

  await prisma.machine.delete({ where: { id } });

  revalidatePath(`/sites/${machine.siteId}`);
  redirect(`/sites/${machine.siteId}`);
}
