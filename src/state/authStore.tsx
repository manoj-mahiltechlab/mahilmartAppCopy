import {create} from 'zustand';
import {persist, createJSONStorage} from 'zustand/middleware';
import {mmkvStorage} from './storage';

interface AuthStore {
  user: Record<string, any> | null;
  token: string | null;
  currentOrder: Record<string, any> | null;
  setUser: (user: any) => void;
  setToken: (token: string) => void;
  setCurrentOrder: (order: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    set => ({
      user: null,
      token: null,
      currentOrder: null,
      setUser: user => set({user}),
      setToken: token => set({token}),
      setCurrentOrder: order => set({currentOrder: order}),
      logout: () => set({user: null, token: null, currentOrder: null}),
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => mmkvStorage),
    },
  ),
);
