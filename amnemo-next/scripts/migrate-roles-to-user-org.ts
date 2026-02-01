import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🔄 Migrating roles from User to UserOrganization...');

  // Récupérer tous les utilisateurs avec leurs organisations
  const users = await prisma.user.findMany({
    include: {
      organizations: true
    }
  });

  console.log(`📊 Found ${users.length} users to migrate`);

  let migratedCount = 0;

  for (const user of users) {
    // Note: user.role n'existe plus après la migration schema
    // On va récupérer le rôle depuis la base de données directement
    const userWithRole = await prisma.$queryRaw<Array<{ role: string }>>`
      SELECT role FROM users WHERE id = ${user.id}
    `;

    if (userWithRole.length === 0) {
      console.log(`⚠️  User ${user.id} has no role, skipping...`);
      continue;
    }

    const role = userWithRole[0].role as "UTILISATEUR" | "GESTIONNAIRE" | "ADMIN";

    console.log(`👤 Migrating user "${user.username}" (role: ${role}) - ${user.organizations.length} organizations`);

    // Mettre à jour chaque relation UserOrganization avec le rôle
    for (const userOrg of user.organizations) {
      await prisma.userOrganization.update({
        where: {
          userId_organizationId: {
            userId: user.id,
            organizationId: userOrg.organizationId
          }
        },
        data: {
          role: role
        }
      });
      migratedCount++;
    }
  }

  console.log(`✅ Migration completed: ${migratedCount} user-organization relationships updated`);
  console.log('');
  console.log('⚠️  IMPORTANT: You can now run the Prisma migration to remove the role column from users table');
}

main()
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
