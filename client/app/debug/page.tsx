"use client"

import { useEffect, useState } from 'react'
import { apiClient } from '@/lib/api-client'
import { Button } from '@/components/ui/button'

export default function AuthDebugPage() {
  const [authState, setAuthState] = useState<any>({})
  const [testResults, setTestResults] = useState<any>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    checkAuthState()
  }, [])

  const checkAuthState = () => {
    const token = localStorage.getItem('auth_token')
    const userInfo = localStorage.getItem('user_info') 
    const currentUser = apiClient.getCurrentUser()
    
    setAuthState({
      hasToken: !!token,
      tokenPreview: token ? token.substring(0, 50) + '...' : null,
      hasUserInfo: !!userInfo,
      userInfo: userInfo ? JSON.parse(userInfo) : null,
      currentUser: currentUser
    })
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      console.log('Testing login...')
      const result = await apiClient.login('admin@aqarat.com', 'admin123')
      setTestResults({...testResults, login: result})
      checkAuthState()
    } catch (error: any) {
      setTestResults({...testResults, login: { error: error.message }})
    }
    setLoading(false)
  }

  const testProtectedRequest = async () => {
    setLoading(true)
    try {
      console.log('Testing protected request...')
      const result = await apiClient.getLeads()
      setTestResults({...testResults, protected: result})
    } catch (error: any) {
      setTestResults({...testResults, protected: { error: error.message }})
    }
    setLoading(false)
  }

  const clearAuth = () => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('user_info')
    document.cookie = 'auth_token=; path=/; max-age=0'
    checkAuthState()
    setTestResults({})
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Authentication Debug</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Auth State */}
        <div className="bg-gray-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Current Auth State</h2>
          <div className="space-y-2 text-sm">
            <div><strong>Has Token:</strong> {authState.hasToken ? 'Yes' : 'No'}</div>
            <div><strong>Token Preview:</strong> {authState.tokenPreview || 'None'}</div>
            <div><strong>Has User Info:</strong> {authState.hasUserInfo ? 'Yes' : 'No'}</div>
            <div><strong>Current User:</strong> {authState.currentUser?.full_name || 'None'}</div>
            <div><strong>User Role:</strong> {authState.currentUser?.role || 'None'}</div>
          </div>
          <Button onClick={checkAuthState} className="mt-3" size="sm">
            Refresh
          </Button>
        </div>

        {/* Controls */}
        <div className="bg-blue-50 p-4 rounded-lg">
          <h2 className="text-lg font-semibold mb-3">Test Controls</h2>
          <div className="space-y-2">
            <Button 
              onClick={testLogin} 
              disabled={loading}
              className="w-full"
            >
              Test Admin Login
            </Button>
            <Button 
              onClick={testProtectedRequest} 
              disabled={loading}
              className="w-full"
            >
              Test Protected Request
            </Button>
            <Button 
              onClick={clearAuth} 
              variant="outline"
              className="w-full"
            >
              Clear Auth Data
            </Button>
          </div>
        </div>
      </div>

      {/* Test Results */}
      <div className="mt-6 bg-gray-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Test Results</h2>
        <pre className="text-xs overflow-auto bg-white p-3 rounded border">
          {JSON.stringify(testResults, null, 2)}
        </pre>
      </div>

      {/* Raw Auth Data */}
      <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-3">Raw Auth Data</h2>
        <pre className="text-xs overflow-auto bg-white p-3 rounded border">
          {JSON.stringify(authState, null, 2)}
        </pre>
      </div>
    </div>
  )
}