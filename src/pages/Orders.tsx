import React, { useEffect, useState } from 'react'
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

const normalizeStatus = (status: string) => {
  const value = status.toLowerCase().trim()
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
    entregue: 'delivered',
    delivered: 'delivered',
    cancelado: 'cancelled',
    cancelled: 'cancelled',
  }

  return aliases[value] ?? value
}

const statusBadgeClass = (status: string) => {
  const normalized = normalizeStatus(status)
  switch (normalized) {
    case 'completed':
      return 'bg-emerald-100 text-emerald-700'
    case 'preparing':
      return 'bg-amber-100 text-amber-700'
    case 'on_the_way':
      return 'bg-cyan-100 text-cyan-700'
    case 'delivered':
      return 'bg-blue-100 text-blue-700'
    case 'cancelled':
      return 'bg-rose-100 text-rose-700'
    default:
      return 'bg-slate-100 text-slate-700'
  }
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    api
      .get('/orders/my')
      .then((res) => setOrders(res.data))
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar seus pedidos. Verifique a API.')
      })
      .finally(() => setLoading(false))
  }, [])

  return (
    <main className="container-app py-8 text-left">
      <div className="rounded-4xl bg-white p-8 shadow-[0_25px_60px_-30px_rgba(15,23,42,0.2)]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-700">Histórico</p>
            <h1 className="mt-2 text-3xl font-semibold">Meus Pedidos</h1>
          </div>
        </div>

        {loading ? (
          <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center text-slate-600">Carregando pedidos...</div>
        ) : error ? (
          <div className="mt-6 rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700">{error}</div>
        ) : orders.length === 0 ? (
          <div className="mt-6 rounded-3xl bg-slate-50 p-8 text-center text-slate-600">Você ainda não fez nenhum pedido.</div>
        ) : (
          <div className="mt-6 space-y-4">
            {orders.map((order) => {
              const normalizedStatusValue = normalizeStatus(order.status)
              const statusText = statusOptions.find((option) => option.value === normalizedStatusValue)?.label ?? order.status

              return (
                <article key={order._id} className="rounded-3xl border border-slate-200 p-6">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <div className="text-sm text-slate-500">Pedido #{order._id}</div>
                      <div className={`mt-2 inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusBadgeClass(order.status)}`}>{statusText}</div>
                      {order.deliveryFee !== undefined && (
                        <div className="mt-3 text-sm text-slate-500">Taxa de entrega: R$ {order.deliveryFee.toFixed(2)}</div>
                      )}
                      {order.deliveryAddress && (
                        <div className="mt-2 text-sm text-slate-500">
                          Endereço: {order.deliveryAddress.street}, {order.deliveryAddress.number}
                          {order.deliveryAddress.complement ? ` (${order.deliveryAddress.complement})` : ''} — {order.deliveryAddress.city}
                        </div>
                      )}
                    </div>
                    <div className="text-left sm:text-right">
                      <div className="text-xl font-semibold">R$ {order.total.toFixed(2)}</div>
                      <div className="text-sm text-slate-500">{order.items.length} item(s)</div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </main>
  )
}

export default Orders
