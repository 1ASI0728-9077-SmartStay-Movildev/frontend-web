import test from 'node:test';
import assert from 'node:assert/strict';
import axios from 'axios';
import { tokenExpiry, validSession, restoreSession, SESSION_KEY } from '../src/shared/domain/session.js';
import { validStay, nightsBetween, toBookingDate } from '../src/shared/domain/stay.js';
import { canUse, memberRoles, adminRoles } from '../src/shared/domain/permissions.js';
import { normalizeApiError } from '../src/shared/infrastructure/api-error.js';
import { createHttpClient } from '../src/shared/infrastructure/http-client.js';
import { PaymentAttempt, normalizeCardNumber, paymentTestData } from '../src/payments/domain/payment-attempt.js';
const jwt = exp => 'header.' + btoa(JSON.stringify({ exp })).replace(/=/g, '') + '.signature';

test('session restores identity, rejects expired/corrupt tokens and clears invalid storage', () => {
  const now = 2000000, session = { id: 2, username: 'guest1', role: 'guest', hotelId: null, chainId: null, token: jwt(2100) };
  assert.equal(tokenExpiry(session.token), 2100000);
  assert.equal(validSession(session, now), true);
  assert.equal(validSession(session, 2100000), false);
  assert.equal(validSession({ ...session, token: 'broken' }, now), false);
  assert.equal(validSession({ ...session, token: jwt('2100') }, now), false);
  const storage = new Map([[SESSION_KEY, JSON.stringify(session)]]);
  const adapter = { getItem: key => storage.get(key), removeItem: key => storage.delete(key) };
  assert.deepEqual(restoreSession(adapter, now), session);
  assert.equal(restoreSession(adapter, 2200000), null);
  assert.equal(storage.has(SESSION_KEY), false);
  storage.set(SESSION_KEY, '{invalid');
  assert.equal(restoreSession(adapter), null);
});

test('stay boundaries, leap days and UTC conversion do not shift calendar dates', () => {
  assert.equal(nightsBetween('2028-02-28', '2028-03-01'), 2);
  assert.equal(validStay('2026-12-14', '2026-12-15'), true);
  assert.equal(validStay('2026-12-01', '2026-12-31'), true);
  for (const pair of [['2026-12-01','2027-01-01'],['2026-12-14','2026-12-14'],['2026-12-16','2026-12-14'],['2026-02-30','2026-03-02'],['','2026-12-14']])
    assert.equal(validStay(...pair), false);
  assert.equal(toBookingDate('2026-12-14'), '2026-12-14T00:00:00Z');
});

test('role menus grant only contracted actions', () => {
  assert.equal(canUse('guest', memberRoles), true);
  assert.equal(canUse('guest', adminRoles), false);
  for (const role of ['staff', 'reception', 'housekeeping', 'maintenance', undefined]) {
    assert.equal(canUse(role, memberRoles), false);
    assert.equal(canUse(role, adminRoles), false);
    assert.equal(canUse(role, undefined), true);
  }
  assert.equal(canUse('chain_admin', adminRoles), true);
});

test('API error variants preserve status and safe detail without relying on one wire format', () => {
  for (const [status, code] of [[400,'validation'],[401,'unauthorized'],[403,'forbidden'],[404,'notFound'],[409,'conflict'],[429,'rateLimit'],[500,'unavailable']])
    assert.equal(normalizeApiError({ response: { status } }).code, code);
  assert.equal(normalizeApiError({ response: { status: 400, data: { errors: { Username: ['Required'] } } } }).detail, 'Required');
  assert.equal(normalizeApiError({ response: { status: 409, data: { error: 'Room occupied' } } }).detail, 'Room occupied');
  assert.equal(normalizeApiError({ response: { status: 400, data: 'Invalid stay' } }).detail, 'Invalid stay');
  assert.equal(normalizeApiError({ response: { status: 502, data: '<html>gateway</html>' } }).detail, '');
  assert.equal(normalizeApiError({ code: 'ECONNABORTED' }).uncertain, true);
  assert.equal(normalizeApiError({ response: { status: 403 } }).uncertain, false);
});

test('HTTP client builds one API prefix, sends Bearer privately and JSON with idempotency', async () => {
  const requests = [], session = { token: 'test-token' };
  const http = createHttpClient('http://localhost:8080', { current: () => session, expire: () => assert.fail('must not expire') });
  http.defaults.adapter = async config => { requests.push(config); return { data: {}, status: 200, headers: {}, config }; };
  await http.get('/rooms/search', { public: true });
  await http.post('/payments', { bookingId: 4, amount: 20 }, { headers: { 'Idempotency-Key': 'attempt-a' } });
  assert.equal(requests[0].headers.Authorization, undefined);
  assert.equal(axios.getUri(requests[0]), 'http://localhost:8080/api/v1/rooms/search');
  assert.equal(requests[1].headers.Authorization, 'Bearer test-token');
  assert.equal(requests[1].headers['Idempotency-Key'], 'attempt-a');
  assert.match(requests[1].headers['Content-Type'], /application\/json/);
  assert.equal(requests[1].withCredentials, false);
  assert.equal(requests[1].timeout, 30000);
  for (const url of ['http://localhost:8080/api/v1','http://localhost:8080/health','http://localhost:8080?api=1'])
    assert.throws(() => createHttpClient(url, {}));
});

test('401 expires the matching session; 403 and public login 401 preserve it; no POST retries', async () => {
  const expired = [], calls = [];
  const http = createHttpClient('http://localhost:8080', { current: () => ({ token: 'token-a' }), expire: token => expired.push(token) });
  let status = 403;
  http.defaults.adapter = async config => { calls.push(config); throw { config, response: { status } }; };
  await assert.rejects(http.post('/payments', {}));
  assert.equal(calls.length, 1);
  assert.deepEqual(expired, []);
  status = 401;
  await assert.rejects(http.get('/bookings/mine'));
  assert.deepEqual(expired, ['token-a']);
  await assert.rejects(http.post('/authentication/sign-in', {}, { public: true }));
  assert.deepEqual(expired, ['token-a']);
});

test('payment retries keep the identical body/key, clear sensitive memory', () => {
  const attempt = new PaymentAttempt();
  const first = attempt.start({ bookingId: 1, amount: 200, cardNumber: '4111111111111111', cvv: '123' }, () => 'first');
  const retry = attempt.start({ bookingId: 1, amount: 300, cardNumber: 'changed' }, () => 'second');
  assert.equal(retry.key, first.key);
  assert.equal(retry.body, first.body);
  assert.equal(retry.body.amount, 200);
  assert.equal(Object.isFrozen(first.body), true);
  attempt.clear();
  assert.equal(attempt.body, null);
  assert.equal(attempt.key, null);
  assert.equal(attempt.start({ amount: 300 }, () => 'new').key, 'new');
});

import { createI18n } from 'vue-i18n';
import { readFileSync } from 'node:fs';
import { effectScope } from 'vue';
import { useRequest } from '../src/shared/application/use-request.js';
test('every ES/EN message compiles and both locales have the same keys', () => {
  const messages = Object.fromEntries(['es', 'en'].map(locale => [locale, JSON.parse(readFileSync(new URL('../src/locales/' + locale + '.json', import.meta.url), 'utf8'))]));
  const keys = object => Object.entries(object).flatMap(([key, value]) => typeof value === 'object' ? keys(value).map(child => key + '.' + child) : [key]);
  assert.deepEqual(keys(messages.es).sort(), keys(messages.en).sort());
  const i18n = createI18n({ legacy: false, locale: 'es', messages });
  for (const locale of ['es', 'en']) {
    i18n.global.locale.value = locale;
    for (const key of keys(messages[locale])) assert.doesNotThrow(() => i18n.global.t(key, { name: 'Test' }), locale + ':' + key);
  }
});
test('scoped requests discard late private data after disposal and prefer the latest result', async () => {
  const scope = effectScope();
  const request = scope.run(() => useRequest());
  let first, second;
  const pendingA = request.run(() => new Promise(resolve => first = resolve));
  const pendingB = request.run(() => new Promise(resolve => second = resolve));
  second({ data: 'latest' }); await pendingB;
  first({ data: 'old' }); await pendingA;
  assert.equal(request.data.value, 'latest');
  let late;
  const pendingC = request.run(() => new Promise(resolve => late = resolve));
  scope.stop(); late({ data: 'private data from previous session' }); await pendingC;
  assert.equal(request.data.value, null);
});

import { wallPanels, validScene, panoramaUrl } from '../src/accommodations/domain/room-scene.js';
import { conciergeRequest, validConciergeRequest, chatExchange } from '../src/concierge/domain/chat-message.js';

test('test card input accepts separators and does not impose client-side Luhn rules', () => {
  assert.equal(normalizeCardNumber('4111-1111 1111-1111'), '4111111111111111');
  assert.equal(normalizeCardNumber('4444444444444444'), '4444444444444444');
  assert.equal(normalizeCardNumber('  -  '), '');
  const sample = paymentTestData(new Date('2026-11-11T12:00:00Z'));
  assert.equal(normalizeCardNumber(sample.cardNumber), '4111111111111111');
  assert.equal(sample.expirationDate, '12/28');
});

test('wall geometry keeps the exact solid area around doors and windows', () => {
  const wall = {
    start: {x:0,z:0}, end: {x:4,z:0}, heightM:2.7,
    openings: [
      { offsetM:0.1, widthM:0.9, sillM:0, heightM:2.1 },
      { offsetM:1.5, widthM:2, sillM:0.9, heightM:1.2 },
    ],
  };
  const panels = wallPanels(wall);
  const area = panels.reduce((sum,item) => sum + item.width*item.height, 0);
  assert.ok(Math.abs(area - (4*2.7 - 0.9*2.1 - 2*1.2)) < 1e-9);
  assert.ok(panels.every(panel => panel.width > 0 && panel.height > 0));
  assert.deepEqual(wallPanels({...wall,end:{x:0,z:0}}),[]);
  assert.equal(validScene({room:{widthM:4,lengthM:5,heightM:2.7},walls:[],beds:[]}),true);
  assert.equal(validScene({room:{widthM:-1,lengthM:5,heightM:2.7},walls:[],beds:[]}),false);
});

test('panorama URLs use the configured gateway and preserve backend paths', () => {
  const origin = 'https://gateway.example';
  assert.equal(panoramaUrl('/tours/room-102/entry.jpg',origin), origin+'/tours/room-102/entry.jpg');
  assert.equal(panoramaUrl('/tours/manifest.json/entry.jpg',origin), origin+'/tours/manifest.json/entry.jpg');
  assert.throws(() => panoramaUrl('https://other.example/entry.jpg',origin));
  assert.throws(() => panoramaUrl('javascript:alert(1)',origin));
});

test('chat requests are independent and each response preserves its own stay preferences', () => {
  const prefs = {checkIn:'2026-12-14',checkOut:'2026-12-16',guests:'2',district:' Lima ',budgetTotal:'400',history:['ignored']};
  const first = conciergeRequest('  A quiet room  ',prefs);
  assert.equal(validConciergeRequest(first),true);
  assert.equal(first.message,'A quiet room');
  assert.equal(first.guests,2);
  assert.equal(first.district,'Lima');
  assert.equal('history' in first,false);
  assert.equal(first.currency,'USD');
  const exchange = chatExchange(first,{assistantMessage:'Server reply',offers:[{roomId:102}],fallbackUsed:true});
  prefs.checkIn='2026-12-20';
  assert.equal(exchange.dates.checkIn,'2026-12-14');
  assert.equal(exchange.preferences.budgetTotal,400);
  assert.equal(exchange.text,'Server reply');
  assert.equal(exchange.fallbackUsed,true);
  assert.equal(validConciergeRequest({...first,guests:1.5}),false);
  assert.equal(validConciergeRequest({...first,message:''}),false);
  assert.equal(validConciergeRequest({...first,budgetTotal:NaN}),false);
});
