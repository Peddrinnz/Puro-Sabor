import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const ProtectedRoute: React.FC<{ children: React.ReactNode; admin?: boolean }> = ({ children, admin }) => {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="container-app py-8">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">Carregando...</div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (admin && user.role !== 'admin') {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
