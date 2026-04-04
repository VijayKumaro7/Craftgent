export function SkeletonMessage() {
  return (
    <div className="mb-3 animate-pulse">
      <div className="flex items-center justify-between mb-1">
        <div className="h-4 bg-white/10 rounded w-24"></div>
        <div className="h-3 bg-white/10 rounded w-16"></div>
      </div>
      <div className="space-y-2">
        <div className="h-4 bg-white/10 rounded w-full"></div>
        <div className="h-4 bg-white/10 rounded w-5/6"></div>
        <div className="h-4 bg-white/10 rounded w-4/6"></div>
      </div>
    </div>
  )
}

export function SkeletonMessages({ count = 3 }: { count?: number }) {
  return (
    <div className="px-3 py-2 flex flex-col gap-2">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonMessage key={i} />
      ))}
    </div>
  )
}
