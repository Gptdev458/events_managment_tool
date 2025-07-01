import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getRelationshipPipeline, getContacts } from '@/lib/actions'
import { PipelineTable } from '@/components/pipeline/pipeline-table'
import { AddToPipelineDialog } from '@/components/pipeline/add-to-pipeline-dialog'
import { PipelineStats } from '@/components/pipeline/pipeline-stats'
import { Contact } from '@/lib/supabase'

export default async function PipelinePage() {
  const [pipelineResult, contactsResult] = await Promise.all([
    getRelationshipPipeline(),
    getContacts()
  ])

  if (pipelineResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relationship Pipeline</h1>
          <p className="text-gray-600">Nurture high-value contacts into strategic partnerships</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading pipeline: {pipelineResult.error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (contactsResult.error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relationship Pipeline</h1>
          <p className="text-gray-600">Nurture high-value contacts into strategic partnerships</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading contacts: {contactsResult.error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const pipeline = pipelineResult.data || []
  const contacts = contactsResult.data || []

  // Get contacts not in pipeline for the add dialog
  const contactsInPipeline = new Set(pipeline.map(p => p.contact_id))
  const availableContacts = contacts.filter(contact => !contactsInPipeline.has(contact.id))

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Relationship Pipeline</h1>
          <p className="text-gray-600">Nurture high-value contacts into strategic partnerships</p>
        </div>
        <AddToPipelineDialog availableContacts={availableContacts} />
      </div>

      {/* Pipeline Statistics */}
      <PipelineStats pipeline={pipeline} />

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Active Pipeline</span>
            <Badge variant="secondary">{pipeline.length} contacts</Badge>
          </CardTitle>
          <CardDescription>
            Track and manage high-priority relationships with strategic follow-ups
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PipelineTable pipeline={pipeline} contacts={contacts} />
        </CardContent>
      </Card>
    </div>
  )
} 