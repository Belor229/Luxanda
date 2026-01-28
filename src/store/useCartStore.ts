import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface CartItem {
    id: string | number
    name: string
    price: number
    image: string
    quantity: number
    vendorName?: string
}

interface CartStore {
    items: CartItem[]
    addItem: (product: any) => void
    removeItem: (productId: string | number) => void
    updateQuantity: (productId: string | number, quantity: number) => void
    clearCart: () => void
    getTotal: () => number
    getItemCount: () => number
}

export const useCartStore = create<CartStore>()(
    persist(
        (set, get) => ({
            items: [],

            addItem: (product) => {
                const currentItems = get().items
                const existingItem = currentItems.find((item) => item.id === product.id)

                if (existingItem) {
                    set({
                        items: currentItems.map((item) =>
                            item.id === product.id
                                ? { ...item, quantity: item.quantity + 1 }
                                : item
                        ),
                    })
                } else {
                    set({
                        items: [
                            ...currentItems,
                            {
                                id: product.id,
                                name: product.name,
                                price: product.price,
                                image: Array.isArray(product.images) ? product.images[0] : product.images,
                                quantity: 1,
                                vendorName: product.vendorName || product.vendor_name,
                            },
                        ],
                    })
                }
            },

            removeItem: (productId) => {
                set({
                    items: get().items.filter((item) => item.id !== productId),
                })
            },

            updateQuantity: (productId, quantity) => {
                if (quantity <= 0) {
                    get().removeItem(productId)
                    return
                }
                set({
                    items: get().items.map((item) =>
                        item.id === productId ? { ...item, quantity } : item
                    ),
                })
            },

            clearCart: () => set({ items: [] }),

            getTotal: () => {
                return get().items.reduce(
                    (total, item) => total + item.price * item.quantity,
                    0
                )
            },

            getItemCount: () => {
                return get().items.reduce((count, item) => count + item.quantity, 0)
            },
        }),
        {
            name: 'luxanda-cart-storage',
        }
    )
)
