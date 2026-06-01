import React, { useEffect, useState } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import type { User } from '../types'

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth()
  const [saving, setSaving] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [profileMessage, setProfileMessage] = useState<string | null>(null)
  const [form, setForm] = useState({
    email: '',
    password: '',
    street: '',
    number: '',
    city: '',
    zipCode: '',
    complement: '',
  })

  useEffect(() => {
    if (user) {
      setForm({
        email: user.email,
        password: '',
        street: user.addresses?.[0]?.street ?? '',
        number: String(user.addresses?.[0]?.number ?? ''),
        city: user.addresses?.[0]?.city ?? '',
        zipCode: user.addresses?.[0]?.zipCode ?? '',
        complement: user.addresses?.[0]?.complement ?? '',
      })
    }
  }, [user])

  const updateProfile = async (payload: Record<string, unknown>) => {
    const response = await api.put('/users/profile', payload)
    return response.data
  }

  const handleUpdateProfile = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setProfileMessage(null)

    const trimmedEmail = form.email.trim().toLowerCase()
    const trimmedStreet = form.street.trim()
    const trimmedCity = form.city.trim()
    const trimmedZipCode = form.zipCode.trim()
    const trimmedNumber = String(form.number ?? '').trim()
    const addressNumber = Number(trimmedNumber)

    if (!trimmedEmail || !trimmedStreet || !trimmedCity || !trimmedZipCode || !trimmedNumber || Number.isNaN(addressNumber)) {
      setProfileMessage('Preencha email, rua, número, cidade e CEP corretamente antes de salvar.')
      return
    }

    setSaving(true)

    const payload: Record<string, unknown> = {
      email: trimmedEmail,
      addresses: [
        {
          street: trimmedStreet,
          number: addressNumber,
          complement: form.complement.trim() || undefined,
          city: trimmedCity,
          zipCode: trimmedZipCode,
        },
      ],
    }

    if (form.password.trim()) {
      payload.password = form.password.trim()
    }

    try {
      const response = await updateProfile(payload)
      const nextUser = (response?.user ?? response) as User
      if (nextUser && typeof nextUser === 'object') {
        updateUser(nextUser)
      }
      setForm((current) => ({ ...current, password: '' }))
      setProfileMessage('Perfil atualizado com sucesso.')
    } catch (err) {
      console.error(err)
      const errorMessage = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined
      setProfileMessage(errorMessage ?? 'Não foi possível atualizar o perfil. Verifique a API e tente novamente.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <main className="container-app py-16 text-left">
      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-4xl bg-slate-50/95 p-8 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.3)] dark:bg-slate-950/95 dark:text-slate-100">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Conta</p>
          <h1 className="mt-3 text-3xl font-semibold text-slate-950 dark:text-slate-100">Perfil</h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">Gerencie suas informações pessoais e dados de entrega.</p>

          {user ? (
            <div className="mt-6 space-y-4 text-slate-700">
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900 dark:text-slate-100 dark:border dark:border-slate-700">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Nome</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{user.name}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900 dark:text-slate-100 dark:border dark:border-slate-700">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Email atual</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{user.email}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-4 dark:bg-slate-900 dark:text-slate-100 dark:border dark:border-slate-700">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">Função</p>
                <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">{user.role ?? 'Usuário'}</p>
              </div>

              {user.addresses?.length ? (
                <div className="rounded-3xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <h2 className="font-semibold text-slate-900 dark:text-slate-100">Endereço cadastrado</h2>
                  <ul className="mt-3 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                    {user.addresses.map((address, index) => (
                      <li key={index} className="rounded-2xl bg-slate-50 px-3 py-2 dark:bg-slate-950 dark:text-slate-100">
                        {address.street}, {address.number}
                        {address.complement ? ` (${address.complement})` : ''} — {address.city} • {address.zipCode}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">Nenhum endereço cadastrado ainda.</p>
              )}
            </div>
          ) : (
            <div className="mt-6 text-slate-600">Não autenticado.</div>
          )}
        </section>

        <section className="rounded-4xl bg-slate-50/95 p-8 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.3)] dark:bg-slate-950/95 dark:text-slate-100">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-700">Editar conta</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">Atualize seus dados</h2>
            </div>
            <span className="rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-700">Privado</span>
          </div>

          {profileMessage && (
            <div className="mt-4 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
              {profileMessage}
            </div>
          )}

          <form onSubmit={handleUpdateProfile} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span>Email</span>
                <input
                  type="email"
                  value={form.email}
                  onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="email@exemplo.com"
                />
              </label>

              <label className="relative space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span>Nova senha</span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 pr-12 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Deixe em branco para manter"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute right-4 top-10 text-slate-500 transition hover:text-slate-900"
                  aria-label={showPassword ? 'Ocultar senha' : 'Mostrar senha'}
                >
                  {showPassword ? 'Ocultar' : 'Mostrar'}
                </button>
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span>Rua</span>
                <input
                  value={form.street}
                  onChange={(event) => setForm((current) => ({ ...current, street: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="Rua das Pizzas"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span>Número</span>
                <input
                  value={form.number}
                  onChange={(event) => setForm((current) => ({ ...current, number: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="123"
                />
              </label>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span>Cidade</span>
                <input
                  value={form.city}
                  onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="São Paulo"
                />
              </label>

              <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
                <span>CEP</span>
                <input
                  value={form.zipCode}
                  onChange={(event) => setForm((current) => ({ ...current, zipCode: event.target.value }))}
                  className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                  placeholder="01000-000"
                />
              </label>
            </div>

            <label className="space-y-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <span>Complemento</span>
              <input
                value={form.complement}
                onChange={(event) => setForm((current) => ({ ...current, complement: event.target.value }))}
                className="w-full rounded-2xl border border-slate-300 bg-slate-50 px-4 py-3 text-slate-900 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                placeholder="Apto, Bloco, casa"
              />
            </label>

            <div className="flex items-center justify-between pt-2">
              <p className="text-sm text-slate-500 dark:text-slate-400">A senha só será alterada se você preencher um novo valor.</p>
              <button
                type="submit"
                disabled={saving}
                className="rounded-full bg-slate-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:hover:bg-slate-700"
              >
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </button>
            </div>
          </form>
        </section>
      </div>
    </main>
  )
}

export default Profile
