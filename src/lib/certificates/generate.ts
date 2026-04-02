import React from 'react'
import { renderToBuffer } from '@react-pdf/renderer'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 60,
    fontFamily: 'Helvetica',
  },
  border: {
    border: '3pt solid #1E3A5F',
    padding: 40,
    height: '100%',
  },
  header: {
    textAlign: 'center',
    marginBottom: 30,
  },
  logo: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#6B7280',
    letterSpacing: 2,
  },
  body: {
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 40,
  },
  certifies: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  name: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E3A5F',
    marginBottom: 20,
  },
  completion: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  courseTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 30,
  },
  date: {
    fontSize: 11,
    color: '#6B7280',
    marginBottom: 8,
  },
  footer: {
    textAlign: 'center',
    marginTop: 'auto',
    paddingTop: 20,
    borderTop: '1pt solid #E5E7EB',
  },
  verification: {
    fontSize: 9,
    color: '#9CA3AF',
  },
})

interface CertificateData {
  holderName: string
  courseTitle: string
  issuedAt: Date
  verificationCode: string
  siteUrl: string
}

export function CertificateDocument({ holderName, courseTitle, issuedAt, verificationCode, siteUrl }: CertificateData) {
  const dateStr = issuedAt.toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', orientation: 'landscape', style: styles.page },
      React.createElement(
        View,
        { style: styles.border },
        React.createElement(
          View,
          { style: styles.header },
          React.createElement(Text, { style: styles.logo }, 'IAlgeria'),
          React.createElement(Text, { style: styles.subtitle }, 'CERTIFICAT DE RÉUSSITE')
        ),
        React.createElement(
          View,
          { style: styles.body },
          React.createElement(Text, { style: styles.certifies }, 'Ce certificat est décerné à'),
          React.createElement(Text, { style: styles.name }, holderName),
          React.createElement(Text, { style: styles.completion }, 'pour avoir complété avec succès le cours'),
          React.createElement(Text, { style: styles.courseTitle }, courseTitle),
          React.createElement(Text, { style: styles.date }, `Délivré le ${dateStr}`)
        ),
        React.createElement(
          View,
          { style: styles.footer },
          React.createElement(
            Text,
            { style: styles.verification },
            `Code de vérification : ${verificationCode} — ${siteUrl}/verify/${verificationCode}`
          )
        )
      )
    )
  )
}

export async function generateCertificatePdf(data: CertificateData): Promise<Buffer> {
  const doc = CertificateDocument(data)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return renderToBuffer(doc as any)
}
