// const CACHE_NAME = 'weatherly-v1';
// const ASSETS = [
//     './weather.html',
//     './weather.css',
//     './weather.js',
//     './manifest.json'
// ];

// self.addEventListener('install', (e) => {
//     e.waitUntil(
//         caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
//     );
// });

// self.addEventListener('fetch', (e) => {
//     e.respondWith(
//         caches.match(e.request).then(response => {
//             return response || fetch(e.request);
//         })
//     );
// });