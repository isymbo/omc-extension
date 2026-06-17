import { useState } from 'react';
import type { StockSearchResult as StockSearchResultType } from '../../lib/types';
import { getStorageItem, STORAGE_KEYS } from '../../lib/storage';
import { t } from '../../lib/i18n';

interface StockSearchResultProps {
  results: StockSearchResultType[];
  query: string;
  onAdded: () => void;
  onCancel: () => void;
}

export default function StockSearchResult({
  results,
  query,
  onAdded,
  onCancel,
}: StockSearchResultProps) {
  const [loading, setLoading] = useState(false);
  const [addedStock, setAddedStock] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function handleAddStock(stock: StockSearchResultType) {
    setLoading(true);
    setError('');

    try {
      const groupId = await getStorageItem<string>(STORAGE_KEYS.DEFAULT_GROUP_ID);
      if (!groupId) {
        setError(t('search.noGroup'));
        return;
      }

      const response = await new Promise<{ success?: boolean; error?: string }>(
        (resolve) => {
          chrome.runtime.sendMessage(
            {
              type: 'ADD_STOCK',
              stock,
              groupId,
            },
            resolve
          );
        }
      );

      if (response.error) {
        setError(response.error);
      } else {
        setAddedStock(stock.symbol);
        setTimeout(onAdded, 1500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('search.addFailed'));
    } finally {
      setLoading(false);
    }
  }

  function getMarketBadge(market: string) {
    switch (market.toUpperCase()) {
      case 'HK':
        return { label: t('market.hk'), className: 'bg-orange-100 text-orange-700' };
      case 'US':
        return { label: t('market.us'), className: 'bg-blue-100 text-blue-700' };
      default:
        return { label: t('market.aShare'), className: 'bg-red-100 text-red-700' };
    }
  }

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-base font-display font-bold text-gray-900">
          {t('search.title')}
        </h2>
        <p className="text-xs text-gray-500 mt-1">
          {t('search.found', { count: results.length, s: results.length !== 1 ? 's' : '', query })}
        </p>
      </div>

      {error && (
        <div className="p-2.5 rounded-xl bg-red-50 border border-red-100 text-red-700 text-xs">
          {error}
        </div>
      )}

      {addedStock && (
        <div className="p-2.5 rounded-xl bg-green-50 border border-green-100 text-green-700 text-xs">
          {t('search.stockAdded')}
        </div>
      )}

      <div className="space-y-2">
        {results.map((stock) => {
          const badge = getMarketBadge(stock.market);
          return (
            <div
              key={`${stock.market}-${stock.symbol}`}
              className="bg-white/72 backdrop-blur-sm rounded-xl border border-white/45 p-2.5 shadow-sm"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-medium text-gray-900">
                      {stock.symbol}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 truncate mt-0.5">
                    {stock.name}
                  </p>
                </div>
                <button
                  onClick={() => handleAddStock(stock)}
                  disabled={loading || addedStock === stock.symbol}
                  className={`ml-3 px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    addedStock === stock.symbol
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gradient-to-r from-primary-500 to-primary-600 text-white hover:shadow-md'
                  }`}
                >
                  {addedStock === stock.symbol ? t('search.added') : loading ? t('search.adding') : t('search.add')}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <button onClick={onCancel} className="w-full ghost">
        {t('common.cancel')}
      </button>
    </div>
  );
}
