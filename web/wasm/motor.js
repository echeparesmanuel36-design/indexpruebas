// web/wasm/motor.js
// Simulador de motor WASM para pruebas
// En producción, esto sería el código generado por wasm-pack

const wasm_bindgen = {
    generate_qr: (text, darkColor, lightColor, size) => {
        // Simular generación de QR
        return new Promise((resolve) => {
            setTimeout(() => {
                const canvas = document.createElement('canvas');
                canvas.width = size;
                canvas.height = size;
                const ctx = canvas.getContext('2d');
                
                ctx.fillStyle = lightColor;
                ctx.fillRect(0, 0, size, size);
                ctx.fillStyle = darkColor;
                ctx.font = `${Math.max(12, size/20)}px monospace`;
                ctx.fillText(`QR: ${text.substring(0, 15)}...`, size/10, size/2);
                
                resolve(canvas.toDataURL('image/png'));
            }, 50);
        });
    }
};

// Exponer función de inicialización
async function init() {
    console.log('WASM motor simulado cargado');
    return Promise.resolve();
}

window.wasm_bindgen = wasm_bindgen;
window.wasm_bindgen.init = init;
