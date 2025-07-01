'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Users, 
  Calendar, 
  TrendingUp,
  Mail,
  Building,
  User,
  ArrowRight
} from 'lucide-react'
import { useDebounce } from '@/lib/hooks'
import { ContactBusinessLogic, UtilityLogic } from '@/lib/business-logic'
import { useRouter } from 'next/navigation'

interface SearchResult {
  id: string
  type: 'contact' | 'event' | 'pipeline'
  title: string
  subtitle: string
  description: string
  url: string
  relevance: number
}

interface GlobalSearchProps {
  contacts: any[]
  events: any[]
  pipeline: any[]
}

export function GlobalSearch({ contacts, events, pipeline }: GlobalSearchProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  const router = useRouter()

  useEffect(() => {
    if (debouncedSearchTerm.length < 2) {
      setResults([])
      return
    }

    setIsSearching(true)
    performSearch(debouncedSearchTerm)
    setIsSearching(false)
  }, [debouncedSearchTerm])

  const performSearch = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    const searchResults: SearchResult[] = []

    // Search contacts
    contacts.forEach(contact => {
      const relevance = calculateContactRelevance(contact, lowercaseQuery)
      if (relevance > 0) {
        searchResults.push({
          id: contact.id,
          type: 'contact',
          title: ContactBusinessLogic.getDisplayName(contact),
          subtitle: contact.email,
          description: ContactBusinessLogic.getProfessionalTitle(contact),
          url: `/contacts?id=${contact.id}`,
          relevance
        })
      }
    })

    // Search events
    events.forEach(event => {
      const relevance = calculateEventRelevance(event, lowercaseQuery)
      if (relevance > 0) {
        searchResults.push({
          id: event.id,
          type: 'event',
          title: event.name,
          subtitle: UtilityLogic.formatDate(event.event_date, 'long'),
          description: `${event.event_type}${event.location ? ` at ${event.location}` : ''}`,
          url: `/events/${event.id}`,
          relevance
        })
      }
    })

    // Search pipeline
    pipeline.forEach(item => {
      const relevance = calculatePipelineRelevance(item, lowercaseQuery)
      if (relevance > 0) {
        const contact = item.contacts
        searchResults.push({
          id: item.id.toString(),
          type: 'pipeline',
          title: ContactBusinessLogic.getDisplayName(contact),
          subtitle: `Pipeline: ${item.pipeline_stage}`,
          description: item.next_action_description || 'No next action set',
          url: `/pipeline?id=${item.id}`,
          relevance
        })
      }
    })

    // Sort by relevance and limit results
    const sortedResults = searchResults
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, 10)

    setResults(sortedResults)
  }

  const calculateContactRelevance = (contact: any, query: string): number => {
    let score = 0
    
    // Name matches (highest priority)
    const displayName = ContactBusinessLogic.getDisplayName(contact).toLowerCase()
    if (displayName.includes(query)) score += 100
    
    // Email matches
    if (contact.email.toLowerCase().includes(query)) score += 80
    
    // Company matches
    if (contact.company?.toLowerCase().includes(query)) score += 60
    
    // Job title matches
    if (contact.job_title?.toLowerCase().includes(query)) score += 40
    
    // Contact type matches
    if (contact.contact_type.toLowerCase().includes(query)) score += 30
    
    // Notes matches
    if (contact.general_notes?.toLowerCase().includes(query)) score += 20
    
    return score
  }

  const calculateEventRelevance = (event: any, query: string): number => {
    let score = 0
    
    // Event name matches (highest priority)
    if (event.name.toLowerCase().includes(query)) score += 100
    
    // Event type matches
    if (event.event_type.toLowerCase().includes(query)) score += 80
    
    // Location matches
    if (event.location?.toLowerCase().includes(query)) score += 60
    
    // Description matches
    if (event.description?.toLowerCase().includes(query)) score += 40
    
    // Status matches
    if (event.status?.toLowerCase().includes(query)) score += 30
    
    return score
  }

  const calculatePipelineRelevance = (item: any, query: string): number => {
    let score = 0
    const contact = item.contacts
    
    // Contact name matches
    const displayName = ContactBusinessLogic.getDisplayName(contact).toLowerCase()
    if (displayName.includes(query)) score += 80
    
    // Pipeline stage matches
    if (item.pipeline_stage.toLowerCase().includes(query)) score += 60
    
    // Next action matches
    if (item.next_action_description?.toLowerCase().includes(query)) score += 50
    
    // Company matches
    if (contact.company?.toLowerCase().includes(query)) score += 40
    
    return score
  }

  const handleResultClick = (result: SearchResult) => {
    setIsOpen(false)
    setSearchTerm('')
    setResults([])
    router.push(result.url)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'contact': return <Users className="h-4 w-4" />
      case 'event': return <Calendar className="h-4 w-4" />
      case 'pipeline': return <TrendingUp className="h-4 w-4" />
      default: return <Search className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'contact': return 'text-blue-600'
      case 'event': return 'text-green-600'
      case 'pipeline': return 'text-purple-600'
      default: return 'text-gray-600'
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'contact': return <Badge variant="outline" className="text-blue-600 border-blue-600">Contact</Badge>
      case 'event': return <Badge variant="outline" className="text-green-600 border-green-600">Event</Badge>
      case 'pipeline': return <Badge variant="outline" className="text-purple-600 border-purple-600">Pipeline</Badge>
      default: return <Badge variant="outline">Unknown</Badge>
    }
  }

  // Keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Search className="h-4 w-4 mr-2" />
          Search everything...
          <kbd className="ml-2 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
            <span className="text-xs">⌘</span>K
          </kbd>
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Global Search</DialogTitle>
          <DialogDescription>
            Search across all your contacts, events, and pipeline items
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Type to search contacts, events, pipeline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {/* Search Results */}
          <div className="max-h-96 overflow-y-auto">
            {isSearching && (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">Searching...</div>
              </div>
            )}

            {!isSearching && debouncedSearchTerm.length >= 2 && results.length === 0 && (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">No results found for "{debouncedSearchTerm}"</div>
              </div>
            )}

            {!isSearching && results.length > 0 && (
              <div className="space-y-2">
                {results.map((result) => (
                  <div
                    key={`${result.type}-${result.id}`}
                    onClick={() => handleResultClick(result)}
                    className="flex items-center gap-3 p-3 rounded-lg border hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <div className={`flex-shrink-0 ${getTypeColor(result.type)}`}>
                      {getTypeIcon(result.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium text-gray-900 truncate">
                          {result.title}
                        </h4>
                        {getTypeBadge(result.type)}
                      </div>
                      <p className="text-sm text-gray-600 truncate">
                        {result.subtitle}
                      </p>
                      <p className="text-xs text-gray-500 truncate">
                        {result.description}
                      </p>
                    </div>
                    
                    <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
                  </div>
                ))}
              </div>
            )}

            {debouncedSearchTerm.length < 2 && (
              <div className="space-y-4 py-4">
                <div className="text-sm text-gray-600">
                  Start typing to search across:
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Users className="h-4 w-4 text-blue-600" />
                    <span>Contacts ({contacts.length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <Calendar className="h-4 w-4 text-green-600" />
                    <span>Events ({events.length})</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <TrendingUp className="h-4 w-4 text-purple-600" />
                    <span>Pipeline ({pipeline.length})</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Help Text */}
          <div className="text-xs text-gray-500 border-t pt-3">
            <kbd className="text-[10px]">Enter</kbd> to select • <kbd className="text-[10px]">Esc</kbd> to close • <kbd className="text-[10px]">⌘K</kbd> to open search
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
} 