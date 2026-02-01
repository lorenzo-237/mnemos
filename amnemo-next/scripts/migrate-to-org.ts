import 'dotenv/config';
import { prisma } from '../lib/prisma';

async function main() {
  console.log('🔄 Starting data migration to default organization...');

  const defaultOrg = await prisma.organization.upsert({
    where: { name: 'Organisation par défaut' },
    create: { name: 'Organisation par défaut' },
    update: {},
  });

  console.log(`✅ Default organization created/found: "${defaultOrg.name}" (id: ${defaultOrg.id})`);

  const updateQueries = [
    prisma.folder.updateMany({
      where: { organizationId: null },
      data: { organizationId: defaultOrg.id }
    }),
    prisma.tag.updateMany({
      where: { organizationId: null },
      data: { organizationId: defaultOrg.id }
    }),
    prisma.site.updateMany({
      where: { organizationId: null },
      data: { organizationId: defaultOrg.id }
    }),
    prisma.task.updateMany({
      where: { organizationId: null },
      data: { organizationId: defaultOrg.id }
    }),
    prisma.software.updateMany({
      where: { organizationId: null },
      data: { organizationId: defaultOrg.id }
    }),
    prisma.updateSession.updateMany({
      where: { organizationId: null },
      data: { organizationId: defaultOrg.id }
    }),
  ];

  console.log('🔄 Updating entities...');
  const results = await prisma.$transaction(updateQueries);

  console.log(`✅ Migration completed:`);
  console.log(`   - Folders: ${results[0].count}`);
  console.log(`   - Tags: ${results[1].count}`);
  console.log(`   - Sites: ${results[2].count}`);
  console.log(`   - Tasks: ${results[3].count}`);
  console.log(`   - Softwares: ${results[4].count}`);
  console.log(`   - UpdateSessions: ${results[5].count}`);
  console.log(`\n✅ All entities associated with "${defaultOrg.name}"`);
}

main()
  .catch((error) => {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
