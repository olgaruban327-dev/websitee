'use client'

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

interface AdminContextType {
  isAdmin: boolean
  refreshAdmin: () => Promise<void>
}

const AdminContext = createContext<AdminContextType>({
  isAdmin: false,
  refreshAdmin: async () => {},
})

async function fetchAdmin(): Promise<boolean> {
  try {
    const res = await fetch('/api/auth/verify', { credentials: 'include' })
    const data = await res.json()
    return Boolean(data.authenticated || data.isAdmin)
  } catch {
    return false
  }
}

export function AdminProvider({ children }: { children: ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false)

  const refreshAdmin = useCallback(async () => {
    setIsAdmin(await fetchAdmin())
  }, [])

  useEffect(() => {
    refreshAdmin()
  }, [refreshAdmin])

  return (
    <AdminContext.Provider value={{ isAdmin, refreshAdmin }}>
      {children}
    </AdminContext.Provider>
  )
}

export function useAdmin() {
  return useContext(AdminContext)
}
