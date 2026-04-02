import crypto from 'crypto'

const EXPIRY_HOURS = 4

export function generateSignedVideoUrl(videoId: string): string {
  const libraryId = process.env.BUNNY_STREAM_LIBRARY_ID!
  const signingKey = process.env.BUNNY_SIGNING_KEY!

  const expiresTimestamp = Math.floor(Date.now() / 1000) + EXPIRY_HOURS * 3600
  const hashableBase = `${signingKey}${videoId}${expiresTimestamp}`

  const token = crypto
    .createHash('sha256')
    .update(hashableBase)
    .digest('hex')

  return `https://iframe.mediadelivery.net/embed/${libraryId}/${videoId}?token=${token}&expires=${expiresTimestamp}`
}
