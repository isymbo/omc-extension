# oh-my-cs Chrome Extension

A Chrome browser extension for quickly adding stocks to your oh-my-cs portfolio.

## Features

- **Login**: Connect to your oh-my-cs instance with email/password
- **Group Selection**: Choose a default stock group for quick additions
- **Context Menu**: Right-click selected text on any webpage to search and add stocks
- **Multi-Market Support**: Works with A-shares (CN), Hong Kong (HK), and US stocks

## Installation

### Development Build

1. Clone this repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Build the extension:
   ```bash
   npm run build
   ```
4. Load in Chrome:
   - Open `chrome://extensions/`
   - Enable "Developer mode" (top right)
   - Click "Load unpacked"
   - Select the `dist/` folder

### Usage

1. **Login**:
   - Click the extension icon in the toolbar
   - Enter your oh-my-cs server URL (default: `http://m2mini.local:8080`)
   - Enter your email and password
   - Click "Sign in"

2. **Select Default Group**:
   - After login, select a stock group from the list
   - This group will be used for quick stock additions
   - You can change this later in Settings

3. **Add Stocks**:
   - Browse any webpage
   - Select a stock name or code (e.g., "茅台" or "600519")
   - Right-click and select "Add to oh-my-cs"
   - If multiple matches found, a popup will let you choose
   - The stock will be added to your default group

## Configuration

### Server URL

Default: `http://m2mini.local:8080`

You can change this in the Settings page (gear icon).

### Default Stock Group

The extension remembers which stock group you use for quick additions.
Change this in Settings → Default Stock Group.

## API Integration

This extension uses the following oh-my-cs API endpoints:

- `POST /api/v1/auth/login` - Authentication
- `POST /api/v1/auth/refresh` - Token refresh
- `GET /api/v1/stocks/search?q=` - Stock search
- `POST /api/v1/stocks` - Add stock
- `GET /api/v1/stocks/preferences` - Get groups
- `PUT /api/v1/stocks/preferences` - Update group assignments

## Development

### Project Structure

```
omc-extension/
├── public/
│   ├── manifest.json      # Chrome extension manifest
│   ├── icons/             # Extension icons
│   └── popup.html         # Popup entry HTML
├── src/
│   ├── background/        # Service worker
│   ├── popup/             # React popup components
│   ├── lib/               # Shared utilities
│   └── styles/            # CSS styles
├── package.json
├── vite.config.ts
└── tsconfig.json
```

### Build Commands

- `npm run dev` - Development mode with hot reload
- `npm run build` - Production build
- `npm run preview` - Preview production build

## Troubleshooting

### "Please login first" error

Make sure you're logged in by clicking the extension icon and signing in.

### "No default group selected" error

Go to Settings and select a default stock group.

### Stocks not appearing

Check that:
1. Your oh-my-cs server is running
2. You're logged in with valid credentials
3. The stock symbol/name is valid

## License

MIT
