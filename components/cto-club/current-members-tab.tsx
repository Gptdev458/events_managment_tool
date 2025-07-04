'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ExternalLink, Users, Eye, Linkedin } from "lucide-react"
import type { Contact } from "@/lib/database.types"
import { ContactBusinessLogic } from "@/lib/business-logic"
import { EditContactDialog } from "@/components/contacts/edit-contact-dialog"

interface CurrentMembersTabProps {
  currentMembers: Contact[]
}

export function CurrentMembersTab({ currentMembers }: CurrentMembersTabProps) {
  if (currentMembers.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Current Members</span>
            <Badge variant="secondary">0 members</Badge>
          </CardTitle>
          <CardDescription>
            Active CTO Club members
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No current members</h3>
            <p className="text-gray-600 mb-4">
              Members will appear here when contacts are marked as CTO Club members.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Current Members</span>
          <Badge variant="secondary">{currentMembers.length} members</Badge>
        </CardTitle>
        <CardDescription>
          Active CTO Club members
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name & Title</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentMembers.map((member) => (
                <TableRow key={member.id} className="h-16">
                  <TableCell className="font-medium py-2">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {ContactBusinessLogic.getDisplayName(member)}
                          </span>
                          {member.linkedin_url && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                              className="h-6 w-6 p-0 hover:bg-blue-50"
                            >
                              <a 
                                href={member.linkedin_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                title="View LinkedIn Profile"
                              >
                                <Linkedin className="h-3 w-3 text-blue-600" />
                              </a>
                            </Button>
                          )}
                        </div>
                        {member.job_title && (
                          <div className="text-xs text-gray-500 mt-0.5">{member.job_title}</div>
                        )}
                      </div>
                    </div>
                  </TableCell>
                  
                  <TableCell className="py-2 text-sm">
                    {member.company || 'No Company'}
                  </TableCell>
                  
                  <TableCell className="py-2">
                    <div className="flex flex-col gap-1">
                      {member.email ? (
                        <a 
                          href={`mailto:${member.email}`}
                          className="text-sm text-blue-600 hover:underline"
                        >
                          {member.email}
                        </a>
                      ) : (
                        <span className="text-sm text-gray-400">No email</span>
                      )}
                      {member.linkedin_url && (
                        <a 
                          href={member.linkedin_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline flex items-center gap-1"
                        >
                          <Linkedin className="h-3 w-3" />
                          LinkedIn
                        </a>
                      )}
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-right py-2">
                    <div className="flex items-center justify-end gap-1">
                      <EditContactDialog contact={member} />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  )
} 