import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const distDir = path.join(__dirname, 'dist');
const indexHtml = path.join(distDir, 'index.html');

if (fs.existsSync(indexHtml)) {
  // 1. Create 404.html for SPA fallback on static hosting platforms
  fs.copyFileSync(indexHtml, path.join(distDir, '404.html'));

  // 2. Create static route directories so deep-links like /admin return 200 OK directly
  const routes = ['admin', 'login', 'register', 'events', 'my-events'];
  routes.forEach((route) => {
    const routeDir = path.join(distDir, route);
    if (!fs.existsSync(routeDir)) {
      fs.mkdirSync(routeDir, { recursive: true });
    }
    fs.copyFileSync(indexHtml, path.join(routeDir, 'index.html'));
  });

  console.log('✅ Generated static route entrypoints (admin, login, register, events, my-events, 404.html) for zero-config SPA routing!');
}
