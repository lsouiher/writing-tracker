import { getServiceClient } from '@/lib/supabase/service'
import { NextRequest, NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'

function verifyUnsubscribeToken(uid: string, token: string): boolean {
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret) return false
  const expected = createHmac('sha256', secret).update(uid).digest('hex')
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid')
  const token = request.nextUrl.searchParams.get('token')

  if (!uid || !token || !verifyUnsubscribeToken(uid, token)) {
    return new NextResponse(renderPage('Lien invalide', 'Le lien de désabonnement est invalide.', false), {
      status: 400,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  const supabase = getServiceClient()
  const { error } = await supabase
    .from('users')
    .update({ email_opt_out: true })
    .eq('id', uid)

  if (error) {
    return new NextResponse(renderPage('Erreur', 'Une erreur est survenue. Veuillez réessayer.', false), {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    })
  }

  return new NextResponse(
    renderPage('Désabonnement confirmé', 'Vous ne recevrez plus d\'emails marketing de IAlgeria.', true),
    { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
  )
}

// One-click unsubscribe via POST (RFC 8058)
export async function POST(request: NextRequest) {
  const uid = request.nextUrl.searchParams.get('uid')
  const token = request.nextUrl.searchParams.get('token')

  if (!uid || !token || !verifyUnsubscribeToken(uid, token)) {
    return NextResponse.json({ error: 'Invalid unsubscribe link' }, { status: 400 })
  }

  const supabase = getServiceClient()
  await supabase.from('users').update({ email_opt_out: true }).eq('id', uid)

  return NextResponse.json({ unsubscribed: true })
}

function renderPage(title: string, message: string, success: boolean): string {
  const color = success ? '#1B6B4A' : '#D4652E'
  return `<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>${title} — IAlgeria</title></head>
<body style="margin:0;padding:0;background:#F7F5F2;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;">
  <div style="background:#fff;border-radius:12px;padding:48px;max-width:480px;text-align:center;box-shadow:0 2px 8px rgba(0,0,0,0.08);">
    <h1 style="color:${color};font-size:24px;margin:0 0 16px;">${title}</h1>
    <p style="color:#6B6560;font-size:16px;margin:0 0 24px;">${message}</p>
    <a href="/" style="color:#1B6B4A;text-decoration:none;font-size:14px;">Retour à IAlgeria</a>
  </div>
</body>
</html>`
}
