import { useState, useEffect } from 'react'
import { getCurrentUser, isAuthenticated } from '@/lib/auth'

export interface User {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'broker' | 'agent'
  phone?: string
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const checkAuth = () => {
      try {
        const authenticated = isAuthenticated()
        const currentUser = getCurrentUser()
        
        console.log('useAuth - checking authentication:', {
          authenticated,
          currentUser
        })
        
        setIsLoggedIn(authenticated)
        setUser(currentUser)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setIsLoggedIn(false)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()

    // Listen for storage changes (login/logout in other tabs)
    const handleStorageChange = () => {
      checkAuth()
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const hasRole = (role: string | string[]) => {
    if (!user) return false
    
    if (Array.isArray(role)) {
      return role.includes(user.role)
    }
    
    return user.role === role
  }

  const isAdmin = () => hasRole('admin')
  const isBroker = () => hasRole(['admin', 'broker'])
  const isAgent = () => hasRole(['admin', 'broker', 'agent'])

  return {
    user,
    isLoading,
    isLoggedIn,
    hasRole,
    isAdmin,
    isBroker,
    isAgent,
    refetch: () => {
      const currentUser = getCurrentUser()
      setUser(currentUser)
      setIsLoggedIn(isAuthenticated())
    }
  }
}