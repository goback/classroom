export const STORES = Object.freeze({
  android: 'https://play.google.com/store/apps/details?id=com.hemilyHealth.app',
  ios: 'https://apps.apple.com/kr/app/id6804555560',
});

const uuid = /^[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$/;

export function videoIdFromUrl(currentUrl) {
  const ids = new URL(currentUrl).searchParams.getAll('videoId');
  return ids.length === 1 && uuid.test(ids[0]) ? ids[0] : null;
}

export function autoFromUrl(currentUrl) {
  return new URL(currentUrl).searchParams.get('auto') !== '0';
}

function videoPath(videoId) {
  if (!uuid.test(videoId ?? '')) throw new TypeError('Invalid video ID');
  return `${APP.path}classroom/videos/${videoId}`;
}

export const APP = Object.freeze({
    name: '해밀리 Dev',
    scheme: 'hemily-dev',
    host: 'hemily.tlchealthcare.co.kr',
    path: '/hemily-dev-link/',
    packageName: 'com.hemilyHealth.app.dev',
});

export function detectPlatform({ userAgent = '', platform = '', maxTouchPoints = 0 } = {}) {
  if (/Android/i.test(userAgent)) return 'android';
  if (/iPhone|iPad|iPod/i.test(userAgent)) return 'ios';
  if (/Mac/i.test(platform + userAgent) && maxTouchPoints > 1) return 'ios';
  return 'desktop';
}

export function appUrl(videoId) {
  return `${APP.scheme}://${APP.host}${videoPath(videoId)}`;
}

export function androidIntent(videoId) {
  return `intent://${APP.host}${videoPath(videoId)}#Intent;scheme=${APP.scheme};` +
    `package=${APP.packageName};S.browser_fallback_url=${encodeURIComponent(STORES.android)};end`;
}

export function shareUrl(currentUrl, auto) {
  const url = new URL(currentUrl);
  const videoId = videoIdFromUrl(currentUrl);
  if (!videoId) throw new TypeError('Invalid video ID');
  url.search = '';
  url.hash = '';
  url.searchParams.set('videoId', videoId);
  if (!auto) url.searchParams.set('auto', '0');
  return url.href;
}

// Keep the recovery action out of focus and hit-testing while automatic
// navigation starts. Old callbacks must not reveal it early after a return.
export function createDelayedReveal({ schedule, unschedule, visible, setShown }) {
  let timer = null;
  let generation = 0;

  function cancel() {
    generation += 1;
    if (timer !== null) unschedule(timer);
    timer = null;
    setShown(false);
  }

  function start() {
    cancel();
    if (!visible()) return;
    const ownGeneration = generation;
    timer = schedule(() => {
      if (generation !== ownGeneration) return;
      timer = null;
      if (visible()) setShown(true);
    }, 2000);
  }

  return { start, cancel };
}

// Android uses the browser's Intent fallback. iOS only requests the app:
// a system confirmation can remain open indefinitely, so no store timer runs.
export function createLauncher({ navigate, report }) {
  function launch(platform, fallback, videoId) {
    if (!uuid.test(videoId ?? '')) {
      report('강의 링크를 확인하고 다시 열어주세요.');
      return;
    }
    if (platform !== 'android' && platform !== 'ios') return;
    try {
      navigate(platform === 'android' && fallback ? androidIntent(videoId) : appUrl(videoId));
    } catch {
      report('연결되지 않으면 외부 브라우저에서 다시 열어주세요.');
    }
  }

  return { launch };
}
