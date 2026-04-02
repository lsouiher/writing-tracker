import type { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://ialgeria.com'
  const supabase = await createClient()

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/courses`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
    { url: `${baseUrl}/pricing`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/teams`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  // Dynamic course pages
  const { data: courses } = await supabase
    .from('courses')
    .select('slug, updated_at')
    .eq('is_published', true)

  const coursePages: MetadataRoute.Sitemap = (courses || []).map((course) => ({
    url: `${baseUrl}/courses/${course.slug}`,
    lastModified: new Date(course.updated_at),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [...staticPages, ...coursePages]
}
