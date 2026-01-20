const vertraege = [
    { id: 1, name: "GriebelBau", betrag: 800, laufzeit: "24.01.2026", status: "aktiv", kategorie: "Bau" },
    { id: 2, name: "Anwalt Walter", betrag: 1200, laufzeit: "13.09.2026", status: "aktiv", kategorie: "Beratung" },
    { id: 3, name: "Netto GMBH", betrag: 1600, laufzeit: "21.08.2027", status: "aktiv", kategorie: "Einzelhandel" },
    { id: 4, name: "Agentur Marketing Plus", betrag: 500, laufzeit: "15.06.2026", status: "aktiv", kategorie: "Marketing" },
    { id: 5, name: "IT-Support Solutions", betrag: 950, laufzeit: "30.03.2026", status: "aktiv", kategorie: "IT" }
];

let selectedVertrag = null;
let currentSort = 'laufzeit';
let sortOrder = { laufzeit: 'asc', betrag: 'asc' };

// --- HILFSFUNKTIONEN ---

// Hilfsfunktion: Konvertiert "DD.MM.YYYY" in ein Date-Objekt
function parseDate(dateString) {
    const [day, month, year] = dateString.split('.');
    return new Date(year, month - 1, day);
}

// Berechne Tage bis Ablaufdatum
function tageRest(laufzeitString) {
    const target = parseDate(laufzeitString);
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

// --- KERNFUNKTIONEN ---

// Aktualisiere Stats
function updateStats() {
    const active = vertraege.filter(v => v.status === 'aktiv').length;
    const total = vertraege.reduce((sum, v) => sum + v.betrag, 0);
    
    // FEHLER BEHOBEN: Wir nutzen eine Kopie [...] und greifen per Index zu statt .pop()
    const sortedByDate = [...vertraege].sort((a, b) => parseDate(a.laufzeit) - parseDate(b.laufzeit));
    const nextRenewal = sortedByDate[0];
    
    document.getElementById('active-count').textContent = active;
    document.getElementById('total-volume').textContent = total.toLocaleString('de-DE') + ' €';
    document.getElementById('next-renewal').textContent = nextRenewal ? nextRenewal.laufzeit : '-';
}

// Sortiere Verträge
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

// Render alle Verträge
function renderVertraege(contractList = vertraege) {
    const container = document.querySelector('.category-section');
    if (!container) return;

    container.innerHTML = '';

    contractList.forEach(vertrag => {
        container.innerHTML += erstelleModerneKarte(vertrag);
    });
    
    // Event Listener für Karten hinzufügen
    document.querySelectorAll('.contract-card').forEach(card => {
        card.addEventListener('click', function() {
            openModal(parseInt(this.dataset.id));
        });
    });
    
    // Stats aktualisieren (nachdem gerendert wurde)
    updateStats();
}

function updateSortButtons() {
    const buttons = {
        laufzeit: document.getElementById('sortLaufzeit'),
        betrag: document.getElementById('sortBetrag')
    };
    
    Object.keys(buttons).forEach(key => {
        const btn = buttons[key];
        const isActive = currentSort === key;
        
        btn.classList.toggle('bg-blue-600', isActive);
        btn.classList.toggle('text-white', isActive);
        btn.classList.toggle('bg-gray-200', !isActive);
        btn.classList.toggle('text-gray-700', !isActive);
    });
}

function erstelleModerneKarte(vertrag) {
    const tage = tageRest(vertrag.laufzeit);
    const daysColor = tage < 30 ? 'text-red-600' : tage < 90 ? 'text-orange-600' : 'text-green-600';
    
    return `
        <div class="contract-card cursor-pointer bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 hover:-translate-y-1" data-id="${vertrag.id}">
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

// --- MODAL & EVENTS ---

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
    selectedVertrag = null;
}

document.addEventListener('DOMContentLoaded', function() {
    // Modal-Close Event
    const modal = document.getElementById('detailModal');
    if(modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === this) closeModal();
        });
    }
    
    // Stats Toggle
    const statsToggle = document.getElementById('statsToggle');
    const statsContent = document.getElementById('statsContent');
    const statsIcon = document.getElementById('statsIcon');
    let statsOpen = true;
    
    if(statsToggle) {
        statsToggle.addEventListener('click', function() {
            statsOpen = !statsOpen;
            statsContent.classList.toggle('hidden', !statsOpen);
            statsIcon.style.transform = statsOpen ? 'rotate(0deg)' : 'rotate(180deg)';
        });
    }
    
    // Sorting Buttons Events
    document.getElementById('sortLaufzeit').addEventListener('click', () => sortVertraege('laufzeit'));
    document.getElementById('sortBetrag').addEventListener('click', () => sortVertraege('betrag'));
    
    // Initialer Aufruf
    sortVertraege('laufzeit');
});