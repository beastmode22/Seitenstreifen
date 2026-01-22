const vertraege = [
    { id: 1, name: "GriebelBau", betrag: 800, laufzeit: "24.01.2026", status: "aktiv", kategorie: "Bau" },
    { id: 2, name: "Anwalt Walter", betrag: 1200, laufzeit: "13.09.2026", status: "aktiv", kategorie: "Beratung" },
    { id: 3, name: "Netto GMBH", betrag: 1600, laufzeit: "21.08.2027", status: "aktiv", kategorie: "Einzelhandel" },
    { id: 4, name: "Agentur Marketing Plus", betrag: 500, laufzeit: "15.06.2026", status: "aktiv", kategorie: "Marketing" },
    { id: 5, name: "IT-Support Solutions", betrag: 950, laufzeit: "30.03.2026", status: "aktiv", kategorie: "IT" }
];

let bandenPlaetze = [];
let bandenConfig = {
    nord: 10,
    ost: 15,
    sued: 10,
    west: 15
};
let seitenPreise = {
    nord: null,
    ost: null,
    sued: null,
    west: null
};
let currentView = 'stadium'; // 'grid' oder 'stadium'
let zoomedSide = null; // 'nord', 'ost', 'sued', 'west' oder null
let currentEditSeite = null;

// Initialisiere Bandenplätze basierend auf Config
function initBandenPlaetze() {
    bandenPlaetze = [];
    const positions = { nord: 0, ost: 0, sued: 0, west: 0 };
    
    Object.keys(bandenConfig).forEach(position => {
        for (let i = 1; i <= bandenConfig[position]; i++) {
            const id = position[0].toUpperCase() + i;
            bandenPlaetze.push({
                id: id,
                position: position,
                preis: null,
                vertragId: null
            });
        }
    });

    // Zuweisen der Verträge
    const assignments = [
        { id: 'N1', vertragId: 1 },
        { id: 'N3', vertragId: 4 },
        { id: 'S1', vertragId: 2 },
        { id: 'S2', vertragId: 3 }
    ];
    
    assignments.forEach(assignment => {
        const platz = bandenPlaetze.find(p => p.id === assignment.id);
        if (platz) platz.vertragId = assignment.vertragId;
    });
}

function renderBandenplan() {
    if (currentView === 'grid') {
        renderGridView();
    } else {
        renderStadiumView();
    }
}

function renderGridView() {
    // Grid-View anzeigen, Stadium-View verstecken
    const gridView = document.getElementById('grid-view');
    const stadiumContainer = document.getElementById('stadium-container');
    const legend = document.getElementById('legend-container');
    if (gridView) gridView.classList.remove('hidden');
    if (stadiumContainer) stadiumContainer.classList.add('hidden');
    if (legend) legend.classList.add('hidden');

    const containers = {
        nord: document.getElementById('banden-nord'),
        ost: document.getElementById('banden-ost'),
        sued: document.getElementById('banden-sued'),
        west: document.getElementById('banden-west')
    };

    // Container leeren
    Object.values(containers).forEach(c => {
        if (c) c.innerHTML = '';
    });

    bandenPlaetze.forEach(platz => {
        const isBelegt = platz.vertragId !== null;
        
        // Nur belegte Banden anzeigen
        if (!isBelegt) return;
        
        const vertrag = vertraege.find(v => v.id === platz.vertragId);
        const container = containers[platz.position];
        
        if (!container) return;

        const btn = document.createElement('button');
        btn.className = `
            group relative text-xs sm:text-sm font-bold rounded-lg transition-all transform hover:scale-105
            h-16 sm:h-20 flex flex-col items-center justify-center gap-1 px-2 sm:px-3
            bg-gradient-to-br from-blue-500 to-blue-700 hover:from-blue-600 hover:to-blue-800
            text-white shadow-md hover:shadow-lg border border-blue-400
            cursor-pointer overflow-hidden
        `;

        btn.innerHTML = `
            <span class="block text-center font-bold line-clamp-2 text-[11px] sm:text-xs">${vertrag.name}</span>
            <span class="text-[10px] opacity-90 font-medium">${vertrag.betrag}€</span>
        `;

        btn.title = vertrag.name;

        btn.onclick = () => {
            openModal(platz.vertragId);
        };

        container.appendChild(btn);
    });

    updateStats();
}

function renderStadiumView() {
    // Stadium-View anzeigen, Grid-View verstecken
    const gridView = document.getElementById('grid-view');
    const stadiumContainer = document.getElementById('stadium-container');
    const legend = document.getElementById('legend-container');
    if (gridView) gridView.classList.add('hidden');
    if (stadiumContainer) stadiumContainer.classList.remove('hidden');
    if (legend) legend.classList.remove('hidden');
    
    if (!stadiumContainer) return;
    
    stadiumContainer.innerHTML = '';
    
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 600 1000');
    svg.setAttribute('class', 'w-full h-auto');
    svg.style.maxWidth = '500px';
    svg.style.margin = '0 auto';
    svg.style.backgroundColor = '#f3f4f6';
    svg.style.borderRadius = '8px';

    // Spielfeld mit Gradient-Effekt (dunkelgrüner Hintergrund)
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    const gradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
    gradient.setAttribute('id', 'fieldGradient');
    gradient.setAttribute('x1', '0%');
    gradient.setAttribute('y1', '0%');
    gradient.setAttribute('x2', '0%');
    gradient.setAttribute('y2', '100%');
    
    const stop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop1.setAttribute('offset', '0%');
    stop1.setAttribute('stop-color', '#1f7a3f');
    
    const stop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
    stop2.setAttribute('offset', '100%');
    stop2.setAttribute('stop-color', '#15593a');
    
    gradient.appendChild(stop1);
    gradient.appendChild(stop2);
    defs.appendChild(gradient);
    svg.appendChild(defs);

    // Spielfeld mit Gradient
    const field = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    field.setAttribute('x', '75');
    field.setAttribute('y', '100');
    field.setAttribute('width', '450');
    field.setAttribute('height', '800');
    field.setAttribute('fill', 'url(#fieldGradient)');
    field.setAttribute('stroke', '#ffffff');
    field.setAttribute('stroke-width', '2');
    svg.appendChild(field);

    // Torlinie (oben und unten)
    const topGoalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    topGoalLine.setAttribute('x1', '75');
    topGoalLine.setAttribute('y1', '100');
    topGoalLine.setAttribute('x2', '525');
    topGoalLine.setAttribute('y2', '100');
    topGoalLine.setAttribute('stroke', '#ffffff');
    topGoalLine.setAttribute('stroke-width', '2');
    svg.appendChild(topGoalLine);

    const bottomGoalLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    bottomGoalLine.setAttribute('x1', '75');
    bottomGoalLine.setAttribute('y1', '900');
    bottomGoalLine.setAttribute('x2', '525');
    bottomGoalLine.setAttribute('y2', '900');
    bottomGoalLine.setAttribute('stroke', '#ffffff');
    bottomGoalLine.setAttribute('stroke-width', '2');
    svg.appendChild(bottomGoalLine);

    // Mittellinie
    const midline = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    midline.setAttribute('x1', '75');
    midline.setAttribute('y1', '500');
    midline.setAttribute('x2', '525');
    midline.setAttribute('y2', '500');
    midline.setAttribute('stroke', '#ffffff');
    midline.setAttribute('stroke-width', '2');
    svg.appendChild(midline);

    // Mittelpunkt (kleiner Kreis)
    const midpoint = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    midpoint.setAttribute('cx', '300');
    midpoint.setAttribute('cy', '500');
    midpoint.setAttribute('r', '8');
    midpoint.setAttribute('fill', '#ffffff');
    svg.appendChild(midpoint);

    // Mittelkreis
    const midcircle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    midcircle.setAttribute('cx', '300');
    midcircle.setAttribute('cy', '500');
    midcircle.setAttribute('r', '50');
    midcircle.setAttribute('fill', 'none');
    midcircle.setAttribute('stroke', '#ffffff');
    midcircle.setAttribute('stroke-width', '1.5');
    svg.appendChild(midcircle);

    // Pfeile für Zoom
    createNavigationArrow(svg, 300, 180, 'north', 'Nord');  // Nord
    createNavigationArrow(svg, 450, 500, 'east', 'Ost');    // Ost
    createNavigationArrow(svg, 300, 820, 'south', 'Süd');   // Süd
    createNavigationArrow(svg, 150, 500, 'west', 'West');   // West

    // Banden rendern
    const nord = bandenPlaetze.filter(p => p.position === 'nord');
    const sued = bandenPlaetze.filter(p => p.position === 'sued');
    const ost = bandenPlaetze.filter(p => p.position === 'ost');
    const west = bandenPlaetze.filter(p => p.position === 'west');

    const bandWidthNord = nord.length > 0 ? 450 / nord.length : 1;
    const bandHeightOst = ost.length > 0 ? 800 / ost.length : 1;

    // Nordseite (dicke Striche oben)
    nord.forEach((platz, idx) => {
        const x1 = 75 + idx * (bandWidthNord + 2);
        const x2 = x1 + bandWidthNord - 5;
        createBandLine(svg, x1, 55, x2, 55, platz);
    });

    // Südseite (dicke Striche unten)
    sued.forEach((platz, idx) => {
        const x1 = 75 + idx * (bandWidthNord + 2);
        const x2 = x1 + bandWidthNord - 5;
        createBandLine(svg, x1, 945, x2, 945, platz);
    });

    // Ostseite (dicke Striche rechts)
    ost.forEach((platz, idx) => {
        const y1 = 100 + idx * (bandHeightOst + 2);
        const y2 = y1 + bandHeightOst - 5;
        createBandLine(svg, 545, y1, 545, y2, platz);
    });

    // Westseite (dicke Striche links)
    west.forEach((platz, idx) => {
        const y1 = 100 + idx * (bandHeightOst + 2);
        const y2 = y1 + bandHeightOst - 5;
        createBandLine(svg, 45, y1, 45, y2, platz);
    });

    stadiumContainer.appendChild(svg);
    updateStats();
}

function createNavigationArrow(svg, x, y, direction, label) {
    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.style.cursor = 'pointer';

    // Hintergrund-Kreis
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', x);
    circle.setAttribute('cy', y);
    circle.setAttribute('r', '25');
    circle.setAttribute('fill', 'rgba(255, 255, 255, 0.9)');
    circle.setAttribute('stroke', '#ffffff');
    circle.setAttribute('stroke-width', '2');
    g.appendChild(circle);

    // Pfeil-Polygon
    let points = '';
    if (direction === 'north') {
        points = `${x},${y-12} ${x-8},${y+5} ${x+8},${y+5}`;
    } else if (direction === 'south') {
        points = `${x},${y+12} ${x-8},${y-5} ${x+8},${y-5}`;
    } else if (direction === 'east') {
        points = `${x+12},${y} ${x-5},${y-8} ${x-5},${y+8}`;
    } else if (direction === 'west') {
        points = `${x-12},${y} ${x+5},${y-8} ${x+5},${y+8}`;
    }

    const arrow = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    arrow.setAttribute('points', points);
    arrow.setAttribute('fill', '#1f7a3f');
    g.appendChild(arrow);

    g.onclick = (e) => {
        e.stopPropagation();
        zoomToSide(direction);
    };

    g.addEventListener('mouseover', () => {
        circle.setAttribute('fill', 'rgba(255, 255, 255, 1)');
        circle.setAttribute('stroke-width', '3');
    });

    g.addEventListener('mouseout', () => {
        circle.setAttribute('fill', 'rgba(255, 255, 255, 0.9)');
        circle.setAttribute('stroke-width', '2');
    });

    svg.appendChild(g);
}

function zoomToSide(direction) {
    const directionMap = {
        'north': 'nord',
        'south': 'sued',
        'east': 'ost',
        'west': 'west'
    };
    zoomedSide = directionMap[direction];
    renderStadiumZoom();
}

function renderStadiumZoom() {
    const stadiumContainer = document.getElementById('stadium-container');
    if (!stadiumContainer || !zoomedSide) return;

    stadiumContainer.innerHTML = '';

    // Wrapper Container mit Scroll
    const wrapper = document.createElement('div');
    wrapper.style.position = 'relative';
    wrapper.style.width = '100%';
    wrapper.style.backgroundColor = '#f3f4f6';
    wrapper.style.borderRadius = '8px';
    wrapper.style.paddingTop = '60px';

    // Zurück-Button (absolut positioniert)
    const backBtn = document.createElement('button');
    backBtn.innerHTML = '← Zurück';
    backBtn.style.position = 'absolute';
    backBtn.style.top = '10px';
    backBtn.style.left = '10px';
    backBtn.style.zIndex = '10';
    backBtn.style.padding = '8px 16px';
    backBtn.style.backgroundColor = '#ef4444';
    backBtn.style.color = 'white';
    backBtn.style.border = 'none';
    backBtn.style.borderRadius = '6px';
    backBtn.style.cursor = 'pointer';
    backBtn.style.fontWeight = 'bold';
    backBtn.style.fontSize = '14px';
    backBtn.onclick = () => {
        zoomedSide = null;
        renderStadiumView();
    };
    wrapper.appendChild(backBtn);

    // Titel (absolut positioniert)
    const title = document.createElement('h3');
    title.style.position = 'absolute';
    title.style.top = '15px';
    title.style.left = '50%';
    title.style.transform = 'translateX(-50%)';
    title.style.margin = '0';
    title.style.fontSize = '20px';
    title.style.fontWeight = 'bold';
    title.style.color = '#1f2937';
    const sideNames = {
        'nord': 'Nordseite',
        'sued': 'Südseite',
        'ost': 'Ostseite',
        'west': 'Westseite'
    };
    title.textContent = sideNames[zoomedSide] || 'Seite';
    wrapper.appendChild(title);

    // Scroll Container
    const scrollContainer = document.createElement('div');
    scrollContainer.style.width = '100%';
    scrollContainer.style.overflowX = 'auto';
    scrollContainer.style.overflowY = 'hidden';
    scrollContainer.style.padding = '20px';
    scrollContainer.style.boxSizing = 'border-box';
    scrollContainer.style.maxHeight = '160px';

    // SVG Canvas
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    
    const sideBanden = bandenPlaetze.filter(p => p.position === zoomedSide);
    const bandWidth = 100; // Feste Breite pro Bande
    const totalWidth = sideBanden.length * bandWidth;
    const viewBoxWidth = totalWidth + 40;
    
    svg.setAttribute('viewBox', `0 0 ${viewBoxWidth} 120`);
    svg.style.width = viewBoxWidth + 'px';
    svg.style.height = '120px';

    // Hintergrund
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', viewBoxWidth);
    bg.setAttribute('height', '120');
    bg.setAttribute('fill', '#ffffff');
    bg.setAttribute('rx', '4');
    svg.appendChild(bg);

    // Banden rendern (alle horizontal nebeneinander)
    sideBanden.forEach((platz, idx) => {
        const x = 20 + idx * bandWidth;
        const rect = createBandRect(x, 10, bandWidth - 5, 90, platz);
        svg.appendChild(rect);
    });

    scrollContainer.appendChild(svg);
    wrapper.appendChild(scrollContainer);

    stadiumContainer.appendChild(wrapper);
}

function createBandLine(svg, x1, y1, x2, y2, platz) {
    const isBelegt = platz.vertragId !== null;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', isBelegt ? '#ef4444' : '#60a5fa');
    line.setAttribute('stroke-width', '8');
    line.setAttribute('stroke-linecap', 'round');
    
    svg.appendChild(line);
}

function createBandRect(x, y, width, height, platz, isClickable = true) {
    const isBelegt = platz.vertragId !== null;
    const vertrag = isBelegt ? vertraege.find(v => v.id === platz.vertragId) : null;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    if (isClickable) {
        g.style.cursor = 'pointer';
    }

    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', x);
    rect.setAttribute('y', y);
    rect.setAttribute('width', width);
    rect.setAttribute('height', height);
    rect.setAttribute('fill', isBelegt ? '#ef4444' : '#60a5fa');
    rect.setAttribute('stroke', isBelegt ? '#dc2626' : '#3b82f6');
    rect.setAttribute('stroke-width', '2');
    rect.setAttribute('rx', '2');

    g.appendChild(rect);

    if (isClickable) {
        g.onclick = (e) => {
            e.stopPropagation();
            if (isBelegt) {
                openModal(platz.vertragId);
            } else {
                openPriceModal(platz);
            }
        };
    }

    return g;
}

function updateStats() {
    const stats = {};
    ['nord', 'ost', 'sued', 'west'].forEach(pos => {
        stats[pos] = bandenPlaetze.filter(p => p.position === pos).length;
    });
    
    const belegt = bandenPlaetze.filter(p => p.vertragId !== null).length;
    const frei = bandenPlaetze.filter(p => p.vertragId === null).length;

    document.getElementById('stats-nord').textContent = stats.nord;
    document.getElementById('stats-ost').textContent = stats.ost;
    document.getElementById('stats-sued').textContent = stats.sued;
    document.getElementById('stats-west').textContent = stats.west;
    document.getElementById('stats-frei').textContent = frei;
}

function showBookingInfo(platz) {
    alert(`Platz ${platz.id} ist verfügbar!\nJetzt unverbindlich anfragen?`);
}

// Komponente: Input-Felder für Anzahl Plätze und Preis
function createSeiteInputComponent(label, icon, positionKey) {
    return `
        <div>
            <h4 class="text-sm font-semibold text-gray-700 mb-3">${icon} ${label}</h4>
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-2">Anzahl Plätze</label>
                    <input type="number" id="input-${positionKey}" min="0" max="20" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-600 mb-2">Preis pro Saison (€)</label>
                    <input type="number" id="price-${positionKey}" min="0" step="50" placeholder="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm">
                </div>
            </div>
        </div>
    `;
}

// Setup Modal Funktionen
function openSetupModal() {
    const modalContent = document.getElementById('setupModalContent');
    const seiten = [
        { label: 'Nordseite', icon: '↑', key: 'nord' },
        { label: 'Ostseite', icon: '→', key: 'ost' },
        { label: 'Südseite', icon: '↓', key: 'sued' },
        { label: 'Westseite', icon: '←', key: 'west' }
    ];
    
    // Generiere die Komponenten
    modalContent.innerHTML = seiten.map(seite => 
        createSeiteInputComponent(seite.label, seite.icon, seite.key)
    ).join('');
    
    // Fülle die Werte
    seiten.forEach(seite => {
        document.getElementById(`input-${seite.key}`).value = bandenConfig[seite.key];
        document.getElementById(`price-${seite.key}`).value = seitenPreise[seite.key] || '';
    });
    
    document.getElementById('setupModal').classList.remove('hidden');
}

function closeSetupModal() {
    document.getElementById('setupModal').classList.add('hidden');
}

function saveSetup() {
    const seiten = ['nord', 'ost', 'sued', 'west'];
    
    seiten.forEach(seite => {
        bandenConfig[seite] = parseInt(document.getElementById(`input-${seite}`).value) || 0;
        seitenPreise[seite] = parseInt(document.getElementById(`price-${seite}`).value) || null;
    });
    
    initBandenPlaetze();
    renderBandenplan();
    closeSetupModal();
}

// Price Modal Funktionen (nicht mehr benötigt, da Preise im Setup gesetzt werden)
function openPriceModal(seite) {
    // Diese Funktion wird nicht mehr aufgerufen
}

function closePriceModal() {
    document.getElementById('priceModal').classList.add('hidden');
    currentEditSeite = null;
}

function savePrice() {
    // Diese Funktion wird nicht mehr benötigt
}

// Berechne Tage bis Ablaufdatum
function tageRest(laufzeitString) {
    const [day, month, year] = laufzeitString.split('.');
    const target = new Date(year, month - 1, day);
    const today = new Date();
    const diff = Math.ceil((target - today) / (1000 * 60 * 60 * 24));
    return diff;
}

// Bestimme Status-Farben
function getStatusColor(status) {
    const colors = {
        "aktiv": "bg-green-100 text-green-800",
        "auslaufend": "bg-orange-100 text-orange-800",
        "beendet": "bg-gray-100 text-gray-800"
    };
    return colors[status] || colors.aktiv;
}

// Modal-Funktionen
function openModal(id) {
    const vertrag = vertraege.find(v => v.id === id);
    if (!vertrag) return;
    
    const tage = tageRest(vertrag.laufzeit);
    
    document.getElementById('modal-name').textContent = vertrag.name;
    document.getElementById('modal-betrag').textContent = vertrag.betrag.toLocaleString('de-DE') + ' €';
    document.getElementById('modal-laufzeit').textContent = vertrag.laufzeit;
    document.getElementById('modal-status').textContent = `Kategorie: ${vertrag.kategorie}`;
    document.getElementById('modal-status-badge').textContent = vertrag.status;
    document.getElementById('modal-status-badge').className = `inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(vertrag.status)}`;
    
    const details = document.getElementById('modal-details');
    details.innerHTML = `
        <div>
            <p class="text-gray-600 text-sm font-medium">Tage bis Ablauf</p>
            <p class="text-lg font-bold ${tage < 30 ? 'text-red-600' : tage < 90 ? 'text-orange-600' : 'text-green-600'} mt-1">
                ${tage > 0 ? tage + ' Tage' : 'Abgelaufen'}
            </p>
        </div>
    `;
    
    document.getElementById('detailModal').classList.remove('hidden');
}

function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

// In dein DOMContentLoaded einfügen:
document.addEventListener('DOMContentLoaded', function() {
    initBandenPlaetze();
    renderBandenplan();
    
    // View Toggle
    const viewToggle = document.getElementById('viewToggle');
    if (viewToggle) {
        viewToggle.addEventListener('click', function() {
            currentView = currentView === 'grid' ? 'stadium' : 'grid';
            viewToggle.textContent = currentView === 'grid' ? '🏟️ Stadionansicht' : '📋 Grid-Ansicht';
            renderBandenplan();
        });
    }

    // Stats Toggle
    const statsToggle = document.getElementById('statsToggle');
    const statsContainer = document.getElementById('statsContainer');
    const statsIcon = document.getElementById('statsIcon');
    if (statsToggle && statsContainer) {
        statsToggle.addEventListener('click', function() {
            statsContainer.classList.toggle('hidden');
            statsIcon.style.transform = statsContainer.classList.contains('hidden') ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    }
    
    // Setup Button
    document.getElementById('setupBtn').addEventListener('click', openSetupModal);
    
    // Close modals bei Außenklick
    document.getElementById('setupModal').addEventListener('click', function(e) {
        if (e.target === this) closeSetupModal();
    });
    
    document.getElementById('priceModal').addEventListener('click', function(e) {
        if (e.target === this) closePriceModal();
    });
    
    document.getElementById('detailModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
});