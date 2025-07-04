import { notFound } from 'next/navigation'
import { getContact } from '@/lib/actions'
import { VipDetailTabs } from '@/components/vip/vip-detail-tabs'

interface VipDetailPageProps {
  params: Promise<{
    id: string
  }>
}

export default async function VipDetailPage({ params }: VipDetailPageProps) {
  const { id } = await params
  
  const contact = await getContact(id)
  
  if (!contact) {
    notFound()
  }

  // Ensure this is actually a VIP
  if (contact.contact_type !== 'vip') {
    notFound()
  }

  return <VipDetailTabs contact={contact} />
} 