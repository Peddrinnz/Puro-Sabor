import React, { useState } from 'react'
import { FiEye, FiEyeOff } from 'react-icons/fi'
import { useForm } from 'react-hook-form'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

type Form = { email: string; password: string }

const Login: React.FC = () => {
  const { register, handleSubmit } = useForm<Form>()
  const { login } = useAuth()
  const nav = useNavigate()
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const onSubmit = async (data: Form) => {
    setError(null)
    setLoading(true)
    try {
      await login(data.email, data.password)
      nav('/')
    } catch (err) {
      setError('Não foi possível entrar. Verifique suas credenciais.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="container-app py-16">
      <div className="mx-auto max-w-md rounded-4xl bg-white p-10 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.3)]">
        <h1 className="text-4xl font-semibold mb-4 text-slate-900">Entrar</h1>
        {error && <div className="mb-4 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <label className="relative block">
            <input
              {...register('email')}
              type="email"
              placeholder="Email"
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-5 py-4 text-slate-900 outline-none transition focus:border-teal-500"
            />
          </label>
          <label className="relative block">
            <input
              {...register('password')}
              type={showPassword ? 'text' : 'password'}
              placeholder="Senha"
              className="w-full rounded-3xl border border-slate-300 bg-slate-50 px-5 py-4 pr-14 text-slate-900 outline-none transition focus:border-teal-500"
            />
            <button
              type="button"
              onClick={() => setShowPassword((current) => !current)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 transition hover:text-slate-900"
              aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
            >
              {showPassword ? <FiEyeOff className="h-5 w-5" /> : <FiEye className="h-5 w-5" />}
            </button>
          </label>
          <button type="submit" className="rounded-full bg-gradient-to-r from-cyan-500 to-teal-400 px-5 py-4 text-sm font-semibold text-slate-950 transition hover:brightness-105 disabled:cursor-not-allowed disabled:opacity-70" disabled={loading}>
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          <div className="text-center text-sm text-slate-500">
            Ainda não tem conta?{' '}
            <Link to="/register" className="font-semibold text-cyan-500 hover:text-teal-400">Criar uma agora</Link>
          </div>
        </form>
      </div>
    </main>
  )
}

export default Login
