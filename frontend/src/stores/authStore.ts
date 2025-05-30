import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { User } from '../types'

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (token: string, user: User) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setUser: (user: User) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,
      
      login: (token: string, user: User) => {
        set({ 
          token, 
          user, 
          isAuthenticated: true,
          isLoading: false 
        })
      },
      
      logout: () => {
        set({ 
          token: null, 
          user: null, 
          isAuthenticated: false,
          isLoading: false 
        })
        // Supprimer le token du localStorage
        localStorage.removeItem('tontine-auth-storage')
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading })
      },
      
      setUser: (user: User) => {
        set({ user })
      },
    }),
    {
      name: 'tontine-auth-storage',
      partialize: (state) => ({ 
        token: state.token, 
        user: state.user, 
        isAuthenticated: state.isAuthenticated 
      }),
    }
  )
)