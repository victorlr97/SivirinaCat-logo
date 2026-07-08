"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"

export interface CartItem {
  productId: string
  name: string
  price: number
  image: string | null
  size: string | null
  quantity: number
}

interface CartContextValue {
  items: CartItem[]
  itemCount: number
  total: number
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void
  removeItem: (productId: string, size: string | null) => void
  updateQuantity: (productId: string, size: string | null, quantity: number) => void
  clearCart: () => void
}

const CartContext = createContext<CartContextValue | null>(null)

const STORAGE_KEY = "sivirina:cart"

function sameLine(a: CartItem, productId: string, size: string | null) {
  return a.productId === productId && a.size === size
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) setItems(JSON.parse(raw))
    } catch {
      // localStorage indisponível ou dado corrompido - segue com carrinho vazio
    }
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items))
  }, [items, hydrated])

  const addItem: CartContextValue["addItem"] = (item, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => sameLine(i, item.productId, item.size))
      if (existing) {
        return prev.map((i) =>
          sameLine(i, item.productId, item.size) ? { ...i, quantity: i.quantity + quantity } : i,
        )
      }
      return [...prev, { ...item, quantity }]
    })
  }

  const removeItem: CartContextValue["removeItem"] = (productId, size) => {
    setItems((prev) => prev.filter((i) => !sameLine(i, productId, size)))
  }

  const updateQuantity: CartContextValue["updateQuantity"] = (productId, size, quantity) => {
    if (quantity < 1) {
      removeItem(productId, size)
      return
    }
    setItems((prev) => prev.map((i) => (sameLine(i, productId, size) ? { ...i, quantity } : i)))
  }

  const clearCart = () => setItems([])

  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0)
  const total = items.reduce((sum, i) => sum + i.price * i.quantity, 0)

  return (
    <CartContext.Provider value={{ items, itemCount, total, addItem, removeItem, updateQuantity, clearCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart deve ser usado dentro de um CartProvider")
  return ctx
}
