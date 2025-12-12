import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const phone = req.headers.get('x-user-phone') || ''
  if (!phone) return NextResponse.json({ authenticated: false })
  return NextResponse.json({ authenticated: true, phone })
}
