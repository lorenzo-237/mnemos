'use server';

import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/password';
import { markSetupCompleted, checkSetupConsistency } from '@/lib/settings';
import { z } from 'zod';

const setupSchema = z.object({
  username: z.string().min(3, "Le nom d'utilisateur doit avoir au moins 3 caractères").max(50),
  password: z.string().min(8, "Le mot de passe doit avoir au moins 8 caractères"),
  organizationName: z.string().min(1, "Le nom de l'organisation est requis").max(100),
});

export async function performInitialSetup(formData: FormData) {
  try {
    // Vérifier la cohérence
    const { isConsistent, setupCompleted } = await checkSetupConsistency();

    if (setupCompleted) {
      throw new Error("Le setup a déjà été effectué");
    }

    if (!isConsistent) {
      throw new Error("Incohérence système détectée. Contactez l'administrateur.");
    }

    // Valider les données
    const rawData = {
      username: formData.get('username') as string,
      password: formData.get('password') as string,
      organizationName: formData.get('organizationName') as string,
    };

    const validated = setupSchema.parse(rawData);

    // Créer en transaction
    await prisma.$transaction(async (tx) => {
      // 1. Créer l'organisation
      const organization = await tx.organization.create({
        data: {
          name: validated.organizationName,
        }
      });

      // 2. Créer l'utilisateur admin
      const passwordHash = await hashPassword(validated.password);
      const user = await tx.user.create({
        data: {
          username: validated.username,
          passwordHash,
        }
      });

      // 3. Associer l'utilisateur à l'organisation avec rôle ADMIN
      await tx.userOrganization.create({
        data: {
          userId: user.id,
          organizationId: organization.id,
          role: 'ADMIN',
        }
      });
    });

    // 4. Marquer le setup comme complété
    await markSetupCompleted();

    console.log('✅ Setup initial complété avec succès');

  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(error.issues[0].message);
    }
    throw error;
  }

  // Rediriger vers login
  redirect('/login');
}
