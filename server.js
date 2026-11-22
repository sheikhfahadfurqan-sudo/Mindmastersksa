// Mind Masters — tiny web server for Render.
// Only serves the files listed below (never .env, .git, db scripts or source files).
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const PORT = process.env.PORT || 10000;

const FILES = {
  '/index.html': ['index.html', 'text/html; charset=utf-8', 'no-cache'],
  '/sw.js': ['sw.js', 'text/javascript; charset=utf-8', 'no-cache'],
  '/manifest.json': ['manifest.json', 'application/manifest+json', 'no-cache'],
  '/logo.jpg': ['logo.jpg', 'image/jpeg', 'public, max-age=86400'],
  '/icons/icon-192.png': ['icons/icon-192.png', 'image/png', 'public, max-age=86400'],
  '/icons/icon-512.png': ['icons/icon-512.png', 'image/png', 'public, max-age=86400'],
  '/icons/icon-maskable-512.png': ['icons/icon-maskable-512.png', 'image/png', 'public, max-age=86400'],
  '/icons/apple-touch-icon.png': ['icons/apple-touch-icon.png', 'image/png', 'public, max-age=86400'],
  '/apple-touch-icon.png': ['icons/apple-touch-icon.png', 'image/png', 'public, max-age=86400'],
  '/favicon.ico': ['icons/icon-192.png', 'image/png', 'public, max-age=86400']
};
const SECURITY = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Strict-Transport-Security': 'max-age=31536000',
  'Permissions-Policy': 'camera=(self), microphone=(), geolocation=()'
};

http.createServer((req, res) => {
  let pathname = '/';
  try { pathname = new URL(req.url, 'http://x').pathname; } catch (e) {}
  if (pathname === '/robots.txt') {
    res.writeHead(200, { 'Content-Type': 'text/plain', ...SECURITY });
    return res.end('User-agent: *\nDisallow: /\n');
  }
  // Any page without a file extension (/, /?code=…, /expenses) gets the app
  let entry = FILES[pathname];
  if (!entry && !path.extname(pathname)) entry = FILES['/index.html'];
  if (!entry || (req.method !== 'GET' && req.method !== 'HEAD')) {
    res.writeHead(404, { 'Content-Type': 'text/plain', ...SECURITY });
    return res.end('Not found');
  }
  fs.readFile(path.join(ROOT, entry[0]), (err, body) => {
    if (err) { res.writeHead(500, SECURITY); return res.end('Server error'); }
    res.writeHead(200, { 'Content-Type': entry[1], 'Cache-Control': entry[2], ...SECURITY });
    res.end(req.method === 'HEAD' ? undefined : body);
  });
}).listen(PORT, '0.0.0.0', () => console.log(`Mind Masters running on port ${PORT}`));
