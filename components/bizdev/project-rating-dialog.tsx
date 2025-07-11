'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DetailedRatingsData, BIZDEV_CONSTANTS } from '@/lib/bizdev-types'
import { updateProjectRating } from '@/lib/bizdev-actions'
import { Slider } from '@/components/ui/slider'
import { Star, Calculator, Info } from 'lucide-react'
import React from 'react'

const ratingSchema = z.object({
  revenuePotential: z.object({
    value: z.number().min(0).max(5),
    weight: z.number().min(0).max(1),
  }),
  insiderSupport: z.object({
    value: z.number().min(0).max(5),
    weight: z.number().min(0).max(1),
  }),
  strategicFitEvolve: z.object({
    value: z.number().min(0).max(5),
    weight: z.number().min(0).max(1),
  }),
  strategicFitVerticals: z.object({
    value: z.number().min(0).max(5),
    weight: z.number().min(0).max(1),
  }),
  clarityClient: z.object({
    value: z.number().min(0).max(5),
    weight: z.number().min(0).max(1),
  }),
  clarityUs: z.object({
    value: z.number().min(0).max(5),
    weight: z.number().min(0).max(1),
  }),
  effortPotentialClient: z.object({
    value: z.number().min(0).max(5),
    weight: z.number().min(0).max(1),
  }),
  effortExistingClient: z.object({
    value: z.number().min(0).max(5),
    weight: z.number().min(0).max(1),
  }),
  timingPotentialClient: z.object({
    value: z.number().min(0).max(5),
    weight: z.number().min(0).max(1),
  }),
  runway: z.number().min(0).max(120), // 0-120 months
})

type RatingFormData = z.infer<typeof ratingSchema>

interface ProjectRatingDialogProps {
  projectId: string
  projectName: string
  currentRating?: DetailedRatingsData | null
  trigger?: React.ReactNode
  onUpdate?: () => void
}

export function ProjectRatingDialog({
  projectId,
  projectName,
  currentRating,
  trigger,
  onUpdate
}: ProjectRatingDialogProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [previewCalculation, setPreviewCalculation] = useState<any>(null)

  // Initialize form with current rating or defaults
  const getDefaultValues = (): RatingFormData => {
    if (currentRating) {
      return {
        revenuePotential: {
          value: currentRating.revenuePotential.value ?? 3,
          weight: currentRating.revenuePotential.weight
        },
        insiderSupport: {
          value: currentRating.insiderSupport.value ?? 3,
          weight: currentRating.insiderSupport.weight
        },
        strategicFitEvolve: {
          value: currentRating.strategicFitEvolve.value ?? 3,
          weight: currentRating.strategicFitEvolve.weight
        },
        strategicFitVerticals: {
          value: currentRating.strategicFitVerticals.value ?? 3,
          weight: currentRating.strategicFitVerticals.weight
        },
        clarityClient: {
          value: currentRating.clarityClient.value ?? 3,
          weight: currentRating.clarityClient.weight
        },
        clarityUs: {
          value: currentRating.clarityUs.value ?? 3,
          weight: currentRating.clarityUs.weight
        },
        effortPotentialClient: {
          value: currentRating.effortPotentialClient.value ?? 3,
          weight: currentRating.effortPotentialClient.weight
        },
        effortExistingClient: {
          value: currentRating.effortExistingClient.value ?? 3,
          weight: currentRating.effortExistingClient.weight
        },
        timingPotentialClient: {
          value: currentRating.timingPotentialClient.value ?? 3,
          weight: currentRating.timingPotentialClient.weight
        },
        runway: currentRating.runway,
      }
    }
    
    // Default values using the metrics from constants
    return {
      revenuePotential: { value: 3, weight: BIZDEV_CONSTANTS.RATING_METRICS.revenuePotential.maxWeight },
      insiderSupport: { value: 3, weight: BIZDEV_CONSTANTS.RATING_METRICS.insiderSupport.maxWeight },
      strategicFitEvolve: { value: 3, weight: BIZDEV_CONSTANTS.RATING_METRICS.strategicFitEvolve.maxWeight },
      strategicFitVerticals: { value: 3, weight: BIZDEV_CONSTANTS.RATING_METRICS.strategicFitVerticals.maxWeight },
      clarityClient: { value: 3, weight: BIZDEV_CONSTANTS.RATING_METRICS.clarityClient.maxWeight },
      clarityUs: { value: 3, weight: BIZDEV_CONSTANTS.RATING_METRICS.clarityUs.maxWeight },
      effortPotentialClient: { value: 3, weight: BIZDEV_CONSTANTS.RATING_METRICS.effortPotentialClient.maxWeight },
      effortExistingClient: { value: 3, weight: BIZDEV_CONSTANTS.RATING_METRICS.effortExistingClient.maxWeight },
      timingPotentialClient: { value: 3, weight: BIZDEV_CONSTANTS.RATING_METRICS.timingPotentialClient.maxWeight },
      runway: 12,
    }
  }

  const form = useForm<RatingFormData>({
    resolver: zodResolver(ratingSchema),
    defaultValues: getDefaultValues(),
  })

  // Calculate preview as user changes values
  const calculatePreview = (data: RatingFormData) => {
    const metrics = Object.entries(data).filter(([key]) => key !== 'runway')
    
    let totalWeightedScore = 0
    let totalPossibleScore = 0
    const breakdown: any = {}
    
    for (const [key, metric] of metrics) {
      if (typeof metric === 'object' && metric !== null) {
        const score = metric.value || 0
        const weight = metric.weight || 0
        const contribution = score * weight
        
        totalWeightedScore += contribution
        totalPossibleScore += 5 * weight
        
        breakdown[key] = {
          score,
          weight,
          contribution
        }
      }
    }
    
    const percentage = totalPossibleScore > 0 ? (totalWeightedScore / totalPossibleScore) * 100 : 0
    
    return {
      weighted_score: totalWeightedScore,
      total_possible: totalPossibleScore,
      percentage,
      breakdown,
      starRating: (percentage / 100) * 5
    }
  }

  // Update preview when form values change
  const watchedValues = form.watch()
  React.useEffect(() => {
    setPreviewCalculation(calculatePreview(watchedValues))
  }, [watchedValues])

  const onSubmit = async (data: RatingFormData) => {
    setIsLoading(true)
    try {
      const result = await updateProjectRating(projectId, data as DetailedRatingsData)
      
      if (result.success) {
        setIsOpen(false)
        onUpdate?.()
        form.reset(data)
      } else {
        console.error('Failed to update rating:', result.error)
      }
    } catch (error) {
      console.error('Error updating rating:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const renderMetricField = (
    name: keyof Omit<RatingFormData, 'runway'>,
    label: string,
    description?: string
  ) => {
    const maxWeight = BIZDEV_CONSTANTS.RATING_METRICS[name]?.maxWeight || 0.1
    
    return (
      <Card key={name} className="p-4">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            {label}
            <Badge variant="outline" className="text-xs">
              Max Weight: {(maxWeight * 100).toFixed(0)}%
            </Badge>
          </CardTitle>
          {description && (
            <CardDescription className="text-xs">{description}</CardDescription>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          <FormField
            control={form.control}
            name={`${name}.value`}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs">Score (0-5)</FormLabel>
                  <span className="text-sm font-medium">{field.value}</span>
                </div>
                <FormControl>
                  <Slider
                    min={0}
                    max={5}
                    step={0.1}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name={`${name}.weight`}
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel className="text-xs">Weight (0-{maxWeight})</FormLabel>
                  <span className="text-sm font-medium">{(field.value * 100).toFixed(1)}%</span>
                </div>
                <FormControl>
                  <Slider
                    min={0}
                    max={maxWeight}
                    step={0.01}
                    value={[field.value]}
                    onValueChange={(value) => field.onChange(value[0])}
                    className="w-full"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Star className="h-4 w-4 mr-2" />
            Rate Project
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Rate Project: {projectName}</DialogTitle>
          <DialogDescription>
            Set detailed ratings for each metric to calculate the overall project score.
            Adjust both the score (0-5) and weight for each metric.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Preview Calculation */}
            {previewCalculation && (
              <Card className="bg-blue-50 border-blue-200">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Calculator className="h-4 w-4" />
                    Live Preview
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.floor(previewCalculation.starRating)
                              ? 'fill-yellow-400 text-yellow-400'
                              : i < previewCalculation.starRating
                              ? 'fill-yellow-200 text-yellow-400'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-sm font-medium">
                      {previewCalculation.starRating.toFixed(1)} / 5.0
                    </span>
                    <Badge variant="secondary">
                      {previewCalculation.percentage.toFixed(1)}%
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">
                    Weighted Score: {previewCalculation.weighted_score.toFixed(2)} / {previewCalculation.total_possible.toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Runway Field */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Runway (Months)</CardTitle>
                <CardDescription className="text-xs">
                  Expected timeline for this project in months
                </CardDescription>
              </CardHeader>
              <CardContent>
                <FormField
                  control={form.control}
                  name="runway"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center gap-4">
                        <FormControl>
                          <Input
                            type="number"
                            min={0}
                            max={120}
                            {...field}
                            onChange={(e) => field.onChange(Number(e.target.value))}
                            className="w-24"
                          />
                        </FormControl>
                        <span className="text-sm text-gray-600">months</span>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Rating Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {renderMetricField('revenuePotential', 'Revenue Potential', 'Expected revenue impact')}
              {renderMetricField('insiderSupport', 'Insider Support', 'Internal champion strength')}
              {renderMetricField('strategicFitEvolve', 'Strategic Fit (Evolve)', 'Alignment with Evolve strategy')}
              {renderMetricField('strategicFitVerticals', 'Strategic Fit (Verticals)', 'Vertical market alignment')}
              {renderMetricField('clarityClient', 'Clarity (Client)', 'Client understanding/clarity')}
              {renderMetricField('clarityUs', 'Clarity (Us)', 'Our understanding/clarity')}
              {renderMetricField('effortPotentialClient', 'Effort (Potential Client)', 'Required effort for prospects')}
              {renderMetricField('effortExistingClient', 'Effort (Existing Client)', 'Required effort for existing clients')}
              {renderMetricField('timingPotentialClient', 'Timing (Potential Client)', 'Market timing for prospects')}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : 'Save Rating'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 