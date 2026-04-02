import type { HTMLAttributes } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({ hover = false, className = '', children, ...props }: CardProps) {
  return (
    <div
      className={`bg-surface rounded-xl border border-border overflow-hidden ${hover ? 'transition-all hover:-translate-y-1 hover:shadow-lg' : ''} ${className}`}
      {...props}
    >
      {children}
    </div>
  )
}

export function CardBody({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  )
}

export function CardFooter({ className = '', children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`px-6 py-4 border-t border-border ${className}`} {...props}>
      {children}
    </div>
  )
}
