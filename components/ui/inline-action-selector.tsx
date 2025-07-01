'use client'

import { useState } from 'react'
import { Input } from './input'
import { Button } from './button'
import { FOLLOW_UP_ACTIONS } from '@/lib/constants'
import { ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuLabel
} from '@/components/ui/dropdown-menu'

interface InlineActionSelectorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
}

export function InlineActionSelector({ 
  value, 
  onChange, 
  placeholder = "Enter next action...",
  className = ""
}: InlineActionSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)

  const handleActionSelect = (action: string) => {
    onChange(action)
    setIsOpen(false)
  }

  return (
    <div className={`relative flex gap-1 ${className}`}>
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="flex-1 text-sm"
      />
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            size="sm" 
            className="px-2"
            type="button"
          >
            <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          {Object.entries(FOLLOW_UP_ACTIONS).map(([categoryKey, category]) => (
            <div key={categoryKey}>
              <DropdownMenuLabel className="text-xs font-medium text-gray-500">
                {category.label}
              </DropdownMenuLabel>
              {category.actions.map((action) => (
                <DropdownMenuItem
                  key={action}
                  onClick={() => handleActionSelect(action)}
                  className="text-sm cursor-pointer"
                >
                  {action}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </div>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
} 