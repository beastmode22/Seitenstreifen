// ============================================
// Anfrage-System für Bandenwerbung
// ============================================

/**
 * Anfrage-Datenstruktur:
 * {
 *   id: number,
 *   verein: string,
 *   bandeId: string,
 *   position: string,
 *   kundenName: string,
 *   kundenEmail: string,
 *   kundenFirma: string,
 *   designId: number,
 *   designVorschau: string (Base64 oder URL),
 *   nachricht: string,
 *   preis: number,
 *   status: 'offen' | 'angenommen' | 'abgelehnt',
 *   erstelltAm: string (ISO Date),
 *   bearbeitetAm: string (ISO Date)
 * }
 */

// --- ANFRAGEN VERWALTUNG ---

/**
 * Lädt alle Anfragen aus LocalStorage
 * @returns {Array} Array aller Anfragen
 */
function ladeAnfragen() {
    const anfragenJson = localStorage.getItem('bandenAnfragen');
    return anfragenJson ? JSON.parse(anfragenJson) : [];
}

/**
 * Speichert Anfragen im LocalStorage
 * @param {Array} anfragen - Array der Anfragen
 */
function speichereAnfragen(anfragen) {
    localStorage.setItem('bandenAnfragen', JSON.stringify(anfragen));
}

/**
 * Erstellt eine neue Anfrage
 * @param {Object} anfrageData - Anfragedaten
 * @returns {Object} Die erstellte Anfrage mit ID
 */
function erstelleAnfrage(anfrageData) {
    const anfragen = ladeAnfragen();
    const neueId = anfragen.length > 0 ? Math.max(...anfragen.map(a => a.id)) + 1 : 1;
    
    const neueAnfrage = {
        id: neueId,
        verein: anfrageData.verein,
        bandeId: anfrageData.bandeId,
        position: anfrageData.position,
        kundenName: anfrageData.kundenName,
        kundenEmail: anfrageData.kundenEmail,
        kundenFirma: anfrageData.kundenFirma || '',
        designId: anfrageData.designId || null,
        designVorschau: anfrageData.designVorschau || '',
        nachricht: anfrageData.nachricht || '',
        preis: anfrageData.preis || 0,
        status: 'offen',
        erstelltAm: new Date().toISOString(),
        bearbeitetAm: null
    };
    
    anfragen.push(neueAnfrage);
    speichereAnfragen(anfragen);
    
    return neueAnfrage;
}

/**
 * Lädt Anfragen für einen bestimmten Verein
 * @param {string} vereinsName - Name des Vereins
 * @returns {Array} Gefilterte Anfragen
 */
function ladeVereinsAnfragen(vereinsName) {
    const alleAnfragen = ladeAnfragen();
    return alleAnfragen.filter(a => a.verein === vereinsName);
}

/**
 * Lädt offene Anfragen für einen Verein
 * @param {string} vereinsName - Name des Vereins
 * @returns {Array} Offene Anfragen
 */
function ladeOffeneAnfragen(vereinsName) {
    const vereinsAnfragen = ladeVereinsAnfragen(vereinsName);
    return vereinsAnfragen.filter(a => a.status === 'offen');
}

/**
 * Aktualisiert den Status einer Anfrage
 * @param {number} anfrageId - ID der Anfrage
 * @param {string} neuerStatus - Neuer Status ('angenommen' oder 'abgelehnt')
 * @returns {boolean} Erfolg der Operation
 */
function aktualisiereAnfrageStatus(anfrageId, neuerStatus) {
    const anfragen = ladeAnfragen();
    const anfrage = anfragen.find(a => a.id === anfrageId);
    
    if (!anfrage) return false;
    
    anfrage.status = neuerStatus;
    anfrage.bearbeitetAm = new Date().toISOString();
    
    speichereAnfragen(anfragen);
    return true;
}

/**
 * Löscht eine Anfrage
 * @param {number} anfrageId - ID der Anfrage
 * @returns {boolean} Erfolg der Operation
 */
function loescheAnfrage(anfrageId) {
    let anfragen = ladeAnfragen();
    const vorherAnzahl = anfragen.length;
    anfragen = anfragen.filter(a => a.id !== anfrageId);
    
    if (anfragen.length < vorherAnzahl) {
        speichereAnfragen(anfragen);
        return true;
    }
    return false;
}

/**
 * Holt eine einzelne Anfrage nach ID
 * @param {number} anfrageId - ID der Anfrage
 * @returns {Object|null} Anfrage oder null
 */
function holeAnfrage(anfrageId) {
    const anfragen = ladeAnfragen();
    return anfragen.find(a => a.id === anfrageId) || null;
}

/**
 * Zählt offene Anfragen für einen Verein
 * @param {string} vereinsName - Name des Vereins
 * @returns {number} Anzahl der offenen Anfragen
 */
function zaehleOffeneAnfragen(vereinsName) {
    return ladeOffeneAnfragen(vereinsName).length;
}

// --- DESIGN-VORLAGEN ---

/**
 * Vordefinierte Design-Vorlagen
 */
const designVorlagen = [
    {
        id: 1,
        name: 'Klassisch Blau',
        vorschau: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
        beschreibung: 'Professionelles blaues Design mit Farbverlauf'
    },
    {
        id: 2,
        name: 'Energetisch Rot',
        vorschau: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
        beschreibung: 'Auffälliges rotes Design für maximale Aufmerksamkeit'
    },
    {
        id: 3,
        name: 'Frisch Grün',
        vorschau: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
        beschreibung: 'Natürliches grünes Design'
    },
    {
        id: 4,
        name: 'Premium Gold',
        vorschau: 'linear-gradient(135deg, #d97706 0%, #f59e0b 100%)',
        beschreibung: 'Edles goldenes Design'
    },
    {
        id: 5,
        name: 'Modern Lila',
        vorschau: 'linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)',
        beschreibung: 'Modernes violettes Design'
    },
    {
        id: 6,
        name: 'Individuell',
        vorschau: 'linear-gradient(135deg, #6b7280 0%, #9ca3af 100%)',
        beschreibung: 'Eigenes Design hochladen'
    }
];

/**
 * Holt Design-Vorlage nach ID
 * @param {number} designId - ID der Design-Vorlage
 * @returns {Object|null} Design-Vorlage oder null
 */
function holeDesignVorlage(designId) {
    return designVorlagen.find(d => d.id === designId) || null;
}

/**
 * Gibt alle Design-Vorlagen zurück
 * @returns {Array} Alle Design-Vorlagen
 */
function alleDesignVorlagen() {
    return designVorlagen;
}
