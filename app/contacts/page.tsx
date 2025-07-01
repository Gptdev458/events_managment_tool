import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getContacts } from '@/lib/actions'
import { AddContactDialog } from '@/components/contacts/add-contact-dialog'
import { CSVImportExport } from '@/components/contacts/csv-import-export'
import { ContactsPageWrapper } from '@/components/contacts/contacts-page-wrapper'

export default async function ContactsPage() {
  const { data: contacts, error } = await getContacts()

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your network rolodex</p>
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contacts</h1>
          <p className="text-gray-600">Manage your network rolodex</p>
        </div>
        <div className="flex gap-2">
          <CSVImportExport contacts={contacts} />
          <AddContactDialog />
        </div>
      </div>

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
          <ContactsPageWrapper contacts={contacts} />
        </CardContent>
      </Card>
    </div>
  )
} 