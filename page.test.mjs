import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { initializePage } from './page.mjs';
import { STORES, appUrl, androidIntent } from './links.mjs';

const VIDEO_ID = 'e9b2ebb8-6e7f-41ff-8ca4-c488730daf12';
const html = readFileSync(new URL('./index.html', import.meta.url), 'utf8');

function setup(platform, query = `videoId=${VIDEO_ID}`) {
  const elements = Object.fromEntries(['heading', 'message', 'connect', 'install'].map((id) => {
    const match = html.match(new RegExp(`<[^>]+\\bid="${id}"[^>]*>([\\s\\S]*?)<\\/[^>]+>`));
    assert.ok(match, `Missing ${id}`);
    const opening = match[0].split('>')[0];
    const listeners = new Map();
    return [id, {
      hidden: /\bhidden\b/.test(opening),
      disabled: /\bdisabled\b/.test(opening),
      textContent: match[1],
      addEventListener: (name, callback) => listeners.set(name, callback),
      click: () => listeners.get('click')(),
    }];
  }));
  const tasks = new Map();
  const events = { document: new Map(), window: new Map() };
  const classes = new Set();
  const navigated = [];
  let now = 0;
  let timerId = 0;
  const document = {
    visibilityState: 'visible',
    getElementById: (id) => elements[id],
    addEventListener: (name, callback) => events.document.set(name, callback),
    documentElement: { classList: { toggle: (name, enabled) => enabled ? classes.add(name) : classes.delete(name) } },
  };
  const window = {
    location: { href: `https://goback.github.io/classroom/?${query}` },
    setTimeout: (callback, delay) => {
      const id = ++timerId;
      tasks.set(id, { callback, at: now + delay });
      return id;
    },
    clearTimeout: (id) => tasks.delete(id),
    addEventListener: (name, callback) => events.window.set(name, callback),
  };
  window.history = { replaceState: (_, __, url) => { window.location.href = url; } };
  const navigator = {
    ios: { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' },
    android: { userAgent: 'Mozilla/5.0 Android 16' },
    desktop: { userAgent: 'Mozilla/5.0 Macintosh', platform: 'MacIntel', maxTouchPoints: 0 },
  }[platform];
  initializePage({ window, document, navigator, navigate: (url) => navigated.push(url) });
  function advance(ms) {
    const end = now + ms;
    for (;;) {
      const next = [...tasks].filter(([, task]) => task.at <= end).sort((a, b) => a[1].at - b[1].at)[0];
      if (!next) break;
      const [id, task] = next;
      tasks.delete(id);
      now = task.at;
      task.callback();
    }
    now = end;
  }
  return { elements, document, events, classes, navigated, tasks, advance };
}

test('iOS는 앱 실행만 자동 요청하고 두 문구와 두 버튼은 2초 뒤 함께 표시한다', () => {
  const t = setup('ios');
  assert.ok(t.classes.has('ios'));
  assert.deepEqual(t.navigated, [appUrl(VIDEO_ID)]);
  for (const element of Object.values(t.elements)) assert.equal(element.hidden, true);
  t.advance(1999);
  for (const element of Object.values(t.elements)) assert.equal(element.hidden, true);
  t.advance(1);
  for (const element of Object.values(t.elements)) assert.equal(element.hidden, false);
  assert.equal(t.elements.heading.textContent, '해밀리헬스 앱으로 이동중이에요');
  assert.equal(t.elements.message.textContent, '자동으로 연결이 안되면 아래 버튼을 눌러주세요');
  t.advance(60000);
  assert.deepEqual(t.navigated, [appUrl(VIDEO_ID)]);
});

test('iOS 앱 열기는 스토어로 보내지 않고 설치 버튼을 누른 경우만 App Store로 이동한다', () => {
  const t = setup('ios');
  t.advance(2000);
  t.elements.connect.click();
  t.advance(60000);
  assert.deepEqual(t.navigated, [appUrl(VIDEO_ID), appUrl(VIDEO_ID)]);
  t.elements.install.click();
  assert.equal(t.navigated.at(-1), STORES.ios);
});

test('Android는 기존 Intent와 스토어 fallback을 사용하며 버튼 하나만 표시한다', () => {
  const t = setup('android');
  assert.deepEqual(t.navigated, [androidIntent(VIDEO_ID)]);
  t.advance(2000);
  assert.equal(t.elements.connect.hidden, false);
  assert.equal(t.elements.install.hidden, true);
  t.elements.connect.click();
  assert.deepEqual(t.navigated, [androidIntent(VIDEO_ID), androidIntent(VIDEO_ID)]);
});

test('페이지 복원은 자동 실행을 반복하지 않고 문구·버튼의 지연 표시만 다시 시작한다', () => {
  const t = setup('ios');
  t.document.visibilityState = 'hidden';
  t.events.document.get('visibilitychange')();
  t.advance(10000);
  assert.equal(t.elements.install.hidden, true);
  t.document.visibilityState = 'visible';
  t.events.document.get('visibilitychange')();
  t.events.window.get('pageshow')({ persisted: true });
  t.advance(1999);
  assert.equal(t.elements.install.hidden, true);
  t.advance(1);
  assert.equal(t.elements.install.hidden, false);
  assert.deepEqual(t.navigated, [appUrl(VIDEO_ID)]);
});

test('잘못된 강의 링크는 오류를 즉시 표시하고 앱·스토어 이동을 하지 않는다', () => {
  const t = setup('ios', 'videoId=bad');
  assert.equal(t.elements.heading.hidden, false);
  assert.equal(t.elements.message.hidden, false);
  t.advance(2000);
  assert.equal(t.elements.connect.disabled, true);
  assert.equal(t.elements.install.disabled, true);
  t.elements.install.click();
  assert.deepEqual(t.navigated, []);
});

test('수동 시험 링크는 앱 열기 버튼을 누를 때만 앱을 실행한다', () => {
  const t = setup('ios', `videoId=${VIDEO_ID}&auto=0`);
  t.advance(2000);
  assert.deepEqual(t.navigated, []);
  t.elements.connect.click();
  assert.deepEqual(t.navigated, [appUrl(VIDEO_ID)]);
});

test('PC도 요청한 문구만 표시하고 앱 연결 버튼은 비활성 상태로 둔다', () => {
  const t = setup('desktop');
  t.advance(2000);
  assert.equal(t.elements.heading.hidden, false);
  assert.equal(t.elements.message.textContent, '자동으로 연결이 안되면 아래 버튼을 눌러주세요');
  assert.equal(t.elements.connect.disabled, true);
  assert.equal(t.elements.install.hidden, true);
  assert.deepEqual(t.navigated, []);
});
