export const STORAGE_KEYS = {
  SERVER_URL: 'serverUrl',
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
  DEFAULT_GROUP_ID: 'defaultGroupId',
} as const;

export async function getStorageItem<T>(key: string): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key] ?? null);
    });
  });
}

export async function setStorageItem<T>(key: string, value: T): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.set({ [key]: value }, resolve);
  });
}

export async function removeStorageItem(key: string): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.remove([key], resolve);
  });
}

export async function clearStorage(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.clear(resolve);
  });
}
