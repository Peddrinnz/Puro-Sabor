export interface User {
  _id: string
  name: string
  email: string
  role?: 'user' | 'admin'
}

export interface Pizza {
  _id: string
  name: string
  description: string
  price: number
  ingredients: string[]
  image?: string
  available?: boolean
}

export interface OrderItem {
  pizza: Pizza | string
  quantity: number
  price?: number
}

export interface Order {
  _id: string
  user: User | string
  items: OrderItem[]
  total: number
  status: string
}
