'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs"
import { 
  User, 
  BarChart3, 
  Heart, 
  ArrowRight, 
  Calendar,
  Star,
  Building2,
  Mail,
  Linkedin,
  Plus,
  Edit,
  ChevronUp,
  ChevronDown
} from "lucide-react"
import type { Contact } from '@/lib/database.types'
import { useState, useEffect, useMemo, useCallback, memo, lazy, Suspense } from 'react'
import { getVipDataBulk } from '@/lib/vip-actions'
import { useFilteredArray, useStableCallback, EMPTY_ARRAY } from '@/lib/performance'
import type { VipInitiative, VipActivity, VipTag, VipTask } from '@/lib/database.types'
import { Checkbox } from "@/components/ui/checkbox"

// Dynamic imports for better performance
const CreateInitiativeDialog = lazy(() => import('./create-initiative-dialog').then(module => ({ default: module.CreateInitiativeDialog })))
const EditInitiativeDialog = lazy(() => import('./edit-initiative-dialog').then(module => ({ default: module.EditInitiativeDialog })))
const CreateActivityDialog = lazy(() => import('./create-activity-dialog').then(module => ({ default: module.CreateActivityDialog })))
const EditActivityDialog = lazy(() => import('./edit-activity-dialog').then(module => ({ default: module.EditActivityDialog })))
const CreateTaskDialog = lazy(() => import('./create-task-dialog').then(module => ({ default: module.CreateTaskDialog })))
const EditTaskDialog = lazy(() => import('./edit-task-dialog').then(module => ({ default: module.EditTaskDialog })))
const AddTagDialog = lazy(() => import('./add-tag-dialog').then(module => ({ default: module.AddTagDialog })))

interface VipDetailTabsProps {
  contact: Contact
}

export function VipDetailTabs({ contact }: VipDetailTabsProps) {
  const [initiatives, setInitiatives] = useState<VipInitiative[]>([])
  const [activities, setActivities] = useState<VipActivity[]>([])
  const [tags, setTags] = useState<VipTag[]>([])
  const [allTasks, setAllTasks] = useState<VipTask[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateGiveDialog, setShowCreateGiveDialog] = useState(false)
  const [showCreateAskDialog, setShowCreateAskDialog] = useState(false)
  const [showCreateActivityDialog, setShowCreateActivityDialog] = useState(false)
  const [showEditActivityDialog, setShowEditActivityDialog] = useState(false)
  const [selectedActivity, setSelectedActivity] = useState<VipActivity | null>(null)
  const [showAddTagDialog, setShowAddTagDialog] = useState(false)
  const [showEditInitiativeDialog, setShowEditInitiativeDialog] = useState(false)
  const [selectedInitiative, setSelectedInitiative] = useState<VipInitiative | null>(null)

  // Memoized filtered initiatives to prevent unnecessary recalculations
  const giveInitiatives = useMemo(() => 
    initiatives.filter(i => i.type === 'give'), [initiatives]
  )
  
  const askInitiatives = useMemo(() => 
    initiatives.filter(i => i.type === 'ask'), [initiatives]
  )

  // Memoized callback to prevent child re-renders
  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      const data = await getVipDataBulk(contact.id)
      setInitiatives(data.initiatives)
      setActivities(data.activities)
      setTags(data.tags)
      setAllTasks(data.allTasks)
    } catch (error) {
      console.error('Error loading VIP data:', error)
    } finally {
      setLoading(false)
    }
  }, [contact.id])

  useEffect(() => {
    const loadVipData = async () => {
      try {
        console.log('Loading VIP data for contact:', contact.id)
        const data = await getVipDataBulk(contact.id)
        console.log('VIP data received:', data)
        
        setInitiatives(data.initiatives)
        setActivities(data.activities)
        setTags(data.tags)
        setAllTasks(data.allTasks)
        
        console.log('State updated - Initiatives:', data.initiatives.length, 'Activities:', data.activities.length)
      } catch (error) {
        console.error('Error loading VIP data:', error)
        console.error('Error details:', error instanceof Error ? error.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadVipData()
  }, [contact.id])

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* VIP Header */}
      <VipHeader contact={contact} onAddActivity={() => setShowCreateActivityDialog(true)} />
      
      {/* Tabs */}
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="give" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Give
          </TabsTrigger>
          <TabsTrigger value="ask" className="flex items-center gap-2">
            <ArrowRight className="h-4 w-4" />
            Ask
          </TabsTrigger>
          <TabsTrigger value="activities" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Activities
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="dashboard" className="mt-6">
          <VipDashboard 
            contact={contact} 
            initiatives={initiatives}
            activities={activities}
            loading={loading}
          />
        </TabsContent>
        
        <TabsContent value="profile" className="mt-6">
          <VipProfile 
            contact={contact} 
            tags={tags}
            onRefresh={refreshData}
            onAddTag={() => setShowAddTagDialog(true)}
          />
        </TabsContent>
        
        <TabsContent value="give" className="mt-6">
          <VipGiveInitiatives
            contact={contact}
            initiatives={giveInitiatives}
            allTasks={allTasks}
            onRefresh={refreshData}
            onCreateInitiative={() => setShowCreateGiveDialog(true)}
            onEditInitiative={(initiative) => {
              setSelectedInitiative(initiative)
              setShowEditInitiativeDialog(true)
            }}
          />
        </TabsContent>

        <TabsContent value="ask" className="mt-6">
          <VipAskInitiatives
            contact={contact}
            initiatives={askInitiatives}
            allTasks={allTasks}
            onRefresh={refreshData}
            onCreateInitiative={() => setShowCreateAskDialog(true)}
            onEditInitiative={(initiative) => {
              setSelectedInitiative(initiative)
              setShowEditInitiativeDialog(true)
            }}
          />
        </TabsContent>
        
        <TabsContent value="activities" className="mt-6">
          <VipActivities 
            contact={contact} 
            activities={activities}
            initiatives={initiatives}
            onRefresh={refreshData}
            onCreateActivity={() => setShowCreateActivityDialog(true)}
            onEditActivity={(activity) => {
              setSelectedActivity(activity)
              setShowEditActivityDialog(true)
            }}
          />
        </TabsContent>
      </Tabs>
      
      {/* Dialogs */}
      <Suspense fallback={null}>
        <CreateInitiativeDialog
          open={showCreateGiveDialog}
          onOpenChange={setShowCreateGiveDialog}
          contactId={contact.id}
          type="give"
          onSuccess={refreshData}
        />
        
        <CreateInitiativeDialog
          open={showCreateAskDialog}
          onOpenChange={setShowCreateAskDialog}
          contactId={contact.id}
          type="ask"
          onSuccess={refreshData}
        />

        <EditInitiativeDialog
          open={showEditInitiativeDialog}
          onOpenChange={setShowEditInitiativeDialog}
          initiative={selectedInitiative}
          onSuccess={refreshData}
        />

        <CreateActivityDialog
          open={showCreateActivityDialog}
          onOpenChange={setShowCreateActivityDialog}
          contactId={contact.id}
          initiatives={initiatives}
          onSuccess={refreshData}
        />
        
        <EditActivityDialog
          open={showEditActivityDialog}
          onOpenChange={setShowEditActivityDialog}
          activity={selectedActivity}
          initiatives={initiatives}
          onSuccess={refreshData}
        />
        
        <AddTagDialog
          open={showAddTagDialog}
          onOpenChange={setShowAddTagDialog}
          contactId={contact.id}
          existingTags={tags}
          onSuccess={refreshData}
        />
      </Suspense>
    </div>
  )
}

function VipHeader({ contact, onAddActivity }: { contact: Contact, onAddActivity: () => void }) {
  const displayName = contact.name || `${contact.first_name || ''} ${contact.last_name || ''}`.trim() || 'Unnamed Contact'
  
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center gap-6">
          {/* Avatar */}
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center">
            <User className="h-10 w-10 text-indigo-600" />
          </div>
          
          {/* Basic Info */}
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-gray-900">{displayName}</h1>
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700">
                VIP
              </Badge>
            </div>
            
            <div className="flex items-center gap-4 text-gray-600">
              {contact.job_title && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{contact.job_title}</span>
                </div>
              )}
              {contact.company && (
                <div className="flex items-center gap-1">
                  <Building2 className="h-4 w-4" />
                  <span>{contact.company}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              {contact.email && (
                <div className="flex items-center gap-1">
                  <Mail className="h-3 w-3" />
                  <span>{contact.email}</span>
                </div>
              )}
              {contact.linkedin_url && (
                <div className="flex items-center gap-1">
                  <Linkedin className="h-3 w-3" />
                  <a href={contact.linkedin_url} target="_blank" rel="noopener noreferrer" className="hover:text-blue-600">
                    LinkedIn
                  </a>
                </div>
              )}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
            <Button size="sm" onClick={onAddActivity}>
              <Plus className="mr-2 h-4 w-4" />
              Add Activity
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface VipDashboardProps {
  contact: Contact
  initiatives: VipInitiative[]
  activities: VipActivity[]
  loading: boolean
}

const VipDashboard = memo(function VipDashboard({ contact, initiatives, activities, loading }: VipDashboardProps) {
  const activeGiveInitiatives = initiatives.filter(i => i.type === 'give' && i.status === 'active')
  const activeAskInitiatives = initiatives.filter(i => i.type === 'ask' && i.status === 'active')
  const upcomingActivities = activities
    .filter(a => new Date(a.activity_date) > new Date())
    .slice(0, 5)

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Our Goals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Our Goals with {contact.name || 'this VIP'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-gray-600">
              <p>Strategic objectives to be defined in Profile section.</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Active Give Initiatives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Heart className="h-5 w-5" />
              Active Give Initiatives ({activeGiveInitiatives.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeGiveInitiatives.length > 0 ? (
              <ul className="space-y-2">
                {activeGiveInitiatives.map(initiative => (
                  <li key={initiative.id} className="text-gray-700">
                    • {initiative.title}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-600">
                <p>No active give initiatives. Start adding value in the Give tab.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Ask Initiatives */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowRight className="h-5 w-5" />
              Active Ask Initiatives ({activeAskInitiatives.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {activeAskInitiatives.length > 0 ? (
              <ul className="space-y-2">
                {activeAskInitiatives.map(initiative => (
                  <li key={initiative.id} className="text-gray-700">
                    • {initiative.title}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-600">
                <p>No active ask initiatives. Define strategic requests in the Ask tab.</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Upcoming Activities */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Upcoming Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingActivities.length > 0 ? (
              <ul className="space-y-2">
                {upcomingActivities.map(activity => (
                  <li key={activity.id} className="text-gray-700">
                    • {activity.summary} - {new Date(activity.activity_date).toLocaleDateString()}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-gray-600">
                <p>No upcoming activities. Schedule interactions in the Activities tab.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

interface VipProfileProps {
  contact: Contact
  tags: VipTag[]
  onRefresh: () => void
  onAddTag: () => void
}

const VipProfile = memo(function VipProfile({ contact, tags, onRefresh, onAddTag }: VipProfileProps) {
  const [editing, setEditing] = useState<string | null>(null)
  const [relationshipSummary, setRelationshipSummary] = useState(contact.general_notes || '')
  const [currentProjects, setCurrentProjects] = useState<string[]>([])
  const [personalGoals, setPersonalGoals] = useState<string[]>([])
  const [strategicGoals, setStrategicGoals] = useState<string[]>([])
  const [newItem, setNewItem] = useState('')

  const handleSaveRelationshipSummary = async () => {
    try {
      const { supabase } = await import('@/lib/supabase')
      const { error } = await supabase
        .from('contacts')
        .update({ general_notes: relationshipSummary })
        .eq('id', contact.id)
      
      if (!error) {
        setEditing(null)
        onRefresh()
      }
    } catch (error) {
      console.error('Error saving relationship summary:', error)
    }
  }

  const addNewItem = async (type: 'projects' | 'goals' | 'strategic') => {
    if (!newItem.trim()) return
    
    const newItemText = newItem.trim()
    setNewItem('')
    
    if (type === 'projects') {
      setCurrentProjects([...currentProjects, newItemText])
    } else if (type === 'goals') {
      setPersonalGoals([...personalGoals, newItemText])
    } else if (type === 'strategic') {
      setStrategicGoals([...strategicGoals, newItemText])
    }
    
    setEditing(null)
  }

  const removeItem = (type: 'projects' | 'goals' | 'strategic', index: number) => {
    if (type === 'projects') {
      setCurrentProjects(currentProjects.filter((_, i) => i !== index))
    } else if (type === 'goals') {
      setPersonalGoals(personalGoals.filter((_, i) => i !== index))
    } else if (type === 'strategic') {
      setStrategicGoals(strategicGoals.filter((_, i) => i !== index))
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Relationship Summary
            <Button
              variant="outline"
              size="sm"
              onClick={() => editing === 'summary' ? handleSaveRelationshipSummary() : setEditing('summary')}
            >
              {editing === 'summary' ? 'Save' : <Edit className="h-4 w-4" />}
            </Button>
          </CardTitle>
          <CardDescription>
            Current standing, history, communication style, and key personality traits
          </CardDescription>
        </CardHeader>
        <CardContent>
          {editing === 'summary' ? (
            <div className="space-y-3">
              <textarea
                value={relationshipSummary}
                onChange={(e) => setRelationshipSummary(e.target.value)}
                className="w-full min-h-[100px] p-3 border rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add insights about this VIP's personality, communication style, history..."
              />
              <div className="flex gap-2">
                <Button onClick={handleSaveRelationshipSummary} size="sm">
                  Save
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setRelationshipSummary(contact.general_notes || '')
                    setEditing(null)
                  }}
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div 
              className="min-h-[100px] p-4 border rounded-md bg-gray-50 cursor-pointer hover:bg-gray-100"
              onClick={() => setEditing('summary')}
            >
              <p className="text-gray-600">
                {relationshipSummary || 'No relationship summary available. Click to add insights about this VIP.'}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Interests & Focus Areas</CardTitle>
            <CardDescription>Tags and categories</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <Badge key={tag.id} variant="outline">{tag.name}</Badge>
              ))}
              <Button variant="outline" size="sm" onClick={onAddTag}>
                <Plus className="mr-1 h-3 w-3" />
                Add Tag
              </Button>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Current Projects & Ventures
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(editing === 'projects' ? null : 'projects')}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </CardTitle>
            <CardDescription>Active endeavors</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {currentProjects.map((project, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <span className="flex-1">• {project}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem('projects', index)}
                    className="h-6 w-6 p-0 hover:bg-red-100"
                  >
                    ×
                  </Button>
                </div>
              ))}
              {editing === 'projects' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Enter new project..."
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && addNewItem('projects')}
                  />
                  <Button onClick={() => addNewItem('projects')} size="sm">Add</Button>
                  <Button variant="outline" onClick={() => setEditing(null)} size="sm">Cancel</Button>
                </div>
              )}
              {currentProjects.length === 0 && editing !== 'projects' && (
                <p className="text-gray-500 text-sm">No current projects listed.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Goals & Aspirations
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(editing === 'goals' ? null : 'goals')}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </CardTitle>
            <CardDescription>Known professional and personal goals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {personalGoals.map((goal, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <span className="flex-1">• {goal}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem('goals', index)}
                    className="h-6 w-6 p-0 hover:bg-red-100"
                  >
                    ×
                  </Button>
                </div>
              ))}
              {editing === 'goals' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Enter new goal..."
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && addNewItem('goals')}
                  />
                  <Button onClick={() => addNewItem('goals')} size="sm">Add</Button>
                  <Button variant="outline" onClick={() => setEditing(null)} size="sm">Cancel</Button>
                </div>
              )}
              {personalGoals.length === 0 && editing !== 'goals' && (
                <p className="text-gray-500 text-sm">No goals documented yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              Our Strategic Goals
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditing(editing === 'strategic' ? null : 'strategic')}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add
              </Button>
            </CardTitle>
            <CardDescription>What we want to achieve with this relationship</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {strategicGoals.map((goal, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 rounded-md">
                  <span className="flex-1">• {goal}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeItem('strategic', index)}
                    className="h-6 w-6 p-0 hover:bg-red-100"
                  >
                    ×
                  </Button>
                </div>
              ))}
              {editing === 'strategic' && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    placeholder="Enter strategic goal..."
                    className="flex-1 p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    onKeyDown={(e) => e.key === 'Enter' && addNewItem('strategic')}
                  />
                  <Button onClick={() => addNewItem('strategic')} size="sm">Add</Button>
                  <Button variant="outline" onClick={() => setEditing(null)} size="sm">Cancel</Button>
                </div>
              )}
              {strategicGoals.length === 0 && editing !== 'strategic' && (
                <p className="text-gray-500 text-sm">No strategic goals defined yet.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
})

interface VipInitiativesProps {
  contact: Contact
  initiatives: VipInitiative[]
  allTasks: VipTask[]
  onRefresh: () => void
  onCreateInitiative: () => void
  onEditInitiative: (initiative: VipInitiative) => void
}

const VipGiveInitiatives = memo(function VipGiveInitiatives({ contact, initiatives, allTasks, onRefresh, onCreateInitiative, onEditInitiative }: VipInitiativesProps) {

  if (initiatives.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Give-First Value Creation</CardTitle>
            <CardDescription>
              Initiatives where we provide value to {contact.name || 'this VIP'} without expecting immediate returns
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Heart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-700 mb-2">No Give Initiatives Yet</h3>
              <p className="text-green-600 mb-4">
                Start building trust and rapport by creating value-add initiatives for this VIP.
              </p>
              <Button 
                className="bg-green-600 hover:bg-green-700"
                onClick={onCreateInitiative}
              >
                <Heart className="mr-2 h-4 w-4" />
                Create Give Initiative
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-green-700">Give Initiatives</h2>
          <p className="text-green-600">Value-add initiatives for {contact.name}</p>
        </div>
        <Button 
          className="bg-green-600 hover:bg-green-700"
          onClick={onCreateInitiative}
        >
          <Plus className="mr-2 h-4 w-4" />
          New Initiative
        </Button>
      </div>

      <div className="space-y-4">
        {initiatives.map(initiative => (
          <InitiativeCard
            key={initiative.id}
            initiative={initiative}
            type="give"
            tasks={allTasks.filter(task => task.initiative_id === initiative.id)}
            onRefresh={onRefresh}
            onEditInitiative={onEditInitiative}
          />
        ))}
      </div>
    </div>
  )
})

const VipAskInitiatives = memo(function VipAskInitiatives({ contact, initiatives, allTasks, onRefresh, onCreateInitiative, onEditInitiative }: VipInitiativesProps) {

  if (initiatives.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Strategic Requests</CardTitle>
            <CardDescription>
              What we'd like to request from {contact.name || 'this VIP'} based on our relationship strength
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <ArrowRight className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Ask Initiatives Yet</h3>
              <p className="text-gray-600 mb-4">
                Define strategic requests once you've established sufficient relationship capital.
              </p>
              <Button onClick={onCreateInitiative}>
                <ArrowRight className="mr-2 h-4 w-4" />
                Create Ask Initiative
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ask Initiatives</h2>
          <p className="text-gray-600">Strategic requests from {contact.name}</p>
        </div>
        <Button onClick={onCreateInitiative}>
          <Plus className="mr-2 h-4 w-4" />
          New Initiative
        </Button>
      </div>

      <div className="space-y-4">
        {initiatives.map(initiative => (
          <InitiativeCard
            key={initiative.id}
            initiative={initiative}
            type="ask"
            tasks={allTasks.filter(task => task.initiative_id === initiative.id)}
            onRefresh={onRefresh}
            onEditInitiative={onEditInitiative}
          />
        ))}
      </div>
    </div>
  )
})

interface VipActivitiesProps {
  contact: Contact
  activities: VipActivity[]
  initiatives: VipInitiative[]
  onRefresh: () => void
  onCreateActivity: () => void
  onEditActivity: (activity: VipActivity) => void
}

const VipActivities = memo(function VipActivities({ contact, activities, initiatives, onRefresh, onCreateActivity, onEditActivity }: VipActivitiesProps) {

  if (activities.length === 0) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Interaction Timeline</CardTitle>
            <CardDescription>
              Complete history of touchpoints, meetings, and communications with {contact.name || 'this VIP'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No Activities Logged</h3>
              <p className="text-gray-600 mb-4">
                Start documenting your interactions to track relationship progress and identify patterns.
              </p>
              <Button onClick={onCreateActivity}>
                <Calendar className="mr-2 h-4 w-4" />
                Log First Activity
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Activity Timeline</h2>
          <p className="text-gray-600">Interaction history with {contact.name}</p>
        </div>
        <Button onClick={onCreateActivity}>
          <Plus className="mr-2 h-4 w-4" />
          Log Activity
        </Button>
      </div>

      <div className="space-y-4">
        {activities.map(activity => (
          <ActivityCard 
            key={activity.id} 
            activity={activity} 
            initiatives={initiatives}
            onEdit={() => onEditActivity(activity)}
          />
        ))}
      </div>
    </div>
  )
})

interface InitiativeCardProps {
  initiative: VipInitiative
  type: 'give' | 'ask'
  tasks: VipTask[]
  onRefresh: () => void
  onEditInitiative: (initiative: VipInitiative) => void
}

const InitiativeCard = memo(function InitiativeCard({ initiative, type, tasks, onRefresh, onEditInitiative }: InitiativeCardProps) {
  const [showTasks, setShowTasks] = useState(false)
  const [showCreateTaskDialog, setShowCreateTaskDialog] = useState(false)
  const [showEditTaskDialog, setShowEditTaskDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<VipTask | null>(null)

  const handleTaskStatusToggle = useCallback(async (taskId: string, currentStatus: string) => {
    try {
      const { updateVipTask } = await import('@/lib/vip-actions')
      const newStatus = currentStatus === 'done' ? 'to_do' : 'done'
      await updateVipTask(taskId, { status: newStatus as any })
      onRefresh() // Refresh all data
    } catch (error) {
      console.error('Error updating task status:', error)
    }
  }, [onRefresh])

  const completedTasks = tasks.filter(t => t.status === 'done').length
  const totalTasks = tasks.length
  
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {type === 'give' ? (
              <Heart className="h-5 w-5 text-gray-600" />
            ) : (
              <ArrowRight className="h-5 w-5 text-gray-600" />
            )}
            <div>
              <CardTitle className="text-gray-900">
                {initiative.title}
              </CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline">
                  {initiative.status}
                </Badge>
                {totalTasks > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {completedTasks}/{totalTasks} tasks
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowTasks(!showTasks)}
            >
              {showTasks ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => onEditInitiative(initiative)}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      {initiative.description && (
        <CardContent className="pt-0">
          <p className="text-gray-600">
            {initiative.description}
          </p>
        </CardContent>
      )}
      {showTasks && (
        <CardContent className="pt-0 border-t">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-sm text-gray-900">Tasks</h4>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowCreateTaskDialog(true)}
              >
                <Plus className="mr-1 h-3 w-3" />
                Add Task
              </Button>
            </div>
            {tasks.length > 0 ? (
              <div className="space-y-2">
                {tasks.map(task => (
                  <div key={task.id} className="flex items-center gap-3 p-2 border rounded-md hover:bg-gray-50">
                    <Checkbox 
                      checked={task.status === 'done'}
                      onCheckedChange={() => handleTaskStatusToggle(task.id, task.status)}
                      className="mt-0.5"
                    />
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => {
                        setSelectedTask(task)
                        setShowEditTaskDialog(true)
                      }}
                    >
                      <div className={`text-sm font-medium ${task.status === 'done' ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                        {task.name}
                      </div>
                      {task.due_date && (
                        <div className="text-xs text-gray-500">
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </div>
                      )}
                      {task.outcome_notes && (
                        <div className="text-xs text-gray-600 mt-1">{task.outcome_notes}</div>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {task.status.replace('_', ' ')}
                    </Badge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No tasks yet. Add your first task to break down this initiative.
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      <Suspense fallback={null}>
        <CreateTaskDialog
          open={showCreateTaskDialog}
          onOpenChange={setShowCreateTaskDialog}
          initiativeId={initiative.id}
          onSuccess={onRefresh}
        />
        
        <EditTaskDialog
          open={showEditTaskDialog}
          onOpenChange={setShowEditTaskDialog}
          task={selectedTask}
          onSuccess={onRefresh}
        />
      </Suspense>
    </Card>
  )
})

interface ActivityCardProps {
  activity: VipActivity
  initiatives: VipInitiative[]
  onEdit: () => void
}

const ActivityCard = memo(function ActivityCard({ activity, initiatives, onEdit }: ActivityCardProps) {
  // Find the related initiative
  const relatedInitiative = activity.initiative_id 
    ? initiatives.find(i => i.id === activity.initiative_id)
    : null

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Calendar className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="font-semibold text-gray-900">{activity.summary}</h3>
              <Badge variant="outline" className="text-xs">
                {activity.type}
              </Badge>
              {relatedInitiative && (
                <Badge 
                  variant="secondary" 
                  className={`text-xs ${
                    relatedInitiative.type === 'give' 
                      ? 'bg-green-100 text-green-700' 
                      : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {relatedInitiative.type === 'give' ? '🤝' : '🎯'} {relatedInitiative.title}
                </Badge>
              )}
            </div>
            <p className="text-sm text-gray-600 mb-2">
              {new Date(activity.activity_date).toLocaleDateString()}
            </p>
            {activity.notes && (
              <p className="text-gray-700">{activity.notes}</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onEdit}>
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}) 