/**
 * Pagination utilities for efficient data loading and display
 */

export interface PaginationParams {
  page: number
  pageSize: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  search?: string
  filters?: Record<string, any>
}

export interface PaginatedResult<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

export class PaginationHelper {
  /**
   * Creates pagination metadata
   */
  static createPagination(
    page: number,
    pageSize: number,
    totalItems: number
  ) {
    const totalPages = Math.ceil(totalItems / pageSize)
    
    return {
      page: Math.max(1, Math.min(page, totalPages)),
      pageSize,
      total: totalItems,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1
    }
  }

  /**
   * Paginates an array of data
   */
  static paginateArray<T>(
    data: T[],
    params: PaginationParams
  ): PaginatedResult<T> {
    const { page, pageSize } = params
    
    // Calculate offset
    const offset = (page - 1) * pageSize
    
    // Get page data
    const pageData = data.slice(offset, offset + pageSize)
    
    // Create pagination info
    const pagination = this.createPagination(page, pageSize, data.length)
    
    return {
      data: pageData,
      pagination
    }
  }

  /**
   * Builds Supabase query with pagination
   */
  static buildSupabaseQuery(
    query: any,
    params: PaginationParams
  ) {
    const { page, pageSize, sortBy, sortOrder, search } = params
    
    // Add sorting
    if (sortBy) {
      query = query.order(sortBy, { ascending: sortOrder === 'asc' })
    }
    
    // Add pagination
    const offset = (page - 1) * pageSize
    query = query.range(offset, offset + pageSize - 1)
    
    return query
  }

  /**
   * Generates page numbers for pagination UI
   */
  static getPageNumbers(currentPage: number, totalPages: number, maxVisible: number = 5): (number | string)[] {
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    const pages: (number | string)[] = []
    const half = Math.floor(maxVisible / 2)

    if (currentPage <= half + 1) {
      // Show first pages
      for (let i = 1; i <= maxVisible - 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    } else if (currentPage >= totalPages - half) {
      // Show last pages
      pages.push(1)
      pages.push('...')
      for (let i = totalPages - maxVisible + 2; i <= totalPages; i++) {
        pages.push(i)
      }
    } else {
      // Show middle pages
      pages.push(1)
      pages.push('...')
      for (let i = currentPage - half + 1; i <= currentPage + half - 1; i++) {
        pages.push(i)
      }
      pages.push('...')
      pages.push(totalPages)
    }

    return pages
  }
}

/**
 * Hook for managing pagination state
 */
export function usePagination(initialPageSize: number = 20) {
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(initialPageSize)
  const [sortBy, setSortBy] = useState<string>('')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')

  const resetPagination = () => {
    setPage(1)
  }

  const updateSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortOrder('asc')
    }
    resetPagination()
  }

  const goToPage = (newPage: number) => {
    setPage(newPage)
  }

  const changePageSize = (newPageSize: number) => {
    setPageSize(newPageSize)
    setPage(1) // Reset to first page when changing page size
  }

  return {
    page,
    pageSize,
    sortBy,
    sortOrder,
    setPage: goToPage,
    setPageSize: changePageSize,
    setSortBy,
    setSortOrder,
    updateSort,
    resetPagination
  }
}

/**
 * Virtual scrolling utility for extremely large datasets
 */
export class VirtualScrollManager {
  private itemHeight: number
  private containerHeight: number
  private overscan: number

  constructor(itemHeight: number, containerHeight: number, overscan: number = 5) {
    this.itemHeight = itemHeight
    this.containerHeight = containerHeight
    this.overscan = overscan
  }

  /**
   * Calculates which items should be visible based on scroll position
   */
  getVisibleRange(scrollTop: number, totalItems: number): {
    startIndex: number
    endIndex: number
    visibleItems: number
    offsetY: number
  } {
    const visibleItems = Math.ceil(this.containerHeight / this.itemHeight)
    const startIndex = Math.max(0, Math.floor(scrollTop / this.itemHeight) - this.overscan)
    const endIndex = Math.min(totalItems - 1, startIndex + visibleItems + this.overscan * 2)
    const offsetY = startIndex * this.itemHeight

    return {
      startIndex,
      endIndex,
      visibleItems,
      offsetY
    }
  }

  /**
   * Calculates total height needed for scrolling
   */
  getTotalHeight(totalItems: number): number {
    return totalItems * this.itemHeight
  }
}

import { useState } from 'react' 