// import {create} from 'zustand';
// import {mmkvStorage} from './storage';
// import {createJSONStorage, persist} from 'zustand/middleware';

// interface CartItem {
//   _id: string | number;
//   item: any;
//   count: number;
// }
// interface CartStore {
//   cart: CartItem[];
//   addItem: (item: any) => void;
//   removeItem: (id: string | number) => void;
//   clearCart: () => void;
//   getItemCount: (id: string | number) => number;
//   getTotalPrice: () => number;
// }

// export const useCartStore = create<CartStore>()(
//   persist(
//     (set, get) => ({
//       cart: [],
//       addItem: item => {
//         const currentCart = get().cart;
//         const existingItemIndex = currentCart.findIndex(
//           cartItem => String(cartItem._id) === String(item._id),
//         );

//         //WHEN ITEM EXIST
//         if (existingItemIndex >= 0) {
//           const updatedCart = [...currentCart];
//           updatedCart[existingItemIndex] = {
//             ...updatedCart[existingItemIndex],
//             count: updatedCart[existingItemIndex].count + 1,
//           };
//           set({cart: updatedCart});
//         } else {
//           set({
//             cart: [...currentCart, {_id: item._id, item: item, count: 1}],
//           });
//         }
//       },
//       clearCart: () => set({cart: []}),

//       removeItem: id => {
//         const currentCart = get().cart;
//         const existingItemIndex = currentCart.findIndex(
//           cartItem => cartItem?._id === id,
//         );

//         if (existingItemIndex >= 0) {
//           const updatedCart = [...currentCart];
//           const existingItem = updatedCart[existingItemIndex];

//           if (existingItem.count > 1) {
//             updatedCart[existingItemIndex] = {
//               ...existingItem,
//               count: existingItem?.count - 1,
//             };
//           } else {
//             updatedCart.splice(existingItemIndex, 1);
//           }
//           set({cart: updatedCart});
//         }
//       },
//       getItemCount: id => {
//         const currentItem = get().cart.find(cartItem => cartItem._id === id);
//         return currentItem ? currentItem?.count : 0;
//       },
//       getTotalPrice: () => {
//         return get().cart.reduce(
//           (total, cartItem) => total + cartItem.item.price * cartItem.count,
//           0,
//         );
//       },
//     }),
//     {
//       name: 'cart-storage',
//       storage: createJSONStorage(() => mmkvStorage),
//     },
//   ),
// );

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
        const itemId = String(item._id);
        console.log('Add item', String(item._id));
        set(state => {
          const cart = [...state.cart];
          const index = cart.findIndex(i => String(i._id) === itemId);
          if (index >= 0) {
            cart[index] = {...cart[index], count: cart[index].count + 1};
          } else {
            cart.push({_id: itemId, item, count: 1});
          }
          return {cart};
        });
      },

      removeItem: id => {
        const itemId = String(id);
        console.log('Remove item', String(id));
        set(state => {
          const cart = [...state.cart];
          const index = cart.findIndex(i => String(i._id) === itemId);
          if (index >= 0) {
            if (cart[index].count > 1) {
              cart[index] = {...cart[index], count: cart[index].count - 1};
            } else {
              cart.splice(index, 1);
            }
          }
          return {cart};
        });
      },

      clearCart: () => set({cart: []}),

      getItemCount: id => {
        const currentItem = get().cart.find(i => String(i._id) === String(id));
        return currentItem ? currentItem.count : 0;
      },

      getTotalPrice: () => {
        return get().cart.reduce((total, {item, count}) => {
          const price = Number(item?.price) || 0;
          return total + price * count;
        }, 0);
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
