const HIGHSCORE_KEY = "happy-stickman-highscores-v4";
const LEVEL_IDS = ["leicht", "mittel", "schwer"];

function standardDaten() {
    return { leicht: [], mittel: [], schwer: [] };
}

function ladeAlle() {
    try {
        const raw = localStorage.getItem(HIGHSCORE_KEY);
        const daten = raw ? JSON.parse(raw) : null;
        return Object.fromEntries(LEVEL_IDS.map(id => [id, Array.isArray(daten?.[id]) ? daten[id] : []]));
    } catch {
        return standardDaten();
    }
}

function speichereAlle(daten) {
    try {
        localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(daten));
    } catch {
    }
}

function normalisiere(eintrag) {
    return {
        name: String(eintrag?.name || "Spieler").replace(/\s+/g, " ").trim().slice(0, 12) || "Spieler",
        wert: Math.max(0, Number(eintrag?.wert) || 0),
        muenzen: Math.max(0, Math.floor(Number(eintrag?.muenzen) || 0)),
        zeit: Math.max(0, Number(eintrag?.zeit) || 0),
        datum: String(eintrag?.datum || new Date().toLocaleDateString("de-DE"))
    };
}

function sortiere(levelId, liste) {
    const normalisiert = liste.map(normalisiere);
    if (levelId === "schwer") {
        return normalisiert.sort((a, b) => b.muenzen - a.muenzen || a.zeit - b.zeit).slice(0, 10);
    }
    return normalisiert.sort((a, b) => a.zeit - b.zeit).slice(0, 10);
}

export function speichereHighscore(levelId, name, muenzen, zeit) {
    if (!LEVEL_IDS.includes(levelId)) return;
    const daten = ladeAlle();
    daten[levelId].push(normalisiere({
        name,
        muenzen,
        zeit,
        wert: levelId === "schwer" ? muenzen : zeit,
        datum: new Date().toLocaleDateString("de-DE")
    }));
    daten[levelId] = sortiere(levelId, daten[levelId]);
    speichereAlle(daten);
}

export function ladeHighscores(levelId) {
    if (!LEVEL_IDS.includes(levelId)) return [];
    return sortiere(levelId, ladeAlle()[levelId]);
}

export function holeBestenwert(levelId) {
    return ladeHighscores(levelId)[0] || null;
}

export function formatiereHighscore(levelId, eintrag) {
    if (!eintrag) return "Noch kein Highscore";
    if (levelId === "schwer") return `${eintrag.muenzen} Münzen – ${eintrag.name}`;
    if (levelId === "mittel") return `${eintrag.muenzen} Münzen – ${eintrag.zeit.toFixed(1).replace(".", ",")} Sek. – ${eintrag.name}`;
    return `${eintrag.zeit.toFixed(1).replace(".", ",")} Sek. – ${eintrag.name}`;
}

export function zeigeStartHighscores() {
    for (const id of LEVEL_IDS) {
        const element = document.getElementById(`bestwert-${id}`);
        if (element) element.textContent = formatiereHighscore(id, holeBestenwert(id));
    }
}

export function zeigeHighscoreListe(levelId, zielElement) {
    if (!zielElement) return;
    zielElement.replaceChildren();
    ladeHighscores(levelId).forEach((e, index) => {
        const li = document.createElement("li");
        if (levelId === "schwer") li.textContent = `${index + 1}. ${e.name} – ${e.muenzen} Münzen – ${e.datum}`;
        else if (levelId === "mittel") li.textContent = `${index + 1}. ${e.name} – ${e.muenzen} Münzen – ${e.zeit.toFixed(1).replace(".", ",")} Sek. – ${e.datum}`;
        else li.textContent = `${index + 1}. ${e.name} – ${e.zeit.toFixed(1).replace(".", ",")} Sek. – ${e.datum}`;
        zielElement.appendChild(li);
    });
}
