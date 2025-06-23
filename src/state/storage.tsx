import {MMKV} from 'react-native-mmkv';

// Create MMKV storage instances
export const tokenStorage = new MMKV({
  id: 'token-storage',
  encryptionKey: 'some_secret_key', // replace with a secure encryption key in production
});

export const storage = new MMKV({
  id: 'my-app-storage',
  encryptionKey: 'some_secret_key', // replace with a secure encryption key in production
});

// Define the storage object with common methods
export const mmkvStorage = {
  setItem: (key: string, value: string) => {
    storage.set(key, value);
  },
  getItem: (key: string) => {
    const value = storage.getString(key);
    return value ?? null;
  },
  removeItem: (key: string) => {
    storage.delete(key);
  },
  clearAll: () => storage.clearAll(),
};

// Example of how to use tokenStorage for storing sensitive tokens (like access tokens)
export const setToken = (token: string) => {
  tokenStorage.set('access_token', token);
};

export const getToken = () => {
  return tokenStorage.getString('access_token') ?? null;
};

export const removeToken = () => {
  tokenStorage.delete('access_token');
};
