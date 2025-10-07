import React from 'react'
import { useAuth } from '@/hooks/use-auth'

interface RoleGuardProps {
  allowedRoles: string | string[]
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function RoleGuard({ allowedRoles, children, fallback = null }: RoleGuardProps) {
  const { hasRole, isLoading } = useAuth()

  if (isLoading) {
    return <div className="animate-pulse">Loading...</div>
  }

  if (!hasRole(allowedRoles)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

interface AdminOnlyProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function AdminOnly({ children, fallback }: AdminOnlyProps) {
  return (
    <RoleGuard allowedRoles="admin" fallback={fallback}>
      {children}
    </RoleGuard>
  )
}

interface BrokerUpProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export function BrokerUp({ children, fallback }: BrokerUpProps) {
  return (
    <RoleGuard allowedRoles={['admin', 'broker']} fallback={fallback}>
      {children}
    </RoleGuard>
  )
}