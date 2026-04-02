import Link from 'next/link'
import { Card, CardBody, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { CourseLevel } from '@/types/domain'

interface CourseCardProps {
  slug: string
  title: string
  description: string
  level: CourseLevel
  durationMinutes: number
  thumbnailUrl: string
  moduleCount: number
  lessonCount: number
}

const levelLabels: Record<CourseLevel, string> = {
  beginner: 'Debutant',
  intermediate: 'Intermediaire',
  advanced: 'Avance',
}

const levelVariants: Record<CourseLevel, 'primary' | 'accent' | 'default'> = {
  beginner: 'primary',
  intermediate: 'accent',
  advanced: 'default',
}

export function CourseCard({
  slug, title, description, level, durationMinutes, thumbnailUrl, moduleCount, lessonCount,
}: CourseCardProps) {
  return (
    <Link href={`/courses/${slug}`}>
      <Card hover>
        <div
          className="h-44 bg-surface-alt bg-cover bg-center"
          style={thumbnailUrl ? { backgroundImage: `url(${thumbnailUrl})` } : undefined}
        />
        <CardBody>
          <Badge variant={levelVariants[level]} className="mb-3">
            {levelLabels[level]}
          </Badge>
          <h3 className="font-display text-xl mb-2 line-clamp-2">{title}</h3>
          <p className="text-sm text-muted line-clamp-2">{description}</p>
        </CardBody>
        <CardFooter className="flex justify-between items-center">
          <span className="text-sm font-semibold text-primary">Gratuit</span>
          <span className="text-xs text-text-light">
            {moduleCount} modules &middot; {Math.round(durationMinutes / 60)}h
          </span>
        </CardFooter>
      </Card>
    </Link>
  )
}
