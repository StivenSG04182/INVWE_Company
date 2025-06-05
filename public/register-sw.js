// Script para registrar el Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then((registration) => {
            })
            .catch((error) => {
                console.error('Error al registrar el Service Worker:', error);
            });
    });
}