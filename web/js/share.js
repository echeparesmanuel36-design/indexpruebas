// AXIOM QR FACTORY - SHARE
// Funciones para compartir resultados

const Share = {
    // Compartir usando Web Share API (nativo)
    async shareQR(text, qrDataUrl) {
        if (navigator.share) {
            try {
                // Convertir dataURL a blob
                const response = await fetch(qrDataUrl);
                const blob = await response.blob();
                const file = new File([blob], 'qr.png', { type: 'image/png' });
                
                await navigator.share({
                    title: 'QR Factory - AXIOM SYSTEMS',
                    text: `Mira este QR: ${text}`,
                    files: [file]
                });
                Utils.showNotification('✅ Compartido');
                return true;
            } catch (e) {
                console.error('Error compartiendo:', e);
                Utils.showNotification('❌ Error al compartir');
                return false;
            }
        } else {
            // Fallback: copiar enlace
            Utils.copyToClipboard(text);
            return false;
        }
    },
    
    // Compartir enlace simple
    shareLink(text) {
        Utils.copyToClipboard(text);
        Utils.showNotification('📋 Enlace copiado al portapapeles');
    },
    
    // Exportar historial a CSV
    exportHistoryToCSV() {
        const history = Utils.loadFromLocalStorage('qr_history', []);
        if (history.length === 0) {
            Utils.showNotification('📭 No hay historial para exportar');
            return;
        }
        
        const headers = ['Texto', 'Tamaño', 'Formato', 'Fecha'];
        const rows = history.map(item => [
            item.text,
            item.size,
            item.format,
            Utils.formatDate(item.timestamp)
        ]);
        
        const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
        Utils.downloadFile(csvContent, `qr-history-${Date.now()}.csv`, 'text/csv');
        Utils.showNotification('✅ Historial exportado');
    }
};

// Exponer globalmente
window.Share = Share;
