import { PrismaClient } from '@prisma/client';
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {

  const userRole = await prisma.role.upsert({
    where: { name: 'USER' },
    update: {},
    create: { name: 'USER' },
  });

  const managerRole = await prisma.role.upsert({
    where: { name: 'MANAGER' },
    update: {},
    create: { name: 'MANAGER' },
  });

  const supportRole = await prisma.role.upsert({
    where: { name: 'SUPPORT' },
    update: {},
    create: { name: 'SUPPORT' },
  });

  // Create a user

  const hashedPassword = await bcrypt.hash('password123', 10);
  const user = await prisma.user.upsert({
    where: { email: 'rana@example.com' },
    update: {
      name: 'Rana',
      password: hashedPassword,
      roleId: managerRole.id,
    },
    create: {
      name: 'Rana',
      email: 'rana@example.com',
      password: hashedPassword,
      roleId: managerRole.id,
    },
  });

  console.log('Created user:', user);
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());