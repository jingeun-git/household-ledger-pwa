// ⚠ index.html을 캐시 우선으로 서빙하므로, index.html을 고쳤으면 이 버전을 반드시 올린다.
// 서비스워커는 sw.js 바이트가 바뀔 때만 재설치되어 install의 addAll이 새 셸을 받아온다.
// 버전을 안 올리면 사용자는 새로고침해도 옛 화면을 계속 본다.
const CACHE = 'household-ledger-shell-v2'; // v2: SYS-38 (0원·음수 금액 등록)
const SHELL = ['index.html', 'manifest.json', 'icon-192.png', 'icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
  );
  self.clients.claim();
});

// 앱 셸(같은 오리진의 정적 파일)만 캐시 우선 적용.
// Apps Script 동기화 요청·CDN 스크립트는 절대 가로채지 않는다 — 항상 최신 데이터를 받아야 하므로.
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  if (url.origin === self.location.origin && SHELL.includes(url.pathname.replace(/^\//, ''))) {
    e.respondWith(caches.match(e.request).then((r) => r || fetch(e.request)));
  }
});
