var C = 'cert-v1';
var FILES = ['./', 'index.html', 'style.css', 'app.js', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function(e){ e.waitUntil(caches.open(C).then(function(c){ return c.addAll(FILES); })); self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(caches.keys().then(function(k){ return Promise.all(k.filter(function(x){ return x !== C; }).map(function(x){ return caches.delete(x); })); }));
  self.clients.claim();
});
self.addEventListener('fetch', function(e){
  var r = e.request;
  if (r.method !== 'GET' || new URL(r.url).origin !== location.origin) return;   // সার্ভারের API ক্যাশ হয় না
  e.respondWith(fetch(r).catch(function(){ return caches.match(r); }));
});
