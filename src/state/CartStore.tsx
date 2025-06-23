import {create} from 'zustand';
import {mmkvStorage} from './storage';
import {createJSONStorage, persist} from 'zustand/middleware';

interface CartItem {
  _id: string | number;
  item: any;
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
      addItem: item => {
        const _id = item._id || item.id;
        if (!_id) {
          console.warn('❗ Cannot add item without valid _id:', item);
          return;
        }

        const currentCart = get().cart;
        const existingItemIndex = currentCart.findIndex(
          cartItem => String(cartItem._id) === String(_id),
        );

        if (existingItemIndex >= 0) {
          const updatedCart = [...currentCart];
          updatedCart[existingItemIndex] = {
            ...updatedCart[existingItemIndex],
            count: updatedCart[existingItemIndex].count + 1,
          };
          set({cart: updatedCart});
        } else {
          set({
            cart: [...currentCart, {_id, item, count: 1}],
          });
        }
      },

      removeItem: id => {
        const currentCart = get().cart;
        const updatedCart = currentCart
          .map(cartItem =>
            String(cartItem._id) === String(id)
              ? {...cartItem, count: cartItem.count - 1}
              : cartItem,
          )
          .filter(cartItem => cartItem.count > 0);

        set({cart: updatedCart});
      },
      clearCart: () => set({cart: []}),
      getItemCount: id => {
        const item = get().cart.find(cartItem => cartItem._id === id);
        return item?.count || 0;
      },
      getTotalPrice: () => {
        return get().cart.reduce(
          (total, cartItem) =>
            total + (cartItem.item?.price || 0) * cartItem.count,
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
