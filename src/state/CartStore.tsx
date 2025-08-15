import {create} from 'zustand';
import {mmkvStorage} from './storage';
import {createJSONStorage, persist} from 'zustand/middleware';

interface CartItem {
  _id: string | number;
  item: any;
  price: number; // discounted price (used for totals/billing)
  mrp?: number; // original price
  count: number;
}

interface CartStore {
  cart: CartItem[];
  addItem: (item: any) => void;
  removeItem: (id: string | number) => void;
  clearCart: () => void;
  getItemCount: (id: string | number) => number;
  getTotalPrice: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      cart: [],

      addItem: product => {
        console.log('Adding product:', product);
        const _id = product._id || product.id;
        if (!_id) {
          console.warn('❗ Cannot add item without valid _id:', product);
          return;
        }

        // ✅ Always pick discounted price first — NEVER fallback to MRP silently
        const discountPrice = Number(
          product.discountPrice ??
            product.offerPrice ??
            product.salePrice ??
            product.discountedPrice ??
            product.item?.price ??
            NaN,
        );

        if (isNaN(discountPrice)) {
          console.warn(
            `⚠ No discount price found for product ${_id}. You must pass it in the UI/API mapping.`,
            product,
          );
          return; // Stop if no valid price found
        }

        // ✅ Store MRP separately
        const mrp = Number(
          product.mrp ?? // Explicit MRP field if present
            (product.price && product.price > discountPrice
              ? product.price
              : discountPrice),
        );

        const currentCart = get().cart;
        const existingItemIndex = currentCart.findIndex(
          cartItem => String(cartItem._id) === String(_id),
        );

        if (existingItemIndex >= 0) {
          // ✅ Increment quantity if already exists
          const updatedCart = [...currentCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            count: updatedCart[existingItemIndex].count + 1,
          };
          set({cart: updatedCart});
        } else {
          // ✅ Add new product
          set({
            cart: [
              ...currentCart,
              {
                _id,
                item: product,
                price: discountPrice, // should be 2 here
                mrp,
                count: 1,
              },
            ],
          });
          console.log('Cart after addItem:', get().cart);
        }
      },

      removeItem: id => {
        const updatedCart = get()
          .cart.map(cartItem =>
            String(cartItem._id) === String(id)
              ? {...cartItem, count: cartItem.count - 1}
              : cartItem,
          )
          .filter(cartItem => cartItem.count > 0);
        set({cart: updatedCart});
      },

      clearCart: () => set({cart: []}),

      getItemCount: id => {
        const item = get().cart.find(
          cartItem => String(cartItem._id) === String(id),
        );
        return item?.count || 0;
      },

      getTotalPrice: () => {
        return get().cart.reduce(
          (total, cartItem) => total + (cartItem.price || 0) * cartItem.count,
          0,
        );
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
