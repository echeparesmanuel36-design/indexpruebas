// AXIOM VOID PULSE - CORE ENGINE v2.0
// Análisis emocional + métricas de impacto

const EMOTION_LEXICON = {
    ira: ['odio', 'rabia', 'enfadado', 'puto', 'mierda', 'cabrón', 'basura', 'detesto', 'asco', 'furia', 'indignación'],
    alegria: ['feliz', 'genial', 'increíble', 'maravilloso', 'alegría', 'risa', 'disfrutar', 'amor', 'gracias', 'perfecto', 'excelente'],
    tristeza: ['triste', 'deprimido', 'llorar', 'dolor', 'soledad', 'perdida', 'vacío', 'melancolía', 'nostalgia'],
    miedo: ['miedo', 'terror', 'pánico', 'ansiedad', 'preocupación', 'amenaza', 'peligro', 'inseguro', 'alarma'],
    sorpresa: ['sorpresa', 'impactante', 'increíble', 'wow', 'oh', 'vaya', 'inesperado', 'asombro'],
    amor: ['amor', 'cariño', 'aprecio', 'adorar', 'corazón', 'abrazar', 'querer', 'pasion', 'romance'],
    frustracion: ['frustración', 'harto', 'cansado', 'agotado', 'colapsado', 'no puedo', 'imposible', 'fracaso'],
    calma: ['tranquilo', 'paz', 'sereno', 'relajado', 'zen', 'meditación', 'quietud', 'armonía'],
    ansiedad: ['ansiedad', 'nervios', 'inquietud', 'preocupado', 'estrés', 'angustia', 'desasosiego'],
    confianza: ['confío', 'seguro', 'certeza', 'garantía', 'fiable', 'solidez', 'firmeza'],
    desprecio: ['asqueroso', 'despreciable', 'vil', 'repugnante', 'desprecio', 'menosprecio'],
    entusiasmo: ['emocionado', 'ansioso', 'energía', 'motivado', 'impaciente', 'fuego', 'poder', 'fuerza']
};

const INTENSITY_WORDS = {
    high: ['absolutamente', 'completamente', 'totalmente', 'extremadamente', 'increíblemente', 'terriblemente', 'horriblemente', 'maravillosamente'],
    medium: ['muy', 'bastante', 'realmente', 'particularmente', 'especialmente'],
    low: ['un poco', 'ligeramente', 'algo', 'medianamente']
};

function analyzeVoidPulse(text) {
    if (!text || text.trim().length === 0) {
        return {
            pulseScore: 0,
            dominantEmotion: 'neutro',
            backlashRisk: 'bajo',
            viralityPrediction: 0,
            intensity: 0,
            emotionBreakdown: {},
            triggerWords: [],
            coherenceScore: 0,
            emotionalWave: [],
            recommendedAction: 'silence'
        };
    }

    const lowerText = text.toLowerCase();
    const words = lowerText.split(/\s+/);
    const wordCount = words.length;
    
    // Detección de emociones
    let emotionCounts = {};
    let triggerWords = [];
    
    for (let [emotion, keywords] of Object.entries(EMOTION_LEXICON)) {
        emotionCounts[emotion] = 0;
        for (let keyword of keywords) {
            const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
            const matches = (text.match(regex) || []).length;
            if (matches > 0) {
                emotionCounts[emotion] += matches;
                if (matches > 0 && !triggerWords.includes(keyword)) {
                    triggerWords.push(keyword);
                }
            }
        }
    }
    
    // Intensidad emocional
    let intensityScore = 0;
    for (let word of INTENSITY_WORDS.high) {
        if (lowerText.includes(word)) intensityScore += 0.3;
    }
    for (let word of INTENSITY_WORDS.medium) {
        if (lowerText.includes(word)) intensityScore += 0.15;
    }
    for (let word of INTENSITY_WORDS.low) {
        if (lowerText.includes(word)) intensityScore += 0.05;
    }
    intensityScore = Math.min(intensityScore, 1.0);
    
    // Emoción dominante
    let maxEmotion = 'neutro';
    let maxCount = 0;
    let totalMatches = 0;
    for (let [emotion, count] of Object.entries(emotionCounts)) {
        totalMatches += count;
        if (count > maxCount) {
            maxCount = count;
            maxEmotion = emotion;
        }
    }
    
    // Score de pulso (0-100)
    let pulseScore = 0;
    if (totalMatches > 0) {
        pulseScore = Math.min(100, Math.round((totalMatches / Math.max(1, wordCount)) * 300 + intensityScore * 40));
    } else {
        pulseScore = Math.max(5, Math.min(30, Math.floor(Math.random() * 25) + 5));
    }
    
    // Riesgo de backlash (ira + desprecio + frustración)
    const backlashEmotions = (emotionCounts.ira || 0) + (emotionCounts.desprecio || 0) + (emotionCounts.frustracion || 0);
    const backlashScore = Math.min(100, Math.round((backlashEmotions / Math.max(1, wordCount)) * 500 + (maxEmotion === 'ira' ? 30 : 0)));
    let backlashRisk = 'bajo';
    if (backlashScore > 60) backlashRisk = 'alto';
    else if (backlashScore > 30) backlashRisk = 'medio';
    
    // Predicción viral (alegría + entusiasmo + sorpresa - tristeza * 0.5)
    const viralScore = (emotionCounts.alegria || 0) * 2 + (emotionCounts.entusiasmo || 0) * 2 + (emotionCounts.sorpresa || 0) * 1.5 - (emotionCounts.tristeza || 0) * 0.8;
    let viralityPrediction = Math.min(95, Math.max(5, Math.round((viralScore / Math.max(1, wordCount)) * 200 + (pulseScore * 0.3))));
    
    // Coherencia de tono (si hay emociones muy opuestas)
    const hasOpposites = (emotionCounts.ira > 0 && emotionCounts.calma > 0) || (emotionCounts.alegria > 0 && emotionCounts.tristeza > 0);
    const coherenceScore = hasOpposites ? 40 + Math.random() * 20 : 70 + Math.random() * 20;
    
    // Ola emocional simulada (para gráfico)
    let emotionalWave = [];
    for (let i = 0; i < 20; i++) {
        let waveValue = Math.sin(i * 0.5) * pulseScore * 0.01 + Math.random() * 0.1;
        emotionalWave.push(Math.min(1, Math.max(0, waveValue + (pulseScore / 100) * 0.5)));
    }
    
    // Acción recomendada
    let recommendedAction = 'neutral';
    if (backlashRisk === 'alto') recommendedAction = '⚠️ Precaución - Revisar tono';
    else if (pulseScore > 70 && (maxEmotion === 'alegria' || maxEmotion === 'entusiasmo')) recommendedAction = '🚀 Ideal para viralizar';
    else if (pulseScore < 20) recommendedAction = '😴 Bajo impacto - Añadir emoción';
    else if (maxEmotion === 'ira') recommendedAction = '⚔️ Contenido polarizante';
    else if (maxEmotion === 'amor') recommendedAction = '💖 Contenido cálido - Buen engagement';
    else recommendedAction = '📈 Estable - Puede mejorar con más intensidad';
    
    return {
        pulseScore: pulseScore,
        dominantEmotion: maxEmotion,
        backlashRisk: backlashRisk,
        viralityPrediction: viralityPrediction,
        intensity: Math.round(intensityScore * 100),
        emotionBreakdown: emotionCounts,
        triggerWords: triggerWords.slice(0, 8),
        coherenceScore: Math.round(coherenceScore),
        emotionalWave: emotionalWave,
        recommendedAction: recommendedAction,
        wordCount: wordCount,
        totalMatches: totalMatches
    };
}

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { analyzeVoidPulse, EMOTION_LEXICON };
}