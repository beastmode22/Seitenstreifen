// Globale Variablen
let uploadedLogo = null;
let selectedDesign = null;

// Logo Upload Handler
function handleLogoUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        uploadedLogo = e.target.result;
        displayLogoPreview();
        
        // Extrahiere dominante Farben aus dem Logo
        extractColorsFromLogo(e.target.result);
        
        updateDesigns();
    };
    reader.readAsDataURL(file);
}

// Logo Preview anzeigen
function displayLogoPreview() {
    const preview = document.getElementById('logoPreview');
    if (uploadedLogo) {
        preview.innerHTML = `<img src="${uploadedLogo}" alt="Logo">`;
    }
}

// Logo löschen
function clearLogo() {
    uploadedLogo = null;
    document.getElementById('logoInput').value = '';
    document.getElementById('logoPreview').innerHTML = '<span class="text-gray-400 text-sm text-center px-2">Klicken zum Hochladen</span>';
    updateDesigns();
}

// Farben aktualisieren
function updateColorValues() {
    const primaryColor = document.getElementById('primaryColor').value;
    const accentColor = document.getElementById('accentColor').value;
    const secondaryColor = document.getElementById('secondaryColor').value;

    document.getElementById('primaryColorValue').textContent = primaryColor.toUpperCase();
    document.getElementById('accentColorValue').textContent = accentColor.toUpperCase();
    document.getElementById('secondaryColorValue').textContent = secondaryColor.toUpperCase();

    // Setze individuelle Textfarben-Inputs auf Akzentfarbe, wenn sie noch nicht verändert wurden
    const companyNameColor = document.getElementById('companyNameColor');
    const secondaryTextColor = document.getElementById('secondaryTextColor');
    const contactTextColor = document.getElementById('contactTextColor');
    if (companyNameColor && (!companyNameColor.dataset.userChanged || companyNameColor.value === '')) {
        companyNameColor.value = accentColor;
    }
    if (secondaryTextColor && (!secondaryTextColor.dataset.userChanged || secondaryTextColor.value === '')) {
        secondaryTextColor.value = accentColor;
    }
    if (contactTextColor && (!contactTextColor.dataset.userChanged || contactTextColor.value === '')) {
        contactTextColor.value = accentColor;
    }
}

// Designs aktualisieren
function updateDesigns() {
    updateColorValues();
    renderDesigns();
    // Wenn bereits ein Design ausgewählt ist, auch die große Vorschau aktualisieren
    if (selectedDesign) showSelectedDesignPreview();
}

// Design Vorschläge rendern
function renderDesigns() {
    const container = document.getElementById('designContainer');
    const designs = generateDesigns();
    
    container.innerHTML = designs.map((design, index) => `
        <div class="design-card ${design.id === selectedDesign ? 'selected' : ''}" onclick="selectDesign('${design.id}')">
            <div class="p-4">
                <h3 class="text-lg font-bold text-gray-900 mb-3">${design.name}</h3>
                <div style="height: 120px; display: flex; align-items: stretch; overflow: hidden; border-radius: 8px; border: 1.5px solid #000; box-sizing: border-box;">
                    ${renderDesignLayout(design)}
                </div>
                <p class="text-xs text-gray-500 mt-3">${design.description}</p>
            </div>
        </div>
    `).join('');
}

// Design-Layouts rendern
function renderDesignLayout(design) {
    const companyName = document.getElementById('companyName') ? document.getElementById('companyName').value || 'Firma' : 'Firma';
    const secondaryText = document.getElementById('secondaryText') ? document.getElementById('secondaryText').value : '';
    const secondaryColor = document.getElementById('secondaryColor') ? document.getElementById('secondaryColor').value : '';
    const contactText = document.getElementById('contactText') ? document.getElementById('contactText').value : '';
    const companyNameColor = document.getElementById('companyNameColor') ? document.getElementById('companyNameColor').value : design.textColor;
    const secondaryTextColor = document.getElementById('secondaryTextColor') ? document.getElementById('secondaryTextColor').value : design.textColor;
    const contactTextColor = document.getElementById('contactTextColor') ? document.getElementById('contactTextColor').value : design.textColor;
    const companyNameFont = document.getElementById('companyNameFont') ? document.getElementById('companyNameFont').value : 'inherit';
    const secondaryTextFont = document.getElementById('secondaryTextFont') ? document.getElementById('secondaryTextFont').value : 'inherit';
    const contactTextFont = document.getElementById('contactTextFont') ? document.getElementById('contactTextFont').value : 'inherit';

    switch(design.layout) {
        case 'logo-left':
            return `
                ${uploadedLogo ? `
                <div style="width: 33.33%; height: 100%; background-color: ${design.primaryColor}; display: flex; align-items: center; justify-content: center; padding: 10px;">
                    <img src="${uploadedLogo}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>` : `<div style="width: 33.33%; height: 100%; background-color: ${design.primaryColor};"></div>`}
                <div style="width: 66.67%; height: 100%; background-color: ${design.primaryColor}; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 20px; text-align: center; position: relative;">
                    <div style="font-size: 20px; font-weight: bold; color: ${companyNameColor}; font-family: ${companyNameFont};">${companyName}</div>
                    ${secondaryText ? `<div style=\"font-size: 12px; opacity: 0.9; margin-top: 2px; color: ${secondaryTextColor}; font-family: ${secondaryTextFont};\">${secondaryText}</div>` : ''}
                    ${contactText ? `<div style=\"position: absolute; left: 50%; transform: translateX(-50%); bottom: 6px; width: calc(100% - 20px); font-size: 10px; color: ${contactTextColor}; text-align: center; pointer-events: none; white-space: pre-line; font-family: ${contactTextFont};\">${contactText}</div>` : ''}
                </div>
            `;
        case 'logo-right':
            return `
                <div style="width: 66.67%; height: 100%; background-color: ${design.primaryColor}; display: flex; flex-direction: column; justify-content: center; align-items: center; padding: 0 20px; text-align: center; position: relative;">
                    <div style="font-size: 20px; font-weight: bold; color: ${companyNameColor}; font-family: ${companyNameFont};">${companyName}</div>
                    ${secondaryText ? `<div style=\"font-size: 12px; opacity: 0.9; margin-top: 2px; color: ${secondaryTextColor}; font-family: ${secondaryTextFont};\">${secondaryText}</div>` : ''}
                    ${contactText ? `<div style=\"position: absolute; left: 50%; transform: translateX(-50%); bottom: 6px; width: calc(100% - 20px); font-size: 10px; color: ${contactTextColor}; text-align: center; pointer-events: none; white-space: pre-line; font-family: ${contactTextFont};\">${contactText}</div>` : ''}
                </div>
                ${uploadedLogo ? `
                <div style="width: 33.33%; height: 100%; background-color: ${design.primaryColor}; display: flex; align-items: center; justify-content: center; padding: 10px;">
                    <img src="${uploadedLogo}" alt="Logo" style="max-width: 100%; max-height: 100%; object-fit: contain;">
                </div>` : `<div style="width: 33.33%; height: 100%; background-color: ${design.primaryColor};"></div>`}
            `;
        default:
            return '';
    }
}

// Design generieren - Vereinfacht auf 2 Varianten
function generateDesigns() {
    const primaryColor = document.getElementById('primaryColor').value;
    const accentColor = document.getElementById('accentColor').value;
    const secondaryColor = document.getElementById('secondaryColor').value;
    // textColor wird nicht mehr benötigt, aber für Fallback
    return [
        {
            id: 'design-1',
            name: 'Logo Links',
            description: 'Logo links (1/3), Textbox rechts (2/3)',
            layout: 'logo-left',
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
            textColor: accentColor
        },
        {
            id: 'design-2',
            name: 'Logo Rechts',
            description: 'Textbox links (2/3), Logo rechts (1/3)',
            layout: 'logo-right',
            primaryColor: primaryColor,
            secondaryColor: secondaryColor,
            textColor: accentColor
        }
    ];
}

// Design auswählen
function selectDesign(designId) {
    selectedDesign = designId;
    renderDesigns();
    showSelectedDesignPreview();
}

// Ausgewähltes Design in größerer Vorschau anzeigen
function showSelectedDesignPreview() {
    const preview = document.getElementById('selectedDesignPreview');
    
    if (!selectedDesign) {
        preview.innerHTML = '<p class="text-gray-500">Wählen Sie ein Design aus</p>';
        return;
    }
    
    const designs = generateDesigns();
    const design = designs.find(d => d.id === selectedDesign);
    
    if (!design) return;
    
    const companyName = document.getElementById('companyName').value || 'Ihre Firma';
    const secondaryText = document.getElementById('secondaryText').value;
    const contactText = document.getElementById('contactText') ? document.getElementById('contactText').value : '';
    const companyNameColor = document.getElementById('companyNameColor') ? document.getElementById('companyNameColor').value : design.textColor;
    const secondaryTextColor = document.getElementById('secondaryTextColor') ? document.getElementById('secondaryTextColor').value : design.textColor;
    const contactTextColor = document.getElementById('contactTextColor') ? document.getElementById('contactTextColor').value : design.textColor;
    const companyNameFont = document.getElementById('companyNameFont') ? document.getElementById('companyNameFont').value : 'inherit';
    const secondaryTextFont = document.getElementById('secondaryTextFont') ? document.getElementById('secondaryTextFont').value : 'inherit';
    const contactTextFont = document.getElementById('contactTextFont') ? document.getElementById('contactTextFont').value : 'inherit';
    // Große Vorschau
    let previewHtml = `
        <div style="width: 100%; max-width: 800px; position: relative;">
            <div class="band-preview" style="height: 120px; background: white; padding: 0; justify-content: flex-start; display: flex; border-radius: 8px; overflow: hidden; border: 1.5px solid #000; box-sizing: border-box; position: relative;">
                ${renderDesignLayout(design)}
            </div>
            <div class="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="font-bold text-gray-900 mb-2">${design.name}</h3>
                <p class="text-sm text-gray-600 mb-4">${design.description}</p>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-xs text-gray-500 uppercase font-bold mb-1">Textbox Farbe</p>
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded border border-gray-300" style="background-color: ${design.primaryColor}"></div>
                            <span class="text-sm font-mono">${design.primaryColor.toUpperCase()}</span>
                        </div>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 uppercase font-bold mb-1">Textfarben</p>
                        <div class="flex items-center gap-2">
                            <span class="text-xs">Firma:</span><div class="w-5 h-5 rounded border border-gray-300" style="background-color: ${companyNameColor}"></div>
                            <span class="text-xs">Sekundär:</span><div class="w-5 h-5 rounded border border-gray-300" style="background-color: ${secondaryTextColor}"></div>
                            <span class="text-xs">Kontakt:</span><div class="w-5 h-5 rounded border border-gray-300" style="background-color: ${contactTextColor}"></div>
                        </div>
                    </div>
                </div>
                <button class="mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    💾 Design speichern
                </button>
            </div>
        </div>
    `;
    preview.innerHTML = previewHtml;
}

// Markiere, wenn User eine Textfarbe ändert
function markUserChangedColorInput(id) {
    const el = document.getElementById(id);
    if (el) el.dataset.userChanged = 'true';
}

// Beim Laden initialisieren
document.addEventListener('DOMContentLoaded', function() {
    // Setze Eventlistener für die neuen Color-Inputs
    ['companyNameColor','secondaryTextColor','contactTextColor'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('input', () => markUserChangedColorInput(id));
    });
    updateDesigns();
});

// Extrahiere dominante Farben aus dem Logo
function extractColorsFromLogo(logoUrl) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    img.onload = function() {
        try {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const data = imageData.data;
            
            const colorMap = {};
            
            // Analysiere jeden 4. Pixel für Performance
            for (let i = 0; i < data.length; i += 16) {
                const r = data[i];
                const g = data[i + 1];
                const b = data[i + 2];
                const a = data[i + 3];
                
                // Ignoriere transparente Pixel und sehr helle Pixel
                if (a < 128 || (r > 240 && g > 240 && b > 240)) continue;
                
                const hex = rgbToHex(r, g, b);
                colorMap[hex] = (colorMap[hex] || 0) + 1;
            }
            
            // Sortiere nach Häufigkeit
            const sortedColors = Object.entries(colorMap)
                .sort((a, b) => b[1] - a[1])
                .map(entry => entry[0]);
            
            // Wende die top Farben an
            if (sortedColors.length > 0) {
                document.getElementById('primaryColor').value = sortedColors[0];
                document.getElementById('primaryColorValue').textContent = sortedColors[0].toUpperCase();
            }
            
            if (sortedColors.length > 1) {
                document.getElementById('secondaryColor').value = sortedColors[1];
                document.getElementById('secondaryColorValue').textContent = sortedColors[1].toUpperCase();
            }
            
            // Für Akzentfarbe: Wähle hellste oder kontrastreichste Farbe
            const brightestColor = sortedColors.find(color => {
                const rgb = hexToRgb(color);
                const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
                return brightness > 150;
            }) || '#ffffff';
            
            document.getElementById('accentColor').value = brightestColor;
            document.getElementById('accentColorValue').textContent = brightestColor.toUpperCase();
            
            updateDesigns();
        } catch (err) {
            console.log('Farberkennung konnte nicht durchgeführt werden:', err);
        }
    };
    
    img.src = logoUrl;
}

// Farb-Hilfsfunktionen
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}

function rgbToHex(r, g, b) {
    return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function adjustBrightness(color, percent) {
    const rgb = hexToRgb(color);
    const r = Math.min(255, Math.max(0, rgb.r + (rgb.r * percent / 100)));
    const g = Math.min(255, Math.max(0, rgb.g + (rgb.g * percent / 100)));
    const b = Math.min(255, Math.max(0, rgb.b + (rgb.b * percent / 100)));
    return rgbToHex(Math.floor(r), Math.floor(g), Math.floor(b));
}

function rotateHue(color, degrees) {
    const rgb = hexToRgb(color);
    // Vereinfachte Hue-Rotation
    let r = rgb.r / 255;
    let g = rgb.g / 255;
    let b = rgb.b / 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    
    if (max !== min) {
        const d = max - min;
        switch(max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }
    
    h = (h * 360 + degrees) % 360;
    const c = (max - min);
    const x = c * (1 - Math.abs((h / 60) % 2 - 1));
    let r_, g_, b_;
    
    if (h < 60) { r_ = c; g_ = x; b_ = 0; }
    else if (h < 120) { r_ = x; g_ = c; b_ = 0; }
    else if (h < 180) { r_ = 0; g_ = c; b_ = x; }
    else if (h < 240) { r_ = 0; g_ = x; b_ = c; }
    else if (h < 300) { r_ = x; g_ = 0; b_ = c; }
    else { r_ = c; g_ = 0; b_ = x; }
    
    const m = min - (c / 2);
    return rgbToHex(
        Math.round((r_ + m) * 255),
        Math.round((g_ + m) * 255),
        Math.round((b_ + m) * 255)
    );
}

