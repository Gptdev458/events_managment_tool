import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Briefcase, Users, Target, TrendingUp, CheckCircle, Clock, AlertCircle, Star, BarChart3 } from "lucide-react"
import { getProjects, getBizDevStats, getKanbanBoardData } from "@/lib/bizdev-actions"
import { AddProjectDialog } from "@/components/bizdev/add-project-dialog"
import { ProjectsTable } from "@/components/bizdev/projects-table"
import { KanbanBoard } from "@/components/bizdev/kanban-board"
import { ProjectRatingDetailed } from "@/components/bizdev/project-rating-display"
import type { DetailedRatingsData } from "@/lib/database.types"

export default async function BizDevPage() {
  const [allProjects, kanbanData] = await Promise.all([
    getProjects(),
    getKanbanBoardData()
  ])

  const bizdevProjects = allProjects.filter(p => !p.is_ian_collaboration)
  const ianProjects = allProjects.filter(p => p.is_ian_collaboration)

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">BizDev Pipeline</h1>
          <p className="text-gray-600 mt-2">Manage business development projects and tasks</p>
        </div>
      </div>

      <Tabs defaultValue="bizdev" className="space-y-6">
        <TabsList className="grid w-fit grid-cols-3">
          <TabsTrigger value="bizdev">BizDev Overview</TabsTrigger>
          <TabsTrigger value="collaboration">Collaboration</TabsTrigger>
          <TabsTrigger value="kanban">Task Board</TabsTrigger>
        </TabsList>

        <TabsContent value="bizdev" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">BizDev Projects</h2>
            <AddProjectDialog />
          </div>
          
          <ProjectsTable 
            projects={bizdevProjects} 
            showIanCollaboration={false}
          />
        </TabsContent>

        <TabsContent value="collaboration" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Ian Collaboration Projects</h2>
            <AddProjectDialog />
          </div>
          
          <ProjectsTable 
            projects={ianProjects} 
            showIanCollaboration={true}
          />
        </TabsContent>

        <TabsContent value="kanban" className="space-y-6">
          <KanbanBoard 
            kanbanData={kanbanData}
            projects={allProjects}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
} 