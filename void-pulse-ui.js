// AXIOM VOID PULSE - UI CONTROLLER v2.0
// Historial, gráficos, exportación, comparador

let analysisHistory = [];
let currentAnalysis = null;

// Cargar historial guardado
function loadHistory() {
    const saved = localStorage.getItem('voidPulse_history');
    if (saved) {
        try {
            analysisHistory = JSON.parse(saved);
            updateHistoryPanel();
        } catch(e) { console.error(e); }
    }
}

function saveHistory() {
    localStorage.setItem('voidPulse_history', JSON.stringify(analysisHistory.slice(0, 10)));
    updateHistoryPanel();
}

function updateHistoryPanel() {
    let historyHtml = '<option value="">-- Seleccionar análisis previo --</option>';
    analysisHistory.forEach((item, idx) => {
        const preview = item.text.substring(0, 40) + (item.text.length > 40 ? '...' : '');
        historyHtml += `<option value="${idx}">📊 Score ${item.score} - ${preview}</option>`;
    });
    
    let historySelect = document.getElementById('historySelect');
    if (!historySelect) {
        const statsPanel = document.getElementById('statsPanel');
        if (statsPanel && !document.getElementById('historySelect')) {
            const historyDiv = document.createElement('div');
            historyDiv.className = 'stats-row';
            historyDiv.style.marginTop = '16px';
            historyDiv.innerHTML = `
                <select id="historySelect" style="background: var(--code-bg); border: 1px solid var(--border-color); padding: 10px; border-radius: 12px; color: var(--text-main); width: 100%;">
                    ${historyHtml}
                </select>
                <button id="clearHistoryBtn" style="background: var(--code-bg); padding: 10px 16px;">🗑️ Borrar</button>
            `;
            statsPanel.parentNode.insertBefore(historyDiv, statsPanel.nextSibling);
            
            document.getElementById('historySelect')?.addEventListener('change', (e) => {
                const idx = parseInt(e.target.value);
                if (!isNaN(idx) && analysisHistory[idx]) {
                    document.getElementById('textInput').value = analysisHistory[idx].text;
                    document.getElementById('analyzeBtn').click();
                }
            });
            
            document.getElementById('clearHistoryBtn')?.addEventListener('click', () => {
                analysisHistory = [];
                saveHistory();
                document.getElementById('historySelect').innerHTML = '<option value="">-- Seleccionar análisis previo --</option>';
            });
        }
    } else {
        historySelect.innerHTML = historyHtml;
    }
}

// Añadir al historial
function addToHistory(text, score, analysis) {
    analysisHistory.unshift({
        text: text.substring(0, 500),
        score: score,
        timestamp: Date.now(),
        emotion: analysis.dominantEmotion,
        backlash: analysis.backlashRisk
    });
    if (analysisHistory.length > 10) analysisHistory.pop();
    saveHistory();
}

// Gráfico de onda del pulso
function drawPulseWave(containerId, waveData, pulseScore) {
    let canvas = document.getElementById('pulseWaveCanvas');
    if (!canvas) {
        const outputArea = document.getElementById('analysisOutput');
        if (outputArea && !document.getElementById('pulseWaveCanvas')) {
            const waveDiv = document.createElement('div');
            waveDiv.style.marginTop = '20px';
            waveDiv.style.marginBottom = '16px';
            waveDiv.innerHTML = '<canvas id="pulseWaveCanvas" width="400" height="80" style="width:100%; height:80px; background: var(--code-bg); border-radius: 12px;"></canvas>';
            outputArea.parentNode.insertBefore(waveDiv, outputArea.nextSibling);
            canvas = document.getElementById('pulseWaveCanvas');
        }
    }
    
    if (canvas && waveData) {
        const ctx = canvas.getContext('2d');
        const w = canvas.parentElement.clientWidth - 20;
        const h = 70;
        canvas.width = w;
        canvas.height = h;
        
        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        const step = w / waveData.length;
        
        // Color según intensidad
        let waveColor = '#00ff66';
        if (pulseScore > 70) waveColor = '#00e5ff';
        if (pulseScore > 85) waveColor = '#ff3366';
        
        ctx.strokeStyle = waveColor;
        ctx.lineWidth = 2;
        ctx.shadowBlur = 8;
        ctx.shadowColor = waveColor;
        
        for (let i = 0; i < waveData.length; i++) {
            const x = i * step;
            const y = h - (waveData[i] * h);
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Relleno degradado
        ctx.lineTo(w, h);
        ctx.lineTo(0, h);
        ctx.closePath();
        const gradient = ctx.createLinearGradient(0, 0, 0, h);
        gradient.addColorStop(0, waveColor + '40');
        gradient.addColorStop(1, waveColor + '00');
        ctx.fillStyle = gradient;
        ctx.fill();
    }
}

// Badges de tono
function addToneBadges(analysis, containerId) {
    let container = document.getElementById('toneBadges');
    if (!container) {
        const outputArea = document.getElementById('analysisOutput');
        if (outputArea && !document.getElementById('toneBadges')) {
            const badgeDiv = document.createElement('div');
            badgeDiv.id = 'toneBadges';
            badgeDiv.style.marginTop = '16px';
            badgeDiv.style.display = 'flex';
            badgeDiv.style.flexWrap = 'wrap';
            badgeDiv.style.gap = '8px';
            outputArea.parentNode.insertBefore(badgeDiv, outputArea.nextSibling);
            container = badgeDiv;
        }
    }
    
    if (container && analysis) {
        let badges = [];
        if (analysis.pulseScore > 70) badges.push({text: '⚡ ALTO PULSO', color: 'var(--pulse-high)'});
        else if (analysis.pulseScore < 25) badges.push({text: '🌙 BAJO PULSO', color: 'var(--text-muted)'});
        
        const emotionMap = {
            ira: '🔥 AGRESIVO', alegria: '💛 OPTIMISTA', tristeza: '💧 MELANCÓLICO',
            miedo: '😨 TEMEROSO', amor: '💖 AFECTUOSO', entusiasmo: '🚀 ENERGÉTICO',
            calma: '🍃 SERENO', frustracion: '⚠️ FRUSTRADO', ansiedad: '😰 ANSIOSO'
        };
        if (emotionMap[analysis.dominantEmotion]) {
            badges.push({text: emotionMap[analysis.dominantEmotion], color: 'var(--accent-glow-2)'});
        }
        
        if (analysis.backlashRisk === 'alto') badges.push({text: '⚠️ RIESGO ALTO', color: 'var(--pulse-high)'});
        if (analysis.viralityPrediction > 70) badges.push({text: '📈 POTENCIAL VIRAL', color: 'var(--accent-success)'});
        
        container.innerHTML = badges.map(b => `<span class="emotion-badge" style="background: ${b.color}20; border:1px solid ${b.color}40; color: ${b.color};">${b.text}</span>`).join('');
    }
}

// Exportar análisis
function exportAnalysis(text, analysis) {
    const content = `AXIOM VOID PULSE - ANÁLISIS
================================
Fecha: ${new Date().toLocaleString()}
Texto original: ${text.substring(0, 200)}${text.length > 200 ? '...' : ''}
--------------------------------
PULSE SCORE: ${analysis.pulseScore}/100
EMOCIÓN DOMINANTE: ${analysis.dominantEmotion}
RIESGO BACKLASH: ${analysis.backlashRisk}
PREDICCIÓN VIRAL: ${analysis.viralityPrediction}%
INTENSIDAD: ${analysis.intensity}%
COHERENCIA: ${analysis.coherenceScore}%
--------------------------------
ACCIÓN RECOMENDADA: ${analysis.recommendedAction}
--------------------------------
AXIOM SYSTEMS - Análisis 100% local`;
    
    const blob = new Blob([content], {type: 'text/plain'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `void-pulse-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
}

// Modal comparador
function showComparator() {
    let modal = document.getElementById('comparatorModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'comparatorModal';
        modal.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.8); backdrop-filter: blur(8px);
            display: flex; align-items: center; justify-content: center;
            z-index: 1000;
        `;
        modal.innerHTML = `
            <div style="background: var(--surface-color); border-radius: 32px; max-width: 900px; width: 90%; max-height: 80vh; overflow: auto; padding: 28px; border: 1px solid var(--border-color);">
                <h2 style="margin-bottom: 20px;">📊 Comparador de textos</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <textarea id="compareText1" placeholder="Texto A" style="background: var(--code-bg); border-radius: 12px; padding: 12px; min-height: 150px;"></textarea>
                    <textarea id="compareText2" placeholder="Texto B" style="background: var(--code-bg); border-radius: 12px; padding: 12px; min-height: 150px;"></textarea>
                </div>
                <button id="doCompareBtn" style="margin: 20px auto; display: block; background: linear-gradient(135deg, var(--accent-glow-1), var(--accent-glow-2)); border: none; padding: 12px 24px; border-radius: 40px; color: #000;">COMPARAR</button>
                <div id="compareResult" style="margin-top: 20px;"></div>
                <button id="closeModalBtn" style="margin-top: 16px; background: var(--code-bg); width: 100%;">Cerrar</button>
            </div>
        `;
        document.body.appendChild(modal);
        
        document.getElementById('closeModalBtn').onclick = () => modal.style.display = 'none';
        document.getElementById('doCompareBtn').onclick = () => {
            const text1 = document.getElementById('compareText1').value;
            const text2 = document.getElementById('compareText2').value;
            const res1 = analyzeVoidPulse(text1);
            const res2 = analyzeVoidPulse(text2);
            const resultDiv = document.getElementById('compareResult');
            resultDiv.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
                    <div style="background: var(--code-bg); border-radius: 16px; padding: 16px;">
                        <div style="font-size: 36px; font-weight: bold; color: ${res1.pulseScore > res2.pulseScore ? 'var(--accent-success)' : 'var(--text-muted)'}">${res1.pulseScore}</div>
                        <div>Pulse</div>
                        <div>${res1.dominantEmotion}</div>
                    </div>
                    <div style="background: var(--code-bg); border-radius: 16px; padding: 16px;">
                        <div style="font-size: 36px; font-weight: bold; color: ${res2.pulseScore > res1.pulseScore ? 'var(--accent-success)' : 'var(--text-muted)'}">${res2.pulseScore}</div>
                        <div>Pulse</div>
                        <div>${res2.dominantEmotion}</div>
                    </div>
                </div>
            `;
        };
    }
    modal.style.display = 'flex';
}

// Inicializar UI mejorada
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    
    // Botón exportar
    const copyBtn = document.getElementById('copyResultBtn');
    if (copyBtn) {
        const exportBtn = document.createElement('button');
        exportBtn.innerHTML = '📄 Exportar';
        exportBtn.style.background = 'var(--code-bg)';
        exportBtn.onclick = () => {
            const text = document.getElementById('textInput').value;
            if (currentAnalysis && text) exportAnalysis(text, currentAnalysis);
            else alert('Primero analiza un texto');
        };
        copyBtn.parentNode.appendChild(exportBtn);
    }
    
    // Botón comparador
    const enhanceBtn = document.getElementById('enhanceBtn');
    if (enhanceBtn) {
        const compareBtn = document.createElement('button');
        compareBtn.innerHTML = '🔍 Comparar';
        compareBtn.style.background = 'var(--code-bg)';
        compareBtn.onclick = showComparator;
        enhanceBtn.parentNode.appendChild(compareBtn);
    }
    
    // Hookear el análisis existente
    const originalAnalyze = window.analyzeAndDisplay || null;
    const analyzeBtn = document.getElementById('analyzeBtn');
    if (analyzeBtn) {
        analyzeBtn.addEventListener('click', () => {
            const textInput = document.getElementById('textInput');
            const text = textInput?.value || '';
            if (text.trim()) {
                const analysis = analyzeVoidPulse(text);
                currentAnalysis = analysis;
                addToHistory(text, analysis.pulseScore, analysis);
                drawPulseWave('pulseWaveCanvas', analysis.emotionalWave, analysis.pulseScore);
                addToneBadges(analysis, 'toneBadges');
                
                // Actualizar stats existentes
                document.getElementById('pulseScore').innerHTML = analysis.pulseScore;
                document.getElementById('emotion').innerHTML = analysis.dominantEmotion;
                document.getElementById('backlashRisk').innerHTML = analysis.backlashRisk;
                document.getElementById('viralityPrediction').innerHTML = analysis.viralityPrediction + '%';
                
                // Actualizar output
                const output = document.getElementById('analysisOutput');
                if (output) {
                    output.innerHTML = `
                        <strong>📊 Análisis completado</strong><br>
                        Score: ${analysis.pulseScore}/100 - ${analysis.dominantEmotion.toUpperCase()}<br>
                        Intensidad: ${analysis.intensity}% | Coherencia: ${analysis.coherenceScore}%<br>
                        Palabras gatillo: ${analysis.triggerWords.join(', ') || 'ninguna'}<br>
                        <span style="color: var(--accent-glow-1);">💡 ${analysis.recommendedAction}</span>
                    `;
                }
            }
        });
    }
});