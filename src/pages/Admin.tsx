import React, { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import type { Order, Pizza } from '../types'

const extractCollection = (payload: unknown, keys: string[]): unknown[] => {
  if (Array.isArray(payload)) return payload

  if (payload && typeof payload === 'object') {
    const record = payload as Record<string, unknown>

    for (const key of keys) {
      const candidate = record[key]
      if (Array.isArray(candidate)) return candidate
    }

    if (Array.isArray(record.data)) return record.data
  }

  return []
}

const Admin: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [pizzas, setPizzas] = useState<Pizza[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadAdminData = async () => {
    setLoading(true)
    try {
      const [ordersRes, pizzasRes] = await Promise.all([api.get('/orders'), api.get('/pizzas')])
      const nextOrders = extractCollection(ordersRes.data, ['orders', 'items', 'data']) as Order[]
      const nextPizzas = extractCollection(pizzasRes.data, ['pizzas', 'items', 'data']) as Pizza[]
      setOrders(nextOrders)
      setPizzas(nextPizzas)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar dados administrativos. Verifique a API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadAdminData()
  }, [])

  const totalRevenue = useMemo(() => orders.reduce((sum, order) => sum + Number(order.total || 0), 0), [orders])
  const activeOrders = useMemo(() => orders.filter((order) => order.status !== 'delivered' && order.status !== 'cancelled').length, [orders])

  if (loading) {
    return (
      <main className="container-app py-8">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm">Carregando painel administrativo...</div>
      </main>
    )
  }

  return (
    <main className="container-app py-8">
      <section className="rounded-4xl bg-linear-to-r from-slate-950 via-teal-700 to-cyan-600 p-8 text-white shadow-[0_30px_80px_-40px_rgba(8,47,73,0.85)]">
        <p className="text-sm uppercase tracking-[0.3em] text-cyan-100/80">Centro administrativo</p>
        <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Painel do restaurante</h1>
        <p className="mt-3 max-w-2xl text-cyan-50/90">Escolha a área que deseja gerenciar: pedidos ou cardápio.</p>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-cyan-100">Pedidos ativos</p>
            <p className="mt-2 text-3xl font-bold">{activeOrders}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-cyan-100">Pizzas no menu</p>
            <p className="mt-2 text-3xl font-bold">{pizzas.length}</p>
          </div>
          <div className="rounded-3xl bg-white/10 p-4 backdrop-blur-sm">
            <p className="text-sm text-cyan-100">Faturamento</p>
            <p className="mt-2 text-3xl font-bold">R$ {totalRevenue.toFixed(2)}</p>
          </div>
        </div>
      </section>

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
        <article className="rounded-3xl border border-slate-200 bg-teal-50 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Pedidos</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Gerenciar pedidos</h2>
              <p className="mt-2 text-sm text-slate-500">Acompanhe pedidos, altere status e remova registros.</p>
            </div>
            <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">Tela dedicada</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/admin/orders" className="rounded-full bg-teal-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-700">Abrir pedidos</Link>
          </div>
        </article>

        <article className="rounded-3xl border border-slate-200 bg-teal-50 p-6 shadow-sm">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Cardápio</p>
              <h2 className="mt-2 text-2xl font-semibold text-slate-950">Gerenciar pizzas</h2>
              <p className="mt-2 text-sm text-slate-500">Cadastre novos sabores, edite o menu e remova itens.</p>
            </div>
            <span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">Tela dedicada</span>
          </div>

          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/admin/pizzas" className="rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-slate-700">Abrir pizzas</Link>
          </div>
        </article>
      </section>
    </main>
  )
}

export default Admin
