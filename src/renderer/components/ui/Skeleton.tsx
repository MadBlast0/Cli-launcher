export function Skeleton({ className = '' }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />
}

/** A placeholder row that mirrors the CliCard layout while states load. */
export function CliCardSkeleton({ delay = 0 }: { delay?: number }) {
  return (
    <div className="mac-card flex items-center gap-2 pl-2 pr-2 py-2 anim-stagger-in" style={{ animationDelay: `${delay}ms` }} aria-hidden="true">
      <Skeleton className="w-3.5 h-4" />
      <Skeleton className="w-9 h-9 rounded-[6px]" />
      <div className="flex flex-col gap-1.5 flex-1 min-w-0">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-2.5 w-20" />
      </div>
      <Skeleton className="h-7 w-9" />
      <Skeleton className="h-7 w-16" />
      <Skeleton className="h-7 w-14" />
    </div>
  )
}
