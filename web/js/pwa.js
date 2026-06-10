// AXIOM QR FACTORY - PWA
// Service worker registration y offline support

// Registrar Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('✅ Service Worker registrado:', registration.scope);
            })
            .catch(error => {
                console.error('❌ Error registrando Service Worker:', error);
            });
    });
}

// Detectar si la app se puede instalar
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    
    // Mostrar notificación de instalación (opcional)
    console.log('📱 App instalable detectada');
});

// Función para instalar (se puede llamar desde un botón)
async function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        deferredPrompt = null;
        return outcome === 'accepted';
    }
    return false;
}
