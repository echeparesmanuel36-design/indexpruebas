// AXIOM QR FACTORY - UI
// Interfaz de usuario y generación de QR (con WASM)

let motor = null;
let currentQrData = null;

// Inicializar motor WASM
async function initMotor() {
    try {
        if (typeof wasm_bindgen !== 'undefined') {
            await wasm_bindgen('./wasm/motor.wasm');
            motor = wasm_bindgen;
            console.log('✅ Motor WASM cargado');
        } else {
            // Fallback a generador JS nativo si WASM no está disponible
            console.warn('WASM no disponible, usando fallback JS');
            motor = null;
        }
    } catch (e) {
        console.error('Error cargando WASM:', e);
        motor = null;
    }
}

// Generar QR usando WASM (o fallback)
async function generateQR(text, darkColor, lightColor, size) {
    if (motor && motor.generate_qr) {
        // Usar motor Rust
        const result = motor.generate_qr(text, darkColor, lightColor, size);
        return result;
    } else {
        // Fallback: dibujar QR simple (simulado para demo)
        return generateFallbackQR(text, darkColor, lightColor, size);
    }
}

// Fallback: dibujar un QR visual (solo para demo)
function generateFallbackQR(text, darkColor, lightColor, size) {
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    // Simular QR con patron visual
    ctx.fillStyle = lightColor;
    ctx.fillRect(0, 0, size, size);
    
    const blockSize = size / 33; // 33x33 grid típico de QR
    
    ctx.fillStyle = darkColor;
    
    // Esquinas (patrones de posición)
    for (let y = 0; y < 7; y++) {
        for (let x = 0; x < 7; x++) {
            if ((x === 0 || x === 6 || y === 0 || y === 6) || 
                (x > 1 && x < 5 && y > 1 && y < 5 && x !== 3 && y !== 3)) {
                ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
                ctx.fillRect(size - (7 - x) * blockSize, y * blockSize, blockSize, blockSize);
                ctx.fillRect(x * blockSize, size - (7 - y) * blockSize, blockSize, blockSize);
            }
        }
    }
    
    // Datos simulados (basados en el texto)
    const hash = text.length % 100;
    for (let i = 0; i < 200; i++) {
        const x = 7 + (i % 20);
        const y = 7 + Math.floor(i / 20);
        if ((hash + i) % 3 !== 0) {
            ctx.fillRect(x * blockSize, y * blockSize, blockSize, blockSize);
        }
    }
    
    return canvas.toDataURL('image/png');
}

// Dibujar QR en canvas
function drawQRToCanvas(dataUrl, size) {
    const canvas = document.getElementById('qrCanvas');
    if (!canvas) return;
    
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    
    const img = new Image();
    img.onload = () => {
        ctx.drawImage(img, 0, 0, size, size);
    };
    img.src = dataUrl;
}

// Descargar como PNG
function downloadAsPNG(canvas) {
    const link = document.createElement('a');
    link.download = `qr-${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    Utils.showNotification('✅ PNG descargado');
}

// Descargar como SVG (simulado)
function downloadAsSVG(text, darkColor, lightColor, size) {
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <rect width="${size}" height="${size}" fill="${lightColor}"/>
        <text x="50%" y="50%" text-anchor="middle" dominant-baseline="middle" fill="${darkColor}" font-size="12">QR: ${text.substring(0, 20)}</text>
    </svg>`;
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `qr-${Date.now()}.svg`;
    a.click();
    URL.revokeObjectURL(url);
    Utils.showNotification('✅ SVG descargado');
}

// Eventos UI
document.addEventListener('DOMContentLoaded', async () => {
    await initMotor();
    
    const generateBtn = document.getElementById('generateBtn');
    const downloadPngBtn = document.getElementById('downloadPngBtn');
    const downloadSvgBtn = document.getElementById('downloadSvgBtn');
    const copyUrlBtn = document.getElementById('copyUrlBtn');
    const qrText = document.getElementById('qrText');
    const qrColor = document.getElementById('qrColor');
    const bgColor = document.getElementById('bgColor');
    const qrSize = document.getElementById('qrSize');
    const previewText = document.getElementById('previewText');
    const proBtn = document.getElementById('proBtn');
    
    // Generar QR
    async function doGenerate() {
        const text = qrText.value.trim();
        if (!text) {
            Utils.showNotification('❌ Introduce un enlace o texto');
            return;
        }
        
        const darkColor = qrColor.value;
        const lightColor = bgColor.value;
        const size = parseInt(qrSize.value);
        
        previewText.textContent = `Contenido: ${text}`;
        
        Utils.heartbeat('qrCount');
        
        try {
            const qrDataUrl = await generateQR(text, darkColor, lightColor, size);
            drawQRToCanvas(qrDataUrl, size);
            currentQrData = { text, darkColor, lightColor, size, qrDataUrl };
            
            // Guardar en historial
            Utils.addToHistory(text, `${size}px`, 'PNG');
        } catch (e) {
            console.error('Error generando QR:', e);
            Utils.showNotification('❌ Error al generar QR');
        }
    }
    
    generateBtn.addEventListener('click', doGenerate);
    
    // Descargar PNG
    downloadPngBtn.addEventListener('click', () => {
        const canvas = document.getElementById('qrCanvas');
        if (canvas) {
            downloadAsPNG(canvas);
            Utils.addToHistory(qrText.value.trim(), `${qrSize.value}px`, 'PNG');
        }
    });
    
    // Descargar SVG
    downloadSvgBtn.addEventListener('click', () => {
        downloadAsSVG(qrText.value.trim(), qrColor.value, bgColor.value, parseInt(qrSize.value));
        Utils.addToHistory(qrText.value.trim(), `${qrSize.value}px`, 'SVG');
    });
    
    // Copiar enlace
    copyUrlBtn.addEventListener('click', () => {
        Utils.copyToClipboard(qrText.value.trim());
    });
    
    // Generar al cambiar inputs (opcional, pero mejor manual)
    qrText.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') doGenerate();
    });
    
    // Botón PRO (demo)
    proBtn.addEventListener('click', () => {
        Utils.showNotification('🔒 Versión PRO disponible con motor Rust y código fuente');
    });
    
    // Generar QR inicial
    doGenerate();
});
