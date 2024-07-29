import { env } from '@/constants/env'

export function resolveCkbExplorerUrl(key: string, type: 'transaction' | 'address' | 'block') {
  return `${env.public.CKB_EXPLORER_URL}/${type}/${key}`
}
