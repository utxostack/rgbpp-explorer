import { PrismaClient } from '@prisma/client';
import { envSchema } from '../src/env';
import {
  DOB_TYPESCRIPTS,
  MNFT_TYPESCRIPTS,
  SUDT_TYPESCRIPTS,
  XUDT_TYPESCRIPTS,
} from '../src/constants';

const env = envSchema.parse(process.env);
const network = env.NETWORK;

const prisma = new PrismaClient();

const assetTypeScripts = [
  XUDT_TYPESCRIPTS,
  SUDT_TYPESCRIPTS,
  DOB_TYPESCRIPTS,
  MNFT_TYPESCRIPTS,
].flatMap((scripts) => scripts[network]);

async function main() {
  await prisma.chain.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: 'CKB',
      ws: 'https://cota-testnet.nervina.dev/wsckbnode',
      startBlock: 0,
    },
  });

  for (const script of assetTypeScripts) {
    await prisma.assetType.create({
      data: {
        chainId: 1,
        codeHash: script.codeHash,
        hashType: script.hashType,
      },
    });
  }
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
