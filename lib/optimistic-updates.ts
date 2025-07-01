/**
 * Optimistic UI update utilities for better perceived performance
 */

import { useState, useCallback, useEffect } from 'react'

/**
 * Hook for managing optimistic updates
 */
export function useOptimisticUpdates<T extends { id: string }>(initialData: T[]) {
  const [items, setItems] = useState<T[]>(initialData)

  // Create item optimistically
  const createOptimistic = useCallback((data: Omit<T, 'id'>) => {
    const newItem = {
      ...data,
      id: `temp-${Date.now()}-${Math.random()}`
    } as T
    
    setItems(prev => [...prev, newItem])
    return newItem.id
  }, [])

  // Update item optimistically  
  const updateOptimistic = useCallback((id: string, updates: Partial<T>) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, ...updates } : item
    ))
    return id
  }, [])

  // Delete item optimistically
  const deleteOptimistic = useCallback((id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
    return id
  }, [])

  return {
    items,
    createOptimistic,
    updateOptimistic,
    deleteOptimistic
  }
}

/**
 * Connection status monitoring
 */
export function useConnectionStatus() {
  const [isOnline, setIsOnline] = useState(
    typeof navigator !== 'undefined' ? navigator.onLine : true
  )

  useEffect(() => {
    if (typeof window === 'undefined') return

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return { isOnline }
} 