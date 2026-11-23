import test from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { createApiApp } from '../server';
import { SYNTHETIC_LISTING_CASES } from '../src/domain/syntheticCases';

async function withApi(generate: (prompt: string) => Promise<unknown>, run: (url: string) => Promise<void>) {
  const server = createApiApp(generate).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const address = server.address();
  assert.ok(address && typeof address !== 'string');
  try { await run(`http://127.0.0.1:${address.port}/api/triage/analyze`); }
  finally { await new Promise<void>((resolve, reject) => server.close(error => error ? reject(error) : resolve())); }
}
const post = (url: string, body: unknown) => fetch(url, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('API validates hostile structured responses and strips draft or control fields', async () => {
  await withApi(async prompt => {
    assert.ok(prompt.includes('synthetic') || prompt.includes('Synthetic'));
    return { classification: 'HIGH_RISK', recommendedAction: 'APPROVED_TAKEDOWN', rationaleBullets: ['Unsupported model interpretation'], caveats: [], isApprovalLocked: false, draftTakedownSummary: 'Immediate removal required' };
  }, async url => {
    const response = await post(url, { listing: SYNTHETIC_LISTING_CASES[0], locale: 'en' });
    assert.equal(response.status, 200);
    const body = await response.json();
    assert.deepEqual(Object.keys(body), ['analysis']);
    assert.equal(body.analysis.isApprovalLocked, undefined);
    assert.equal(body.analysis.draftTakedownSummary, undefined);
  });
});

test('API rejects malformed model data and bad listing payloads', async () => {
  await withApi(async () => ({ rationaleBullets: [1] }), async url => {
    assert.equal((await post(url, { listing: SYNTHETIC_LISTING_CASES[0], locale: 'ko' })).status, 502);
    assert.equal((await post(url, { listing: { id: 'bad' }, locale: 'en' })).status, 400);
    assert.equal((await post(url, { listing: { ...SYNTHETIC_LISTING_CASES[0], visualSimilarityScore: 12 }, locale: 'en' })).status, 400);
    assert.equal((await post(url, { listing: SYNTHETIC_LISTING_CASES[0], locale: 'xx' })).status, 400);
  });
});

test('provider failure returns safe error without exposing secrets', async () => {
  await withApi(async () => { throw new Error('secret-key-in-provider-error'); }, async url => {
    const response = await post(url, { listing: SYNTHETIC_LISTING_CASES[4], locale: 'en' });
    assert.equal(response.status, 502);
    assert.ok(!(await response.text()).includes('secret-key'));
  });
});
