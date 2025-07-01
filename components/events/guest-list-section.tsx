'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  UserPlus, 
  Search, 
  Mail, 
  Linkedin, 
  CheckCircle,
  XCircle,
  Clock,
  Edit3,
  Trash2,
  UserCheck,
  Users,
  CheckSquare,
  Square
} from 'lucide-react'
import { INVITATION_STATUSES } from '@/lib/constants'
import { Contact } from '@/lib/supabase'
import { ContactBusinessLogic } from '@/lib/business-logic'
import { AddGuestDialog } from './add-guest-dialog'
import { InvitationActionsDropdown } from './invitation-actions-dropdown'
import { BulkEditDialog, type BulkEditMode } from './bulk-edit-dialog'

interface Invitation {
  id: number
  event_id: string
  contact_id: string
  status: string
  invited_by_host_id: string | null
  is_new_connection: boolean
  follow_up_notes: string | null
  contacts: Contact
  invited_by: {
    id: string
    first_name: string | null
    last_name: string | null
  } | null
}

interface GuestListSectionProps {
  eventId: string
  invitations: Invitation[]
  availableContacts: Contact[]
  eventStatus: string
  isUpcoming: boolean
  isPast: boolean
}

export function GuestListSection({ 
  eventId, 
  invitations, 
  availableContacts, 
  eventStatus,
  isUpcoming,
  isPast
}: GuestListSectionProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showAddDialog, setShowAddDialog] = useState(false)
  
  // Bulk edit state
  const [selectedInvitationIds, setSelectedInvitationIds] = useState<number[]>([])
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false)
  const [bulkEditMode, setBulkEditMode] = useState<BulkEditMode>('status')

  const filteredInvitations = invitations.filter(invitation => {
    const contact = invitation.contacts
    const displayName = ContactBusinessLogic.getDisplayName(contact).toLowerCase()
    const email = (contact.email || '').toLowerCase()
    const company = (contact.company || '').toLowerCase()
    
    const matchesSearch = searchTerm === '' || 
      displayName.includes(searchTerm.toLowerCase()) ||
      email.includes(searchTerm.toLowerCase()) ||
      company.includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Sourced': { color: 'bg-gray-100 text-gray-800', icon: Clock },
      'Invited': { color: 'bg-blue-100 text-blue-800', icon: Mail },
      'RSVP_Yes': { color: 'bg-green-100 text-green-800', icon: CheckCircle },
      'RSVP_No': { color: 'bg-red-100 text-red-800', icon: XCircle },
      'Attended': { color: 'bg-purple-100 text-purple-800', icon: CheckCircle },
      'No Show': { color: 'bg-orange-100 text-orange-800', icon: XCircle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Sourced']
    const Icon = config.icon

    return (
      <Badge className={`${config.color} flex items-center gap-1`}>
        <Icon className="h-3 w-3" />
        {INVITATION_STATUSES.find(s => s.value === status)?.label || status}
      </Badge>
    )
  }

  const getContactDisplayName = (contact: Contact) => {
    return ContactBusinessLogic.getDisplayName(contact)
  }

  // Bulk selection handlers
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedInvitationIds(filteredInvitations.map(inv => inv.id))
    } else {
      setSelectedInvitationIds([])
    }
  }

  const handleSelectInvitation = (invitationId: number, checked: boolean) => {
    if (checked) {
      setSelectedInvitationIds(prev => [...prev, invitationId])
    } else {
      setSelectedInvitationIds(prev => prev.filter(id => id !== invitationId))
    }
  }

  const handleBulkEdit = (mode: BulkEditMode) => {
    setBulkEditMode(mode)
    setShowBulkEditDialog(true)
  }

  const handleBulkEditSuccess = () => {
    setSelectedInvitationIds([])
  }

  const getSelectedGuestNames = () => {
    return selectedInvitationIds
      .map(id => {
        const invitation = invitations.find(inv => inv.id === id)
        return invitation ? getContactDisplayName(invitation.contacts) : ''
      })
      .filter(Boolean)
  }

  const allFilteredSelected = filteredInvitations.length > 0 && 
    filteredInvitations.every(inv => selectedInvitationIds.includes(inv.id))
  const someFilteredSelected = filteredInvitations.some(inv => selectedInvitationIds.includes(inv.id))

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Guest List</CardTitle>
            <CardDescription>
              Manage invitations and track attendance for this event
            </CardDescription>
          </div>
          <Button 
            onClick={() => setShowAddDialog(true)}
            disabled={availableContacts.length === 0}
            className="flex items-center gap-2"
          >
            <UserPlus className="h-4 w-4" />
            Add Guests
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search guests by name, email, or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {INVITATION_STATUSES.map((status) => (
                <SelectItem key={status.value} value={status.value}>
                  {status.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Bulk Actions Toolbar */}
        {selectedInvitationIds.length > 0 && (
          <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-blue-800">
                {selectedInvitationIds.length} guest{selectedInvitationIds.length !== 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkEdit('status')}
                className="flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" />
                Update Status
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkEdit('notes')}
                className="flex items-center gap-1"
              >
                <Edit3 className="h-3 w-3" />
                Add Notes
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleBulkEdit('new_connection')}
                className="flex items-center gap-1"
              >
                <UserCheck className="h-3 w-3" />
                New Connection
              </Button>
              <Button 
                size="sm" 
                variant="destructive"
                onClick={() => handleBulkEdit('remove')}
                className="flex items-center gap-1"
              >
                <Trash2 className="h-3 w-3" />
                Remove
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => setSelectedInvitationIds([])}
                className="flex items-center gap-1"
              >
                <Square className="h-3 w-3" />
                Clear
              </Button>
            </div>
          </div>
        )}

        {/* Results summary */}
        <div className="text-sm text-muted-foreground">
          Showing {filteredInvitations.length} of {invitations.length} invitations
          {selectedInvitationIds.length > 0 && (
            <span className="ml-2 text-blue-600">
              • {selectedInvitationIds.length} selected
            </span>
          )}
        </div>

        {/* Guest List Table */}
        {filteredInvitations.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">
                    <Checkbox 
                      checked={allFilteredSelected}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Invited By</TableHead>
                  <TableHead>New Connection</TableHead>
                  <TableHead className="w-[70px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvitations.map((invitation) => {
                  const contact = invitation.contacts
                  const isSelected = selectedInvitationIds.includes(invitation.id)
                  
                  return (
                    <TableRow key={invitation.id} className={isSelected ? 'bg-blue-50' : ''}>
                      <TableCell>
                        <Checkbox 
                          checked={isSelected}
                          onCheckedChange={(checked) => handleSelectInvitation(invitation.id, checked === true)}
                        />
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <div className="font-medium">
                            {getContactDisplayName(contact)}
                          </div>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {contact.email && (
                              <a 
                                href={`mailto:${contact.email}`} 
                                className="flex items-center gap-1 hover:text-primary"
                              >
                                <Mail className="h-3 w-3" />
                                {contact.email}
                              </a>
                            )}
                            {contact.linkedin_url && (
                              <a 
                                href={contact.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 hover:text-primary"
                              >
                                <Linkedin className="h-3 w-3" />
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          {contact.company && (
                            <div className="font-medium">{contact.company}</div>
                          )}
                          {contact.job_title && (
                            <div className="text-sm text-muted-foreground">{contact.job_title}</div>
                          )}
                          <Badge variant="outline" className="w-fit mt-1">
                            {contact.contact_type}
                          </Badge>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(invitation.status)}
                      </TableCell>
                      <TableCell>
                        {invitation.invited_by ? (
                          <div className="text-sm">
                            {invitation.invited_by.first_name} {invitation.invited_by.last_name}
                          </div>
                        ) : (
                          <div className="text-sm text-muted-foreground">System</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {invitation.is_new_connection && (
                          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                            New Connection
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <InvitationActionsDropdown 
                          invitation={invitation}
                          eventStatus={eventStatus}
                          isUpcoming={isUpcoming}
                          isPast={isPast}
                        />
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            {invitations.length === 0 ? (
              <div>
                <UserPlus className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No guests invited yet</p>
                <p className="text-sm">Start building your guest list by adding contacts to this event</p>
              </div>
            ) : (
              <div>
                <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                <p>No guests match your current filters</p>
                <p className="text-sm">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}
      </CardContent>

      {/* Add Guest Dialog */}
      <AddGuestDialog
        eventId={eventId}
        availableContacts={availableContacts}
        open={showAddDialog}
        onOpenChange={setShowAddDialog}
      />

      {/* Bulk Edit Dialog */}
      <BulkEditDialog
        open={showBulkEditDialog}
        onOpenChange={setShowBulkEditDialog}
        selectedInvitationIds={selectedInvitationIds}
        selectedGuestNames={getSelectedGuestNames()}
        mode={bulkEditMode}
        onSuccess={handleBulkEditSuccess}
      />
    </Card>
  )
} 