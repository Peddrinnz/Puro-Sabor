export type Address = {
  street: string
  number: string
  complement?: string
  city: string
  zipCode: string
}

export type User = {
  _id: string
  name: string
  email: string
  role?: 'user' | 'admin'
  addresses?: Address[]
  favoritePizzas?: string[]
}

export type Pizza = {
  _id: string
  name: string
  description: string
  price: number
  ingredients: string[]
  image?: string
  available?: boolean
}

export type OrderItem = {
  pizza: Pizza | string
  quantity: number
  price: number
}

export type Order = {
  _id: string
  user: User | string
  items: OrderItem[]
  subtotal: number
  deliveryFee?: number
  total: number
  status: string
  deliveryAddress?: Address
}

export type CartItem = {
  pizza: Pizza
  quantity: number
}
