import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, UserPlus, TrendingUp } from "lucide-react"
import { getCtoClubCurrentMembers, getCtoPotentialMembers, getCtoPipelineItems, getCtoClubStats } from "@/lib/cto-club-actions"
import { getContacts } from "@/lib/actions"
import { CurrentMembersTab } from "@/components/cto-club/current-members-tab"
import { PotentialMembersTab } from "@/components/cto-club/potential-members-tab"
import { PipelineTab } from "@/components/cto-club/pipeline-tab"

export default async function CtoClubPage() {
  // Fetch all data in parallel
  const [
    currentMembersResult,
    potentialMembersResult, 
    pipelineItemsResult,
    allContactsResult,
    statsResult
  ] = await Promise.all([
    getCtoClubCurrentMembers().catch(() => []),
    getCtoPotentialMembers().catch(() => []),
    getCtoPipelineItems().catch(() => []),
    getContacts(),
    getCtoClubStats().catch(() => ({ current_members: 0, potential_members: 0, pipeline_items: 0, ready_for_next_step: 0 }))
  ])

  const currentMembers = currentMembersResult
  const potentialMembers = potentialMembersResult
  const pipelineItems = pipelineItemsResult
  const allContacts = allContactsResult.success ? allContactsResult.data : []
  const stats = statsResult

  // Get available contacts for adding to potential members and pipeline
  const currentMemberIds = new Set(currentMembers.map(m => m.id))
  const potentialMemberIds = new Set(potentialMembers.map(m => m.contact_id))
  const pipelineContactIds = new Set(pipelineItems.map(p => p.contact_id))
  
  const availableForPotential = allContacts.filter(contact => 
    !currentMemberIds.has(contact.id) && !potentialMemberIds.has(contact.id)
  )
  
  // For pipeline: include potential members and other contacts, but exclude current members and those already in pipeline
  const availableForPipeline = allContacts.filter(contact => 
    !currentMemberIds.has(contact.id) && !pipelineContactIds.has(contact.id)
  )

  // Create a map of pipeline status for potential members
  const pipelineStatusMap = new Map<string, string>()
  pipelineItems.forEach(item => {
    pipelineStatusMap.set(item.contact_id, item.status)
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">CTO Club</h1>
          <p className="text-gray-600 mt-2">Manage CTO Club members and recruitment pipeline</p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.current_members}</div>
            <p className="text-xs text-muted-foreground">Active CTO Club members</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Potential Members</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.potential_members}</div>
            <p className="text-xs text-muted-foreground">Being evaluated</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Pipeline</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pipeline_items}</div>
            <p className="text-xs text-muted-foreground">Active recruitment</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ready for Next Step</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.ready_for_next_step}</div>
            <p className="text-xs text-muted-foreground">Requires action</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="current-members" className="space-y-6">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
          <TabsTrigger 
            value="current-members"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <Users className="h-4 w-4 mr-2" />
            Current Members
          </TabsTrigger>
          <TabsTrigger 
            value="potential-members"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Potential Members
          </TabsTrigger>
          <TabsTrigger 
            value="pipeline"
            className="inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Pipeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current-members" className="mt-6">
          <CurrentMembersTab currentMembers={currentMembers} />
        </TabsContent>

        <TabsContent value="potential-members" className="mt-6">
          <PotentialMembersTab 
            potentialMembers={potentialMembers} 
            availableContacts={availableForPotential}
            availableForPipeline={availableForPipeline}
            pipelineStatusMap={pipelineStatusMap}
          />
        </TabsContent>

        <TabsContent value="pipeline" className="mt-6">
          <PipelineTab 
            pipelineItems={pipelineItems}
            availableContacts={availableForPipeline}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 