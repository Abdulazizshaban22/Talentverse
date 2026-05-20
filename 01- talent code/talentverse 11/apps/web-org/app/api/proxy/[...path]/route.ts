
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

const API_BASE = process.env.API_BASE || 'http://localhost:8000'

export async function GET(req: NextRequest, { params }: { params: { path: string[] } }) {
  const token = await getToken({ req })
  const url = `${API_BASE}/${params.path.join('/')}${req.nextUrl.search}`
  const res = await fetch(url, { headers: { 'Authorization': token ? `Bearer ${token.access_token || token.id_token || ''}` : '' } })
  const data = await res.text()
  return new NextResponse(data, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } })
}

export async function POST(req: NextRequest, { params }: { params: { path: string[] } }) {
  const token = await getToken({ req })
  const url = `${API_BASE}/${params.path.join('/')}${req.nextUrl.search}`
  const body = await req.arrayBuffer()
  const res = await fetch(url, { method: 'POST', body, headers: { 'Authorization': token ? `Bearer ${token.access_token || token.id_token || ''}` : '', 'content-type': req.headers.get('content-type') || 'application/json' } })
  const data = await res.text()
  return new NextResponse(data, { status: res.status, headers: { 'content-type': res.headers.get('content-type') || 'application/json' } })
}
