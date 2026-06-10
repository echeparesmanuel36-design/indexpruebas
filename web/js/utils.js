// AXIOM QR FACTORY - UTILS
// Funciones auxiliares reutilizables

const Utils = {
    // Guardar datos en localStorage
    saveToLocalStorage(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (e) {
            console.error('Error saving to localStorage:', e);
            return false;
        }
    },

    // Cargar datos de localStorage
    loadFromLocalStorage(key, defaultValue = null) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : defaultValue;
        } catch (e) {
            console.error('Error loading from localStorage:', e);
            return defaultValue;
        }
    },

    // Mostrar notificación temporal
    showNotification(message, duration = 2000) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent-success);
            color: #000;
            padding: 12px 24px;
            border-radius: 40px;
            font-size: 12px;
            font-weight: 600;
            z-index: 10000;
            animation: fadeInOut ${duration}ms ease;
        `;
        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), duration);
    },

    // Descargar archivo
    downloadFile(data, filename, mimeType) {
        const blob = new Blob([data], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    },

    // Copiar al portapapeles
    async copyToClipboard(text) {
        try {
            await navigator.clipboard.writeText(text);
            this.showNotification('✅ Copiado al portapapeles');
            return true;
        } catch (e) {
            console.error('Error copying:', e);
            this.showNotification('❌ Error al copiar');
            return false;
        }
    },

    // Formatear fecha
    formatDate(timestamp) {
        return new Date(timestamp).toLocaleString();
    },

    // Obtener estadísticas actuales
    getStats() {
        const history = this.loadFromLocalStorage('qr_history', []);
        return {
            total: history.length,
            lastSize: history[history.length - 1]?.size || '—',
            lastFormat: history[history.length - 1]?.format || '—'
        };
    },

    // Añadir al historial
    addToHistory(text, size, format) {
        const history = this.loadFromLocalStorage('qr_history', []);
        history.push({
            text: text.substring(0, 100),
            size: size,
            format: format,
            timestamp: Date.now()
        });
        // Mantener solo últimos 50
        if (history.length > 50) history.shift();
        this.saveToLocalStorage('qr_history', history);
        this.updateStatsDisplay();
    },

    // Actualizar display de estadísticas
    updateStatsDisplay() {
        const stats = this.getStats();
        const qrCountEl = document.getElementById('qrCount');
        const lastSizeEl = document.getElementById('lastSize');
        const lastFormatEl = document.getElementById('lastFormat');
        
        if (qrCountEl) qrCountEl.textContent = stats.total;
        if (lastSizeEl) lastSizeEl.textContent = stats.lastSize;
        if (lastFormatEl) lastFormatEl.textContent = stats.lastFormat;
    },

    // Efecto heartbeat
    heartbeat(elementId) {
        const el = document.getElementById(elementId);
        if (el) {
            el.classList.add('heartbeat');
            setTimeout(() => el.classList.remove('heartbeat'), 300);
        }
    }
};

// Inicializar estadísticas al cargar
document.addEventListener('DOMContentLoaded', () => {
    Utils.updateStatsDisplay();
});
