// AXIOM QR FACTORY - UI v1.0
let qrGeneratedCount = 0;
let currentQRDataURL = null;
let currentText = "";

function generateQR() {
    const text = document.getElementById('qrText').value.trim();
    const qrColor = document.getElementById('qrColor').value;
    const bgColor = document.getElementById('bgColor').value;
    const size = parseInt(document.getElementById('qrSize').value);

    if (!text) {
        alert("Introduce un enlace o texto");
        return;
    }

    currentText = text;
    const container = document.getElementById('qrcode');
    container.innerHTML = "";

    const canvas = document.createElement('canvas');
    new QRCode(canvas, {
        text: text,
        width: size,
        height: size,
        colorDark: qrColor,
        colorLight: bgColor,
        correctLevel: QRCode.CorrectLevel.H
    });

    setTimeout(() => {
        currentQRDataURL = canvas.toDataURL('image/png');
        const img = document.createElement('img');
        img.src = currentQRDataURL;
        img.style.width = `${size}px`;
        img.style.height = `${size}px`;
        container.innerHTML = "";
        container.appendChild(img);

        qrGeneratedCount++;
        document.getElementById('qrCount').innerText = qrGeneratedCount;
    }, 50);
}

function downloadPNG() {
    if (!currentQRDataURL) {
        alert("Genera un QR primero");
        return;
    }
    const link = document.createElement('a');
    link.download = `axiom-qr-${Date.now()}.png`;
    link.href = currentQRDataURL;
    link.click();
}

function downloadSVG() {
    const text = document.getElementById('qrText').value.trim();
    const qrColor = document.getElementById('qrColor').value;
    const bgColor = document.getElementById('bgColor').value;
    const size = parseInt(document.getElementById('qrSize').value);

    if (!text) {
        alert("Genera un QR primero");
        return;
    }

    const qr = new QRCode(-1, QRCode.CorrectLevel.H);
    qr.addData(text);
    qr.make();

    const modules = qr.getModuleCount();
    const cellSize = size / modules;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">`;
    svg += `<rect width="${size}" height="${size}" fill="${bgColor}"/>`;

    for (let row = 0; row < modules; row++) {
        for (let col = 0; col < modules; col++) {
            if (qr.isDark(row, col)) {
                svg += `<rect x="${col * cellSize}" y="${row * cellSize}" width="${cellSize}" height="${cellSize}" fill="${qrColor}"/>`;
            }
        }
    }
    svg += `</svg>`;

    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.download = `axiom-qr-${Date.now()}.svg`;
    link.href = url;
    link.click();
    URL.revokeObjectURL(url);
}

function copyLink() {
    const text = document.getElementById('qrText').value.trim();
    if (!text) {
        alert("Introduce un enlace o texto");
        return;
    }
    navigator.clipboard.writeText(text);
    alert("Enlace copiado al portapapeles");
}

document.getElementById('generateBtn').addEventListener('click', generateQR);
document.getElementById('downloadPngBtn').addEventListener('click', downloadPNG);
document.getElementById('downloadSvgBtn').addEventListener('click', downloadSVG);
document.getElementById('copyLinkBtn').addEventListener('click', copyLink);

// Tema oscuro/claro
const themeToggle = document.getElementById('themeToggle');
const htmlTag = document.documentElement;
themeToggle.addEventListener('click', () => {
    const isDark = htmlTag.getAttribute('data-theme') === 'dark';
    htmlTag.setAttribute('data-theme', isDark ? 'light' : 'dark');
    themeToggle.innerText = isDark ? '☀️' : '🌙';
});

generateQR();
