import assert from 'node:assert/strict';
import { test } from 'node:test';
import { STORES, DEFAULT_VIDEO_ID, appUrl, androidIntent, autoFromUrl, detectPlatform, shareUrl, createLauncher, videoIdFromUrl } from './links.mjs';

function setup() {
  const navigated = [];
  const reports = [];
  const callbacks = [];
  const cancelled = [];
  const pending = [];
  let isVisible = true;
  const launcher = createLauncher({
    navigate: (url) => navigated.push(url),
    schedule: (callback, delay) => { callbacks.push({ callback, delay }); return callbacks.length; },
    unschedule: (id) => cancelled.push(id),
    visible: () => isVisible,
    report: (message) => reports.push(message),
    pending: (value) => pending.push(value),
  });
  return { launcher, navigated, reports, callbacks, cancelled, pending, hide: () => { isVisible = false; } };
}

test('개발앱 실행만으로는 스토어 이동을 예약하지 않는다', () => {
  for (const platform of ['android', 'ios']) {
    const t = setup();
    t.launcher.launch(platform, false);
    assert.deepEqual(t.navigated, [`hemily-dev://hemily.tlchealthcare.co.kr/hemily-dev-link/classroom/videos/${DEFAULT_VIDEO_ID}`]);
    assert.equal(t.callbacks.length, 0);
  }
});

test('Android 자동 시험은 개발앱 패키지와 인코딩된 운영 스토어 fallback만 사용한다', () => {
  const t = setup();
  t.launcher.launch('android', true);
  const url = t.navigated[0];
  assert.equal(url, androidIntent());
  assert.ok(url.includes('scheme=hemily-dev;package=com.hemilyHealth.app.dev;'));
  const fallback = url.match(/S\.browser_fallback_url=([^;]+)/)[1];
  assert.equal(decodeURIComponent(fallback), STORES.android);
  assert.equal(t.callbacks.length, 0);
});

test('iOS 자동 시험은 앱 실행 후 페이지가 보일 때만 3초 뒤 올바른 스토어로 이동한다', () => {
  const t = setup();
  t.launcher.launch('ios', true);
  assert.deepEqual(t.navigated, [appUrl()]);
  assert.equal(t.callbacks[0].delay, 3000);
  t.callbacks[0].callback();
  assert.deepEqual(t.navigated, [appUrl(), 'https://apps.apple.com/kr/app/id6804555560']);
});

test('페이지 숨김은 이벤트 취소가 늦어져도 스토어로 보내지 않는다', () => {
  const t = setup();
  t.launcher.launch('ios', true);
  t.hide();
  t.callbacks[0].callback();
  assert.deepEqual(t.navigated, [appUrl()]);
});

test('앱 전환/이탈/사용자 취소 뒤 늦게 완료된 타이머는 스토어로 보내지 않는다', () => {
  const t = setup();
  t.launcher.launch('ios', true);
  t.launcher.cancel('취소');
  assert.deepEqual(t.cancelled, [1]);
  t.callbacks[0].callback();
  assert.deepEqual(t.navigated, [appUrl()]);
  assert.equal(t.pending.at(-1), false);
});

test('다시 시도하면 이전 시도의 타이머는 새 시도 중에도 무시한다', () => {
  const t = setup();
  t.launcher.launch('ios', true);
  t.launcher.launch('ios', true);
  t.callbacks[0].callback();
  assert.deepEqual(t.navigated, [appUrl(), appUrl()]);
  assert.equal(t.pending.at(-1), true);
  t.callbacks[1].callback();
  assert.deepEqual(t.navigated, [appUrl(), appUrl(), STORES.ios]);
});

test('앱 실행만 재시험하면 이전 자동 스토어 이동이 남지 않는다', () => {
  const t = setup();
  t.launcher.launch('ios', true);
  t.launcher.launch('ios', false);
  t.callbacks[0].callback();
  assert.deepEqual(t.navigated, [appUrl(), appUrl()]);
});

test('컴퓨터에서는 앱 실행과 자동 스토어 이동을 모두 하지 않는다', () => {
  const t = setup();
  t.launcher.launch('desktop', true);
  assert.deepEqual(t.navigated, []);
  assert.equal(t.callbacks.length, 0);
});

test('모바일 기기와 데스크톱 모드 iPad를 구분한다', () => {
  assert.equal(detectPlatform({ userAgent: 'Mozilla Android 16 KAKAOTALK' }), 'android');
  assert.equal(detectPlatform({ userAgent: 'Mozilla iPhone OS 19' }), 'ios');
  assert.equal(detectPlatform({ userAgent: 'Mozilla Macintosh', platform: 'MacIntel', maxTouchPoints: 5 }), 'ios');
  assert.equal(detectPlatform({ userAgent: 'Mozilla Macintosh', platform: 'MacIntel', maxTouchPoints: 0 }), 'desktop');
});

test('복사 URL은 Pages 프로젝트 경로를 유지하며 미사용 파라미터와 fragment를 제거한다', () => {
  const input = 'https://goback.github.io/classroom/?app=prod&redirect=https%3A%2F%2Fevil.example#secret';
  assert.equal(shareUrl(input, false), `https://goback.github.io/classroom/?videoId=${DEFAULT_VIDEO_ID}&auto=0`);
  assert.equal(shareUrl(input, true), `https://goback.github.io/classroom/?videoId=${DEFAULT_VIDEO_ID}&auto=1`);
});

test('일반 링크도 자동 연결을 기본으로 사용하며 auto=0으로만 끌 수 있다', () => {
  const base = `https://goback.github.io/classroom/?videoId=${DEFAULT_VIDEO_ID}`;
  assert.equal(autoFromUrl(base), true);
  assert.equal(autoFromUrl(base + '&auto=1'), true);
  assert.equal(autoFromUrl(base + '&auto=0'), false);
  assert.equal(autoFromUrl(shareUrl(base, false)), false);
  assert.equal(autoFromUrl(shareUrl(base, true)), true);
});

test('링크의 강의 ID를 앱 실행·Android Intent·복사 링크까지 그대로 전달한다', () => {
  const id = '22222222-2222-4222-8222-222222222222';
  const url = `https://goback.github.io/classroom/?videoId=${id}&auto=1`;
  assert.equal(videoIdFromUrl(url), id);
  assert.ok(appUrl(id).endsWith(`/classroom/videos/${id}`));
  assert.ok(androidIntent(id).includes(`/classroom/videos/${id}#Intent;`));
  assert.equal(shareUrl(url, true), url);
  const t = setup();
  t.launcher.launch('ios', false, id);
  assert.deepEqual(t.navigated, [appUrl(id)]);
});

test('지정한 기본 강의를 사용하되 잘못되거나 중복된 ID로는 앱을 실행하지 않는다', () => {
  assert.equal(videoIdFromUrl('https://goback.github.io/classroom/'), DEFAULT_VIDEO_ID);
  for (const query of ['videoId=bad', `videoId=${DEFAULT_VIDEO_ID}&videoId=${DEFAULT_VIDEO_ID}`, 'videoId=']) {
    assert.equal(videoIdFromUrl(`https://goback.github.io/classroom/?${query}`), null);
  }
  const t = setup();
  t.launcher.launch('ios', true, 'bad');
  assert.deepEqual(t.navigated, []);
  assert.equal(t.callbacks.length, 0);
});
