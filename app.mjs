import { autoFromUrl, createLauncher, detectPlatform, shareUrl, videoIdFromUrl } from './links.mjs?v=20261029-minimal';

const platform = detectPlatform(navigator);
const videoId = videoIdFromUrl(window.location.href);
const message = document.getElementById('message');
const connectButton = document.getElementById('connect');

const launcher = createLauncher({
  navigate: (url) => { window.location.href = url; },
  schedule: (callback, delay) => window.setTimeout(callback, delay),
  unschedule: (timer) => window.clearTimeout(timer),
  visible: () => document.visibilityState === 'visible',
  report: (text) => { message.textContent = text; },
  pending: () => {},
});

connectButton.disabled = platform === 'desktop' || !videoId;
if (!videoId) {
  message.textContent = '강의 링크를 확인하고 다시 열어주세요.';
} else if (platform === 'desktop') {
  message.textContent = '휴대폰에서 이 링크를 열어주세요.';
}

if (videoId) {
  const cleanUrl = shareUrl(window.location.href, autoFromUrl(window.location.href));
  if (window.location.href !== cleanUrl) window.history.replaceState(null, '', cleanUrl);
}

connectButton.addEventListener('click', () => launcher.launch(platform, true, videoId));

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'hidden') launcher.cancel();
});
window.addEventListener('pagehide', () => launcher.cancel());
window.addEventListener('pageshow', (event) => {
  if (!event.persisted) return;
  launcher.cancel();
  if (videoId && platform !== 'desktop') {
    message.textContent = '연결되지 않으면 아래 버튼을 눌러주세요.';
  }
});

if (autoFromUrl(window.location.href) && videoId && document.visibilityState === 'visible') {
  launcher.launch(platform, true, videoId);
}
