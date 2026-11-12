import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { handler, resolveFile } from '../server.mjs';

const ROOT = fileURLToPath(new URL('..', import.meta.url));
const DIST = join(ROOT, 'dist');

async function withServer(fn) {
  const srv = createServer(handler());
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  try { return await fn(`http://127.0.0.1:${srv.address().port}`); } finally { srv.close(); }
}

test('/ redirects to the map', () => withServer(async (base) => {
  const r = await fetch(base + '/', { redirect: 'manual' });
  assert.equal(r.status, 302);
  assert.equal(r.headers.get('location'), '/mapa/');
}));

test('the map and the privacy page are served', () => withServer(async (base) => {
  for (const p of ['/mapa/', '/privacidad/']) {
    const r = await fetch(base + p);
    assert.equal(r.status, 200, p);
    assert.match(r.headers.get('content-type'), /text\/html/);
  }
  const m = await fetch(base + '/mapa/data/world/manifest.json');
  assert.equal(m.status, 200);
}));

test('/health answers ok', () => withServer(async (base) => {
  assert.deepEqual(await (await fetch(base + '/health')).json(), { ok: true });
}));

test('paths outside dist/ or unknown sections are 404', () => withServer(async (base) => {
  for (const p of ['/mapa/../server.mjs', '/mapa/%2e%2e/%2e%2e/package.json', '/api/agent', '/codelab/', '/cuenta/', '/x']) {
    assert.equal((await fetch(base + p)).status, 404, p);
  }
  assert.equal(resolveFile('/mapa/..%2f..%2fserver.mjs', DIST), null);
  assert.equal(resolveFile('/mapa/%00', DIST), null);
}));

test('only GET and HEAD', () => withServer(async (base) => {
  assert.equal((await fetch(base + '/mapa/', { method: 'POST' })).status, 405);
}));

test('the published files carry no AI, account or Code Lab code', () => {
  const walk = (d) => readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)]));
  const text = walk(DIST).filter((f) => /\.(html|js|css)$/.test(f) && !f.includes(`${'/'}vendor${'/'}`)).map((f) => readFileSync(f, 'utf8')).join('\n');
  for (const gone of ['/api/', '/codelab/', 'Code Lab', 'Crear mi cuenta', 'lt-profile-btn']) assert.ok(!text.includes(gone), gone);
});
