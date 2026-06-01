import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api, { getImageUrl } from '../services/api'
import type { Pizza } from '../types'
import { useCart } from '../context/CartContext'

const PizzaDetails: React.FC = () => {
  const { id } = useParams()
  const [pizza, setPizza] = useState<Pizza | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { addToCart } = useCart()
  const nav = useNavigate()

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api
      .get(`/pizzas/${id}`)
      .then((res) => setPizza(res.data))
      .catch((err) => {
        console.error(err)
        setError('Não foi possível carregar esta pizza. Verifique a API.')
      })
      .finally(() => setLoading(false))
  }, [id])

  const totalPrice = useMemo(() => pizza ? pizza.price * quantity : 0, [pizza, quantity])

  const handleAddToCart = () => {
    if (!pizza) return
    addToCart(pizza, quantity)
    nav('/checkout')
  }

  if (loading) {
    return (
      <main className="container-app py-8">
        <div className="rounded-3xl bg-white p-8 shadow-sm text-center">Carregando detalhes...</div>
      </main>
    )
  }

  if (error || !pizza) {
    return (
      <main className="container-app py-8">
        <div className="rounded-3xl bg-red-50 border border-red-200 p-8 text-red-700">{error ?? 'Pizza não encontrada.'}</div>
      </main>
    )
  }

  return (
    <main className="container-app py-8">
      <div className="rounded-3xl bg-white p-8 shadow-sm dark:bg-slate-950 dark:text-slate-100">
        <button onClick={() => nav(-1)} className="mb-6 text-sm text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Voltar</button>
        <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            {getImageUrl(pizza.image) ? (
              <div className="mb-8 overflow-hidden rounded-4xl bg-slate-100 dark:bg-slate-900">
                <img src={getImageUrl(pizza.image)} alt={pizza.name} className="h-80 w-full object-cover" />
              </div>
            ) : null}
            <h1 className="text-4xl font-semibold text-slate-900 dark:text-white">{pizza.name}</h1>
            <p className="mt-4 text-slate-600 dark:text-slate-300">{pizza.description}</p>
            <div className="mt-6 flex flex-wrap gap-2">
              {pizza.ingredients.map((ingredient) => (
                <span key={ingredient} className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">{ingredient}</span>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-900/95 dark:text-slate-100">
            <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
              <span>Preço unitário</span>
              <strong>R$ {pizza.price.toFixed(2)}</strong>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              <span className="text-sm text-slate-500">Quantidade</span>
              <div className="flex items-center gap-2 rounded-full border border-slate-300 px-3 py-2">
                <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))} className="text-xl">-</button>
                <span className="w-10 text-center text-lg font-semibold">{quantity}</span>
                <button type="button" onClick={() => setQuantity(quantity + 1)} className="text-xl">+</button>
              </div>
            </div>
            <div className="mt-6 flex items-center justify-between text-slate-300">
              <span>Total</span>
              <strong>R$ {totalPrice.toFixed(2)}</strong>
            </div>
            <button onClick={handleAddToCart} className="mt-6 w-full rounded-2xl bg-teal-600 px-4 py-3 text-white transition hover:bg-teal-700">
              Adicionar ao Carrinho
            </button>
          </div>
        </div>
      </div>
    </main>
  )
}

export default PizzaDetails
