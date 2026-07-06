import { cn } from '@/lib/utils'

export function StallIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* awning */}
      <path
        d="M3 9 L5 4 H27 L29 9 Z"
        fill="currentColor"
        className="text-primary"
      />
      <path d="M9 4 L8 9 M16 4 L16 9 M23 4 L24 9" stroke="var(--background)" strokeWidth="1.5" />
      {/* posts */}
      <rect x="5" y="9" width="1.6" height="19" fill="currentColor" className="text-primary" />
      <rect x="25.4" y="9" width="1.6" height="19" fill="currentColor" className="text-primary" />
      {/* counter */}
      <rect x="7" y="20" width="18" height="8" fill="currentColor" className="text-primary/80" />
      <rect x="7" y="20" width="18" height="2" fill="currentColor" className="text-primary" />
    </svg>
  )
}

export function Logo({
  className,
  showTagline = true,
  size = 'md',
}: {
  className?: string
  showTagline?: boolean
  size?: 'sm' | 'md'
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <StallIcon className={size === 'sm' ? 'h-6 w-6' : 'h-9 w-9'} />
      <div className="flex flex-col leading-none">
        <span
          className={cn(
            'font-extrabold tracking-tight text-foreground',
            size === 'sm' ? 'text-base' : 'text-xl',
          )}
        >
ORANJE<span className="text-primary">MARKT</span>
        </span>
        {showTagline && (
          <span className="mt-1 hidden text-[10px] font-medium tracking-widest text-muted-foreground sm:block">
            DE DIGITALE BAZAAR VAN NEDERLAND
          </span>
        )}
      </div>
    </div>
  )
}
