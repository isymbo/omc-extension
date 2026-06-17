import { getStorageItem, setStorageItem } from './storage';

export type Locale = 'en' | 'zh';

export const LOCALE_KEY = 'locale';

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Common
    'app.name': 'oh-my-cs',
    'common.loading': 'Loading...',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.confirm': 'Confirm',
    'common.back': 'Back',
    'common.settings': 'Settings',
    'common.error': 'Error',
    'common.success': 'Success',
    'common.retry': 'Retry',
    'common.skip': 'Skip',

    // Auth
    'auth.signIn': 'Sign in',
    'auth.signingIn': 'Signing in...',
    'auth.serverUrl': 'Server URL',
    'auth.serverUrlPlaceholder': 'http://m2mini.local:8080',
    'auth.email': 'Email',
    'auth.emailPlaceholder': 'you@example.com',
    'auth.password': 'Password',
    'auth.passwordPlaceholder': '••••••••',
    'auth.showPassword': 'Show password',
    'auth.hidePassword': 'Hide password',
    'auth.loginSuccess': 'Login successful',
    'auth.loginFailed': 'Login failed',
    'auth.connectTo': 'Connect to your oh-my-cs account',

    // Group
    'group.selectTitle': 'Select Default Group',
    'group.selectDescription': 'Choose a stock group for quick additions',
    'group.systemGroup': 'System group',
    'group.customGroup': 'Custom group',
    'group.untitled': 'Untitled',
    'group.confirmSelection': 'Confirm Selection',
    'group.noGroups': 'No groups available',
    'group.loadFailed': 'Failed to load groups',

    // Main
    'main.welcomeBack': 'Welcome back,',
    'main.quickActions': 'Quick Actions',
    'main.quickActionsDesc': 'Select text on any webpage and right-click to add stocks to your portfolio.',
    'main.changeGroup': 'Change Default Group',
    'main.currentGroup': 'Current group: {name}',

    // Settings
    'settings.title': 'Settings',
    'settings.loggedAs': 'Logged in as',
    'settings.serverUrl': 'Server URL',
    'settings.defaultGroup': 'Default Stock Group',
    'settings.language': 'Language',
    'settings.languageEn': 'English',
    'settings.languageZh': '中文',
    'settings.saveSettings': 'Save Settings',
    'settings.saving': 'Saving...',
    'settings.saved': 'Settings saved!',
    'settings.saveFailed': 'Failed to save settings',
    'settings.logout': 'Logout',

    // Search
    'search.title': 'Search Results',
    'search.found': 'Found {count} result{s} for "{query}"',
    'search.noResults': 'No stocks found',
    'search.add': 'Add',
    'search.added': '✓ Added',
    'search.adding': '...',
    'search.stockAdded': '✓ Stock added successfully!',
    'search.noGroup': 'No default group selected. Please configure in settings.',
    'search.addFailed': 'Failed to add stock',

    // Context menu
    'context.addTo': 'Add "%s" to oh-my-cs',
    'context.loginFirst': 'Please login first by clicking the extension icon.',
    'context.noGroup': 'Please select a default stock group first.',
    'context.noResults': 'No stocks found for "%s"',
    'context.added': 'Added {name} ({symbol}) to your portfolio.',
    'context.failed': 'Failed to add stock: {error}',

    // Market
    'market.aShare': 'A',
    'market.hk': 'HK',
    'market.us': 'US',
  },
  zh: {
    // Common
    'app.name': 'oh-my-cs',
    'common.loading': '加载中...',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.confirm': '确认',
    'common.back': '返回',
    'common.settings': '设置',
    'common.error': '错误',
    'common.success': '成功',
    'common.retry': '重试',
    'common.skip': '跳过',

    // Auth
    'auth.signIn': '登录',
    'auth.signingIn': '登录中...',
    'auth.serverUrl': '服务器地址',
    'auth.serverUrlPlaceholder': 'http://m2mini.local:8080',
    'auth.email': '邮箱',
    'auth.emailPlaceholder': 'you@example.com',
    'auth.password': '密码',
    'auth.passwordPlaceholder': '••••••••',
    'auth.showPassword': '显示密码',
    'auth.hidePassword': '隐藏密码',
    'auth.loginSuccess': '登录成功',
    'auth.loginFailed': '登录失败',
    'auth.connectTo': '连接到你的 oh-my-cs 账户',

    // Group
    'group.selectTitle': '选择默认分组',
    'group.selectDescription': '选择一个股票分组用于快速添加',
    'group.systemGroup': '系统分组',
    'group.customGroup': '自定义分组',
    'group.untitled': '未命名',
    'group.confirmSelection': '确认选择',
    'group.noGroups': '暂无可用分组',
    'group.loadFailed': '加载分组失败',

    // Main
    'main.welcomeBack': '欢迎回来，',
    'main.quickActions': '快捷操作',
    'main.quickActionsDesc': '在任意网页上选中文本，右键点击即可将股票添加到你的投资组合。',
    'main.changeGroup': '更换默认分组',
    'main.currentGroup': '当前分组：{name}',

    // Settings
    'settings.title': '设置',
    'settings.loggedAs': '登录为',
    'settings.serverUrl': '服务器地址',
    'settings.defaultGroup': '默认股票分组',
    'settings.language': '语言',
    'settings.languageEn': 'English',
    'settings.languageZh': '中文',
    'settings.saveSettings': '保存设置',
    'settings.saving': '保存中...',
    'settings.saved': '设置已保存！',
    'settings.saveFailed': '保存设置失败',
    'settings.logout': '退出登录',

    // Search
    'search.title': '搜索结果',
    'search.found': '找到 {count} 个结果，关键词 "{query}"',
    'search.noResults': '未找到股票',
    'search.add': '添加',
    'search.added': '✓ 已添加',
    'search.adding': '...',
    'search.stockAdded': '✓ 股票添加成功！',
    'search.noGroup': '未选择默认分组，请在设置中配置。',
    'search.addFailed': '添加股票失败',

    // Context menu
    'context.addTo': '添加 "%s" 到 oh-my-cs',
    'context.loginFirst': '请先点击扩展图标登录。',
    'context.noGroup': '请先选择默认股票分组。',
    'context.noResults': '未找到 "%s" 对应的股票',
    'context.added': '已将 {name} ({symbol}) 添加到你的投资组合。',
    'context.failed': '添加股票失败：{error}',

    // Market
    'market.aShare': 'A股',
    'market.hk': '港股',
    'market.us': '美股',
  },
};

let currentLocale: Locale = 'en';

export async function initI18n(): Promise<Locale> {
  const stored = await getStorageItem<Locale>(LOCALE_KEY);
  currentLocale = stored || 'en';
  return currentLocale;
}

export function getLocale(): Locale {
  return currentLocale;
}

export async function setLocale(locale: Locale): Promise<void> {
  currentLocale = locale;
  await setStorageItem(LOCALE_KEY, locale);
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

export function getAvailableLocales(): { code: Locale; name: string }[] {
  return [
    { code: 'en', name: 'English' },
    { code: 'zh', name: '中文' },
  ];
}
