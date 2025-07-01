import { cn } from '@/lib/utils'

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-muted", className)}
      {...props}
    />
  )
}

/**
 * Table skeleton for loading states
 */
function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  showHeader = true 
}: { 
  rows?: number
  columns?: number
  showHeader?: boolean 
}) {
  return (
    <div className="w-full">
      {/* Header skeleton */}
      {showHeader && (
        <div className="flex space-x-4 p-4 border-b">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
      )}
      
      {/* Rows skeleton */}
      <div className="space-y-3 p-4">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex space-x-4">
            {Array.from({ length: columns }).map((_, j) => (
              <Skeleton key={j} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * Card skeleton for loading states
 */
function CardSkeleton() {
  return (
    <div className="p-6 border rounded-lg space-y-4">
      <div className="space-y-2">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-4 w-[200px]" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-[150px]" />
      </div>
    </div>
  )
}

/**
 * Contact card skeleton
 */
function ContactCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex items-center space-x-3">
        <Skeleton className="h-10 w-10 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-[150px]" />
          <Skeleton className="h-3 w-[100px]" />
        </div>
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[80%]" />
      </div>
      <div className="flex justify-between">
        <Skeleton className="h-6 w-16 rounded-full" />
        <Skeleton className="h-8 w-20" />
      </div>
    </div>
  )
}

/**
 * Event card skeleton
 */
function EventCardSkeleton() {
  return (
    <div className="p-4 border rounded-lg space-y-3">
      <div className="flex justify-between items-start">
        <div className="space-y-2">
          <Skeleton className="h-5 w-[200px]" />
          <Skeleton className="h-4 w-[150px]" />
        </div>
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      <div className="space-y-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-[70%]" />
      </div>
      <div className="flex justify-between items-center">
        <Skeleton className="h-4 w-[100px]" />
        <div className="flex space-x-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  )
}

/**
 * Dashboard stats skeleton
 */
function DashboardStatsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-6 border rounded-lg space-y-3">
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-[100px]" />
            <Skeleton className="h-4 w-4" />
          </div>
          <Skeleton className="h-8 w-[60px]" />
          <Skeleton className="h-3 w-[80px]" />
        </div>
      ))}
    </div>
  )
}

/**
 * Navigation skeleton
 */
function NavigationSkeleton() {
  return (
    <div className="flex space-x-6 p-4">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-6 w-[80px]" />
      ))}
    </div>
  )
}

/**
 * Page header skeleton
 */
function PageHeaderSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <Skeleton className="h-8 w-[200px]" />
          <Skeleton className="h-4 w-[300px]" />
        </div>
        <Skeleton className="h-10 w-[120px]" />
      </div>
    </div>
  )
}

/**
 * Full page loading skeleton
 */
function PageSkeleton() {
  return (
    <div className="space-y-6">
      <PageHeaderSkeleton />
      <CardSkeleton />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}

/**
 * Loading spinner
 */
function LoadingSpinner({ 
  size = 'md',
  className = '' 
}: { 
  size?: 'sm' | 'md' | 'lg'
  className?: string 
}) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
  }

  return (
    <div className={cn('flex justify-center items-center', className)}>
      <div 
        className={cn(
          'animate-spin rounded-full border-2 border-gray-300 border-t-blue-600',
          sizeClasses[size]
        )}
      />
    </div>
  )
}

/**
 * Loading overlay
 */
function LoadingOverlay({ 
  message = 'Loading...',
  className = '' 
}: { 
  message?: string
  className?: string 
}) {
  return (
    <div className={cn(
      'absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50',
      className
    )}>
      <div className="flex flex-col items-center space-y-3">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-gray-600">{message}</p>
      </div>
    </div>
  )
}

/**
 * Shimmer effect for enhanced loading appearance
 */
function ShimmerSkeleton({ 
  className,
  ...props 
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-gray-200",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2s_infinite] before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className
      )}
      style={{
        '--shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)'
      } as React.CSSProperties}
      {...props}
    />
  )
}

export {
  Skeleton,
  TableSkeleton,
  CardSkeleton,
  ContactCardSkeleton,
  EventCardSkeleton,
  DashboardStatsSkeleton,
  NavigationSkeleton,
  PageHeaderSkeleton,
  PageSkeleton,
  LoadingSpinner,
  LoadingOverlay,
  ShimmerSkeleton
} 