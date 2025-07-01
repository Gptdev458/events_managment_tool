'use client'

import { ContactsTable } from './contacts-table'
import { Contact } from '@/lib/supabase'

interface ContactsPageWrapperProps {
  contacts: Contact[]
}

export function ContactsPageWrapper({ contacts }: ContactsPageWrapperProps) {
  return (
    <div className="space-y-4">
      <ContactsTable contacts={contacts} />
    </div>
  )
} 