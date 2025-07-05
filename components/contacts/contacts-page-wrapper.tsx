'use client'

import { ContactsTable } from './contacts-table'
import { Contact } from '@/lib/supabase'

interface ContactsPageWrapperProps {
  contacts: Contact[]
  onContactUpdated?: (updatedContact: Contact) => void
}

export function ContactsPageWrapper({ contacts, onContactUpdated }: ContactsPageWrapperProps) {
  return (
    <div className="space-y-4">
      <ContactsTable contacts={contacts} onContactUpdated={onContactUpdated} />
    </div>
  )
} 