interface PaymentFailedProps {
  userName: string
  siteUrl: string
}

export function renderPaymentFailed({ userName, siteUrl }: PaymentFailedProps): string {
  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #F7F5F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F5F2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden;">
          <tr>
            <td style="background-color: #1B6B4A; padding: 24px 32px;">
              <span style="color: #FFFFFF; font-size: 22px; font-weight: bold;">IAlgeria</span>
              <span style="color: rgba(255,255,255,0.7); font-size: 14px; float: right; margin-top: 4px;">Paiement</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px;">
              <p style="color: #1A1A1A; font-size: 16px; margin: 0 0 24px;">
                ${escapeHtml(userName)}, votre paiement a echoue
              </p>
              <p style="color: #6B6560; font-size: 14px; margin: 0 0 16px;">
                Nous n'avons pas pu traiter votre paiement pour votre abonnement Pro IAlgeria.
              </p>
              <p style="color: #6B6560; font-size: 14px; margin: 0 0 16px;">
                Veuillez mettre a jour votre moyen de paiement dans les 7 jours pour eviter la suspension de votre acces Pro.
                Nous reessaierons automatiquement le paiement.
              </p>
              <p style="color: #6B6560; font-size: 14px; margin: 0 0 32px;">
                Si vous avez des questions, n'hesitez pas a nous contacter.
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding: 8px 0;">
                    <a href="${siteUrl}/dashboard" style="display: inline-block; background-color: #D4652E; color: #FFFFFF; text-decoration: none; padding: 14px 40px; border-radius: 8px; font-weight: 600; font-size: 15px;">
                      Mettre a jour le paiement
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <tr>
            <td style="padding: 24px 32px; background-color: #F7F5F2; border-top: 1px solid #D8D4CF;">
              <p style="color: #9B9590; font-size: 12px; margin: 0; text-align: center;">
                <a href="${siteUrl}" style="color: #1B6B4A;">IAlgeria</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
