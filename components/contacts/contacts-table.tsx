'use client'

import { useState, useMemo } from 'react'
import { useDebounce } from '@/lib/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { EditContactDialog } from './edit-contact-dialog'
import { DeleteContactDialog } from './delete-contact-dialog'
import { ContactDetailModal } from './contact-detail-modal'
import { Contact } from '@/lib/supabase'
import { CONTACT_TYPES } from '@/lib/constants'
import { Search, Edit, Trash2, ExternalLink, Eye, Linkedin } from 'lucide-react'
import { ContactBusinessLogic } from '@/lib/business-logic'

interface ContactsTableProps {
  contacts: Contact[]
}

export function ContactsTable({ contacts }: ContactsTableProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState<string>('all')
  const [sortBy, setSortBy] = useState<'name' | 'email' | 'company' | 'created_at'>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [detailModalOpen, setDetailModalOpen] = useState(false)

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
      
      return matchesSearch && matchesType
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
    }), [contacts, debouncedSearchTerm, filterType, sortBy, sortOrder])

  const getDisplayName = (contact: Contact) => {
    return ContactBusinessLogic.getDisplayName(contact)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  const handleViewDetails = (contact: Contact) => {
    setSelectedContact(contact)
    setDetailModalOpen(true)
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

      {/* Results Summary */}
      <div className="text-sm text-gray-600">
        Showing {filteredAndSortedContacts.length} of {contacts.length} contacts
      </div>

      {/* Compact Table */}
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAndSortedContacts.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                  {searchTerm || filterType !== 'all' 
                    ? 'No contacts match your search criteria'
                    : 'No contacts yet. Add your first contact!'
                  }
                </TableCell>
              </TableRow>
            ) : (
              filteredAndSortedContacts.map((contact) => (
                <TableRow key={contact.id} className="h-16">
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
    </div>
  )
} 