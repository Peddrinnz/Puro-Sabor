import React, { useEffect, useMemo, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import api from '../services/api'
import { useCart } from '../context/CartContext'

const DELIVERY_FEE = 10.0

type AddressForm = {
  street: string
  number: string
  complement?: string
  city: string
  zipCode: string
}

const Checkout: React.FC = () => {
  const { items, total, removeItem, updateQuantity, clearCart } = useCart()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [cepLoading, setCepLoading] = useState(false)
  const [address, setAddress] = useState<AddressForm>({ street: '', number: '', complement: '', city: '', zipCode: '' })
  const [editingAddress, setEditingAddress] = useState(true)
  const nav = useNavigate()

  const handleLookupCep = async () => {
    const cep = address.zipCode.replace(/\D/g, '')
    if (cep.length !== 8) {
      setError('CEP inválido. Digite 8 números.')
      return
    }

    setError(null)
    setCepLoading(true)

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await response.json()

      if (data.erro) {
        setError('CEP não encontrado.')
        return
      }

      setAddress((current) => {
        const rawComplement = data.complemento ?? ''
        const hasLetters = /[A-Za-zÀ-ÖØ-öø-ÿ]/.test(rawComplement)
        const isDigitsOnly = /^\d+$/.test(String(rawComplement).trim())
        const complementToUse = hasLetters && !isDigitsOnly ? rawComplement : current.complement

        return {
          ...current,
          street: data.logradouro || current.street,
          complement: complementToUse,
          city: data.localidade || current.city,
          zipCode: cep,
        }
      })
    } catch (err) {
      console.error(err)
      setError('Não foi possível buscar o CEP. Verifique sua conexão.')
    } finally {
      setCepLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (items.length === 0) {
      setError('Seu carrinho está vazio.')
      return
    }

    if (!address.street || !address.number || !address.city || !address.zipCode) {
      setError('Preencha o endereço de entrega.')
      return
    }

    setError(null)
    setLoading(true)

    const addressPayload = {
      ...address,
      number: Number(address.number) || address.number,
    }

    try {
      await api.post('/orders', {
        items: items.map((item) => ({ pizza: item.pizza, quantity: item.quantity, price: item.pizza.price })),
        deliveryAddress: addressPayload,
      })
      clearCart()
      nav('/orders')
    } catch (err) {
      console.error(err)
      if (axios.isAxiosError(err) && err.response?.data) {
        const detail = (err.response.data as any).message || JSON.stringify(err.response.data)
        setError(`Não foi possível finalizar o pedido: ${detail}`)
      } else if (err instanceof Error) {
        setError(err.message)
      } else {
        setError('Não foi possível finalizar o pedido. Verifique a API.')
      }
    } finally {
      setLoading(false)
    }
  }

  const orderSubtotal = useMemo(() => total, [total])
  const orderTotal = useMemo(() => total + DELIVERY_FEE, [total])

  useEffect(() => {
    if (user && Array.isArray(user.addresses) && user.addresses.length > 0) {
      const profileAddress = user.addresses[0]
      setAddress({
        street: profileAddress.street || '',
        number: String(profileAddress.number ?? ''),
        complement: profileAddress.complement || '',
        city: profileAddress.city || '',
        zipCode: profileAddress.zipCode || '',
      })
      // prefill but keep inputs locked until user chooses to edit
      setEditingAddress(false)
    } else {
      setEditingAddress(true)
    }
  }, [user])

  return (
    <main className="container-app py-8">
      <div className="grid gap-8 lg:grid-cols-[1.3fr_0.7fr]">
        <section className="rounded-3xl bg-white p-8 shadow-sm">
          <h1 className="text-3xl font-semibold mb-4">Carrinho</h1>
          {items.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-slate-300 p-8 text-center text-slate-600">Sem itens no carrinho.</div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.pizza._id} className="rounded-3xl border border-slate-200 p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">{item.pizza.name}</h2>
                      <p className="text-sm text-slate-500">R$ {item.pizza.price.toFixed(2)} cada</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                      <button type="button" onClick={() => updateQuantity(item.pizza._id, item.quantity - 1)} className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200">-</button>
                      <span className="w-8 text-center text-slate-700">{item.quantity}</span>
                      <button type="button" onClick={() => updateQuantity(item.pizza._id, item.quantity + 1)} className="rounded-full border border-slate-300 bg-slate-100 px-3 py-1 text-slate-700 hover:bg-slate-200">+</button>
                      <button type="button" onClick={() => removeItem(item.pizza._id)} className="ml-4 rounded-2xl border border-red-200 bg-red-50 px-3 py-1 text-sm text-red-600 hover:bg-red-100">Remover</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <aside className="rounded-3xl bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-semibold mb-4">Local de entrega</h2>
          <form onSubmit={(e) => { e.preventDefault(); handleSubmit(); }} className="space-y-4">
            {user && Array.isArray(user.addresses) && user.addresses.length > 0 && (
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">Usando endereço do perfil</div>
                <div className="flex items-center gap-2">
                  {!editingAddress ? (
                    <button type="button" onClick={() => setEditingAddress(true)} className="rounded-full border border-slate-300 px-3 py-1 text-sm transition hover:bg-slate-100">Editar</button>
                  ) : (
                    <button type="button" onClick={() => {
                      // reset to profile address and stop editing
                      const profileAddress = user.addresses![0]
                      setAddress({
                        street: profileAddress.street || '',
                        number: String(profileAddress.number ?? ''),
                        complement: profileAddress.complement || '',
                        city: profileAddress.city || '',
                        zipCode: profileAddress.zipCode || '',
                      })
                      setEditingAddress(false)
                    }} className="rounded-full border border-slate-300 px-3 py-1 text-sm transition hover:bg-slate-100">Usar salvo</button>
                  )}
                </div>
              </div>
            )}
            <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
              <input
                value={address.zipCode}
                onChange={(e) => setAddress((s) => ({ ...s, zipCode: e.target.value }))}
                placeholder="CEP"
                className="w-full rounded-2xl border border-slate-300 px-4 py-3"
                disabled={!editingAddress}
              />
              <button
                type="button"
                onClick={handleLookupCep}
                disabled={cepLoading}
                className="inline-flex items-center justify-center rounded-2xl bg-slate-900 px-4 py-3 text-white transition hover:bg-slate-800 disabled:opacity-60"
              >
                {cepLoading ? 'Buscando CEP...' : 'Buscar CEP'}
              </button>
            </div>
            <input
              value={address.street}
              onChange={(e) => setAddress((s) => ({ ...s, street: e.target.value }))}
              placeholder="Rua"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              disabled={!editingAddress}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={address.number}
                onChange={(e) => setAddress((s) => ({ ...s, number: e.target.value }))}
                placeholder="Número"
                className="rounded-2xl border border-slate-300 px-4 py-3"
                disabled={!editingAddress}
              />
              <input
                value={address.city}
                onChange={(e) => setAddress((s) => ({ ...s, city: e.target.value }))}
                placeholder="Cidade"
                className="rounded-2xl border border-slate-300 px-4 py-3"
                disabled={!editingAddress}
              />
            </div>
            <input
              value={address.complement}
              onChange={(e) => setAddress((s) => ({ ...s, complement: e.target.value }))}
              placeholder="Complemento (opcional)"
              className="w-full rounded-2xl border border-slate-300 px-4 py-3"
              disabled={!editingAddress}
            />
            <div className="rounded-3xl bg-slate-50 p-5 text-slate-700">
              <div className="flex justify-between text-sm mb-2"><span>Subtotal</span><strong>R$ {orderSubtotal.toFixed(2)}</strong></div>
              <div className="flex justify-between text-sm mb-2"><span>Taxa de entrega</span><strong>R$ {DELIVERY_FEE.toFixed(2)}</strong></div>
              <div className="flex justify-between text-base font-semibold border-t border-slate-200 pt-3"><span>Total</span><strong>R$ {orderTotal.toFixed(2)}</strong></div>
            </div>
            {error && <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700">{error}</div>}
            <button type="submit" disabled={loading || items.length === 0} className="w-full rounded-2xl bg-teal-600 px-4 py-3 text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60">
              {loading ? 'Finalizando...' : 'Finalizar Pedido'}
            </button>
          </form>
        </aside>
      </div>
    </main>
  )
}

export default Checkout
