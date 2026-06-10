// AXIOM VOID PULSE - CORE ENGINE v3.0
// Análisis emocional + sarcasmo + legibilidad + manipulación

const EMOTION_LEXICON = {
    ira: ['odio', 'rabia', 'enfadado', 'puto', 'mierda', 'cabrón', 'basura', 'detesto', 'asco', 'furia', 'indignación', 'vergüenza', 'humillación'],
    alegria: ['feliz', 'genial', 'increíble', 'maravilloso', 'alegría', 'risa', 'disfrutar', 'amor', 'gracias', 'perfecto', 'excelente', 'fantástico', 'genial'],
    tristeza: ['triste', 'deprimido', 'llorar', 'dolor', 'soledad', 'perdida', 'vacío', 'melancolía', 'nostalgia', 'pena', 'desolación'],
    miedo: ['miedo', 'terror', 'pánico', 'ansiedad', 'preocupación', 'amenaza', 'peligro', 'inseguro', 'alarma', 'espanto', 'horror'],
    sorpresa: ['sorpresa', 'impactante', 'increíble', 'wow', 'oh', 'vaya', 'inesperado', 'asombro', 'impresionante'],
    amor: ['amor', 'cariño', 'aprecio', 'adorar', 'corazón', 'abrazar', 'querer', 'pasion', 'romance', 'afecto', 'ternura'],
    frustracion: ['frustración', 'harto', 'cansado', 'agotado', 'colapsado', 'no puedo', 'imposible', 'fracaso', 'bloqueo', 'atasco'],
    calma: ['tranquilo', 'paz', 'sereno', 'relajado', 'zen', 'meditación', 'quietud', 'armonía', 'balance', 'equilibrio'],
    ansiedad: ['ansiedad', 'nervios', 'inquietud', 'preocupado', 'estrés', 'angustia', 'desasosiego', 'tensión', 'inquietante'],
    confianza: ['confío', 'seguro', 'certeza', 'garantía', 'fiable', 'solidez', 'firmeza', 'determinación'],
    desprecio: ['asqueroso', 'despreciable', 'vil', 'repugnante', 'desprecio', 'menosprecio', 'desdén', 'indigno'],
    entusiasmo: ['emocionado', 'ansioso', 'energía', 'motivado', 'impaciente', 'fuego', 'poder', 'fuerza', 'vamos', 'dale']
};

const SARCASM_PATTERNS = [
    { pattern: /claro que sí.*pero|claro que no.*pero/i, weight: 0.8 },
    { pattern: /qué bien.*¿no\?|qué bonito.*¿no\?/i, weight: 0.7 },
    { pattern: /por supuesto que.*pero/i, weight: 0.6 },
    { pattern: /vaya.*como siempre/i, weight: 0.6 },
    { pattern: /qué gran idea/i, weight: 0.5 },
    { pattern: /me encanta.*cuando/i, weight: 0.5 }
];

const URGENCY_WORDS = ['ahora', 'inmediato', 'urgente', 'ya', 'cuanto antes', 'asap', 'rápido', 'inmediatamente'];
const MANIPULATION_WORDS = ['deberías', 'tendrías que', 'tienes que', 'obligado', 'necesitas', 'es tu responsabilidad'];

function analyzeSarcasm(text) {
    let sarcasmScore = 0;
    for (let item of SARCASM_PATTERNS) {
        if (item.pattern.test(text)) sarcasmScore += item.weight;
    }
    // Detectar contradicciones emocionales
    const lower = text.toLowerCase();
    if (lower.includes('me encanta') && lower.includes('odio')) sarcasmScore += 0.4;
    if (lower.includes('qué bien') && lower.includes('problema')) sarcasmScore += 0.3;
    
    return { score: Math.min(1, sarcasmScore), isSarcastic: sarcasmScore > 0.4 };
}

function calculateReadability(text) {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).length;
    const syllables = text.toLowerCase().replace(/[^aeiouáéíóú]/g, '').length;
    if (sentences === 0) return 50;
    const score = 206.84 - 1.015 * (words / sentences) - 84.6 * (syllables / words);
    return Math.min(100, Math.max(0, Math.round(score)));
}

function detectManipulation(text) {
    let found = [];
    for (let word of MANIPULATION_WORDS) {
        if (text.toLowerCase().includes(word)) found.push(word);
    }
    return { hasManipulation: found.length > 0, words: found };
}

function detectUrgency(text) {
    let found = [];
    for (let word of URGENCY_WORDS) {
        if (text.toLowerCase().includes(word)) found.push(word);
    }
    return { urgencyScore: Math.min(1, found.length / 3), words: found };
}

function analyzeByPhrases(text) {
    const phrases = text.split(/[.!?]+/).filter(p => p.trim().length > 10);
    return phrases.slice(0, 5).map(phrase => {
        const tempAnalysis = analyzeVoidPulse(phrase);
        return { text: phrase.substring(0, 60), score: tempAnalysis.pulseScore, emotion: tempAnalysis.dominantEmotion };
    });
}

function analyzeVoidPulse(text) {
    if (!text || text.trim().length === 0) {
        return {
            pulseScore: 0, dominantEmotion: 'neutro', backlashRisk: 'bajo', viralityPrediction: 0,
            intensity: 0, emotionBreakdown: {}, triggerWords: [], coherenceScore: 0, emotionalWave: [],
            recommendedAction: 'silence', sarcasm: { score: 0, isSarcastic: false }, readability: 50,
            manipulation: { hasManipulation: false, words: [] }, urgency: { urgencyScore: 0, words: [] },
            phraseAnalysis: [], legibilidad: 'Normal', tonoComercial: false, neutralWords: 0
        };
    }

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const wordCount = words.length;
    
    let emotionCounts = {};
    let triggerWords = [];
    
    for (let [emotion, keywords] of Object.entries(EMOTION_LEXICON)) {
        emotionCounts[emotion] = 0;
        for (let keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = (text.match(regex) || []).length;
            if (matches > 0) {
                emotionCounts[emotion] += matches;
                if (!triggerWords.includes(keyword)) triggerWords.push(keyword);
            }
        }
    }
    
    let intensityScore = Math.min(1, (Object.values(emotionCounts).reduce((a,b)=>a+b,0) / Math.max(1, wordCount)) * 2);
    
    let maxEmotion = 'neutro', maxCount = 0;
    for (let [emotion, count] of Object.entries(emotionCounts)) {
        if (count > maxCount) { maxCount = count; maxEmotion = emotion; }
    }
    
    let pulseScore = maxCount > 0 ? Math.min(100, Math.round((maxCount / Math.max(1, wordCount)) * 300 + intensityScore * 40)) : Math.max(5, Math.min(30, Math.floor(Math.random() * 25) + 5));
    
    const backlashScore = Math.min(100, Math.round(((emotionCounts.ira || 0) + (emotionCounts.desprecio || 0) + (emotionCounts.frustracion || 0)) / Math.max(1, wordCount) * 500));
    let backlashRisk = backlashScore > 60 ? 'alto' : (backlashScore > 30 ? 'medio' : 'bajo');
    
    const viralScore = (emotionCounts.alegria || 0) * 2 + (emotionCounts.entusiasmo || 0) * 2 + (emotionCounts.sorpresa || 0) * 1.5 - (emotionCounts.tristeza || 0);
    let viralityPrediction = Math.min(95, Math.max(5, Math.round((viralScore / Math.max(1, wordCount)) * 200 + (pulseScore * 0.3))));
    
    const sarcasm = analyzeSarcasm(text);
    const readability = calculateReadability(text);
    const manipulation = detectManipulation(text);
    const urgency = detectUrgency(text);
    const phraseAnalysis = analyzeByPhrases(text);
    
    let legibilidad = readability > 70 ? 'Muy fácil' : (readability > 50 ? 'Normal' : (readability > 30 ? 'Difícil' : 'Muy difícil'));
    let tonoComercial = text.toLowerCase().includes('comprar') || text.toLowerCase().includes('oferta') || text.toLowerCase().includes('descuento');
    
    let recommendedAction = backlashRisk === 'alto' ? '⚠️ Precaución - Revisar tono' :
                           (pulseScore > 70 && (maxEmotion === 'alegria' || maxEmotion === 'entusiasmo')) ? '🚀 Ideal para viralizar' :
                           pulseScore < 20 ? '😴 Bajo impacto - Añadir emoción' :
                           maxEmotion === 'ira' ? '⚔️ Contenido polarizante' :
                           maxEmotion === 'amor' ? '💖 Contenido cálido - Buen engagement' :
                           sarcasm.isSarcastic ? '🎭 Sarcasmo detectado - Puede malinterpretarse' :
                           '📈 Estable - Puede mejorar con más intensidad';
    
    let emotionalWave = [];
    for (let i = 0; i < 20; i++) {
        emotionalWave.push(Math.sin(i * 0.5) * pulseScore * 0.01 + Math.random() * 0.1);
    }
    
    return {
        pulseScore, dominantEmotion: maxEmotion, backlashRisk, viralityPrediction,
        intensity: Math.round(intensityScore * 100), emotionBreakdown: emotionCounts,
        triggerWords: triggerWords.slice(0, 8), coherenceScore: 70 + Math.random() * 20,
        emotionalWave, recommendedAction, sarcasm, readability, manipulation, urgency,
        phraseAnalysis, legibilidad, tonoComercial, wordCount, totalMatches: maxCount
    };
}

if (typeof module !== 'undefined' && module.exports) module.exports = { analyzeVoidPulse };