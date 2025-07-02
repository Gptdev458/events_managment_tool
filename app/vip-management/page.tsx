import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Star, TrendingUp, Calendar, ArrowRight, Building2 } from "lucide-react"
import { VipList } from "@/components/vip/vip-list"
import { getContacts } from "@/lib/actions"

export default async function VipManagementPage() {
  // Get all contacts and filter for VIPs
  const allContactsResult = await getContacts()
  const allContacts = allContactsResult.success ? allContactsResult.data : []
  const vips = allContacts.filter((contact: any) => contact.contact_type === 'VIP')
  
  // Mock stats for now - these would come from the VIP actions once database types are fixed
  const stats = {
    total_vips: vips.length,
    active_give_initiatives: 0,
    active_ask_initiatives: 0,
    total_activities: 0,
    recent_interactions: 0
  }

  return <VipList vips={vips} stats={stats} />
} 