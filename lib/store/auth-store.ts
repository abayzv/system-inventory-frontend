'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  username: string
  role: 'admin' | 'user'
}

interface AuthState {
  user: User | null
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  loginAsAdmin: () => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (username: string, _password: string) => {
        // Dummy authentication - accepts any credentials
        const user: User = {
          username,
          role: 'user',
        }
        set({ user, isAuthenticated: true })
        return true
      },
      loginAsAdmin: () => {
        const user: User = {
          username: 'admin',
          role: 'admin',
        }
        set({ user, isAuthenticated: true })
      },
      logout: () => {
        set({ user: null, isAuthenticated: false })
      },
    }),
    {
      name: 'inventory-auth',
    }
  )
)
