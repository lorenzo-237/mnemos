import { prisma } from '@/lib/prisma';

/**
 * Récupère ou crée les settings de l'application
 * Il n'existe qu'une seule ligne de settings (id=1)
 */
export async function getSettings() {
  let settings = await prisma.settings.findUnique({
    where: { id: 1 }
  });

  // Créer les settings si elles n'existent pas
  if (!settings) {
    settings = await prisma.settings.create({
      data: { id: 1, setupCompleted: false }
    });
  }

  return settings;
}

/**
 * Vérifie si le setup initial a été complété
 */
export async function isSetupCompleted(): Promise<boolean> {
  const settings = await getSettings();
  return settings.setupCompleted;
}

/**
 * Marque le setup comme complété
 */
export async function markSetupCompleted() {
  await prisma.settings.upsert({
    where: { id: 1 },
    create: { id: 1, setupCompleted: true },
    update: { setupCompleted: true }
  });
}

/**
 * Vérifie la cohérence du système
 * Si setupCompleted=false MAIS des users existent → incohérence
 */
export async function checkSetupConsistency(): Promise<{
  isConsistent: boolean;
  setupCompleted: boolean;
  userCount: number;
}> {
  const settings = await getSettings();
  const userCount = await prisma.user.count();

  const isConsistent = !(settings.setupCompleted === false && userCount > 0);

  return {
    isConsistent,
    setupCompleted: settings.setupCompleted,
    userCount
  };
}
