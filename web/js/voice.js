// AXIOM QR FACTORY - VOICE INPUT
// Entrada de texto por voz

let recognition = null;
let isListening = false;

// Inicializar reconocimiento de voz
function initVoiceRecognition() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        recognition = new SpeechRecognition();
        recognition.lang = 'es-ES';
        recognition.continuous = false;
        recognition.interimResults = false;
        
        recognition.onstart = () => {
            isListening = true;
            Utils.showNotification('🎤 Escuchando...');
        };
        
        recognition.onend = () => {
            isListening = false;
        };
        
        recognition.onresult = (event) => {
            const transcript = event.results[0][0].transcript;
            const textInput = document.getElementById('qrText');
            if (textInput) {
                textInput.value = transcript;
                textInput.dispatchEvent(new Event('input'));
                Utils.showNotification(`✅ Texto: "${transcript}"`);
                // Opcional: generar QR automáticamente
                document.getElementById('generateBtn')?.click();
            }
        };
        
        recognition.onerror = (event) => {
            console.error('Error de voz:', event.error);
            Utils.showNotification('❌ Error de reconocimiento de voz');
            isListening = false;
        };
        
        return true;
    } else {
        console.warn('Reconocimiento de voz no soportado');
        return false;
    }
}

// Iniciar escucha
function startVoiceInput() {
    if (!recognition) {
        const supported = initVoiceRecognition();
        if (!supported) {
            Utils.showNotification('❌ Tu navegador no soporta reconocimiento de voz');
            return;
        }
    }
    
    if (isListening) {
        recognition.stop();
    } else {
        recognition.start();
    }
}

// Crear botón de voz (añadir al UI)
function addVoiceButton() {
    const container = document.querySelector('.glass-card:first-child .flex-row');
    if (container && !document.getElementById('voiceBtn')) {
        const voiceBtn = document.createElement('button');
        voiceBtn.id = 'voiceBtn';
        voiceBtn.innerHTML = '🎤 Voz';
        voiceBtn.title = 'Entrada por voz';
        voiceBtn.addEventListener('click', startVoiceInput);
        container.insertBefore(voiceBtn, container.firstChild);
    }
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
    addVoiceButton();
    initVoiceRecognition();
});
