'use server';

import { prisma } from '@/lib/prisma';
import { requireSession } from '@/lib/auth/session';
import { revalidatePath } from 'next/cache';
import { MachineType } from '@/lib/types';

interface ImportFolder {
  name: string;
}

interface ImportTag {
  name: string;
  color: string;
}

interface ImportSoftware {
  name: string;
  publisher?: string;
  description?: string;
}

interface ImportMachine {
  name: string;
  type: 'SERVER' | 'CLIENT';
}

interface ImportSite {
  name: string;
  folder?: string;
  tags?: string[];
  metadata?: Record<string, unknown>;
  machines: ImportMachine[];
}

interface ImportData {
  folders: ImportFolder[];
  tags: ImportTag[];
  softwares: ImportSoftware[];
  tasks: {
    server: string[];
    client: string[];
  };
  sites: ImportSite[];
}

export interface ImportResult {
  success: boolean;
  message: string;
  details: {
    folders: number;
    tags: number;
    softwares: number;
    tasks: number;
    sites: number;
    machines: number;
  };
  errors: string[];
}

export async function importData(jsonData: string): Promise<ImportResult> {
  const session = await requireSession();

  if (session.role === 'UTILISATEUR') {
    throw new Error('Permission insuffisante. Seuls les gestionnaires et admins peuvent importer des données.');
  }

  const errors: string[] = [];
  const details = {
    folders: 0,
    tags: 0,
    softwares: 0,
    tasks: 0,
    sites: 0,
    machines: 0,
  };

  try {
    const data: ImportData = JSON.parse(jsonData);

    // Maps pour stocker les IDs créés
    const folderMap = new Map<string, number>();
    const tagMap = new Map<string, number>();

    // 1. Créer les dossiers
    console.log('📁 Import des dossiers...');
    for (const folder of data.folders) {
      try {
        const existing = await prisma.folder.findFirst({
          where: { name: folder.name, organizationId: session.organizationId }
        });

        if (existing) {
          folderMap.set(folder.name, existing.id);
          console.log(`  ⏭️  Dossier "${folder.name}" existe déjà`);
        } else {
          const created = await prisma.folder.create({
            data: {
              name: folder.name,
              organizationId: session.organizationId,
              createdById: session.userId,
            }
          });
          folderMap.set(folder.name, created.id);
          details.folders++;
          console.log(`  ✅ Dossier "${folder.name}" créé`);
        }
      } catch (e) {
        errors.push(`Dossier "${folder.name}": ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
      }
    }

    // 2. Créer les tags
    console.log('🏷️  Import des tags...');
    for (const tag of data.tags) {
      try {
        const existing = await prisma.tag.findFirst({
          where: { name: tag.name, organizationId: session.organizationId }
        });

        if (existing) {
          // Mettre à jour la couleur si elle a changé
          if (existing.color !== tag.color) {
            await prisma.tag.update({
              where: { id: existing.id },
              data: { color: tag.color }
            });
            console.log(`  🔄 Tag "${tag.name}" couleur mise à jour`);
          }
          tagMap.set(tag.name, existing.id);
          console.log(`  ⏭️  Tag "${tag.name}" existe déjà`);
        } else {
          const created = await prisma.tag.create({
            data: {
              name: tag.name,
              color: tag.color,
              organizationId: session.organizationId,
              createdById: session.userId,
            }
          });
          tagMap.set(tag.name, created.id);
          details.tags++;
          console.log(`  ✅ Tag "${tag.name}" créé`);
        }
      } catch (e) {
        errors.push(`Tag "${tag.name}": ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
      }
    }

    // 3. Créer les logiciels
    console.log('💿 Import des logiciels...');
    for (const software of data.softwares) {
      try {
        const existing = await prisma.software.findFirst({
          where: { name: software.name, organizationId: session.organizationId }
        });

        if (existing) {
          console.log(`  ⏭️  Logiciel "${software.name}" existe déjà`);
        } else {
          await prisma.software.create({
            data: {
              name: software.name,
              description: software.description,
              metadata: software.publisher ? { publisher: { value: software.publisher } } : undefined,
              organizationId: session.organizationId,
              createdById: session.userId,
            }
          });
          details.softwares++;
          console.log(`  ✅ Logiciel "${software.name}" créé`);
        }
      } catch (e) {
        errors.push(`Logiciel "${software.name}": ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
      }
    }

    // 4. Créer les tâches
    console.log('📋 Import des tâches...');

    // Récupérer l'ID du tag urgencemed pour l'associer aux tâches
    const urgencemedTagId = tagMap.get('urgencemed');

    // Tâches serveur
    for (const taskName of data.tasks.server) {
      try {
        const existing = await prisma.task.findFirst({
          where: { name: taskName, organizationId: session.organizationId }
        });

        if (existing) {
          console.log(`  ⏭️  Tâche "${taskName}" existe déjà`);
        } else {
          const created = await prisma.task.create({
            data: {
              name: taskName,
              targetType: 'SERVER',
              organizationId: session.organizationId,
              createdById: session.userId,
            }
          });

          // Associer le tag urgencemed si disponible
          if (urgencemedTagId) {
            await prisma.taskTag.create({
              data: { taskId: created.id, tagId: urgencemedTagId }
            });
          }

          details.tasks++;
          console.log(`  ✅ Tâche serveur "${taskName}" créée`);
        }
      } catch (e) {
        errors.push(`Tâche "${taskName}": ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
      }
    }

    // Tâches client
    for (const taskName of data.tasks.client) {
      try {
        const existing = await prisma.task.findFirst({
          where: { name: taskName, organizationId: session.organizationId }
        });

        if (existing) {
          console.log(`  ⏭️  Tâche "${taskName}" existe déjà`);
        } else {
          const created = await prisma.task.create({
            data: {
              name: taskName,
              targetType: 'CLIENT',
              organizationId: session.organizationId,
              createdById: session.userId,
            }
          });

          // Associer le tag urgencemed si disponible
          if (urgencemedTagId) {
            await prisma.taskTag.create({
              data: { taskId: created.id, tagId: urgencemedTagId }
            });
          }

          details.tasks++;
          console.log(`  ✅ Tâche client "${taskName}" créée`);
        }
      } catch (e) {
        errors.push(`Tâche "${taskName}": ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
      }
    }

    // 5. Créer les sites et machines
    console.log('🏢 Import des sites et machines...');
    for (const site of data.sites) {
      try {
        const existing = await prisma.site.findFirst({
          where: { name: site.name, organizationId: session.organizationId }
        });

        let siteId: number;

        if (existing) {
          siteId = existing.id;
          console.log(`  ⏭️  Site "${site.name}" existe déjà`);
        } else {
          // Préparer les métadonnées
          const metadata: Record<string, { value: string }> = {};
          if (site.metadata) {
            for (const [key, value] of Object.entries(site.metadata)) {
              if (value !== null && value !== undefined) {
                metadata[key] = { value: String(value) };
              }
            }
          }

          const created = await prisma.site.create({
            data: {
              name: site.name,
              folderId: site.folder ? folderMap.get(site.folder) : undefined,
              metadata: Object.keys(metadata).length > 0 ? metadata : undefined,
              organizationId: session.organizationId,
              createdById: session.userId,
            }
          });
          siteId = created.id;
          details.sites++;
          console.log(`  ✅ Site "${site.name}" créé`);

          // Associer les tags
          if (site.tags && site.tags.length > 0) {
            for (const tagName of site.tags) {
              const tagId = tagMap.get(tagName);
              if (tagId) {
                await prisma.siteTag.create({
                  data: { siteId, tagId }
                });
              }
            }
          }
        }

        // Créer les machines
        for (const machine of site.machines) {
          try {
            const existingMachine = await prisma.machine.findFirst({
              where: { name: machine.name, siteId }
            });

            if (existingMachine) {
              console.log(`    ⏭️  Machine "${machine.name}" existe déjà`);
            } else {
              await prisma.machine.create({
                data: {
                  name: machine.name,
                  type: machine.type as MachineType,
                  siteId,
                }
              });
              details.machines++;
              console.log(`    ✅ Machine "${machine.name}" créée`);
            }
          } catch (e) {
            errors.push(`Machine "${machine.name}" (${site.name}): ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
          }
        }
      } catch (e) {
        errors.push(`Site "${site.name}": ${e instanceof Error ? e.message : 'Erreur inconnue'}`);
      }
    }

    // Revalidate paths
    revalidatePath('/sites');
    revalidatePath('/logiciels');
    revalidatePath('/tasks');
    revalidatePath('/parametres');

    const totalImported = details.folders + details.tags + details.softwares + details.tasks + details.sites + details.machines;

    return {
      success: errors.length === 0,
      message: totalImported > 0
        ? `Import terminé : ${totalImported} éléments créés`
        : 'Tous les éléments existaient déjà',
      details,
      errors,
    };

  } catch (e) {
    return {
      success: false,
      message: `Erreur lors de l'import: ${e instanceof Error ? e.message : 'Erreur inconnue'}`,
      details,
      errors: [e instanceof Error ? e.message : 'Erreur inconnue'],
    };
  }
}
