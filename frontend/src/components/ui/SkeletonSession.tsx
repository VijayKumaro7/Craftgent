export function SkeletonSession() {
  return (
    <div className="w-full text-left px-2 py-2 border-b border-white/5 animate-pulse">
      <div className="flex items-center justify-between mb-0.5">
        <div className="h-3 bg-white/10 rounded w-16"></div>
        <div className="h-3 bg-white/10 rounded w-12"></div>
      </div>
      <div className="space-y-1 mb-0.5">
        <div className="h-3 bg-white/10 rounded w-full"></div>
        <div className="h-3 bg-white/10 rounded w-4/5"></div>
      </div>
      <div className="h-2 bg-white/10 rounded w-20"></div>
    </div>
  )
}

export function SkeletonSessions({ count = 3 }: { count?: number }) {
  return (
    <div className="max-h-[240px] overflow-y-auto" style={{ scrollbarWidth: 'thin' }}>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonSession key={i} />
      ))}
    </div>
  )
}
