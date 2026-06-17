import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { writeFileSync, readFileSync, mkdirSync, existsSync, readdirSync, statSync, unlinkSync, rmdirSync } from 'fs';

function deleteFolderRecursive(path: string) {
  if (existsSync(path)) {
    readdirSync(path).forEach((file) => {
      const curPath = `${path}/${file}`;
      if (statSync(curPath).isDirectory()) {
        deleteFolderRecursive(curPath);
      } else {
        unlinkSync(curPath);
      }
    });
    rmdirSync(path);
  }
}

export default defineConfig({
  plugins: [
    react(),
    {
      name: 'copy-files',
      closeBundle() {
        // Copy manifest.json to dist
        const manifest = readFileSync('public/manifest.json', 'utf-8');
        writeFileSync('dist/manifest.json', manifest);

        // Copy icons to dist/icons (only PNG files)
        if (!existsSync('dist/icons')) {
          mkdirSync('dist/icons', { recursive: true });
        }
        ['icon16.png', 'icon48.png', 'icon128.png'].forEach(icon => {
          const iconData = readFileSync(`public/icons/${icon}`);
          writeFileSync(`dist/icons/${icon}`, iconData);
        });

        // Fix popup.html paths (move from dist/public/ to dist/ with correct relative paths)
        if (existsSync('dist/public/popup.html')) {
          let html = readFileSync('dist/public/popup.html', 'utf-8');
          // Fix relative paths - assets are now in ./assets/ not ../assets/
          html = html.replace(/\.\.\/assets\//g, 'assets/');
          writeFileSync('dist/popup.html', html);
          // Clean up the public folder
          deleteFolderRecursive('dist/public');
        }
      },
    },
  ],
  base: './',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: resolve(__dirname, 'public/popup.html'),
        background: resolve(__dirname, 'src/background/index.ts'),
      },
      output: {
        entryFileNames: (chunkInfo) => {
          return chunkInfo.name === 'background' ? 'background.js' : 'assets/[name]-[hash].js';
        },
        assetFileNames: 'assets/[name]-[hash][extname]',
      },
    },
  },
});
