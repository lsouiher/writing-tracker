import { Resend } from 'resend'

let resendInstance: Resend | null = null

function getResend(): Resend {
  if (!resendInstance) {
    resendInstance = new Resend(process.env.RESEND_API_KEY)
  }
  return resendInstance
}

interface SendEmailParams {
  to: string
  subject: string
  html: string
  unsubscribeUrl?: string
}

export async function sendEmail({ to, subject, html, unsubscribeUrl }: SendEmailParams) {
  const resend = getResend()

  try {
    const headers: Record<string, string> = {}
    if (unsubscribeUrl) {
      headers['List-Unsubscribe'] = `<${unsubscribeUrl}>`
      headers['List-Unsubscribe-Post'] = 'List-Unsubscribe=One-Click'
    }

    const { data, error } = await resend.emails.send({
      from: 'IAlgeria <noreply@ialgeria.com>',
      to,
      subject,
      html,
      headers,
    })

    if (error) {
      console.error('Email send error:', error)
      return null
    }

    return data
  } catch (err) {
    console.error('Email send failed:', err)
    return null
  }
}

export function buildUnsubscribeUrl(userId: string): string {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ialgeria.com'
  const secret = process.env.UNSUBSCRIBE_SECRET
  if (!secret) throw new Error('UNSUBSCRIBE_SECRET environment variable is required')
  const { createHmac } = require('crypto') as typeof import('crypto')
  const token = createHmac('sha256', secret).update(userId).digest('hex')
  return `${baseUrl}/api/user/unsubscribe?token=${token}&uid=${userId}`
}
