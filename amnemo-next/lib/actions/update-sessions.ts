"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/auth/session";
import { z } from "zod";

const updateSessionSchema = z.object({
  name: z.string().min(1, "Le nom est requis").max(100),
  description: z.string().optional(),
  folderId: z.preprocess(
    (val) => (val && val !== "none" ? Number(val) : undefined),
    z.number().optional(),
  ),
  tagId: z.preprocess(
    (val) => (val && val !== "none" ? Number(val) : undefined),
    z.number().optional(),
  ),
});

export async function getUpdateSessions() {
  const session = await requireSession();

  return await prisma.updateSession.findMany({
    where: { organizationId: session.organizationId },
    include: {
      folder: true,
      tag: true,
      _count: {
        select: { updateTasks: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getUpdateSessionById(id: number) {
  const session = await requireSession();

  const updateSession = await prisma.updateSession.findUnique({
    where: { id },
    include: {
      folder: {
        include: {
          sites: {
            include: {
              tags: { include: { tag: true } },
              machines: {
                include: {
                  installations: {
                    where: { removedAt: null },
                    include: { software: true },
                  },
                },
              },
            },
          },
        },
      },
      tag: {
        include: {
          sites: {
            include: {
              site: {
                include: {
                  tags: { include: { tag: true } },
                  machines: {
                    include: {
                      installations: {
                        where: { removedAt: null },
                        include: { software: true },
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
      updateTasks: {
        include: {
          machine: {
            include: {
              site: true,
            },
          },
          task: true,
          software: true,
        },
        orderBy: [{ machineOrder: "asc" }, { taskOrder: "asc" }],
      },
    },
  });

  if (!updateSession || updateSession.organizationId !== session.organizationId) {
    return null;
  }

  return updateSession;
}

export async function createUpdateSession(formData: FormData) {
  const session = await requireSession();
  const rawData = Object.fromEntries(formData);
  const validated = updateSessionSchema.parse(rawData);

  const updateSession = await prisma.updateSession.create({
    data: {
      name: validated.name,
      description: validated.description,
      folderId: validated.folderId,
      tagId: validated.tagId,
      organizationId: session.organizationId,
      createdById: session.userId,
    },
  });

  revalidatePath("/updates");
  redirect(`/updates/${updateSession.id}/prepare`);
}

export async function updateUpdateSession(id: number, formData: FormData) {
  const session = await requireSession();
  const rawData = Object.fromEntries(formData);
  const validated = updateSessionSchema.parse(rawData);

  await prisma.updateSession.update({
    where: {
      id,
      organizationId: session.organizationId
    },
    data: {
      name: validated.name,
      description: validated.description,
      folderId: validated.folderId,
      tagId: validated.tagId,
      updatedById: session.userId,
    },
  });

  revalidatePath("/updates");
  revalidatePath(`/updates/${id}`);
}

async function _oldUpdateUpdateSession(id: number, formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const validated = updateSessionSchema.parse(rawData);

  await prisma.updateSession.update({
    where: { id },
    data: {
      name: validated.name,
      description: validated.description,
      folderId: validated.folderId,
      tagId: validated.tagId,
    },
  });

  revalidatePath(`/updates/${id}`);
  revalidatePath("/updates");
}

export async function deleteUpdateSession(id: number) {
  await prisma.updateSession.delete({
    where: { id },
  });

  revalidatePath("/updates");
  redirect("/updates");
}

export async function startUpdateSession(id: number) {
  await prisma.updateSession.update({
    where: { id },
    data: {
      startedAt: new Date(),
    },
  });

  revalidatePath(`/updates/${id}`);
}

export async function completeUpdateSession(id: number) {
  // Récupérer toutes les tâches COMPLETED de type SOFTWARE_REPLACEMENT de cette session
  const completedSoftwareReplacements = await prisma.updateTask.findMany({
    where: {
      updateSessionId: id,
      status: "COMPLETED",
    },
    include: {
      task: true,
    },
  });

  // Filtrer uniquement les tâches de remplacement de logiciel avec les données complètes
  const replacementsToProcess = completedSoftwareReplacements.filter(
    (ut) =>
      ut.task.type === "SOFTWARE_REPLACEMENT" &&
      ut.softwareId &&
      ut.targetVersion,
  );

  // Traiter les remplacements de logiciels dans une transaction
  await prisma.$transaction(async (tx) => {
    // Marquer la session comme terminée
    await tx.updateSession.update({
      where: { id },
      data: {
        completedAt: new Date(),
      },
    });

    // Traiter chaque remplacement
    for (const replacement of replacementsToProcess) {
      const { machineId, softwareId, targetVersion } = replacement;

      // Vérifier si une installation identique existe déjà (même machine, logiciel, version, et non retirée)
      const existingInstallation = await tx.installation.findFirst({
        where: {
          machineId,
          softwareId: softwareId!,
          version: targetVersion!,
          removedAt: null,
        },
      });

      // Si l'installation n'existe pas déjà, procéder à la mise à jour
      if (!existingInstallation) {
        // Fermer l'ancienne installation si elle existe (différente version)
        await tx.installation.updateMany({
          where: {
            machineId,
            softwareId: softwareId!,
            removedAt: null,
          },
          data: {
            removedAt: new Date(),
          },
        });

        // Créer la nouvelle installation
        await tx.installation.create({
          data: {
            machineId,
            softwareId: softwareId!,
            version: targetVersion!,
            installedAt: new Date(),
          },
        });
      }
    }
  });

  revalidatePath(`/updates/${id}`);
  revalidatePath("/updates");
  revalidatePath("/sites");
}

export async function cancelStartUpdateSession(id: number) {
  await prisma.updateSession.update({
    where: { id },
    data: {
      startedAt: null,
    },
  });

  revalidatePath(`/updates/${id}`);
  revalidatePath("/updates");
  redirect(`/updates/${id}/prepare`);
}

export async function reopenUpdateSession(id: number) {
  await prisma.updateSession.update({
    where: { id },
    data: {
      completedAt: null,
    },
  });

  revalidatePath(`/updates/${id}`);
  revalidatePath("/updates");
}

// Ajouter des tâches à une session
export async function addTasksToSession(
  sessionId: number,
  machineIds: number[],
  taskIds: number[],
  softwareReplacements?: Record<
    number,
    { softwareId: number; targetVersion: string }
  >,
) {
  // Déterminer l'ordre des machines existantes pour placer les nouvelles après
  const existingTasks = await prisma.updateTask.findMany({
    where: { updateSessionId: sessionId },
    select: { machineId: true, machineOrder: true, taskOrder: true },
  });

  const existingMachineOrders = new Map<number, number>();
  let maxMachineOrder = -1;
  for (const t of existingTasks) {
    if (
      !existingMachineOrders.has(t.machineId) ||
      existingMachineOrders.get(t.machineId)! < t.machineOrder
    ) {
      existingMachineOrders.set(t.machineId, t.machineOrder);
    }
    if (t.machineOrder > maxMachineOrder) maxMachineOrder = t.machineOrder;
  }

  const existingTaskOrders = new Map<number, number>();
  for (const t of existingTasks) {
    const key = t.machineId;
    if (
      !existingTaskOrders.has(key) ||
      existingTaskOrders.get(key)! < t.taskOrder
    ) {
      existingTaskOrders.set(key, t.taskOrder);
    }
  }

  const tasks = [];

  for (const machineId of machineIds) {
    const machineOrder = existingMachineOrders.has(machineId)
      ? existingMachineOrders.get(machineId)!
      : ++maxMachineOrder;
    const baseTaskOrder = existingTaskOrders.get(machineId) ?? -1;

    for (let i = 0; i < taskIds.length; i++) {
      const taskId = taskIds[i];
      const softwareData = softwareReplacements?.[taskId];

      tasks.push({
        updateSessionId: sessionId,
        machineId,
        taskId,
        status: "PENDING" as const,
        machineOrder,
        taskOrder: baseTaskOrder + i + 1,
        softwareId: softwareData?.softwareId,
        targetVersion: softwareData?.targetVersion,
      });
    }
  }

  await prisma.updateTask.createMany({
    data: tasks,
    skipDuplicates: true,
  });

  revalidatePath(`/updates/${sessionId}`);
}

// Cloner les tâches d'une machine source vers une ou plusieurs machines destinations
export async function cloneTasksToMachines(
  sessionId: number,
  sourceMachineId: number,
  destinationMachineIds: number[],
) {
  const sourceTasks = await prisma.updateTask.findMany({
    where: {
      updateSessionId: sessionId,
      machineId: sourceMachineId,
    },
    orderBy: { taskOrder: "asc" },
  });

  if (sourceTasks.length === 0) return;

  // Déterminer le max machineOrder existant
  const maxOrder = await prisma.updateTask.aggregate({
    where: { updateSessionId: sessionId },
    _max: { machineOrder: true },
  });
  let nextMachineOrder = (maxOrder._max.machineOrder ?? 0) + 1;

  // Déterminer les machines destinations qui existent déjà dans la session
  const existingMachineOrders = await prisma.updateTask.groupBy({
    by: ["machineId"],
    where: { updateSessionId: sessionId },
    _max: { machineOrder: true, taskOrder: true },
  });

  const machineOrderMap = new Map(
    existingMachineOrders.map((g) => [
      g.machineId,
      { machineOrder: g._max.machineOrder!, taskOrder: g._max.taskOrder! },
    ]),
  );

  const clonedTasks = [];

  for (const destMachineId of destinationMachineIds) {
    const existing = machineOrderMap.get(destMachineId);
    const machineOrder = existing?.machineOrder ?? nextMachineOrder++;
    const baseTaskOrder = existing?.taskOrder ?? 0;

    for (let i = 0; i < sourceTasks.length; i++) {
      const src = sourceTasks[i];
      clonedTasks.push({
        updateSessionId: sessionId,
        machineId: destMachineId,
        taskId: src.taskId,
        status: "PENDING" as const,
        machineOrder,
        taskOrder: baseTaskOrder + i + 1,
        softwareId: src.softwareId,
        targetVersion: src.targetVersion,
      });
    }
  }

  await prisma.updateTask.createMany({
    data: clonedTasks,
    skipDuplicates: true,
  });

  revalidatePath(`/updates/${sessionId}`);
}

// Réordonnancer les machines dans une session
export async function reorderMachines(
  sessionId: number,
  machineOrder: { machineId: number; order: number }[],
) {
  await prisma.$transaction(async (tx) => {
    for (const { machineId, order } of machineOrder) {
      await tx.updateTask.updateMany({
        where: { updateSessionId: sessionId, machineId },
        data: { machineOrder: order },
      });
    }
  });

  revalidatePath(`/updates/${sessionId}`);
}

// Réordonnancer les tâches dans une machine
export async function reorderTasks(
  sessionId: number,
  machineId: number,
  taskOrder: { updateTaskId: number; order: number }[],
) {
  await prisma.$transaction(async (tx) => {
    for (const { updateTaskId, order } of taskOrder) {
      await tx.updateTask.update({
        where: { id: updateTaskId },
        data: { taskOrder: order },
      });
    }
  });

  revalidatePath(`/updates/${sessionId}`);
}

// Modifier une tâche dans une session (notes)
export async function updateUpdateTask(
  updateTaskId: number,
  sessionId: number,
  notes: string,
) {
  await prisma.updateTask.update({
    where: { id: updateTaskId },
    data: { notes: notes || null },
  });

  revalidatePath(`/updates/${sessionId}`);
}

// Supprimer une tâche d'une session
export async function removeTaskFromSession(
  updateTaskId: number,
  sessionId: number,
) {
  await prisma.updateTask.delete({
    where: { id: updateTaskId },
  });

  revalidatePath(`/updates/${sessionId}`);
}

// Mettre à jour le statut d'une tâche
export async function updateTaskStatus(
  updateTaskId: number,
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "SKIPPED",
  notes?: string,
) {
  await prisma.updateTask.update({
    where: { id: updateTaskId },
    data: {
      status,
      notes,
      completedAt:
        status === "COMPLETED" || status === "SKIPPED" ? new Date() : null,
    },
  });

  // Note: On ne fait pas de revalidatePath ici pour éviter trop de revalidations
  // Le composant utilisera des mutations optimistes
  // La mise à jour des installations pour les SOFTWARE_REPLACEMENT se fait lors de la finalisation de la session
}
