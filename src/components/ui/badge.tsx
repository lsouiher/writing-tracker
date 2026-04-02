import type { HTMLAttributes } from 'react'

type BadgeVariant = 'default' | 'primary' | 'accent' | 'success' | 'warning' | 'error'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant
}

const variantStyles: Record<BadgeVariant, string> = {
  default: 'bg-surface-alt text-foreground',
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  error: 'bg-error/10 text-error',
}

export function Badge({ variant = 'default', className = '', ...props }: BadgeProps) {
  return (
    <span
      className={`inline-block px-2.5 py-1 rounded text-xs font-semibold ${variantStyles[variant]} ${className}`}
      {...props}
    />
  )
}
