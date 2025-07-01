'use client'

import { useState } from 'react'
import { Badge } from './badge'
import { Input } from './input'
import { Label } from './label'
import { FOLLOW_UP_ACTIONS } from '@/lib/constants'
import { ChevronDown, ChevronRight } from 'lucide-react'

interface ActionSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function ActionSelector({ 
  value, 
  onChange, 
  placeholder = "Enter custom action or select from suggestions below...",
  className = ""
}: ActionSelectorProps) {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
    'initial-outreach': true,
    'forming-relationship': false,
    'maintaining-relationship': false
  })

  const toggleCategory = (categoryKey: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryKey]: !prev[categoryKey]
    }))
  }

  const handleChipClick = (action: string) => {
    onChange(action)
  }

  const handleManualInput = (inputValue: string) => {
    onChange(inputValue)
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Manual Input */}
      <div>
        <Input
          value={value}
          onChange={(e) => handleManualInput(e.target.value)}
          placeholder={placeholder}
          className="w-full"
        />
      </div>

      {/* Action Categories */}
      <div className="space-y-3">
        <Label className="text-sm font-medium text-gray-700">
          Quick Actions (click to select):
        </Label>
        
        {Object.entries(FOLLOW_UP_ACTIONS).map(([categoryKey, category]) => (
          <div key={categoryKey} className="border rounded-lg p-3 bg-gray-50">
            {/* Category Header */}
            <button
              type="button"
              onClick={() => toggleCategory(categoryKey)}
              className="flex items-center justify-between w-full text-left"
            >
              <span className="font-medium text-sm text-gray-800">
                {category.label}
              </span>
              {expandedCategories[categoryKey] ? (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-500" />
              )}
            </button>

            {/* Action Chips */}
            {expandedCategories[categoryKey] && (
              <div className="flex flex-wrap gap-2 mt-3">
                {category.actions.map((action) => (
                  <Badge
                    key={action}
                    variant={value === action ? "default" : "outline"}
                    className="cursor-pointer hover:bg-blue-100 hover:border-blue-300 transition-colors"
                    onClick={() => handleChipClick(action)}
                  >
                    {action}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
} 