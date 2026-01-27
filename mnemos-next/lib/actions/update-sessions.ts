'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const updateSessionSchema = z.object({
  name: z.string().min(1, 'Le nom est requis').max(100),
  description: z.string().optional(),
  folderId: z.preprocess((val) => val && val !== 'none' ? Number(val) : undefined, z.number().optional()),
  tagId: z.preprocess((val) => val && val !== 'none' ? Number(val) : undefined, z.number().optional()),
});

export async function getUpdateSessions() {
  return await prisma.updateSession.findMany({
    include: {
      folder: true,
      tag: true,
      _count: {
        select: { updateTasks: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  });
}

export async function getUpdateSessionById(id: number) {
  return await prisma.updateSession.findUnique({
    where: { id },
    include: {
      folder: {
        include: {
          sites: {
            include: {
              machines: {
                include: {
                  _count: {
                    select: {
                      installations: {
                        where: { removedAt: null }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      tag: {
        include: {
          sites: {
            include: {
              site: {
                include: {
                  machines: {
                    include: {
                      _count: {
                        select: {
                          installations: {
                            where: { removedAt: null }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      },
      updateTasks: {
        include: {
          machine: {
            include: {
              site: true
            }
          },
          task: true,
          software: true
        },
        orderBy: [
          { machine: { site: { name: 'asc' } } },
          { machine: { name: 'asc' } }
        ]
      }
    }
  });
}

export async function createUpdateSession(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const validated = updateSessionSchema.parse(rawData);

  const session = await prisma.updateSession.create({
    data: {
      name: validated.name,
      description: validated.description,
      folderId: validated.folderId,
      tagId: validated.tagId,
    }
  });

  revalidatePath('/updates');
  redirect(`/updates/${session.id}/prepare`);
}

export async function updateUpdateSession(id: number, formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const validated = updateSessionSchema.parse(rawData);

  await prisma.updateSession.update({
    where: { id },
    data: {
      name: validated.name,
      description: validated.description,
      folderId: validated.folderId,
      tagId: validated.tagId,
    }
  });

  revalidatePath(`/updates/${id}`);
  revalidatePath('/updates');
}

export async function deleteUpdateSession(id: number) {
  await prisma.updateSession.delete({
    where: { id }
  });

  revalidatePath('/updates');
  redirect('/updates');
}

export async function startUpdateSession(id: number) {
  await prisma.updateSession.update({
    where: { id },
    data: {
      startedAt: new Date()
    }
  });

  revalidatePath(`/updates/${id}`);
}

export async function completeUpdateSession(id: number) {
  // Récupérer toutes les tâches COMPLETED de type SOFTWARE_REPLACEMENT de cette session
  const completedSoftwareReplacements = await prisma.updateTask.findMany({
    where: {
      updateSessionId: id,
      status: 'COMPLETED'
    },
    include: {
      task: true
    }
  });

  // Filtrer uniquement les tâches de remplacement de logiciel avec les données complètes
  const replacementsToProcess = completedSoftwareReplacements.filter(
    ut => ut.task.type === 'SOFTWARE_REPLACEMENT' && ut.softwareId && ut.targetVersion
  );

  // Traiter les remplacements de logiciels dans une transaction
  await prisma.$transaction(async (tx) => {
    // Marquer la session comme terminée
    await tx.updateSession.update({
      where: { id },
      data: {
        completedAt: new Date()
      }
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
          removedAt: null
        }
      });

      // Si l'installation n'existe pas déjà, procéder à la mise à jour
      if (!existingInstallation) {
        // Fermer l'ancienne installation si elle existe (différente version)
        await tx.installation.updateMany({
          where: {
            machineId,
            softwareId: softwareId!,
            removedAt: null
          },
          data: {
            removedAt: new Date()
          }
        });

        // Créer la nouvelle installation
        await tx.installation.create({
          data: {
            machineId,
            softwareId: softwareId!,
            version: targetVersion!,
            installedAt: new Date()
          }
        });
      }
    }
  });

  revalidatePath(`/updates/${id}`);
  revalidatePath('/updates');
  revalidatePath('/sites');
}

export async function cancelStartUpdateSession(id: number) {
  await prisma.updateSession.update({
    where: { id },
    data: {
      startedAt: null
    }
  });

  revalidatePath(`/updates/${id}`);
  revalidatePath('/updates');
  redirect(`/updates/${id}/prepare`);
}

export async function reopenUpdateSession(id: number) {
  await prisma.updateSession.update({
    where: { id },
    data: {
      completedAt: null
    }
  });

  revalidatePath(`/updates/${id}`);
  revalidatePath('/updates');
}

// Ajouter des tâches à une session
export async function addTasksToSession(
  sessionId: number,
  machineIds: number[],
  taskIds: number[],
  softwareReplacements?: Record<number, { softwareId: number; targetVersion: string }>
) {
  const tasks = [];

  for (const machineId of machineIds) {
    for (const taskId of taskIds) {
      const softwareData = softwareReplacements?.[taskId];

      tasks.push({
        updateSessionId: sessionId,
        machineId,
        taskId,
        status: 'PENDING' as const,
        softwareId: softwareData?.softwareId,
        targetVersion: softwareData?.targetVersion,
      });
    }
  }

  await prisma.updateTask.createMany({
    data: tasks,
    skipDuplicates: true
  });

  revalidatePath(`/updates/${sessionId}`);
}

// Supprimer une tâche d'une session
export async function removeTaskFromSession(updateTaskId: number, sessionId: number) {
  await prisma.updateTask.delete({
    where: { id: updateTaskId }
  });

  revalidatePath(`/updates/${sessionId}`);
}

// Mettre à jour le statut d'une tâche
export async function updateTaskStatus(
  updateTaskId: number,
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'SKIPPED',
  notes?: string
) {
  await prisma.updateTask.update({
    where: { id: updateTaskId },
    data: {
      status,
      notes,
      completedAt: status === 'COMPLETED' || status === 'SKIPPED' ? new Date() : null
    }
  });

  // Note: On ne fait pas de revalidatePath ici pour éviter trop de revalidations
  // Le composant utilisera des mutations optimistes
  // La mise à jour des installations pour les SOFTWARE_REPLACEMENT se fait lors de la finalisation de la session
}
