import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import StockSearchResult from './components/StockSearchResult';
import Settings from './components/Settings';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../lib/storage';
import { initI18n, t } from '../lib/i18n';
import type { User, StockGroup, StockSearchResult as StockSearchResultType } from '../lib/types';

type Page = 'login' | 'main' | 'settings' | 'search-results';

export default function App() {
  const [page, setPage] = useState<Page>('login');
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState<StockSearchResultType[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [localeReady, setLocaleReady] = useState(false);
  const [groups, setGroups] = useState<StockGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');

  useEffect(() => {
    init();
  }, []);

  async function init() {
    await initI18n();
    setLocaleReady(true);
    await checkAuth();
    await checkSearchResults();
  }

  async function loadGroupsAndSelection() {
    const groupId = await getStorageItem<string>(STORAGE_KEYS.DEFAULT_GROUP_ID);
    if (groupId) {
      setSelectedGroupId(groupId);
    }

    try {
      const response = await new Promise<{ groups?: StockGroup[] }>((resolve) => {
        chrome.runtime.sendMessage({ type: 'GET_PREFERENCES' }, resolve);
      });
      if (response.groups) {
        setGroups(response.groups);
        // If no group selected yet, select the first one
        if (!groupId && response.groups.length > 0) {
          setSelectedGroupId(response.groups[0].id);
          await setStorageItem(STORAGE_KEYS.DEFAULT_GROUP_ID, response.groups[0].id);
        }
      }
    } catch {
      // Ignore
    }
  }

  async function handleGroupChange(groupId: string) {
    setSelectedGroupId(groupId);
    await setStorageItem(STORAGE_KEYS.DEFAULT_GROUP_ID, groupId);
  }

  async function checkAuth() {
    const storedUser = await getStorageItem<User>(STORAGE_KEYS.USER);
    const accessToken = await getStorageItem<string>(STORAGE_KEYS.ACCESS_TOKEN);

    if (storedUser && accessToken) {
      setUser(storedUser);
      setPage('main');
      await loadGroupsAndSelection();
    }
    setLoading(false);
  }

  async function checkSearchResults() {
    const results = await getStorageItem<StockSearchResultType[]>('searchResults');
    const query = await getStorageItem<string>('searchQuery');

    if (results && results.length > 0) {
      setSearchResults(results);
      setSearchQuery(query || '');
      setPage('search-results');

      chrome.storage.local.remove(['searchResults', 'searchQuery']);
    }
  }

  async function handleLoginSuccess(userData: User) {
    setUser(userData);
    setPage('main');
    await loadGroupsAndSelection();
  }

  function handleLogout() {
    setUser(null);
    setPage('login');
  }

  function handleSearchResultAdded() {
    setPage('main');
    setSearchResults([]);
    setSearchQuery('');
  }

  if (loading || !localeReady) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="w-[380px] min-h-[500px] bg-gray-50 font-body">
      <header className="bg-white/80 backdrop-blur-lg border-b border-gray-200 px-4 py-2.5 sticky top-0 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
              S
            </div>
            <h1 className="text-base font-display font-bold text-gray-900">{t('app.name')}</h1>
          </div>
          {user && (
            <button
              onClick={() => setPage('settings')}
              className="text-gray-500 hover:text-gray-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          )}
        </div>
      </header>

      <main className="p-4">
        {page === 'login' && (
          <LoginForm onSuccess={handleLoginSuccess} />
        )}
        {page === 'main' && user && (
          <div className="space-y-3">
            <div className="bg-white/72 backdrop-blur-sm rounded-2xl border border-white/45 p-3 shadow-sm">
              <p className="text-xs text-gray-500">{t('main.welcomeBack')}</p>
              <p className="text-base font-semibold text-gray-900">{user.name}</p>
            </div>
            {groups.length > 0 && (
              <div className="bg-white/72 backdrop-blur-sm rounded-2xl border border-white/45 p-3 shadow-sm">
                <label className="text-xs text-gray-500 block mb-1.5">{t('settings.defaultGroup')}</label>
                <select
                  value={selectedGroupId}
                  onChange={(e) => handleGroupChange(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-gray-900 focus:outline-none focus:border-gray-400 transition-all"
                >
                  {groups.map((group) => (
                    <option key={group.id} value={group.id}>
                      {group.name || (group.type === 'system' ? group.id : t('group.untitled'))}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="bg-white/72 backdrop-blur-sm rounded-2xl border border-white/45 p-3 shadow-sm">
              <p className="text-xs text-gray-500 mb-1.5">{t('main.quickActions')}</p>
              <p className="text-[11px] text-gray-400">
                {t('main.quickActionsDesc')}
              </p>
            </div>
            <button
              onClick={() => setPage('settings')}
              className="w-full ghost"
            >
              {t('common.settings')}
            </button>
          </div>
        )}
        {page === 'settings' && (
          <Settings
            user={user}
            onLogout={handleLogout}
            onBack={() => setPage('main')}
          />
        )}
        {page === 'search-results' && (
          <StockSearchResult
            results={searchResults}
            query={searchQuery}
            onAdded={handleSearchResultAdded}
            onCancel={() => setPage('main')}
          />
        )}
      </main>
    </div>
  );
}
