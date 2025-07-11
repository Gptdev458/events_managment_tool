'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const tools = [
  {
    href: '/contacts',
    label: 'Contacts',
    description: 'Manage your network and relationships'
  },
  {
    href: '/events-management',
    label: 'Events Management',
    description: 'Manage events, invitations, and pipeline'
  },
  {
    href: '/vip-management',
    label: 'VIP Management', 
    description: 'Strategic relationship management'
  },
  {
    href: '/cto-club',
    label: 'CTO Club',
    description: 'Manage CTO Club members and recruitment'
  },
  {
    href: '/bizdev',
    label: 'BizDev Pipeline',
    description: 'Manage business development projects and tasks'
  },
]

export function ToolNavigation() {
  const pathname = usePathname()
  
  const getCurrentTool = () => {
    if (pathname.startsWith('/contacts')) return '/contacts'
    if (pathname.startsWith('/vip-management')) return '/vip-management'
    if (pathname.startsWith('/cto-club')) return '/cto-club'
    if (pathname.startsWith('/bizdev')) return '/bizdev'
    return '/events-management'
  }

  const currentTool = getCurrentTool()

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="hidden sm:ml-8 sm:flex sm:space-x-1">
              {tools.map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className={cn(
                    "inline-flex items-center px-4 py-2 rounded-md text-sm font-medium transition-colors",
                    currentTool === tool.href
                      ? "bg-indigo-100 text-indigo-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                  )}
                  title={tool.description}
                >
                  {tool.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 