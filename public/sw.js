// Service Worker para INVWE
const CACHE_NAME = 'invwe-cache-v1';
const urlsToCache = [
    '/site',
    '/manifest.json',
    '/agency-logo.png',
    '/images/payment-gateways/paypal-logo.png',
    '/images/payment-gateways/payu-logo.png',
    '/images/payment-gateways/mercadopago-logo.png',
    '/images/payment-gateways/epayco-logo.png',
    '/images/payment-gateways/wompi-logo.png'
];

self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Devolver la respuesta de la caché si existe
                if (response) {
                    return response;
                }
                // Si no está en caché, hacer la solicitud a la red
                return fetch(event.request);
            })
    );
});

self.addEventListener('activate', (event) => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        // Eliminar cachés antiguas
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});