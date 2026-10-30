import { STORES, autoFromUrl, createDelayedReveal, createLauncher, detectPlatform, shareUrl, videoIdFromUrl } from './links.mjs?v=20261029-ios-manual';

export function initializePage({ window, document, navigator, navigate }) {
  const go = navigate ?? ((url) => { window.location.href = url; });
  const platform = detectPlatform(navigator);
  const isIOS = platform === 'ios';
  const videoId = videoIdFromUrl(window.location.href);
  const heading = document.getElementById('heading');
  const message = document.getElementById('message');
  const connectButton = document.getElementById('connect');
  const installButton = document.getElementById('install');
  document.documentElement.classList.toggle('ios', isIOS);

  const buttonReveal = createDelayedReveal({
    schedule: (callback, delay) => window.setTimeout(callback, delay),
    unschedule: (timer) => window.clearTimeout(timer),
    visible: () => document.visibilityState === 'visible',
    setShown: (shown) => {
      connectButton.hidden = !shown;
      installButton.hidden = !shown || !isIOS;
      if (videoId) {
        message.hidden = !shown;
      }
    },
  });
  const launcher = createLauncher({ navigate: go, report: () => {} });
  const openApp = () => launcher.launch(platform, platform === 'android', videoId);

  connectButton.disabled = platform === 'desktop' || !videoId;
  installButton.disabled = !isIOS || !videoId;
  if (!videoId) {
    heading.textContent = '강의 링크를 확인해주세요';
    message.textContent = '공유받은 링크를 다시 열어주세요';
    heading.hidden = message.hidden = false;
  } else {
    const cleanUrl = shareUrl(window.location.href, autoFromUrl(window.location.href));
    if (window.location.href !== cleanUrl) window.history.replaceState(null, '', cleanUrl);
  }

  connectButton.addEventListener('click', openApp);
  installButton.addEventListener('click', () => {
    if (isIOS && videoId) go(STORES.ios);
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') buttonReveal.cancel();
    else buttonReveal.start();
  });
  window.addEventListener('pagehide', () => buttonReveal.cancel());
  window.addEventListener('pageshow', (event) => {
    if (event.persisted) buttonReveal.start();
  });

  buttonReveal.start();
  if (autoFromUrl(window.location.href) && videoId && document.visibilityState === 'visible') {
    openApp();
  }
}
