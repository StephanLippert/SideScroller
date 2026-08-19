const HIGHSCORE_KEY = "happy-stickman-highscores-v3";

const STANDARD = {
    leicht: [],
    mittel: [],
    schwer: []
};

function ladeAlle() {
    try {
        const daten = JSON.parse(localStorage.getItem(HIGHSCORE_KEY));

        return {
            leicht: Array.isArray(daten?.leicht) ? daten.leicht : [],
            mittel: Array.isArray(daten?.mittel) ? daten.mittel : [],
            schwer: Array.isArray(daten?.schwer) ? daten.schwer : []
        };
    } catch {
        return {
            leicht: [],
            mittel: [],
            schwer: []
        };
    }
}

function speichereAlle(daten) {
    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(daten));
}

function normalisiereEintrag(levelId, eintrag) {
    return {
        name: String(eintrag?.name || "Spieler").slice(0, 12),
        wert: Number(eintrag?.wert) || 0,
        muenzen: Number(eintrag?.muenzen) || 0,
        zeit: Number(eintrag?.zeit) || 0,
        datum: eintrag?.datum || new Date().toLocaleDateString("de-DE")
    };
}

function sortiere(levelId, liste) {
    if (levelId === "schwer") {
        return liste.sort(
            (a, b) =>
                b.muenzen - a.muenzen ||
                a.zeit - b.zeit
        );
    }

    return liste.sort(
        (a, b) => a.zeit - b.zeit
    );
}

export function speichereHighscore(levelId, name, muenzen, zeit) {
    const daten = ladeAlle();

    if (!daten[levelId]) {
        daten[levelId] = [];
    }

    daten[levelId].push(
        normalisiereEintrag(levelId, {
            name,
            muenzen,
            zeit,
            wert: levelId === "schwer" ? muenzen : zeit,
            datum: new Date().toLocaleDateString("de-DE")
        })
    );

    daten[levelId] = sortiere(levelId, daten[levelId]).slice(0, 10);
    speichereAlle(daten);
}

export function ladeHighscores(levelId) {
    const daten = ladeAlle();
    return sortiere(
        levelId,
        (daten[levelId] || []).map(eintrag =>
            normalisiereEintrag(levelId, eintrag)
        )
    );
}

export function holeBestenwert(levelId) {
    const liste = ladeHighscores(levelId);
    return liste.length ? liste[0] : null;
}

export function formatiereHighscore(levelId, eintrag) {
    if (!eintrag) {
        return "Noch kein Highscore";
    }

    if (levelId === "schwer") {
        return `${eintrag.muenzen} Münzen – ${eintrag.name}`;
    }

    if (levelId === "mittel") {
        return `${eintrag.muenzen} Münzen – ${eintrag.zeit.toFixed(1).replace(".", ",")} Sek. – ${eintrag.name}`;
    }

    return `${eintrag.zeit.toFixed(1).replace(".", ",")} Sek. – ${eintrag.name}`;
}

export function zeigeStartHighscores() {
    for (const levelId of ["leicht", "mittel", "schwer"]) {
        const element = document.getElementById(`bestwert-${levelId}`);

        if (element) {
            element.textContent = formatiereHighscore(
                levelId,
                holeBestenwert(levelId)
            );
        }
    }
}

export function zeigeHighscoreListe(levelId, zielElement) {
    if (!zielElement) {
        return;
    }

    zielElement.innerHTML = "";

    ladeHighscores(levelId).forEach((eintrag, index) => {
        const li = document.createElement("li");

        if (levelId === "schwer") {
            li.textContent =
                `${index + 1}. ${eintrag.name} – ${eintrag.muenzen} Münzen – ${eintrag.datum}`;
        } else if (levelId === "mittel") {
            li.textContent =
                `${index + 1}. ${eintrag.name} – ${eintrag.muenzen} Münzen – ${eintrag.zeit.toFixed(1).replace(".", ",")} Sek. – ${eintrag.datum}`;
        } else {
            li.textContent =
                `${index + 1}. ${eintrag.name} – ${eintrag.zeit.toFixed(1).replace(".", ",")} Sek. – ${eintrag.datum}`;
        }

        zielElement.appendChild(li);
    });
}
