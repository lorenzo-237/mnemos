import 'dotenv/config';
import { prisma } from '../lib/prisma';
import { hashPassword } from '../lib/auth/password';

async function main() {
  const orgName = process.env.ADMIN_ORG_NAME || 'Ma Organisation';
  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD || 'changeme';

  console.log('🔄 Creating admin user and organization...');

  const org = await prisma.organization.upsert({
    where: { name: orgName },
    create: { name: orgName },
    update: {},
  });

  console.log(`✅ Organization: "${org.name}" (id: ${org.id})`);

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.upsert({
    where: { username },
    create: { username, passwordHash },
    update: { passwordHash },
  });

  console.log(`✅ User: "${user.username}" (id: ${user.id})`);

  await prisma.userOrganization.upsert({
    where: {
      userId_organizationId: {
        userId: user.id,
        organizationId: org.id
      }
    },
    create: { userId: user.id, organizationId: org.id, role: 'ADMIN' },
    update: { role: 'ADMIN' },
  });

  console.log(`✅ User "${username}" linked to organization "${orgName}" with role ADMIN`);
  console.log('');
  console.log('🎉 Admin setup complete!');
  console.log(`   Username: ${username}`);
  console.log(`   Password: ${password}`);
  console.log(`   Organization: ${orgName}`);
}

main()
  .catch((error) => {
    console.error('❌ Error creating admin:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
