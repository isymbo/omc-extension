export type Locale = 'en' | 'zh';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    'context.addTo': 'Add "%s" to oh-my-cs',
    'context.loginFirst': 'Please login first by clicking the extension icon.',
    'context.noGroup': 'Please select a default stock group first.',
    'context.noResults': 'No stocks found for "%s"',
    'context.added': 'Added {name} ({symbol}) to your portfolio.',
    'context.failed': 'Failed to add stock: {error}',
  },
  zh: {
    'context.addTo': '添加 "%s" 到 oh-my-cs',
    'context.loginFirst': '请先点击扩展图标登录。',
    'context.noGroup': '请先选择默认股票分组。',
    'context.noResults': '未找到 "%s" 对应的股票',
    'context.added': '已将 {name} ({symbol}) 添加到你的投资组合。',
    'context.failed': '添加股票失败：{error}',
  },
};

let currentLocale: Locale = 'en';

export async function initBackgroundI18n(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['locale'], (result) => {
      currentLocale = result.locale || 'en';
      resolve();
    });
  });
}

export function t(key: string, params?: Record<string, string | number>): string {
  let text = translations[currentLocale]?.[key] || translations.en[key] || key;

  if (params) {
    Object.entries(params).forEach(([k, v]) => {
      text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), String(v));
    });
  }

  return text;
}
