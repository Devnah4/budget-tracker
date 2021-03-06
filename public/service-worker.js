const APP_PREFIX = 'BudgetTracker-';
const VERSION = 'version_01';
const CACHE_NAME = APP_PREFIX + VERSION;

// uses relative pathing due to hosting
const FILES_TO_CACHE = [
    "./index.html",
    "./js/index.js",
    "./js/idbs.js",
    "./css/styles.css",
    "./icons/icon-512x512.png",
    "./icons/icon-384x384.png",
    "./icons/icon-192x192.png",
    "./icons/icon-152x152.png",
    "./icons/icon-144x144.png",
    "./icons/icon-128x128.png",
    "./icons/icon-96x96.png",
    "./icons/icon-72x72.png"
];

// We use self instead of window as the service worker is run before the window loads
self.addEventListener('install', function (e) {
    // Tells the browser to wait until it's done to install the service worker
    e.waitUntil(
        // finds the cache by name in FILES_TO_CACHE
        caches.open(CACHE_NAME).then(function (cache) {
            console.log('installing cache : ' + CACHE_NAME)
            return cache.addAll(FILES_TO_CACHE)
        })
    )
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        // Will return an array of all cache names
        caches.keys().then(function (keyList) {
            let cacheKeeplist = keyList.filter(function (key) {
                return key.indexOf(APP_PREFIX);
            });
            cacheKeeplist.push(CACHE_NAME);

            // Deletes all caches that aren't in the cacheKeeplist
            return Promise.all(
                keyList.map(function (key, i) {
                    if (cacheKeeplist.indexOf(key) === -1) {
                        console.log('deleting cache : ' + keyList[i]);
                        return caches.delete(keyList[i]);
                    }
                })
            );
        })
    );
});

// For offline support
self.addEventListener('fetch', function (e) {
    // Logs the URL for the response
    console.log('fetch request : ' + e.request.url)
    // This will respond with the cached version of the page
    e.respondWith(
        // Checks if the request is in the cache
        caches.match(e.request).then(function (request) {
            if (request) {
                console.log('responding with cache : ' + e.request.url)
                return request
            } else {
                console.log('file is not cached, fetching : ' + e.request.url)
                return fetch(e.request)
            }
        })
    )
})
