const CACHE_NAME = 'sei-kanji-pwa-v9';
const CORE_ASSETS = [
  './',
  './index.html',
  './styles.css?v=9',
  './app.js?v=9',
  './manifest.webmanifest',
  './data/words.json',
  './assets/start-bg.jpg',
  './assets/menu/start.png',
  './assets/menu/review.png',
  './assets/menu/music.png',
  './assets/menu/settings.png',
  './assets/audio/start-bgm.mp3',
  './assets/audio/intro.wav',
  './assets/audio/word-ikiru.wav',
  './assets/audio/word-umareru.wav',
  './assets/audio/word-umu.wav',
  './assets/audio/word-seikatsu.wav',
  './assets/audio/word-jinsei.wav',
  './assets/audio/word-seisan.wav',
  './assets/audio/word-isshou.wav',
  './assets/audio/word-hassei.wav',
  './assets/audio/sentence-ikiru.wav',
  './assets/audio/sentence-umareru.wav',
  './assets/audio/sentence-umu.wav',
  './assets/audio/sentence-seikatsu.wav',
  './assets/audio/sentence-jinsei.wav',
  './assets/audio/sentence-seisan.wav',
  './assets/audio/sentence-isshou.wav',
  './assets/audio/sentence-hassei.wav',
  './icons/icon-192.png',
  './icons/icon-512.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(CORE_ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
