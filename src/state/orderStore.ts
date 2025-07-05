// @state/orderStore.ts
import {create} from 'zustand';

interface OrderStore {
  pastOrders: any[];
  setPastOrders: (orders: any[]) => void;
}

export const useOrderStore = create<OrderStore>((set) => ({
  pastOrders: [],
  setPastOrders: (orders) => set({pastOrders: orders}),
}));
