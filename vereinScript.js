const vertraege = [
    { name: "GriebelBau", betrag: 800, laufzeit: "24.01.2026" },
    { name: "Anwalt Walter", betrag: 1200, laufzeit: "13.09.2026" },
    { name: "Netto GMBH", betrag: 1400, laufzeit: "21.08.2027" }
];

function erstelleVertragsKarte(vertrag) {
    return `
        <div class="card">
            <h3 class="company-name">${vertrag.name}</h3>
            <div class="card-details">
                <div class="detail-group">
                    <span class="label">Betrag:</span>
                    <span class="value">${vertrag.betrag} Euro</span>
                </div>
                <div class="detail-group align-right">
                    <span class="label">Laufzeit:</span>
                    <span class="value">${vertrag.laufzeit}</span>
                </div>
            </div>
        </div>
    `;
}

document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('#app-container');

    vertraege.forEach(vertrag => {
        container.innerHTML += erstelleVertragsKarte(vertrag);
    });
});