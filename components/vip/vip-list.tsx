'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Star, Calendar, Building2, ArrowRight, Plus } from "lucide-react"
import Link from "next/link"
import type { Contact } from "@/lib/database.types"
import { useState } from "react"
import { AddVipDialog } from "./add-vip-dialog"

interface VipListProps {
  vips: Contact[]
  stats: {
    total_vips: number
    active_give_initiatives: number
    active_ask_initiatives: number
    total_activities: number
    recent_interactions: number
  }
}

export function VipList({ vips, stats }: VipListProps) {
  const [addDialogOpen, setAddDialogOpen] = useState(false)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">VIP Management</h1>
          <p className="text-gray-600">Manage strategic relationships with key contacts</p>
        </div>
        <Button onClick={() => setAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add VIP
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stats.total_vips}</div>
                <p className="text-sm text-gray-600">Total VIPs</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <Star className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">{stats.active_give_initiatives}</div>
                <p className="text-sm text-gray-600">Give Initiatives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                <ArrowRight className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-600">{stats.active_ask_initiatives}</div>
                <p className="text-sm text-gray-600">Ask Initiatives</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-600">{stats.total_activities}</div>
                <p className="text-sm text-gray-600">Total Activities</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                <Calendar className="h-5 w-5 text-indigo-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-indigo-600">{stats.recent_interactions}</div>
                <p className="text-sm text-gray-600">Recent Interactions</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* VIP Cards Grid */}
      {vips.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No VIPs yet</h3>
            <p className="text-gray-600 mb-6">
              Start building your strategic relationship network by adding your first VIP contact.
            </p>
            <Button onClick={() => setAddDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First VIP
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {vips.map((vip) => (
            <VipCard key={vip.id} vip={vip} />
          ))}
        </div>
      )}

      <AddVipDialog open={addDialogOpen} onOpenChange={setAddDialogOpen} />
    </div>
  )
}

interface VipCardProps {
  vip: Contact
}

function VipCard({ vip }: VipCardProps) {
  const displayName = vip.name || `${vip.first_name || ''} ${vip.last_name || ''}`.trim() || 'Unnamed Contact'
  const lastInteraction = null // TODO: Get from activities
  
  return (
    <Link href={`/vip-management/${vip.id}`}>
      <Card className="hover:shadow-md transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{displayName}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    {vip.job_title && <span>{vip.job_title}</span>}
                    {vip.job_title && vip.company && <span>•</span>}
                    {vip.company && <span>{vip.company}</span>}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="text-right">
              <Badge variant="secondary" className="bg-indigo-100 text-indigo-700 mb-1">
                VIP
              </Badge>
              {lastInteraction ? (
                <div className="text-xs text-gray-500">
                  Last: {lastInteraction}
                </div>
              ) : (
                <div className="text-xs text-gray-500">
                  No recent activity
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
} 