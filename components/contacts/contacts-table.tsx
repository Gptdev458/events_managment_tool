'use client'

import { useState, useMemo } from 'react'
import { useDebounce } from '@/lib/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { EditContactDialog } from './edit-contact-dialog'
import { DeleteContactDialog } from './delete-contact-dialog'
import { ContactDetailModal } from './contact-detail-modal'
import { BulkEditContactsDialog } from './bulk-edit-contacts-dialog'
import { Contact } from '@/lib/supabase'
import { CONTACT_TYPES } from '@/lib/constants'
import { Search, Edit, Trash2, ExternalLink, Eye, Linkedin, Users, Edit3, UserCheck, Square } from 'lucide-react'
import { ContactBusinessLogic } from '@/lib/business-logic'
import { CONTACT_AREA_OPTIONS } from '@/lib/contact-area-utils'

interface ContactsTableProps {
  contacts: Contact[]
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [filterArea, setFilterArea] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'company' | 'created_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

  // Bulk edit state
  const [selectedContactIds, setSelectedContactIds] = useState<string[]>([])
  const [showBulkEditDialog, setShowBulkEditDialog] = useState(false)
  const [bulkOperationType, setBulkOperationType] = useState<'contact-type' | 'cto-club' | 'company' | 'area' | 'notes' | 'pipeline' | 'delete'>('contact-type')

  // Debounce search term for better performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Filter and sort contacts with memoization
  const filteredAndSortedContacts = useMemo(() => contacts
    .filter(contact => {
      const displayName = ContactBusinessLogic.getDisplayName(contact)
      const email = contact.email || ''
      const company = contact.company || ''
      
      const matchesSearch = 
        displayName.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        email.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        company.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
      
      const matchesType = filterType === 'all' || contact.contact_type === filterType
      const contactArea = contact.area // Use the new area field directly
      const matchesArea = filterArea === 'all' ||
        (filterArea === 'none' && !contactArea) ||
        contactArea === filterArea

      return matchesSearch && matchesType && matchesArea
    })
    .sort((a, b) => {
      let aVal: string = ''
      let bVal: string = ''
      
      switch (sortBy) {
        case 'name':
          aVal = ContactBusinessLogic.getDisplayName(a)
          bVal = ContactBusinessLogic.getDisplayName(b)
          break
        case 'email':
          aVal = a.email || ''
          bVal = b.email || ''
          break
        case 'company':
          aVal = a.company || ''
          bVal = b.company || ''
          break
        case 'created_at':
          aVal = a.created_at || ''
          bVal = b.created_at || ''
          break
      }
      
      if (sortOrder === 'asc') {
        return aVal.localeCompare(bVal)
      } else {
        return bVal.localeCompare(aVal)
      }
    }), [contacts, debouncedSearchTerm, filterType, filterArea, sortBy, sortOrder])

  const getDisplayName = (contact: Contact) => {
    return ContactBusinessLogic.getDisplayName(contact)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const getAreaLabel = (area: string | null) => {
    if (!area) return '-'
    return area.charAt(0).toUpperCase() + area.slice(1)
  }

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact)
    setDetailModalOpen(true)
  }

  // Bulk edit handlers
  const handleSelectContact = (contactId: string, checked: boolean) => {
    if (checked) {
      setSelectedContactIds(prev => [...prev, contactId])
    } else {
      setSelectedContactIds(prev => prev.filter(id => id !== contactId))
    }
  }

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedContactIds(filteredAndSortedContacts.map(contact => contact.id))
    } else {
      setSelectedContactIds([])
    }
  }

  const handleBulkEdit = (operationType: typeof bulkOperationType) => {
    setBulkOperationType(operationType)
    setShowBulkEditDialog(true)
  }

  const handleBulkEditSuccess = () => {
    setSelectedContactIds([])
  }

  const getSelectedContacts = () => {
    return selectedContactIds
      .map(id => contacts.find(contact => contact.id === id))
      .filter(Boolean) as Contact[]
  }

  return (
    <div className="space-y-4">
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search contacts by name, email, or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            {CONTACT_TYPES.map(type => (
              <SelectItem key={type.value} value={type.value}>
                {type.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterArea} onValueChange={setFilterArea}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by area" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Areas</SelectItem>
            <SelectItem value="none">No Area</SelectItem>
            {CONTACT_AREA_OPTIONS.map(area => (
              <SelectItem key={area.value} value={area.value}>
                {area.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={`${sortBy}-${sortOrder}`} onValueChange={(value) => {
          const [field, order] = value.split('-')
          setSortBy(field as any)
          setSortOrder(order as 'asc' | 'desc')
        }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created_at-desc">Newest First</SelectItem>
            <SelectItem value="created_at-asc">Oldest First</SelectItem>
            <SelectItem value="name-asc">Name A-Z</SelectItem>
            <SelectItem value="name-desc">Name Z-A</SelectItem>
            <SelectItem value="email-asc">Email A-Z</SelectItem>
            <SelectItem value="company-asc">Company A-Z</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedContactIds.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">
              {selectedContactIds.length} contact{selectedContactIds.length !== 1 ? 's' : ''} selected
            </span>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkEdit('contact-type')}
              className="flex items-center gap-1"
            >
              <Edit3 className="h-3 w-3" />
              Update Type
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkEdit('cto-club')}
              className="flex items-center gap-1"
            >
              <UserCheck className="h-3 w-3" />
              CTO Club
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkEdit('company')}
              className="flex items-center gap-1"
            >
              <Edit3 className="h-3 w-3" />
              Company
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkEdit('area')}
              className="flex items-center gap-1"
            >
              <Edit3 className="h-3 w-3" />
              Area
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleBulkEdit('delete')}
              className="flex items-center gap-1"
            >
              <Trash2 className="h-3 w-3" />
              Delete
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setSelectedContactIds([])}
              className="flex items-center gap-1"
            >
              <Square className="h-3 w-3" />
              Clear
            </Button>
          </div>
        </div>
      )}

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedContacts.length} of {contacts.length} contacts
      </div>

      {/* Compact Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedContactIds.length === filteredAndSortedContacts.length && filteredAndSortedContacts.length > 0}
                  onCheckedChange={handleSelectAll}
                />
              </TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Area</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-gray-500 py-8">
                  {searchTerm || filterType !== 'all' 
                    ? 'No contacts match your search criteria'
                    : 'No contacts yet. Add your first contact!'
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedContacts.map((contact) => (
                <TableRow key={contact.id} className="h-16">
                  <TableCell className="py-2">
                    <Checkbox
                      checked={selectedContactIds.includes(contact.id)}
                      onCheckedChange={(checked) => handleSelectContact(contact.id, checked as boolean)}
                    />
                  </TableCell>
                  <TableCell className="font-medium py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{getDisplayName(contact)}</span>
                          {contact.linkedin_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-6 w-6 p-0 hover:bg-blue-50"
                            >
                              <a 
                                href={contact.linkedin_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                title="View LinkedIn Profile"
                              >
                                <Linkedin className="h-3 w-3 text-blue-600" />
                              </a>
                            </Button>
                          )}
                        </div>
                        {contact.job_title && (
                          <div className="text-xs text-gray-500 mt-0.5">{contact.job_title}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="py-2">
                    {ContactBusinessLogic.hasAnyEmails(contact) ? (
                      <div className="flex items-center space-x-2">
                        <span>{ContactBusinessLogic.getPrimaryEmail(contact)}</span>
                        {ContactBusinessLogic.hasMultipleEmails(contact) && (
                          <Badge variant="outline" className="text-xs">
                            +{ContactBusinessLogic.getEmailCount(contact) - 1}
                          </Badge>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground italic">No email</span>
                    )}
                  </TableCell>
                  <TableCell className="py-2 text-sm">{contact.company || '-'}</TableCell>
                  <TableCell className="py-2">
                    <Badge variant="outline" className="text-xs">
                      {CONTACT_TYPES.find(type => type.value === contact.contact_type)?.label || contact.contact_type}
                    </Badge>
                  </TableCell>
                  <TableCell className="py-2 text-sm">
                    {getAreaLabel(contact.area)}
                  </TableCell>
                  <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleViewDetails(contact)}
                        className="h-7 px-2"
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      <EditContactDialog contact={contact} />
                      <DeleteContactDialog contact={contact} />
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Contact Detail Modal */}
      {selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          open={detailModalOpen}
          onOpenChange={setDetailModalOpen}
        />
      )}

      {/* Bulk Edit Dialog */}
      <BulkEditContactsDialog
        open={showBulkEditDialog}
        onOpenChange={setShowBulkEditDialog}
        selectedContacts={getSelectedContacts()}
        operationType={bulkOperationType}
        onSuccess={handleBulkEditSuccess}
      />
    </div>
  )
}