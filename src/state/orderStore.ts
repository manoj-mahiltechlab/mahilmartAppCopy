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
import { fetchCustomerOrders } from '@service/orderService';

interface OrderStore {
  pastOrders: any[];
  setPastOrders: (orders: any[]) => void;
  getPendingOrdersCount: () => number;
  fetchOrders: () => Promise<void>;
  loading: boolean;
}

export const useOrderStore = create<OrderStore>((set, get) => ({
  pastOrders: [],
  loading: false,

  setPastOrders: (orders) => set({ pastOrders: orders }),

  getPendingOrdersCount: () =>
    get().pastOrders.filter(
      order => order.status?.toLowerCase() === 'pending'
    ).length,

  fetchOrders: async () => {
    set({ loading: true });
    try {
      const data = await fetchCustomerOrders();
      set({ pastOrders: data });
    } catch (err) {
      console.error('❌ Failed to fetch orders:', err);
    } finally {
      set({ loading: false });
    }
  },
}));

