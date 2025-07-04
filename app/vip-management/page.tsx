import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Star, TrendingUp, Calendar, ArrowRight, Building2 } from "lucide-react"
import { VipList } from "@/components/vip/vip-list"
import { getContacts } from "@/lib/actions"
import { getVipStats } from "@/lib/vip-actions"

export default async function VipManagementPage() {
  // Get all contacts and filter for VIPs
  const allContactsResult = await getContacts()
  const allContacts = allContactsResult.success ? allContactsResult.data : []
  const vips = allContacts.filter((contact: any) => contact.contact_type === 'vip')
  
  // Get real VIP statistics from the database
  const stats = await getVipStats()

  return <VipList vips={vips} stats={stats} />
} 