import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.chain.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'CKB',
      ws: 'https://cota-testnet.nervina.dev/wsckbnode',
      startBlock: 13764300,
    },
  });
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
