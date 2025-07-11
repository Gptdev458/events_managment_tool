import type { 
  DetailedRatingsData
} from './database.types'
import type {
  RatingCalculationResult
} from './bizdev-types'

// Helper function to calculate weighted rating
export function calculateProjectRating(detailedRatings: DetailedRatingsData): RatingCalculationResult {
  // Validate input
  if (!detailedRatings || typeof detailedRatings !== 'object') {
    throw new Error('Invalid rating data provided')
  }

  const metrics = Object.entries(detailedRatings).filter(([key]) => key !== 'runway')
  
  let totalWeightedScore = 0
  let totalPossibleScore = 0
  const breakdown: RatingCalculationResult['breakdown'] = {}
  
  for (const [key, metric] of metrics) {
    if (typeof metric === 'object' && metric !== null && 'value' in metric && 'weight' in metric) {
      // Validate metric values
      const score = Math.max(0, Math.min(5, metric.value ?? 0)) // Clamp between 0-5
      const weight = Math.max(0, Math.min(1, metric.weight ?? 0)) // Clamp between 0-1
      
      const contribution = score * weight
      
      totalWeightedScore += contribution
      totalPossibleScore += 5 * weight // Max rating is 5
      
      breakdown[key] = {
        score,
        weight,
        contribution
      }
    }
  }
  
  // Ensure we don't divide by zero
  const percentage = totalPossibleScore > 0 ? (totalWeightedScore / totalPossibleScore) * 100 : 0
  
  return {
    weighted_score: Math.round(totalWeightedScore * 100) / 100, // Round to 2 decimal places
    total_possible: Math.round(totalPossibleScore * 100) / 100,
    percentage: Math.round(percentage * 100) / 100,
    breakdown
  }
} 