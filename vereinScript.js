// ============================================
// Verträge Management - Bandenwerbung Manager
// ============================================

// --- DATEN ---
const vertraege = [
    { id: 1, name: "GriebelBau", betrag: 800, laufzeit: "24.01.2026", status: "aktiv", kategorie: "Bau" },
    { id: 2, name: "Anwalt Walter", betrag: 1200, laufzeit: "13.09.2026", status: "aktiv", kategorie: "Beratung" },
    { id: 3, name: "Netto GMBH", betrag: 1600, laufzeit: "21.08.2027", status: "aktiv", kategorie: "Einzelhandel" },
    { id: 4, name: "Agentur Marketing Plus", betrag: 500, laufzeit: "15.06.2026", status: "aktiv", kategorie: "Marketing" },
    { id: 5, name: "IT-Support Solutions", betrag: 950, laufzeit: "30.03.2026", status: "aktiv", kategorie: "IT" }
];

// --- STATE ---
let selectedVertrag = null;
let currentSort = 'laufzeit';
let sortOrder = { laufzeit: 'asc', betrag: 'asc' };

// --- HILFSFUNKTIONEN ---

/**
 * Konvertiert "DD.MM.YYYY" in ein Date-Objekt
 * @param {string} dateString - Datum im Format DD.MM.YYYY
 * @returns {Date} Date-Objekt
 */
function parseDate(dateString) {
    const [day, month, year] = dateString.split('.');
    return new Date(year, month - 1, day);
}

/**
 * Berechnet verbleibende Tage bis Ablaufdatum
 * @param {string} laufzeitString - Ablaufdatum als String
 * @returns {number} Anzahl der verbleibenden Tage
 */
function tageRest(laufzeitString) {
    const target = parseDate(laufzeitString);
    const today = new Date();
    return Math.ceil((target - today) / (1000 * 60 * 60 * 24));
}

/**
 * Bestimmt Farbklassen basierend auf Status
 * @param {string} status - Vertragsstatus
 * @returns {string} Tailwind CSS Klassen
 */
function getStatusColor(status) {
    const colors = {
        "aktiv": "bg-green-100 text-green-800",
        "auslaufend": "bg-orange-100 text-orange-800",
        "beendet": "bg-gray-100 text-gray-800"
    };
    return colors[status] || colors.aktiv;
}

// --- KERNFUNKTIONEN ---

/**
 * Aktualisiert die Statistik-Anzeige
 */
function updateStats() {
    const active = vertraege.filter(v => v.status === 'aktiv').length;
    const total = vertraege.reduce((sum, v) => sum + v.betrag, 0);
    
    // Sortiere nach Datum und hole das nächste Ablaufdatum
    const sortedByDate = [...vertraege].sort((a, b) => parseDate(a.laufzeit) - parseDate(b.laufzeit));
    const nextRenewal = sortedByDate[0];
    
    document.getElementById('active-count').textContent = active;
    document.getElementById('total-volume').textContent = total.toLocaleString('de-DE') + ' €';
    document.getElementById('next-renewal').textContent = nextRenewal ? nextRenewal.laufzeit : '-';
}

/**
 * Sortiert Verträge nach Typ und aktualisiert UI
 * @param {string} sortType - 'laufzeit' oder 'betrag'
 */
function sortVertraege(sortType) {
    currentSort = sortType;
    const sorted = [...vertraege];
    
    if (sortType === 'laufzeit') {
        sorted.sort((a, b) => {
            const dateA = parseDate(a.laufzeit);
            const dateB = parseDate(b.laufzeit);
            return sortOrder.laufzeit === 'asc' ? dateA - dateB : dateB - dateA;
        });
        sortOrder.laufzeit = sortOrder.laufzeit === 'asc' ? 'desc' : 'asc';
    } else if (sortType === 'betrag') {
        sorted.sort((a, b) => {
            return sortOrder.betrag === 'asc' ? a.betrag - b.betrag : b.betrag - a.betrag;
        });
        sortOrder.betrag = sortOrder.betrag === 'asc' ? 'desc' : 'asc';
    }
    
    updateSortButtons();
    renderVertraege(sorted);
}

/**
 * Rendert alle Verträge auf der Seite
 * @param {Array} contractList - Liste der anzuzeigenden Verträge
 */
function renderVertraege(contractList = vertraege) {
    const container = document.querySelector('.category-section');
    if (!container) return;

    container.innerHTML = contractList.map(vertrag => erstelleModerneKarte(vertrag)).join('');
    
    // Event Listener für Karten hinzufügen
    document.querySelectorAll('.contract-card').forEach(card => {
        card.addEventListener('click', function() {
            openModal(parseInt(this.dataset.id));
        });
    });
    
    updateStats();
}

/**
 * Aktualisiert den visuellen Zustand der Sortier-Buttons
 */
function updateSortButtons() {
    const buttons = {
        laufzeit: document.getElementById('sortLaufzeit'),
        betrag: document.getElementById('sortBetrag')
    };
    
    Object.keys(buttons).forEach(key => {
        const btn = buttons[key];
        const isActive = currentSort === key;
        
        btn.classList.toggle('btn-primary', isActive);
        btn.classList.toggle('btn-secondary', !isActive);
    });
}

/**
 * Erstellt HTML für eine Vertragskarte
 * @param {Object} vertrag - Vertragsobjekt
 * @returns {string} HTML-String
 */
function erstelleModerneKarte(vertrag) {
    const tage = tageRest(vertrag.laufzeit);
    const daysColor = tage < 30 ? 'text-red-600' : tage < 90 ? 'text-orange-600' : 'text-green-600';
    
    return `
        <div class="card card-clickable contract-card" data-id="${vertrag.id}">
            <div class="flex items-start justify-between mb-4">
                <div>
                    <h3 class="text-lg font-bold text-gray-900">${vertrag.name}</h3>
                    <p class="text-sm text-gray-500 mt-1">${vertrag.kategorie}</p>
                </div>
                <span class="${getStatusColor(vertrag.status)} px-3 py-1 rounded-full text-xs font-semibold">${vertrag.status}</span>
            </div>
            
            <div class="mb-4 pb-4 border-b border-gray-100">
                <p class="text-gray-600 text-xs font-medium tracking-wide mb-1">VERTRAGSBETRAG</p>
                <p class="text-2xl font-bold text-blue-600">${vertrag.betrag.toLocaleString('de-DE')} €</p>
            </div>
            
            <div class="space-y-3">
                <div>
                    <p class="text-gray-600 text-xs font-medium tracking-wide mb-1">LAUFZEITENDE</p>
                    <p class="text-sm font-semibold text-gray-900">${vertrag.laufzeit}</p>
                </div>
                <div>
                    <p class="text-gray-600 text-xs font-medium tracking-wide mb-1">TAGE VERBLEIBEND</p>
                    <p class="text-sm font-semibold ${daysColor}">${tage > 0 ? tage + ' Tage' : 'Abgelaufen'}</p>
                </div>
            </div>
            <p class="text-xs text-gray-400 mt-4 pt-4 border-t border-gray-100">Klicken für Details</p>
        </div>
    `;
}

// --- MODAL FUNKTIONEN ---

/**
 * Öffnet Modal mit Vertragsdetails
 * @param {number} id - Vertrags-ID
 */
function openModal(id) {
    selectedVertrag = vertraege.find(v => v.id === id);
    if (!selectedVertrag) return;
    
    const tage = tageRest(selectedVertrag.laufzeit);
    
    document.getElementById('modal-name').textContent = selectedVertrag.name;
    document.getElementById('modal-betrag').textContent = selectedVertrag.betrag.toLocaleString('de-DE') + ' €';
    document.getElementById('modal-laufzeit').textContent = selectedVertrag.laufzeit;
    document.getElementById('modal-status').textContent = `Kategorie: ${selectedVertrag.kategorie}`;
    document.getElementById('modal-status-badge').textContent = selectedVertrag.status;
    document.getElementById('modal-status-badge').className = `inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedVertrag.status)}`;
    
    const details = document.getElementById('modal-details');
    details.innerHTML = `
        <div>
            <p class="stat-label">Tage bis Ablauf</p>
            <p class="text-lg font-bold ${tage < 30 ? 'text-red-600' : tage < 90 ? 'text-orange-600' : 'text-green-600'} mt-1">
                ${tage > 0 ? tage + ' Tage' : 'Abgelaufen'}
            </p>
        </div>
    `;
    
    document.getElementById('detailModal').classList.remove('hidden');
}

/**
 * Schließt das Modal
 */
function closeModal() {
    document.getElementById('detailModal').classList.add('hidden');
    selectedVertrag = null;
}

// --- INITIALISIERUNG ---

document.addEventListener('DOMContentLoaded', function() {
    // Modal-Close Event (Klick außerhalb)
    const modal = document.getElementById('detailModal');
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }
    
    // Stats Toggle
    const statsToggle = document.getElementById('statsToggle');
    const statsContent = document.getElementById('statsContent');
    const statsIcon = document.getElementById('statsIcon');
    let statsOpen = true;
    
    if (statsToggle) {
        statsToggle.addEventListener('click', function() {
            statsOpen = !statsOpen;
            statsContent.classList.toggle('hidden', !statsOpen);
            if (statsIcon) {
                statsIcon.style.transform = statsOpen ? 'rotate(0deg)' : 'rotate(180deg)';
            }
        });
    }
    
    // Sorting Buttons Events
    const sortLaufzeitBtn = document.getElementById('sortLaufzeit');
    const sortBetragBtn = document.getElementById('sortBetrag');
    
    if (sortLaufzeitBtn) {
        sortLaufzeitBtn.addEventListener('click', () => sortVertraege('laufzeit'));
    }
    if (sortBetragBtn) {
        sortBetragBtn.addEventListener('click', () => sortVertraege('betrag'));
    }
    
    // Initialer Aufruf
    sortVertraege('laufzeit');
});