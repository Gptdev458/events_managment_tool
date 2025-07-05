'use client'

import { useEffect, useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Users, Building2, UserCheck, Star, TrendingUp, BarChart3 } from 'lucide-react'
import { getContacts } from '@/lib/actions'
import { AddContactDialog } from '@/components/contacts/add-contact-dialog'
import { CSVImportExport } from '@/components/contacts/csv-import-export'
import { ContactsPageWrapper } from '@/components/contacts/contacts-page-wrapper'
import { CONTACT_TYPES } from '@/lib/constants'
import type { Contact } from '@/lib/database.types'

export default function ContactsPage() {
  const [contacts, setContacts] = useState<Contact[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)


  useEffect(() => {
    async function loadContacts() {
      try {
        const { data, error } = await getContacts()
        if (error) {
          setError(error)
        } else {
          setContacts(data || [])
        }
      } catch (err) {
        setError('Failed to load contacts')
      } finally {
        setLoading(false)
      }
    }
    
    loadContacts()
  }, [])

  // Handle contact updates from edit dialog
  const handleContactUpdated = (updatedContact: Contact) => {
    setContacts(prevContacts => 
      prevContacts.map(contact => 
        contact.id === updatedContact.id ? updatedContact : contact
      )
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your network and relationships</p>
        </div>
        <div className="text-center py-8">Loading contacts...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your network and relationships</p>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center text-red-600">
              <p>Error loading contacts: {error}</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate statistics
  const stats = {
    total: contacts.length,
    byType: CONTACT_TYPES.reduce((acc, type) => {
      acc[type.value] = contacts.filter(c => c.contact_type === type.value).length
      return acc
    }, {} as Record<string, number>),
    withCompany: contacts.filter(c => c.company && c.company.trim() !== '').length,
    withLinkedIn: contacts.filter(c => c.linkedin_url && c.linkedin_url.trim() !== '').length,
    inCtoClub: contacts.filter(c => c.is_in_cto_club).length
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your network and relationships</p>
        </div>
        <div className="flex gap-2">
          <CSVImportExport contacts={contacts} />
          <AddContactDialog />
        </div>
      </div>

      <Tabs defaultValue="contacts" className="w-full">
        <TabsList className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500">
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Contacts
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Dashboard
          </TabsTrigger>
        </TabsList>

        <TabsContent value="contacts" className="mt-6 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>All Contacts</span>
                <Badge variant="secondary">{contacts.length} total</Badge>
              </CardTitle>
              <CardDescription>
                Add, edit, search, and manage all contacts in your network
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ContactsPageWrapper contacts={contacts} onContactUpdated={handleContactUpdated} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6 space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
                    <p className="text-sm text-gray-600">Total Contacts</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.withCompany}</div>
                    <p className="text-sm text-gray-600">With Company</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <UserCheck className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-600">{stats.withLinkedIn}</div>
                    <p className="text-sm text-gray-600">LinkedIn Connected</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Star className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-orange-600">{stats.inCtoClub}</div>
                    <p className="text-sm text-gray-600">CTO Club Members</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contact Types Breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Types</CardTitle>
              <CardDescription>
                Distribution of contacts by type
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                {CONTACT_TYPES.map((type) => (
                  <div key={type.value} className="text-center p-4 border rounded-lg">
                    <div className="text-2xl font-bold text-gray-900">
                      {stats.byType[type.value] || 0}
                    </div>
                    <div className="text-sm text-gray-600">{type.label}</div>
                    {stats.total > 0 && (
                      <div className="text-xs text-gray-500 mt-1">
                        {Math.round(((stats.byType[type.value] || 0) / stats.total) * 100)}%
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>
                Common tasks and shortcuts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center gap-2"
                  onClick={() => {
                    // Trigger the contacts tab to show the add contact functionality
                    const addButton = document.querySelector('[data-testid="add-contact-trigger"]') as HTMLButtonElement;
                    if (addButton) addButton.click();
                  }}
                >
                  <Users className="h-8 w-8 text-blue-600" />
                  <span>Add New Contact</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <TrendingUp className="h-8 w-8 text-green-600" />
                  <span>Import Contacts</span>
                </Button>
                <Button variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                  <Star className="h-8 w-8 text-purple-600" />
                  <span>Export Data</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Contact Dialog - uses internal state management */}
    </div>
  )
} 