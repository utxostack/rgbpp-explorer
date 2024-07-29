import { env } from '@/constants/env'

export function resolveMempool(key: string, type: 'tx') {
  return `${env.public.MEMPOOL_URL}/${type}/${key}`
}
