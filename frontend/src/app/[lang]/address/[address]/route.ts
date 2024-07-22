import { redirect } from 'next/navigation'
import { NextRequest } from 'next/server'

export function GET(request: NextRequest, { params: { address } }: { params: { address: string } }) {
  return redirect(`/address/${address}/transactions`)
}
