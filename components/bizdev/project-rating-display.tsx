'use client'

import { DetailedRatingsData, RatingCalculationResult, BIZDEV_CONSTANTS } from '@/lib/bizdev-types'
import { calculateProjectRating } from '@/lib/rating-utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Star, TrendingUp, BarChart3, Clock } from 'lucide-react'

interface ProjectRatingDisplayProps {
  rating?: DetailedRatingsData | null
  className?: string
  showBreakdown?: boolean
  showRunway?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function ProjectRatingDisplay({
  rating,
  className = '',
  showBreakdown = false,
  showRunway = true,
  size = 'md'
}: ProjectRatingDisplayProps) {
  if (!rating) {
    return (
      <div className={`flex items-center gap-2 text-gray-400 ${className}`}>
        <Star className="h-4 w-4" />
        <span className="text-sm">Not rated</span>
      </div>
    )
  }

  const calculation = calculateProjectRating(rating)
  const starRating = (calculation.percentage / 100) * 5

  const StarRating = ({ rating, size }: { rating: number; size: 'sm' | 'md' | 'lg' }) => {
    const iconSize = size === 'sm' ? 'h-3 w-3' : size === 'md' ? 'h-4 w-4' : 'h-5 w-5'
    
    return (
      <div className="flex items-center gap-1">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`${iconSize} ${
              i < Math.floor(rating)
                ? 'fill-yellow-400 text-yellow-400'
                : i < rating
                ? 'fill-yellow-200 text-yellow-400'
                : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const getContributionColor = (contribution: number) => {
    if (contribution >= 1.0) return 'bg-green-100 text-green-800'
    if (contribution >= 0.5) return 'bg-yellow-100 text-yellow-800'
    if (contribution >= 0.2) return 'bg-orange-100 text-orange-800'
    return 'bg-red-100 text-red-800'
  }

  if (!showBreakdown) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <StarRating rating={starRating} size={size} />
        <div className="flex items-center gap-1">
          <span className={`font-medium ${size === 'sm' ? 'text-sm' : size === 'md' ? 'text-base' : 'text-lg'}`}>
            {starRating.toFixed(1)}
          </span>
          <Badge variant="outline" className={size === 'sm' ? 'text-xs' : 'text-sm'}>
            {calculation.percentage.toFixed(0)}%
          </Badge>
          {showRunway && (
            <div className="flex items-center gap-1 text-gray-600">
              <Clock className="h-3 w-3" />
              <span className="text-xs">{rating.runway}m</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Rating Breakdown
          </CardTitle>
          <div className="flex items-center gap-2">
            <StarRating rating={starRating} size="md" />
            <Badge variant="secondary">
              {starRating.toFixed(1)} / 5.0
            </Badge>
          </div>
        </div>
        <CardDescription className="text-xs">
          Overall Score: {calculation.weighted_score.toFixed(2)} / {calculation.total_possible.toFixed(2)} ({calculation.percentage.toFixed(1)}%)
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-3">
        {/* Runway Display */}
        {showRunway && (
          <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium">Project Runway</span>
            </div>
            <Badge variant="outline" className="bg-white">
              {rating.runway} months
            </Badge>
          </div>
        )}

        {/* Metrics Breakdown */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Metrics Contribution</h4>
          {Object.entries(calculation.breakdown).map(([key, metric]) => {
            const metricInfo = BIZDEV_CONSTANTS.RATING_METRICS[key as keyof typeof BIZDEV_CONSTANTS.RATING_METRICS]
            const label = metricInfo?.label || key
            const contribution = metric.contribution
            const percentage = calculation.total_possible > 0 ? (contribution / calculation.total_possible) * 100 : 0
            
            return (
              <div key={key} className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium">{label}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-600">
                      {metric.score.toFixed(1)} × {(metric.weight * 100).toFixed(0)}%
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getContributionColor(contribution)}`}
                    >
                      {contribution.toFixed(2)}
                    </Badge>
                  </div>
                </div>
                
                {/* Progress bar */}
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300" 
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-3 pt-3 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">
              {calculation.percentage.toFixed(0)}%
            </div>
            <div className="text-xs text-gray-600">Overall Score</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {Object.keys(calculation.breakdown).length}
            </div>
            <div className="text-xs text-gray-600">Metrics Rated</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// Compact version for table cells - shows only numerical rating with 2 decimals
export function ProjectRatingCompact({
  rating,
  className = ''
}: {
  rating?: DetailedRatingsData | null
  className?: string
}) {
  if (!rating) {
    return (
      <div className={`text-gray-400 text-sm ${className}`}>
        <span>Not rated</span>
      </div>
    )
  }

  const calculation = calculateProjectRating(rating)
  const starRating = (calculation.percentage / 100) * 5

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <span className="font-medium text-sm">
        {starRating.toFixed(2)}
      </span>
      <Badge variant="outline" className="text-xs">
        {calculation.percentage.toFixed(0)}%
      </Badge>
    </div>
  )
}

// Detailed version with all metrics
export function ProjectRatingDetailed({
  rating,
  className = ''
}: {
  rating?: DetailedRatingsData | null
  className?: string
}) {
  return (
    <ProjectRatingDisplay
      rating={rating}
      className={className}
      showBreakdown={true}
      showRunway={true}
      size="md"
    />
  )
} 