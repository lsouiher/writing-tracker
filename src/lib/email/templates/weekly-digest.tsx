interface DigestPost {
  title: string
  author_name: string
  upvote_count: number
  reply_count: number
  course_title: string
  url: string
}

interface DigestCourse {
  title: string
  level: string
  url: string
}

interface WeeklyDigestProps {
  userName: string
  topPosts: DigestPost[]
  newCourses: DigestCourse[]
  siteUrl: string
  unsubscribeUrl: string
}

export function renderWeeklyDigest({
  userName,
  topPosts,
  newCourses,
  siteUrl,
  unsubscribeUrl,
}: WeeklyDigestProps): string {
  const postsHtml = topPosts
    .map(
      (post) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDEAE6;">
          <a href="${post.url}" style="color: #1B6B4A; text-decoration: none; font-weight: 500; font-size: 15px;">
            ${escapeHtml(post.title)}
          </a>
          <div style="color: #6B6560; font-size: 13px; margin-top: 4px;">
            ${escapeHtml(post.author_name)} · ${post.upvote_count} vote${post.upvote_count !== 1 ? 's' : ''} · ${post.reply_count} réponse${post.reply_count !== 1 ? 's' : ''} · ${escapeHtml(post.course_title)}
          </div>
        </td>
      </tr>`
    )
    .join('')

  const coursesHtml = newCourses
    .map(
      (course) => `
      <tr>
        <td style="padding: 12px 0; border-bottom: 1px solid #EDEAE6;">
          <a href="${course.url}" style="color: #1B6B4A; text-decoration: none; font-weight: 500; font-size: 15px;">
            ${escapeHtml(course.title)}
          </a>
          <div style="color: #6B6560; font-size: 13px; margin-top: 4px;">
            Niveau : ${course.level === 'beginner' ? 'Débutant' : course.level === 'intermediate' ? 'Intermédiaire' : 'Avancé'}
          </div>
        </td>
      </tr>`
    )
    .join('')

  return `
<!DOCTYPE html>
<html lang="fr">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin: 0; padding: 0; background-color: #F7F5F2; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #F7F5F2; padding: 32px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden;">
          <!-- Header -->
          <tr>
            <td style="background-color: #1B6B4A; padding: 24px 32px;">
              <span style="color: #FFFFFF; font-size: 22px; font-weight: bold;">IAlgeria</span>
              <span style="color: rgba(255,255,255,0.7); font-size: 14px; float: right; margin-top: 4px;">Digest hebdomadaire</span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 32px;">
              <p style="color: #1A1A1A; font-size: 16px; margin: 0 0 24px;">
                Bonjour ${escapeHtml(userName)},
              </p>
              <p style="color: #6B6560; font-size: 14px; margin: 0 0 24px;">
                Voici les discussions les plus populaires et les nouveautés de la semaine.
              </p>

              ${topPosts.length > 0 ? `
              <h2 style="color: #1A1A1A; font-size: 18px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #1B6B4A;">
                Discussions populaires
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                ${postsHtml}
              </table>` : ''}

              ${newCourses.length > 0 ? `
              <h2 style="color: #1A1A1A; font-size: 18px; margin: 0 0 12px; padding-bottom: 8px; border-bottom: 2px solid #D4652E;">
                Nouveaux cours
              </h2>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 32px;">
                ${coursesHtml}
              </table>` : ''}

              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-top: 16px;">
                    <a href="${siteUrl}/courses" style="display: inline-block; background-color: #D4652E; color: #FFFFFF; text-decoration: none; padding: 12px 32px; border-radius: 8px; font-weight: 500; font-size: 14px;">
                      Explorer la plateforme
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 24px 32px; background-color: #F7F5F2; border-top: 1px solid #D8D4CF;">
              <p style="color: #9B9590; font-size: 12px; margin: 0; text-align: center;">
                Vous recevez cet email car vous êtes inscrit sur IAlgeria.<br>
                <a href="${unsubscribeUrl}" style="color: #1B6B4A;">Se désabonner en un clic</a>
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
