'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { GlobalSearch } from './global-search'
import { useState, useEffect } from 'react'

const navItems = [
  {
    href: '/events-management',
    label: 'Dashboard',
  },
  {
    href: '/events-management/contacts',
    label: 'Contacts',
  },
  {
    href: '/events-management/events',
    label: 'Events',
  },
  {
    href: '/events-management/pipeline',
    label: 'Pipeline',
  },
]

export function Navigation() {
  const pathname = usePathname()
  
  // Only show this navigation for events management
  if (!pathname.startsWith('/events-management')) {
    return null
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-lg font-semibold text-gray-600">Events Management</span>
            </div>
            <div className="hidden sm:ml-8 sm:flex sm:space-x-8">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium",
                    pathname === item.href
                      ? "border-indigo-500 text-gray-900"
                      : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
} 