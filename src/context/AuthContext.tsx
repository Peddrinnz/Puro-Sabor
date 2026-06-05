import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import axios from 'axios'
import api from '../services/api'
import type { User } from '../types'

type AuthContextType = {
  user: User | null
  token: string | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  updateUser: (updatedUser: User) => void
}

const normalizeRole = (role: User['role'] | string | undefined): User['role'] | undefined => {
  if (typeof role !== 'string') return role

  const normalized = role.toLowerCase()
  if (normalized === 'admin') return 'admin'
  if (normalized === 'user') return 'user'

  return role as User['role']
}

const normalizeUserForStorage = (user: User): User => ({
  ...user,
  role: normalizeRole(user.role),
  addresses: user.addresses?.map((address) => ({
    ...address,
    number: String(address.number ?? ''),
  })),
})

const AuthContext = createContext<AuthContextType | undefined>(undefined)

const storageUserKey = 'puro_sabor_user'

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const rawUser = localStorage.getItem(storageUserKey)
      if (!rawUser) return null
      const parsedUser = JSON.parse(rawUser) as User
      return normalizeUserForStorage(parsedUser)
    } catch (err) {
      console.error(err)
      localStorage.removeItem(storageUserKey)
      return null
    }
  })
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('puro_sabor_token'))
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) {
      localStorage.setItem(storageUserKey, JSON.stringify(user))
    } else {
      localStorage.removeItem(storageUserKey)
    }
  }, [user])

  const updateUser = useCallback((updatedUser: User) => {
    const normalizedUser = normalizeUserForStorage(updatedUser)
    setUser(normalizedUser)
    localStorage.setItem(storageUserKey, JSON.stringify(normalizedUser))
  }, [])

  const refreshUser = useCallback(async () => {
    try {
      const res = await api.get('/users/profile')
      const nextUser = (res.data?.user ?? res.data) as User
      updateUser(nextUser)
    } catch (_err) {
      setUser(null)
      localStorage.removeItem(storageUserKey)
      setToken(null)
    }
  }, [updateUser])

  useEffect(() => {
    if (token) {
      localStorage.setItem('puro_sabor_token', token)
      void refreshUser()
    } else {
      localStorage.removeItem('puro_sabor_token')
      setUser(null)
    }
  }, [token, refreshUser])

  const login = async (email: string, password: string) => {
    setLoading(true)
    try {
      const res = await api.post('/users/login', { email, password })
      setToken(res.data.token)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response?.status === 404) {
        const res = await api.post('/login', { email, password })
        setToken(res.data.token)
      } else {
        throw err
      }
    } finally {
      setLoading(false)
    }
  }

  const register = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      try {
        await api.post('/users/register', { name, email, password })
      } catch (err) {
        if (axios.isAxiosError(err) && err.response?.status === 404) {
          await api.post('/register', { name, email, password })
        } else {
          throw err
        }
      }
      await login(email, password)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('puro_sabor_token')
    localStorage.removeItem(storageUserKey)
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, refreshUser, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}