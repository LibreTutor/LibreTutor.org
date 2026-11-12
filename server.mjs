// LibreTutor.org: serves the 3D map and the privacy page as static files. No dependencies, no database, no AI.
import { createServer } from 'node:http';
import { createReadStream, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const DIST = fileURLToPath(new URL('./dist', import.meta.url));
const SECTIONS = ['mapa', 'privacidad'];
const TYPES = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.json': 'application/json', '.bin': 'application/octet-stream', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.webp': 'image/webp', '.woff2': 'font/woff2', '.ico': 'image/x-icon',
};

/** Maps a URL path to a file inside dist/<section>/, or null. Never leaves dist/. */
export function resolveFile(urlPath, root = DIST) {
  let p;
  try { p = decodeURIComponent(urlPath.split('?')[0]); } catch { return null; }
  if (p.includes('\0')) return null;
  const parts = p.split('/').filter(Boolean);
  if (!SECTIONS.includes(parts[0])) return null;
  const rel = normalize(join(...parts));
  if (rel.startsWith('..') || !rel.startsWith(parts[0])) return null;
  let file = join(root, rel);
  if (!file.startsWith(root + sep)) return null;
  try {
    if (statSync(file).isDirectory()) file = join(file, 'index.html');
    return statSync(file).isFile() ? file : null;
  } catch { return null; }
}

export function handler(root = DIST) {
  return (req, res) => {
    const path = (req.url || '/').split('?')[0];
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (req.method !== 'GET' && req.method !== 'HEAD') { res.writeHead(405, { Allow: 'GET, HEAD' }); res.end(); return; }
    if (path === '/') { res.writeHead(302, { Location: '/mapa/' }); res.end(); return; }
    if (path === '/health') { res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('{"ok":true}'); return; }
    if (SECTIONS.includes(path.slice(1))) { res.writeHead(301, { Location: path + '/' }); res.end(); return; }
    const file = resolveFile(path, root);
    if (!file) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); res.end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': TYPES[extname(file)] || 'application/octet-stream', 'Cache-Control': 'public, max-age=3600' });
    if (req.method === 'HEAD') { res.end(); return; }
    createReadStream(file).pipe(res);
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const port = Number(process.env.PORT || 8080);
  const host = process.env.HOST || '127.0.0.1';
  createServer(handler()).listen(port, host, () => console.log(`LibreTutor.org on http://${host}:${port}/`));
}
