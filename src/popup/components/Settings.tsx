import { useState, useEffect } from 'react';
import type { User } from '../../lib/types';
import { getStorageItem, setStorageItem, STORAGE_KEYS } from '../../lib/storage';
import { t, getLocale, setLocale, getAvailableLocales, type Locale } from '../../lib/i18n';

interface SettingsProps {
  user: User | null;
  onLogout: () => void;
  onBack: () => void;
}

export default function Settings({ user, onLogout, onBack }: SettingsProps) {
  const [serverUrl, setServerUrl] = useState('');
  const [currentLocale, setCurrentLocale] = useState<Locale>('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSettings();
  }, []);

  async function loadSettings() {
    const storedUrl = await getStorageItem<string>(STORAGE_KEYS.SERVER_URL);
    if (storedUrl) setServerUrl(storedUrl);

    setCurrentLocale(getLocale());
    setLoading(false);
  }

  async function handleSave() {
    setSaving(true);
    setMessage('');

    try {
      await setStorageItem(STORAGE_KEYS.SERVER_URL, serverUrl);
      await setLocale(currentLocale);
      setMessage(t('settings.saved'));
      setTimeout(() => setMessage(''), 2000);
    } catch {
      setMessage(t('settings.saveFailed'));
    } finally {
      setSaving(false);
    }
  }

  async function handleLogout() {
    await new Promise<void>((resolve) => {
      chrome.runtime.sendMessage({ type: 'LOGOUT' }, () => resolve());
    });
    onLogout();
  }

  function handleLocaleChange(locale: Locale) {
    setCurrentLocale(locale);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-1 text-gray-500 hover:text-gray-700"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-display font-bold text-gray-900">{t('settings.title')}</h2>
      </div>

      {user && (
        <div className="bg-white/72 backdrop-blur-sm rounded-2xl border border-white/45 p-3 shadow-sm">
          <p className="text-xs text-gray-500">{t('settings.loggedAs')}</p>
          <p className="font-medium text-xs text-gray-900">{user.name}</p>
          <p className="text-xs text-gray-600">{user.email}</p>
        </div>
      )}

      <div className="space-y-2.5">
        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('settings.serverUrl')}
          </label>
          <input
            type="url"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            className="input"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            {t('settings.language')}
          </label>
          <div className="flex gap-2">
            {getAvailableLocales().map((locale) => (
              <button
                key={locale.code}
                onClick={() => handleLocaleChange(locale.code)}
                className={`flex-1 text-xs ${
                  currentLocale === locale.code
                    ? ''
                    : 'ghost'
                }`}
              >
                {locale.name}
              </button>
            ))}
          </div>
        </div>

        {message && (
          <div className={`p-2.5 rounded-xl text-xs ${
            message.includes(t('settings.saveFailed'))
              ? 'bg-red-50 border border-red-100 text-red-700'
              : 'bg-green-50 border border-green-100 text-green-700'
          }`}>
            {message}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full"
        >
          {saving ? t('settings.saving') : t('settings.saveSettings')}
        </button>
      </div>

      <div className="pt-3 border-t border-gray-200">
        <button onClick={handleLogout} className="w-full danger">
          {t('settings.logout')}
        </button>
      </div>
    </div>
  );
}
