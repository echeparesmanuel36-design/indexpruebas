// AXIOM VOID PULSE - UI CONTROLLER v3.0
// Historial, PNG 9:16, PDF, logros, gamificación, todas las funciones

let analysisHistory = [];
let currentAnalysis = null;
let currentText = '';
let achievementsUnlocked = [];
let dailyStreak = 0;
let lastAnalysisDate = null;
let highScore = 0;

function loadAllData() {
    const savedHistory = localStorage.getItem('voidPulse_history');
    if (savedHistory) analysisHistory = JSON.parse(savedHistory);
    const savedAchievements = localStorage.getItem('voidPulse_achievements');
    if (savedAchievements) achievementsUnlocked = JSON.parse(savedAchievements);
    const savedStreak = localStorage.getItem('voidPulse_streak');
    if (savedStreak) dailyStreak = parseInt(savedStreak);
    const savedLastDate = localStorage.getItem('voidPulse_lastDate');
    if (savedLastDate) lastAnalysisDate = savedLastDate;
    const savedHighScore = localStorage.getItem('voidPulse_highScore');
    if (savedHighScore) highScore = parseInt(savedHighScore);
    updateStreakDisplay();
    updateHighScoreDisplay();
}

function saveAllData() {
    localStorage.setItem('voidPulse_history', JSON.stringify(analysisHistory.slice(0, 50)));
    localStorage.setItem('voidPulse_achievements', JSON.stringify(achievementsUnlocked));
    localStorage.setItem('voidPulse_streak', dailyStreak.toString());
    localStorage.setItem('voidPulse_lastDate', lastAnalysisDate || '');
    localStorage.setItem('voidPulse_highScore', highScore.toString());
}

function updateStreakDisplay() {
    const streakEl = document.getElementById('streakInfo');
    if (streakEl) streakEl.innerHTML = `🔥 Racha: ${dailyStreak} días seguidos analizando | 🏆 Récord personal: ${highScore}`;
}

function updateHighScoreDisplay() {
    if (currentAnalysis && currentAnalysis.pulseScore > highScore) {
        highScore = currentAnalysis.pulseScore;
        saveAllData();
        updateStreakDisplay();
        showParticles();
        checkAchievements(currentAnalysis.pulseScore);
    }
}

function showParticles() {
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle-effect';
        particle.innerHTML = '✨';
        particle.style.position = 'fixed';
        particle.style.left = Math.random() * window.innerWidth + 'px';
        particle.style.top = Math.random() * window.innerHeight + 'px';
        particle.style.fontSize = (Math.random() * 20 + 10) + 'px';
        particle.style.opacity = '1';
        particle.style.transition = 'all 1s ease';
        document.body.appendChild(particle);
        setTimeout(() => { particle.style.opacity = '0'; particle.style.transform = 'translateY(-50px)'; }, 100);
        setTimeout(() => particle.remove(), 1000);
    }
}

function heartbeatEffect() {
    const pulseElement = document.getElementById('pulseScore');
    if (pulseElement) {
        pulseElement.classList.add('heartbeat');
        setTimeout(() => pulseElement.classList.remove('heartbeat'), 300);
    }
}

function playPulseSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscillator.frequency.value = 440;
        gainNode.gain.value = 0.1;
        oscillator.start();
        gainNode.gain.exponentialRampToValueAtTime(0.00001, audioCtx.currentTime + 0.5);
        oscillator.stop(audioCtx.currentTime + 0.5);
    } catch(e) { console.log('Audio no soportado'); }
}

function addToHistory(text, analysis) {
    analysisHistory.unshift({
        text: text.substring(0, 200),
        score: analysis.pulseScore,
        emotion: analysis.dominantEmotion,
        backlash: analysis.backlashRisk,
        timestamp: Date.now()
    });
    if (analysisHistory.length > 50) analysisHistory.pop();
    saveAllData();
    updateHistoryPanel();
}

function updateHistoryPanel() {
    const panel = document.getElementById('historyPanel');
    if (!panel) return;
    if (analysisHistory.length === 0) {
        panel.innerHTML = '<p style="color:var(--text-muted);">No hay análisis previos.</p>';
        return;
    }
    panel.innerHTML = '<div style="display:flex; flex-direction:column; gap:12px;">' + 
        analysisHistory.map((item, idx) => `
            <div style="background:var(--code-bg); border-radius:12px; padding:12px; border-left: 4px solid ${item.score > 70 ? 'var(--pulse-high)' : (item.score > 40 ? 'var(--accent-glow-1)' : 'var(--pulse-low)')}">
                <div><strong>Score ${item.score}</strong> - ${item.emotion} - ${item.backlash}</div>
                <div style="font-size:11px; color:var(--text-muted);">${item.text.substring(0, 80)}${item.text.length > 80 ? '...' : ''}</div>
                <div style="font-size:10px; color:var(--text-muted);">${new Date(item.timestamp).toLocaleString()}</div>
                <button class="loadHistoryBtn" data-idx="${idx}" style="margin-top:8px; padding:4px 12px; font-size:9px;">Cargar</button>
            </div>
        `).join('') + '</div>';
    document.querySelectorAll('.loadHistoryBtn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.idx);
            if (analysisHistory[idx]) {
                document.getElementById('textInput').value = analysisHistory[idx].text;
                document.getElementById('analyzeBtn').click();
            }
        });
    });
}

function updateAchievementsPanel() {
    const panel = document.getElementById('achievementsPanel');
    if (!panel) return;
    const allAchievements = [
        { id: 'first_analysis', name: '🌟 Primer análisis', condition: 'Realiza tu primer análisis' },
        { id: 'score_90', name: '💪 Pulso de acero', condition: 'Alcanza 90+ de pulse score' },
        { id: 'score_10', name: '😴 Pulso bajo', condition: 'Obtén menos de 15 de pulse score' },
        { id: 'ira_detected', name: '⚔️ Detecta ira', condition: 'Detecta ira como emoción dominante' },
        { id: 'amor_detected', name: '💖 Detecta amor', condition: 'Detecta amor como emoción dominante' },
        { id: 'sarcasm_detected', name: '🎭 Detecta sarcasmo', condition: 'Analiza un texto sarcástico' },
        { id: 'high_risk', name: '⚠️ Riesgo alto', condition: 'Detecta riesgo de backlash alto' },
        { id: 'viral_80', name: '📈 Viral', condition: 'Predicción viral > 80%' },
        { id: 'ten_analyses', name: '📊 Analista', condition: 'Realiza 10 análisis' },
        { id: 'fifty_analyses', name: '🏅 Experto', condition: 'Realiza 50 análisis' }
    ];
    const unlockedIds = achievementsUnlocked.map(a => a.id);
    panel.innerHTML = '<div style="display:grid; grid-template-columns:repeat(auto-fill,minmax(200px,1fr)); gap:12px;">' +
        allAchievements.map(ach => `
            <div style="background:var(--code-bg); border-radius:12px; padding:12px; opacity:${unlockedIds.includes(ach.id) ? '1' : '0.5'}">
                <div>${ach.name}</div>
                <div style="font-size:10px; color:var(--text-muted);">${ach.condition}</div>
                ${unlockedIds.includes(ach.id) ? '<span style="font-size:10px; color:var(--accent-success);">✓ Desbloqueado</span>' : '<span style="font-size:10px;">🔒 Bloqueado</span>'}
            </div>
        `).join('') + '</div>';
}

function checkAchievements(score) {
    const newAchievements = [];
    if (analysisHistory.length >= 1 && !achievementsUnlocked.find(a => a.id === 'first_analysis')) {
        newAchievements.push({ id: 'first_analysis', name: '🌟 Primer análisis', date: Date.now() });
    }
    if (score >= 90 && !achievementsUnlocked.find(a => a.id === 'score_90')) {
        newAchievements.push({ id: 'score_90', name: '💪 Pulso de acero', date: Date.now() });
    }
    if (score <= 15 && !achievementsUnlocked.find(a => a.id === 'score_10')) {
        newAchievements.push({ id: 'score_10', name: '😴 Pulso bajo', date: Date.now() });
    }
    if (currentAnalysis && currentAnalysis.dominantEmotion === 'ira' && !achievementsUnlocked.find(a => a.id === 'ira_detected')) {
        newAchievements.push({ id: 'ira_detected', name: '⚔️ Detecta ira', date: Date.now() });
    }
    if (currentAnalysis && currentAnalysis.dominantEmotion === 'amor' && !achievementsUnlocked.find(a => a.id === 'amor_detected')) {
        newAchievements.push({ id: 'amor_detected', name: '💖 Detecta amor', date: Date.now() });
    }
    if (currentAnalysis && currentAnalysis.sarcasm.isSarcastic && !achievementsUnlocked.find(a => a.id === 'sarcasm_detected')) {
        newAchievements.push({ id: 'sarcasm_detected', name: '🎭 Detecta sarcasmo', date: Date.now() });
    }
    if (currentAnalysis && currentAnalysis.backlashRisk === 'alto' && !achievementsUnlocked.find(a => a.id === 'high_risk')) {
        newAchievements.push({ id: 'high_risk', name: '⚠️ Riesgo alto', date: Date.now() });
    }
    if (currentAnalysis && currentAnalysis.viralityPrediction >= 80 && !achievementsUnlocked.find(a => a.id === 'viral_80')) {
        newAchievements.push({ id: 'viral_80', name: '📈 Viral', date: Date.now() });
    }
    if (analysisHistory.length >= 10 && !achievementsUnlocked.find(a => a.id === 'ten_analyses')) {
        newAchievements.push({ id: 'ten_analyses', name: '📊 Analista', date: Date.now() });
    }
    if (analysisHistory.length >= 50 && !achievementsUnlocked.find(a => a.id === 'fifty_analyses')) {
        newAchievements.push({ id: 'fifty_analyses', name: '🏅 Experto', date: Date.now() });
    }
    if (newAchievements.length > 0) {
        achievementsUnlocked.push(...newAchievements);
        saveAllData();
        updateAchievementsPanel();
        alert(`🏆 ¡Nuevo logro desbloqueado: ${newAchievements.map(a => a.name).join(', ')}!`);
    }
}

function drawRadarChart(emotionBreakdown) {
    const canvas = document.getElementById('radarCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width = 200, h = canvas.height = 200;
    ctx.clearRect(0, 0, w, h);
    const emotions = ['ira', 'alegria', 'tristeza', 'miedo', 'amor', 'entusiasmo'];
    const values = emotions.map(e => Math.min(1, (emotionBreakdown[e] || 0) / 5));
    const centerX = w/2, centerY = h/2, radius = 70;
    const angles = emotions.map((_, i) => (i * 2 * Math.PI / emotions.length) - Math.PI/2);
    
    ctx.beginPath();
    angles.forEach((angle, i) => {
        const x = centerX + radius * values[i] * Math.cos(angle);
        const y = centerY + radius * values[i] * Math.sin(angle);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
    });
    ctx.closePath();
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-glow-1') + '40';
    ctx.fill();
    ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--accent-glow-1');
    ctx.stroke();
    
    angles.forEach((angle, i) => {
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(x, y);
        ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue('--border-color');
        ctx.stroke();
        ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--text-muted');
        ctx.font = '8px Inter';
        ctx.fillText(emotions[i].substring(0,3), x-8, y-5);
    });
    window.redrawRadar = () => drawRadarChart(emotionBreakdown);
}

function generateWordCloud(triggerWords) {
    const container = document.getElementById('wordCloud');
    if (!container) return;
    if (!triggerWords || triggerWords.length === 0) {
        container.innerHTML = '<span style="color:var(--text-muted);">No se detectaron palabras clave.</span>';
        return;
    }
    const sizes = [24, 20, 18, 16, 14, 12];
    container.innerHTML = triggerWords.map((word, i) => 
        `<span style="display:inline-block; margin:4px; font-size:${sizes[Math.min(i, sizes.length-1)]}px; color:var(--accent-glow-1);">${word}</span>`
    ).join('');
}

function updateTips(analysis, text) {
    const container = document.getElementById('tipsContainer');
    if (!container) return;
    let tips = [];
    if (analysis.backlashRisk === 'alto') tips.push('⚠️ Riesgo alto de backlash. Suaviza el tono o añade matices.');
    if (analysis.sarcasm.isSarcastic) tips.push('🎭 Se detectó sarcasmo. Asegúrate de que el contexto sea claro.');
    if (analysis.manipulation.hasManipulation) tips.push(`🔍 Lenguaje manipulativo detectado: "${analysis.manipulation.words.join(', ')}". Considera un tono más colaborativo.`);
    if (analysis.urgency.urgencyScore > 0.5) tips.push('⏰ Lenguaje urgente detectado. Úsalo con moderación para no quemar al lector.');
    if (analysis.tonoComercial) tips.push('💰 Tono comercial identificado. Añade pruebas sociales o casos de éxito.');
    if (analysis.readability < 40) tips.push('📖 El texto es difícil de leer. Acorta frases y simplifica palabras.');
    if (analysis.pulseScore < 30) tips.push('💓 Pulse bajo. Añade palabras emocionales o ejemplos vívidos.');
    if (analysis.pulseScore > 80) tips.push('🔥 ¡Alto voltaje! Perfecto para redes sociales.');
    if (tips.length === 0) tips.push('✅ El texto está equilibrado. Puedes experimentar con más intensidad o calma según tu objetivo.');
    container.innerHTML = tips.map(t => `<div style="margin:8px 0;">${t}</div>`).join('');
}

async function downloadAsPNG(analysis, text) {
    const canvas = document.createElement('canvas');
    const ratio = 9/16;
    canvas.width = 900;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');
    const theme = document.documentElement.getAttribute('data-theme');
    ctx.fillStyle = theme === 'dark' ? '#03060a' : '#F2F4F8';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = theme === 'dark' ? '#F5F6F8' : '#101219';
    ctx.font = 'bold 48px "Playfair Display"';
    ctx.fillText('AXIOM VOID PULSE', 50, 100);
    ctx.font = '24px Inter';
    ctx.fillStyle = theme === 'dark' ? '#8E92A2' : '#5F6473';
    ctx.fillText('Análisis de pulso emocional', 50, 160);
    
    const pulseColor = analysis.pulseScore > 70 ? '#ff3366' : (analysis.pulseScore > 40 ? '#00e5ff' : '#00ff66');
    ctx.fillStyle = pulseColor;
    ctx.font = 'bold 180px Inter';
    ctx.fillText(analysis.pulseScore.toString(), 50, 400);
    ctx.font = '32px Inter';
    ctx.fillStyle = theme === 'dark' ? '#F5F6F8' : '#101219';
    ctx.fillText('Pulse Score', 50, 480);
    
    ctx.font = '28px Inter';
    ctx.fillStyle = theme === 'dark' ? '#8E92A2' : '#5F6473';
    ctx.fillText(`Emoción: ${analysis.dominantEmotion}`, 50, 580);
    ctx.fillText(`Riesgo backlash: ${analysis.backlashRisk}`, 50, 640);
    ctx.fillText(`Predicción viral: ${analysis.viralityPrediction}%`, 50, 700);
    
    ctx.font = '20px Inter';
    const wrappedText = text.length > 200 ? text.substring(0, 200) + '...' : text;
    const lines = [];
    let line = '';
    for (let word of wrappedText.split(' ')) {
        if ((line + ' ' + word).length * 15 > 800) {
            lines.push(line);
            line = word;
        } else {
            line += (line ? ' ' : '') + word;
        }
    }
    lines.push(line);
    lines.forEach((l, i) => ctx.fillText(l, 50, 820 + i * 30));
    
    ctx.fillStyle = pulseColor;
    ctx.font = '16px Inter';
    ctx.fillText('AXIOM SYSTEMS · Análisis 100% local', 50, canvas.height - 80);
    const link = document.createElement('a');
    link.download = `void-pulse-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
}

async function downloadAsPDF(analysis, text) {
    const { jsPDF } = window.jspdf || await import('https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js');
    const doc = new jsPDF({ format: 'a4' });
    doc.setFont('helvetica');
    doc.setFontSize(22);
    doc.text('AXIOM VOID PULSE', 20, 30);
    doc.setFontSize(12);
    doc.text(`Fecha: ${new Date().toLocaleString()}`, 20, 50);
    doc.text(`Pulse Score: ${analysis.pulseScore}/100`, 20, 70);
    doc.text(`Emoción dominante: ${analysis.dominantEmotion}`, 20, 85);
    doc.text(`Riesgo backlash: ${analysis.backlashRisk}`, 20, 100);
    doc.text(`Predicción viral: ${analysis.viralityPrediction}%`, 20, 115);
    doc.text(`Intensidad: ${analysis.intensity}%`, 20, 130);
    doc.text(`Legibilidad: ${analysis.legibilidad}`, 20, 145);
    doc.text(`Sarcasmo detectado: ${analysis.sarcasm.isSarcastic ? 'Sí' : 'No'}`, 20, 160);
    doc.text(`Manipulación detectada: ${analysis.manipulation.hasManipulation ? 'Sí' : 'No'}`, 20, 175);
    doc.text(`Acción recomendada: ${analysis.recommendedAction}`, 20, 195);
    const splitText = doc.splitTextToSize(text.substring(0, 500), 170);
    doc.text(splitText, 20, 220);
    doc.save(`void-pulse-${Date.now()}.pdf`);
}

function shareOnTwitter(analysis) {
    const text = `Mi texto tiene un PULSE SCORE de ${analysis.pulseScore}/100 🫀\nEmoción: ${analysis.dominantEmotion}\nRiesgo: ${analysis.backlashRisk}\nViralidad: ${analysis.viralityPrediction}%\n\nAnaliza el tuyo con @AxiomSystems #VoidPulse`;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}`, '_blank');
}

function showComparatorModal() {
    let modal = document.getElementById('comparatorModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'comparatorModal';
        modal.style.cssText = `position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,0.8); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:1000;`;
        modal.innerHTML = `<div style="background:var(--surface-color); border-radius:32px; max-width:900px; width:90%; max-height:80vh; overflow:auto; padding:28px;">
            <h2>Comparador de textos</h2>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin:20px 0;">
                <textarea id="compareText1" placeholder="Texto A" style="background:var(--code-bg); border-radius:12px; padding:12px; min-height:150px;"></textarea>
                <textarea id="compareText2" placeholder="Texto B" style="background:var(--code-bg); border-radius:12px; padding:12px; min-height:150px;"></textarea>
            </div>
            <button id="doCompareBtn" style="margin:10px auto; display:block; background:linear-gradient(135deg,var(--accent-glow-1),var(--accent-glow-2)); border:none; padding:12px 24px; border-radius:40px;">COMPARAR</button>
            <div id="compareResult"></div>
            <button id="closeModalBtn" style="margin-top:16px; width:100%; background:var(--code-bg);">Cerrar</button>
        </div>`;
        document.body.appendChild(modal);
        document.getElementById('closeModalBtn').onclick = () => modal.style.display = 'none';
        document.getElementById('doCompareBtn').onclick = () => {
            const t1 = document.getElementById('compareText1').value;
            const t2 = document.getElementById('compareText2').value;
            const r1 = analyzeVoidPulse(t1);
            const r2 = analyzeVoidPulse(t2);
            document.getElementById('compareResult').innerHTML = `<div style="display:grid; grid-template-columns:1fr 1fr; gap:16px;">
                <div style="background:var(--code-bg); border-radius:16px; padding:16px; text-align:center;"><div style="font-size:48px; font-weight:bold;">${r1.pulseScore}</div><div>${r1.dominantEmotion}</div><div>${r1.backlashRisk}</div></div>
                <div style="background:var(--code-bg); border-radius:16px; padding:16px; text-align:center;"><div style="font-size:48px; font-weight:bold;">${r2.pulseScore}</div><div>${r2.dominantEmotion}</div><div>${r2.backlashRisk}</div></div>
            </div>`;
        };
    }
    modal.style.display = 'flex';
}

function generateRandomText() {
    const samples = [
        "Estoy muy feliz hoy! El sol brilla y todo va genial.",
        "Odio esta situación. Es insoportable y no aguanto más.",
        "Me siento extraño... no sé qué pensar. Quizás todo salga bien, o quizás no.",
        "¡Increíble! No me lo puedo creer. Esto cambia todo lo que sabíamos.",
        "Tranquilo, todo está bajo control. Respira hondo y confía en el proceso."
    ];
    document.getElementById('textInput').value = samples[Math.floor(Math.random() * samples.length)];
    document.getElementById('analyzeBtn').click();
}

function toggleFullscreen() {
    if (!document.fullscreenElement) document.documentElement.requestFullscreen();
    else document.exitFullscreen();
}

function resetAllData() {
    if (confirm('⚠️ ¿Seguro que quieres borrar TODO? Se perderán historial, logros, récord y racha.')) {
        localStorage.clear();
        location.reload();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadAllData();
    updateHistoryPanel();
    updateAchievementsPanel();
    
    document.getElementById('analyzeBtn').addEventListener('click', () => {
        const text = document.getElementById('textInput').value;
        if (!text.trim()) return;
        currentText = text;
        const analysis = analyzeVoidPulse(text);
        currentAnalysis = analysis;
        addToHistory(text, analysis);
        updateHighScoreDisplay();
        heartbeatEffect();
        playPulseSound();
        
        document.getElementById('pulseScore').innerHTML = analysis.pulseScore;
        document.getElementById('emotion').innerHTML = analysis.dominantEmotion;
        document.getElementById('backlashRisk').innerHTML = analysis.backlashRisk;
        document.getElementById('viralityPrediction').innerHTML = analysis.viralityPrediction + '%';
        
        const output = document.getElementById('analysisOutput');
        output.innerHTML = `<strong>📊 Análisis completado</strong><br>
            Score: ${analysis.pulseScore}/100 - ${analysis.dominantEmotion.toUpperCase()}<br>
            Intensidad: ${analysis.intensity}% | Coherencia: ${analysis.coherenceScore}%<br>
            Palabras gatillo: ${analysis.triggerWords.join(', ') || 'ninguna'}<br>
            Legibilidad: ${analysis.legibilidad} | Sarcasmo: ${analysis.sarcasm.isSarcastic ? 'Sí' : 'No'}<br>
            <span style="color: var(--accent-glow-1);">💡 ${analysis.recommendedAction}</span>`;
        
        document.getElementById('sarcasmDetector').innerHTML = analysis.sarcasm.isSarcastic ? 
            '<span style="color:var(--pulse-high);">🎭 SARCASMO DETECTADO - Revisa el contexto</span>' :
            '<span style="color:var(--accent-success);">✓ Sin sarcasmo aparente</span>';
        
        drawRadarChart(analysis.emotionBreakdown);
        generateWordCloud(analysis.triggerWords);
        updateTips(analysis, text);
        
        const phraseDiv = document.getElementById('phraseBreakdown');
        if (phraseDiv && analysis.phraseAnalysis.length) {
            phraseDiv.innerHTML = '<label style="font-size:10px;">📊 Desglose por frases:</label>' + 
                analysis.phraseAnalysis.map(p => `<div style="font-size:11px; margin:4px 0;">Score ${p.score}: ${p.text}...</div>`).join('');
        }
        
        checkAchievements(analysis.pulseScore);
    });
    
    document.getElementById('randomTextBtn').addEventListener('click', generateRandomText);
    document.getElementById('fullscreenBtn').addEventListener('click', toggleFullscreen);
    document.getElementById('downloadPngBtn').addEventListener('click', () => { if(currentAnalysis) downloadAsPNG(currentAnalysis, currentText); });
    document.getElementById('downloadPdfBtn').addEventListener('click', () => { if(currentAnalysis) downloadAsPDF(currentAnalysis, currentText); });
    document.getElementById('shareTwitterBtn').addEventListener('click', () => { if(currentAnalysis) shareOnTwitter(currentAnalysis); });
    document.getElementById('copyResultBtn').addEventListener('click', () => {
        const output = document.getElementById('analysisOutput').innerText;
        navigator.clipboard.writeText(output);
        alert('Resultado copiado al portapapeles');
    });
    document.getElementById('enhanceBtn').addEventListener('click', showComparatorModal);
    document.getElementById('showHistoryBtn').addEventListener('click', () => {
        const panel = document.getElementById('historyPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        updateHistoryPanel();
    });
    document.getElementById('showAchievementsBtn').addEventListener('click', () => {
        const panel = document.getElementById('achievementsPanel');
        panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        updateAchievementsPanel();
    });
    document.getElementById('resetAllDataBtn').addEventListener('click', resetAllData);
});