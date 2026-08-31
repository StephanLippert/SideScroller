export function erstellePlattformElement(plattform, spielfeld) {
    const element = document.createElement("div");
    element.classList.add("plattform");
    if (plattform.typ === "start") element.classList.add("plattform-start");
    if (plattform.beweglich) element.classList.add("plattform-beweglich");
    plattform.element = element;
    element.style.width = `${plattform.breite}px`;
    element.style.height = `${plattform.hoehe}px`;
    spielfeld.appendChild(element);
    return element;
}

function zufall(min, max) {
    return min + Math.random() * (max - min);
}

function sichereHoehe(welt, alteY, zielY) {
    const minY = welt.CONFIG.BODEN_Y - 355;
    const maxY = welt.CONFIG.BODEN_Y - 70;
    const begrenzt = Math.max(minY, Math.min(maxY, zielY));
    const delta = Math.max(-welt.CONFIG.maxHoehenAenderung, Math.min(welt.CONFIG.maxHoehenAenderung, begrenzt - alteY));
    return alteY + delta;
}

function erstelleBoden(welt, spielfeld) {
    const boden = {
        x: 0,
        y: welt.CONFIG.BODEN_Y,
        breite: welt.CONFIG.MAX_WELT_BREITE,
        hoehe: welt.CONFIG.BODEN_HOEHE,
        typ: "boden",
        gegnerAnzahl: 0,
        element: null,
        beweglich: false
    };
    welt.listen.plattformen.push(boden);
    erstellePlattformElement(boden, spielfeld);
}

export function erstellePlattform(welt, spielfeld, x, y, breite, typ = "normal", optionen = {}) {
    const plattform = {
        x,
        y,
        breite,
        hoehe: welt.CONFIG.PLATTFORM_HOEHE,
        typ,
        element: null,
        gegnerAnzahl: 0,
        beweglich: Boolean(optionen.beweglich),
        basisX: x,
        bewegungAmp: optionen.amp ?? 0,
        bewegungTempo: optionen.tempo ?? 0,
        bewegungPhase: optionen.phase ?? 0
    };
    welt.listen.plattformen.push(plattform);
    erstellePlattformElement(plattform, spielfeld);
    return plattform;
}

function erstelleGruppe(welt, spielfeld) {
    const daten = welt.status.levelDaten;
    const anzahl = welt.CONFIG.gruppenGroesse;
    let x = daten.naechsteGruppenX;
    let y = daten.letzteY;

    for (let i = 0; i < anzahl; i += 1) {
        const breite = zufall(welt.CONFIG.platformWidthMin, welt.CONFIG.platformWidthMax);
        const zielY = i === 0 ? welt.CONFIG.BODEN_Y - zufall(82, 150) : y + zufall(-welt.CONFIG.maxHoehenAenderung, welt.CONFIG.maxHoehenAenderung);
        y = sichereHoehe(welt, y, zielY);

        const gap = zufall(welt.CONFIG.platformGapMin, welt.CONFIG.platformGapMax);
        if (i > 0) x += gap;

        const istBeweglich = welt.status.levelId === "mittel" && daten.gruppenNummer % 5 === 2 && i === 1;
        const istChaos = welt.status.levelId === "schwer" && daten.gruppenNummer % 4 === 1 && i === 2;

        erstellePlattform(welt, spielfeld, x, y, breite, istChaos ? "gefährlich" :
            `gruppe-${daten.gruppenNummer}`, istBeweglich ?
            { beweglich: true, amp: 45, tempo: 0.0018, phase: Math.random() * Math.PI * 2 } : {});

        x += breite;
    }

    daten.gruppenNummer += 1;
    daten.naechsteGruppenX = x + zufall(120, 210);
    daten.letzteY = y;
}

export function erstelleZufaelligePlattformen(welt, spielfeld) {
    welt.listen.plattformen.length = 0;
    erstelleBoden(welt, spielfeld);

    erstellePlattform(welt, spielfeld, 55, welt.CONFIG.BODEN_Y - 145, 280, "start");

    welt.status.x = 110;
    welt.status.y = welt.CONFIG.BODEN_Y - 145 - 87;
    welt.status.vorherigesX = welt.status.x;
    welt.status.vorherigesY = welt.status.y;
    welt.status.levelDaten.naechsteGruppenX = 455;
    welt.status.levelDaten.letzteY = welt.CONFIG.BODEN_Y - 145;
    welt.status.levelDaten.gruppenNummer = 0;

    for (let i = 0; i < welt.CONFIG.startGruppen; i += 1) erstelleGruppe(welt, spielfeld);
}

export function aktualisiereEndlessPlattformen(welt, spielfeld) {
    let weitestesX = welt.status.x;
    for (const plattform of welt.listen.plattformen) {
        if (plattform.typ !== "boden") weitestesX = Math.max(weitestesX, plattform.x + plattform.breite);
    }

    let sicherheitszaehler = 0;
    while (weitestesX < welt.status.x + welt.CONFIG.NACHLADE_ABSTAND &&
        weitheitsLimitNochNichtErreicht(welt) &&
        sicherheitszaehler < 12
    ) {
        erstelleGruppe(welt, spielfeld);
        sicherheitszaehler += 1;
        weitestesX = welt.status.levelDaten.naechsteGruppenX;
    }

    const entferneBis = welt.status.kameraX - welt.CONFIG.ENTFERNEN_HINTER_SPIELER;
    welt.listen.plattformen = welt.listen.plattformen.filter(plattform => {
        if (plattform.typ === "boden" || plattform.typ === "start") return true;
        if (plattform.x + plattform.breite < entferneBis) {
            plattform.element?.remove();
            return false;
        }
        return true;
    });
}

function weitheitsLimitNochNichtErreicht(welt) {
    return welt.status.levelDaten.naechsteGruppenX < welt.CONFIG.MAX_WELT_BREITE;
}

export function animierePlattformen(welt) {
    const jetzt = performance.now();
    for (const plattform of welt.listen.plattformen) {
        if (!plattform.element) continue;

        if (plattform.beweglich) {
            plattform.x = plattform.basisX + Math.sin(jetzt * plattform.bewegungTempo + plattform.bewegungPhase) * plattform.bewegungAmp;
        }

        plattform.element.style.left = `${plattform.x - welt.status.kameraX}px`;
        plattform.element.style.top = `${plattform.y}px`;
    }
}
