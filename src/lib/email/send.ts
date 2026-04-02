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
}

export async function sendEmail({ to, subject, html }: SendEmailParams) {
  const resend = getResend()

  try {
    const { data, error } = await resend.emails.send({
      from: 'IAlgeria <noreply@ialgeria.com>',
      to,
      subject,
      html,
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
