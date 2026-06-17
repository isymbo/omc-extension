import { api } from '../lib/api';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/storage';
import { initBackgroundI18n, t } from './i18n';
import type { StockSearchResult } from '../lib/types';

// Initialize i18n when service worker starts
initBackgroundI18n();

// Set up token update callback to persist refreshed tokens
api.setTokenUpdateCallback(async (accessToken, refreshToken) => {
  await setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken);
  await setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
});

// Re-initialize i18n when locale changes
chrome.storage.onChanged.addListener((changes) => {
  if (changes.locale) {
    initBackgroundI18n();
  }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'add-to-oh-my-cs',
    title: 'Add "%s" to oh-my-cs',
    contexts: ['selection'],
  });
});

chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== 'add-to-oh-my-cs' || !info.selectionText) {
    return;
  }

  const selectedText = info.selectionText.trim();
  if (!selectedText) {
    return;
  }

  const serverUrl = await getStorageItem<string>(STORAGE_KEYS.SERVER_URL);
  const accessToken = await getStorageItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = await getStorageItem<string>(STORAGE_KEYS.REFRESH_TOKEN);
  const defaultGroupId = await getStorageItem<string>(STORAGE_KEYS.DEFAULT_GROUP_ID);

  if (!serverUrl || !accessToken || !refreshToken) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'oh-my-cs',
      message: t('context.loginFirst'),
    });
    return;
  }

  if (!defaultGroupId) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'oh-my-cs',
      message: t('context.noGroup'),
    });
    return;
  }

  try {
    api.setServerUrl(serverUrl);
    api.setTokens(accessToken, refreshToken);

    const results = await api.searchStocks(selectedText);

    if (results.length === 0) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'oh-my-cs',
        message: t('context.noResults', { s: selectedText }),
      });
      return;
    }

    if (results.length === 1) {
      await addStockToGroup(results[0], defaultGroupId);
      return;
    }

    if (tab?.id) {
      await setStorageItem('searchResults', results);
      await setStorageItem('searchQuery', selectedText);

      chrome.action.openPopup();
    }
  } catch (error) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'oh-my-cs',
      message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
    });
  }
});

export async function addStockToGroup(
  stock: StockSearchResult,
  defaultGroupId: string
): Promise<void> {
  try {
    const newStock = await api.addStock({
      symbol: stock.symbol,
      name: stock.name,
      market: stock.market,
      quantity: 0,
      purchasePrice: 0,
      currentPrice: 0,
    });

    const prefs = await api.getPreferences();
    const assignments = prefs.groupAssignments || {};

    if (!assignments[defaultGroupId]) {
      assignments[defaultGroupId] = [];
    }

    if (!assignments[defaultGroupId].includes(newStock.id)) {
      assignments[defaultGroupId].push(newStock.id);
    }

    await api.updatePreferences({
      ...prefs,
      groupAssignments: assignments,
    });

    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'oh-my-cs',
      message: t('context.added', { name: stock.name, symbol: stock.symbol }),
    });
  } catch (error) {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icons/icon128.png',
      title: 'oh-my-cs',
      message: t('context.failed', { error: error instanceof Error ? error.message : 'Unknown error' }),
    });
  }
}

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'LOGIN') {
    handleLogin(message.serverUrl, message.email, message.password)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === 'LOGOUT') {
    handleLogout().then(() => sendResponse({ success: true }));
    return true;
  }

  if (message.type === 'SEARCH_STOCKS') {
    handleSearchStocks(message.query)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === 'ADD_STOCK') {
    handleAddStock(message.stock, message.groupId)
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === 'GET_PREFERENCES') {
    handleGetPreferences()
      .then(sendResponse)
      .catch((err) => sendResponse({ error: err.message }));
    return true;
  }

  if (message.type === 'UPDATE_DEFAULT_GROUP') {
    setStorageItem(STORAGE_KEYS.DEFAULT_GROUP_ID, message.groupId)
      .then(() => sendResponse({ success: true }));
    return true;
  }
});

async function handleLogin(serverUrl: string, email: string, password: string) {
  api.setServerUrl(serverUrl);
  const authData = await api.login(email, password);

  await setStorageItem(STORAGE_KEYS.SERVER_URL, serverUrl);
  await setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, authData.token || authData.access_token);
  await setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, authData.refresh_token);
  await setStorageItem(STORAGE_KEYS.USER, authData.user);

  return { success: true, user: authData.user };
}

async function handleLogout() {
  await setStorageItem(STORAGE_KEYS.ACCESS_TOKEN, '');
  await setStorageItem(STORAGE_KEYS.REFRESH_TOKEN, '');
  await setStorageItem(STORAGE_KEYS.USER, null);
}

async function handleSearchStocks(query: string) {
  const serverUrl = await getStorageItem<string>(STORAGE_KEYS.SERVER_URL);
  const accessToken = await getStorageItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = await getStorageItem<string>(STORAGE_KEYS.REFRESH_TOKEN);

  if (!serverUrl || !accessToken || !refreshToken) {
    throw new Error('Not authenticated');
  }

  api.setServerUrl(serverUrl);
  api.setTokens(accessToken, refreshToken);

  return api.searchStocks(query);
}

async function handleAddStock(stock: StockSearchResult, groupId: string) {
  const serverUrl = await getStorageItem<string>(STORAGE_KEYS.SERVER_URL);
  const accessToken = await getStorageItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = await getStorageItem<string>(STORAGE_KEYS.REFRESH_TOKEN);

  if (!serverUrl || !accessToken || !refreshToken) {
    throw new Error('Not authenticated');
  }

  api.setServerUrl(serverUrl);
  api.setTokens(accessToken, refreshToken);

  const newStock = await api.addStock({
    symbol: stock.symbol,
    name: stock.name,
    market: stock.market,
    quantity: 0,
    purchasePrice: 0,
    currentPrice: 0,
  });

  const prefs = await api.getPreferences();
  const assignments = prefs.groupAssignments || {};

  if (!assignments[groupId]) {
    assignments[groupId] = [];
  }

  if (!assignments[groupId].includes(newStock.id)) {
    assignments[groupId].push(newStock.id);
  }

  await api.updatePreferences({
    ...prefs,
    groupAssignments: assignments,
  });

  return { success: true, stock: newStock };
}

async function handleGetPreferences() {
  const serverUrl = await getStorageItem<string>(STORAGE_KEYS.SERVER_URL);
  const accessToken = await getStorageItem<string>(STORAGE_KEYS.ACCESS_TOKEN);
  const refreshToken = await getStorageItem<string>(STORAGE_KEYS.REFRESH_TOKEN);

  if (!serverUrl || !accessToken || !refreshToken) {
    throw new Error('Not authenticated');
  }

  api.setServerUrl(serverUrl);
  api.setTokens(accessToken, refreshToken);

  return api.getPreferences();
}
