import { PrismaClient } from '@prisma/client';
import { envSchema } from '../src/env';
import {
  CKB_CHAIN_ID,
  DOB_TYPESCRIPTS,
  MNFT_TYPESCRIPTS,
  SUDT_TYPESCRIPTS,
  XUDT_TYPESCRIPTS,
} from '../src/constants';

const env = envSchema.parse(process.env);
const network = env.NETWORK;

const prisma = new PrismaClient();

const NON_FUNGIBLE_ASSET_TYPE_SCRIPTS = [DOB_TYPESCRIPTS, MNFT_TYPESCRIPTS].flatMap(
  (scripts) => scripts[network],
);

const FUNGIBLE_ASSET_TYPE_SCRIPTS = [XUDT_TYPESCRIPTS, SUDT_TYPESCRIPTS].flatMap(
  (scripts) => scripts[network],
);

async function main() {
  await prisma.chain.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: CKB_CHAIN_ID,
      name: 'CKB',
      ws: env.CKB_RPC_WEBSOCKET_URL,
      startBlock: 0,
    },
  });

  for (const script of [...NON_FUNGIBLE_ASSET_TYPE_SCRIPTS, ...FUNGIBLE_ASSET_TYPE_SCRIPTS]) {
    await prisma.assetType.create({
      data: {
        chainId: 1,
        codeHash: script.codeHash,
        hashType: script.hashType,
        fungible: FUNGIBLE_ASSET_TYPE_SCRIPTS.some((s) => s.codeHash === script.codeHash),
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
