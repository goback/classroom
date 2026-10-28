export const STORES = Object.freeze({
  android: 'https://play.google.com/store/apps/details?id=com.hemilyHealth.app',
  ios: 'https://apps.apple.com/kr/app/id6804555560',
});

export const DEFAULT_VIDEO_ID = 'e9b2ebb8-6e7f-41ff-8ca4-c488730daf12';
const uuid = /^[0-9a-fA-F]{8}(-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}$/;

export function videoIdFromUrl(currentUrl) {
  const ids = new URL(currentUrl).searchParams.getAll('videoId');
  if (ids.length === 0) return DEFAULT_VIDEO_ID;
  return ids.length === 1 && uuid.test(ids[0]) ? ids[0] : null;
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

export function appUrl(videoId = DEFAULT_VIDEO_ID) {
  return `${APP.scheme}://${APP.host}${videoPath(videoId)}`;
}

export function androidIntent(videoId = DEFAULT_VIDEO_ID) {
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
  if (auto) url.searchParams.set('auto', '1');
  return url.href;
}

// The browser cannot prove app installation or launch success. Only an explicit
// test action (or an opted-in auto=1 link) schedules an iOS store fallback.
export function createLauncher({ navigate, schedule, unschedule, visible, report, pending }) {
  let timer = null;
  let generation = 0;
  let active = false;

  function cancel(message) {
    generation += 1;
    if (timer !== null) unschedule(timer);
    timer = null;
    pending(false);
    const wasActive = active;
    active = false;
    if (message && wasActive) report(message);
  }

  function launch(platform, fallback, videoId = DEFAULT_VIDEO_ID) {
    cancel();
    if (!uuid.test(videoId ?? '')) {
      report('강의 ID가 올바르지 않습니다. 앱에서 공유한 링크를 다시 열어 주세요.');
      return;
    }
    if (platform !== 'android' && platform !== 'ios') {
      report('휴대폰에서 이 링크를 열어 주세요. 컴퓨터에서는 아래 스토어 링크를 확인할 수 있습니다.');
      return;
    }
    active = true;
    report(fallback
      ? (platform === 'ios'
        ? '앱 실행을 요청합니다. 페이지가 계속 보이면 약 3초 뒤 App Store로 이동합니다.'
        : '앱 실행을 요청합니다. 지원 브라우저는 실행할 수 없을 때 Google Play로 연결합니다.')
      : '앱 실행을 요청했습니다. 앱이 열리지 않으면 설치 여부와 브라우저 안내를 확인해 주세요.');

    if (platform === 'ios' && fallback) {
      const ownGeneration = generation;
      pending(true);
      timer = schedule(() => {
        if (generation !== ownGeneration || !active) return;
        timer = null;
        pending(false);
        if (!visible()) { active = false; return; }
        active = false;
        report('페이지가 계속 보여 App Store로 이동합니다. 앱 미설치를 확인한 결과는 아닙니다.');
        navigate(STORES.ios);
      }, 3000);
    }
    try {
      navigate(platform === 'android' && fallback ? androidIntent(videoId) : appUrl(videoId));
    } catch {
      cancel();
      report('브라우저가 앱 실행을 허용하지 않았습니다. 앱에서 열기 버튼을 다시 누르거나 외부 브라우저에서 열어 주세요.');
    }
  }

  return { launch, cancel };
}
