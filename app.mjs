import { APP, STORES, appUrl, autoFromUrl, createLauncher, detectPlatform, shareUrl, videoIdFromUrl } from './links.mjs?v=20261028-dynamic-id';

const byId = (id) => document.getElementById(id);
const platform = detectPlatform(navigator);
const videoId = videoIdFromUrl(window.location.href);
const auto = byId('auto');
const status = byId('status');
const events = byId('events');
const cancelButton = byId('cancel');
const openButton = byId('open-app');
const connectButton = byId('connect');
const shareInput = byId('share-url');

function log(message) {
  const entry = document.createElement('li');
  const time = new Date().toLocaleTimeString('ko-KR', { hour12: false });
  entry.textContent = `${time} · ${message}`;
  events.prepend(entry);
  while (events.childElementCount > 12) events.lastElementChild.remove();
}

const launcher = createLauncher({
  navigate: (url) => { window.location.href = url; },
  schedule: (callback, delay) => window.setTimeout(callback, delay),
  unschedule: (timer) => window.clearTimeout(timer),
  visible: () => document.visibilityState === 'visible',
  report: (message) => { status.textContent = message; log(message); },
  pending: (value) => { cancelButton.hidden = !value; },
});

byId('device').textContent = { android: 'Android', ios: 'iPhone / iPad', desktop: '컴퓨터 · 휴대폰에서 열어 주세요' }[platform];
byId('desktop-note').hidden = platform !== 'desktop';
byId('video-id').textContent = videoId ?? '잘못된 강의 주소';
byId('app-url').textContent = videoId ? appUrl(videoId) : '강의 ID를 확인해 주세요.';
byId('android-store').href = STORES.android;
byId('ios-store').href = STORES.ios;
byId('android-store').dataset.current = String(platform === 'android');
byId('ios-store').dataset.current = String(platform === 'ios');
openButton.disabled = connectButton.disabled = platform === 'desktop' || !videoId;
openButton.querySelector('span').textContent = `${APP.name}에서 열기`;
if (platform === 'ios') {
  byId('fallback-note').textContent = 'iPhone은 페이지가 계속 보이면 약 3초 뒤 App Store로 이동합니다. 앱 실행을 확인한 결과는 아닙니다.';
} else if (platform === 'android') {
  byId('fallback-note').textContent = '지원 브라우저에서 앱을 열 수 없으면 Google Play로 연결합니다. 브라우저의 실행 차단도 같은 결과일 수 있습니다.';
}

auto.checked = autoFromUrl(window.location.href);
function updateShareLink() {
  if (!videoId) {
    shareInput.value = window.location.href;
    byId('copy').disabled = true;
    status.textContent = '강의 정보가 없거나 올바르지 않습니다. 앱에서 공유한 강의 링크로 열어 주세요.';
    return;
  }
  const url = shareUrl(window.location.href, auto.checked);
  shareInput.value = url;
  byId('copy-status').textContent = '';
  if (window.location.href !== url) window.history.replaceState(null, '', url);
}
updateShareLink();
auto.addEventListener('change', () => {
  launcher.cancel('자동 전환 예약을 취소했습니다.');
  updateShareLink();
  log(auto.checked ? '공유 링크에 자동 연결 시험을 켰습니다. 다음에 링크를 열 때 실행됩니다.' : '공유 링크의 자동 연결 시험을 껐습니다.');
});

openButton.addEventListener('click', () => launcher.launch(platform, false, videoId));
connectButton.addEventListener('click', () => launcher.launch(platform, true, videoId));
cancelButton.addEventListener('click', () => launcher.cancel('스토어 자동 이동을 취소했습니다.'));
for (const id of ['android-store', 'ios-store']) {
  byId(id).addEventListener('click', () => launcher.cancel('선택한 스토어로 직접 이동합니다.'));
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') {
    launcher.cancel('페이지가 숨겨져 스토어 자동 이동 예약을 취소했습니다.');
  }
});
window.addEventListener('pagehide', () => launcher.cancel());
window.addEventListener('pageshow', (event) => {
  if (event.persisted) {
    launcher.cancel();
    status.textContent = '테스트 페이지로 돌아왔습니다. 필요한 동작의 버튼을 다시 눌러 주세요.';
    log('페이지 복원 · 자동으로 재실행하지 않습니다.');
  }
});

byId('copy').addEventListener('click', async () => {
  const requestedUrl = shareInput.value;
  try {
    if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
    await navigator.clipboard.writeText(requestedUrl);
    byId('copy-status').textContent = '링크를 복사했습니다. 휴대폰이나 다른 앱에서 열어 보세요.';
  } catch {
    shareInput.focus();
    shareInput.select();
    shareInput.setSelectionRange(0, shareInput.value.length);
    byId('copy-status').textContent = '복사가 허용되지 않았습니다. 선택된 주소를 길게 눌러 복사해 주세요.';
  }
});

log('개발앱 전용 테스트 페이지를 준비했습니다.');
if (auto.checked && videoId && document.visibilityState === 'visible') {
  launcher.launch(platform, true, videoId);
}
