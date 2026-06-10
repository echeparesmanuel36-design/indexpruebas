// AXIOM QR FACTORY - KEYBOARD SHORTCUTS
// Atajos de teclado para mejorar productividad

const Shortcuts = {
    shortcuts: {
        'ctrl+enter': () => {
            document.getElementById('generateBtn')?.click();
        },
        'ctrl+d': () => {
            document.getElementById('downloadPngBtn')?.click();
        },
        'ctrl+s': () => {
            document.getElementById('downloadSvgBtn')?.click();
        },
        'ctrl+c': () => {
            const text = document.getElementById('qrText')?.value;
            if (text) Utils.copyToClipboard(text);
        },
        'ctrl+h': () => {
            Share.exportHistoryToCSV();
        },
        '?': () => {
            Shortcuts.showHelp();
        },
        'escape': () => {
            document.getElementById('qrText')?.focus();
        }
    },
    
    init() {
        document.addEventListener('keydown', (e) => {
            const key = e.key.toLowerCase();
            const ctrl = e.ctrlKey || e.metaKey;
            
            // Construir clave del shortcut
            let shortcutKey = '';
            if (ctrl) shortcutKey += 'ctrl+';
            if (e.shiftKey) shortcutKey += 'shift+';
            shortcutKey += key;
            
            const handler = this.shortcuts[shortcutKey];
            if (handler) {
                e.preventDefault();
                handler();
            }
        });
    },
    
    showHelp() {
        const helpText = `
🎹 ATEJOS DE TECLADO:
─────────────────────
Ctrl+Enter  → Generar QR
Ctrl+D      → Descargar PNG
Ctrl+S      → Descargar SVG
Ctrl+C      → Copiar enlace
Ctrl+H      → Exportar historial
?           → Mostrar esta ayuda
Esc         → Enfocar input
        `;
        alert(helpText);
    }
};

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    Shortcuts.init();
});
