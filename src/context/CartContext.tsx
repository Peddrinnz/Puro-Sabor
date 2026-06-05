import React, { createContext, useContext, useMemo, useState } from 'react'
import type { CartItem, Pizza } from '../types'

type CartContextType = {
  items: CartItem[]
  total: number
  itemCount: number
  addToCart: (pizza: Pizza, quantity: number) => void
  removeItem: (pizzaId: string) => void
  updateQuantity: (pizzaId: string, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([])

  const addToCart = (pizza: Pizza, quantity: number) => {
    setItems((current) => {
      const existing = current.find((item) => item.pizza._id === pizza._id)
      if (existing) {
        return current.map((item) =>
          item.pizza._id === pizza._id
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      }
      return [...current, { pizza, quantity }]
    })
  }

  const removeItem = (pizzaId: string) => {
    setItems((current) => current.filter((item) => item.pizza._id !== pizzaId))
  }

  const updateQuantity = (pizzaId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(pizzaId)
      return
    }
    setItems((current) =>
      current.map((item) =>
        item.pizza._id === pizzaId ? { ...item, quantity } : item,
      ),
    )
  }

  const clearCart = () => {
    setItems([])
  }

  const total = useMemo(
    () => items.reduce((sum, item) => sum + item.pizza.price * item.quantity, 0),
    [items],
  )

  const itemCount = useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items],
  )

  return (
    <CartContext.Provider value={{ items, total, itemCount, addToCart, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}