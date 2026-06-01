import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import api from '../services/api'
import type { Order } from '../types'

const statusOptions = [
  { value: 'pending', label: 'Pendente' },
  { value: 'completed', label: 'Concluído' },
  { value: 'preparing', label: 'Em preparo' },
  { value: 'on_the_way', label: 'A caminho' },
  { value: 'delivered', label: 'Entregue' },
  { value: 'cancelled', label: 'Cancelado' },
]

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

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null)
  const [deletingOrderId, setDeletingOrderId] = useState<string | null>(null)
  const [adminMessage, setAdminMessage] = useState<string | null>(null)

  const normalizeStatus = (status: string) => {
    const normalized = status.toLowerCase().trim()
    const aliases: Record<string, string> = {
      concluido: 'completed',
      complete: 'completed',
      finalized: 'completed',
      finalizado: 'completed',
      pendente: 'pending',
      pending: 'pending',
      preparando: 'preparing',
      'em preparo': 'preparing',
      preparing: 'preparing',
      'a caminho': 'on_the_way',
      on_the_way: 'on_the_way',
      caminho: 'on_the_way',
      entregue: 'delivered',
      delivered: 'delivered',
      cancelado: 'cancelled',
      cancelled: 'cancelled',
    }

    return aliases[normalized] ?? normalized
  }

  const statusLabel = (status: string) => {
    const normalized = normalizeStatus(status)
    return statusOptions.find((option) => option.value === normalized)?.label ?? status
  }

  const statusBadgeClass = (status: string) => {
    const normalized = normalizeStatus(status)
    switch (normalized) {
      case 'completed':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/60 dark:text-emerald-100'
      case 'preparing':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/60 dark:text-amber-100'
      case 'on_the_way':
        return 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/60 dark:text-cyan-100'
      case 'delivered':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-100'
      case 'cancelled':
        return 'bg-rose-100 text-rose-700 dark:bg-rose-900/60 dark:text-rose-100'
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-100'
    }
  }

  const loadOrders = async () => {
    setLoading(true)
    try {
      const res = await api.get('/orders')
      const nextOrders = extractCollection(res.data, ['orders', 'items', 'data']) as Order[]
      setOrders(nextOrders)
      setError(null)
    } catch (err) {
      console.error(err)
      setError('Não foi possível carregar pedidos. Verifique a API.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void loadOrders()
  }, [])

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    const attempts = [
      { method: 'patch' as const, route: `/orders/${orderId}/status`, payload: { status: newStatus } },
      { method: 'put' as const, route: `/orders/${orderId}/status`, payload: { status: newStatus } },
      { method: 'patch' as const, route: `/orders/${orderId}`, payload: { status: newStatus } },
      { method: 'put' as const, route: `/orders/${orderId}`, payload: { status: newStatus } },
      { method: 'patch' as const, route: `/orders/${orderId}/status`, payload: { status: newStatus, orderStatus: newStatus } },
      { method: 'put' as const, route: `/orders/${orderId}/status`, payload: { status: newStatus, orderStatus: newStatus } },
      { method: 'patch' as const, route: `/orders/${orderId}`, payload: { status: newStatus, orderStatus: newStatus } },
      { method: 'put' as const, route: `/orders/${orderId}`, payload: { status: newStatus, orderStatus: newStatus } },
      { method: 'patch' as const, route: `/orders/${orderId}/status`, payload: { orderStatus: newStatus } },
      { method: 'put' as const, route: `/orders/${orderId}/status`, payload: { orderStatus: newStatus } },
      { method: 'patch' as const, route: `/orders/${orderId}`, payload: { orderStatus: newStatus } },
      { method: 'put' as const, route: `/orders/${orderId}`, payload: { orderStatus: newStatus } },
    ]

    let latestError: unknown = null

    for (const attempt of attempts) {
      try {
        if (attempt.method === 'patch') {
          await api.patch(attempt.route, attempt.payload)
        } else {
          await api.put(attempt.route, attempt.payload)
        }
        return
      } catch (err) {
        latestError = err
      }
    }

    throw latestError
  }

  const deleteOrder = async (orderId: string) => {
    const routes = [`/orders/${orderId}`, `/admin/orders/${orderId}`]
    let latestError: unknown = null

    for (const route of routes) {
      try {
        await api.delete(route)
        return
      } catch (err) {
        latestError = err
      }
    }

    throw latestError
  }

  const handleDeleteOrder = async (orderId: string) => {
    setAdminMessage(null)
    setDeletingOrderId(orderId)

    try {
      await deleteOrder(orderId)
      setAdminMessage('Pedido removido com sucesso.')
      await loadOrders()
    } catch (err) {
      console.error(err)
      setAdminMessage('Não foi possível remover o pedido. Verifique a API e tente novamente.')
    } finally {
      setDeletingOrderId(null)
    }
  }

  if (loading) {
    return (
      <main className="container-app py-8">
        <div className="rounded-3xl bg-white p-8 text-center shadow-sm dark:bg-slate-950 dark:text-slate-100">Carregando pedidos...</div>
      </main>
    )
  }

  return (
    <main className="container-app py-8">
      <section className="rounded-4xl bg-linear-to-r from-slate-950 via-teal-700 to-cyan-600 p-8 text-white shadow-[0_30px_80px_-40px_rgba(8,47,73,0.85)]">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-cyan-100/80">Admin</p>
            <h1 className="mt-3 text-4xl font-bold sm:text-5xl">Pedidos</h1>
            <p className="mt-3 max-w-2xl text-cyan-50/90">Gerencie status e remova pedidos em uma tela dedicada.</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link to="/admin" className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20">Voltar ao painel</Link>
            <Link to="/admin/pizzas" className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-teal-700 transition hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">Gerenciar pizzas</Link>
          </div>
        </div>
      </section>

      {adminMessage && (
        <div className="mt-5 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-800">
          {adminMessage}
        </div>
      )}

      {error && (
        <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <section className="mt-6 rounded-3xl border border-slate-200 bg-white p-6 text-slate-950 shadow-sm dark:border-slate-800/70 dark:bg-slate-950/95 dark:text-slate-100">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700 dark:text-teal-300">Controle de pedidos</p>
            <h2 className="mt-2 text-2xl font-semibold text-slate-950 dark:text-slate-100">Atualização de status</h2>
          </div>
          <span className="rounded-full bg-teal-100 px-3 py-1 text-xs font-semibold text-teal-700">{orders.length} no total</span>
        </div>

        <div className="space-y-3">
          {orders.length === 0 ? (
            <div className="rounded-3xl bg-slate-50 p-6 text-slate-600 dark:bg-slate-900 dark:text-slate-100">Nenhum pedido encontrado.</div>
          ) : (
            orders.map((order) => (
              <article key={order._id} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 dark:border-slate-800/70 dark:bg-slate-900/95 dark:text-slate-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Pedido #{order._id}</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">Total R$ {order.total.toFixed(2)}</p>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{order.items.length} item(s) • entrega {order.deliveryFee ? `R$ ${order.deliveryFee.toFixed(2)}` : 'grátis'}</p>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>
                    {statusLabel(order.status)}
                  </span>
                </div>

                <div className="mt-4 flex flex-col gap-3 rounded-2xl bg-white p-3 border border-slate-200 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800/70 dark:bg-slate-950/90">
                  <select
                    value={normalizeStatus(order.status)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-4 py-2 text-slate-700 sm:max-w-xs dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                    onChange={async (event) => {
                      const newStatus = event.target.value
                      setUpdatingOrderId(order._id)
                      try {
                        await updateOrderStatus(order._id, newStatus)
                        setOrders((current) => current.map((item) => (item._id === order._id ? { ...item, status: newStatus } : item)))
                        setAdminMessage(`Status atualizado para ${statusLabel(newStatus)}.`)
                      } catch (err) {
                        console.error(err)
                        await loadOrders()
                        setAdminMessage('Não foi possível atualizar o status. Tente novamente.')
                      } finally {
                        setUpdatingOrderId(null)
                      }
                    }}
                    disabled={updatingOrderId === order._id}
                  >
                    {statusOptions.map((option) => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-100">
                      {updatingOrderId === order._id ? 'Salvando...' : 'Selecione um status'}
                    </span>
                    <button
                      type="button"
                      onClick={() => void handleDeleteOrder(order._id)}
                      disabled={deletingOrderId === order._id}
                      className="rounded-full bg-rose-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {deletingOrderId === order._id ? 'Removendo...' : 'Remover pedido'}
                    </button>
                  </div>
                </div>
              </article>
            ))
          )}
        </div>
      </section>
    </main>
  )
}

export default AdminOrders
