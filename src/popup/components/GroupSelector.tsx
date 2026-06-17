import { useState, useEffect } from 'react';
import type { StockGroup } from '../../lib/types';
import { setStorageItem, STORAGE_KEYS } from '../../lib/storage';
import { t } from '../../lib/i18n';

interface GroupSelectorProps {
  onComplete: () => void;
}

export default function GroupSelector({ onComplete }: GroupSelectorProps) {
  const [groups, setGroups] = useState<StockGroup[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadGroups();
  }, []);

  async function loadGroups() {
    try {
      const response = await new Promise<{ groups?: StockGroup[]; error?: string }>(
        (resolve) => {
          chrome.runtime.sendMessage({ type: 'GET_PREFERENCES' }, resolve);
        }
      );

      if (response.error) {
        setError(response.error);
      } else if (response.groups) {
        setGroups(response.groups);
        if (response.groups.length > 0) {
          setSelectedGroupId(response.groups[0].id);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('group.loadFailed'));
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirm() {
    if (!selectedGroupId) return;

    await setStorageItem(STORAGE_KEYS.DEFAULT_GROUP_ID, selectedGroupId);
    onComplete();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <div className="p-4 rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm">
          {error}
        </div>
        <button onClick={loadGroups} className="w-full">
          {t('common.retry')}
        </button>
        <button onClick={onComplete} className="w-full ghost">
          {t('common.skip')}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="text-center">
        <h2 className="text-lg font-display font-bold text-gray-900">
          {t('group.selectTitle')}
        </h2>
        <p className="text-xs text-gray-400 mt-1">
          {t('group.selectDescription')}
        </p>
      </div>

      <div className="space-y-2">
        {groups.map((group) => (
          <button
            key={group.id}
            onClick={() => setSelectedGroupId(group.id)}
            className={`w-full text-left px-4 py-3.5 rounded-2xl transition-all duration-200 ${
              selectedGroupId === group.id
                ? 'bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] ring-1 ring-black/[0.04]'
                : 'bg-gray-50/80 hover:bg-gray-100/80'
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className={`font-medium text-xs ${selectedGroupId === group.id ? 'text-gray-900' : 'text-gray-700'}`}>
                  {group.name || (group.type === 'system' ? group.id : t('group.untitled'))}
                </p>
                <p className="text-[11px] text-gray-400 mt-0.5">
                  {group.type === 'system' ? t('group.systemGroup') : t('group.customGroup')}
                </p>
              </div>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                selectedGroupId === group.id
                  ? 'border-gray-900 bg-gray-900'
                  : 'border-gray-300'
              }`}>
                {selectedGroupId === group.id && (
                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </div>
          </button>
        ))}
      </div>

      <button
        onClick={handleConfirm}
        disabled={!selectedGroupId}
        className="w-full bg-gray-900 hover:bg-gray-800 text-white font-medium py-3 rounded-2xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {t('group.confirmSelection')}
      </button>
    </div>
  );
}
