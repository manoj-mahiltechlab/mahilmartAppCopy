// // @state/orderStore.ts
// import {create} from 'zustand';

// interface OrderStore {
//   pastOrders: any[];
//   setPastOrders: (orders: any[]) => void;
// }

// export const useOrderStore = create<OrderStore>((set) => ({
//   pastOrders: [],
//   setPastOrders: (orders) => set({pastOrders: orders}),
// }));


import { create } from 'zustand';

interface OrderStore {
  pastOrders: any[];
  setPastOrders: (orders: any[]) => void;
  getPendingOrdersCount: () => number;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  pastOrders: [],
  setPastOrders: (orders) => set({ pastOrders: orders }),
  getPendingOrdersCount: () =>
    get().pastOrders.filter(order => order.status?.toLowerCase() === 'pending').length,
}));
