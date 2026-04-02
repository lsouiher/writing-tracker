interface ProgressBarProps {
  value: number // 0-100
  label?: string
  size?: 'sm' | 'md'
}

export function ProgressBar({ value, label, size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, value))
  const height = size === 'sm' ? 'h-1.5' : 'h-2'

  return (
    <div>
      {label && (
        <div className="flex justify-between items-center mb-1">
          <span className="text-sm text-muted">{label}</span>
          <span className="text-xs text-text-light">{Math.round(clamped)}%</span>
        </div>
      )}
      <div className={`${height} bg-surface-alt rounded-full overflow-hidden`}>
        <div
          className={`${height} bg-primary rounded-full transition-all duration-300`}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>
    </div>
  )
}
