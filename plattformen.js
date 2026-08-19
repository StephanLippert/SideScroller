const spielfeld = document.getElementById("spielfeld");

const NACHLADE_ABSTAND = 3600;
const ENTFERNEN_HINTER_SPIELER = 1800;
const PLATTFORM_BREITE_MIN = 150;
const PLATTFORM_BREITE_MAX = 220;
const PLATTFORM_HOEHE = 20;
const GRUPPE_PLATTFORMEN = 3;
const MAX_SPRUNG_HOEHE = 110;
const MAX_SPRUNG_WEITE = 250;

function erstelleElement(plattform) {
    const element = document.createElement("div");
    element.classList.add("plattform");
    plattform.element = element;
    element.style.left = `${plattform.x}px`;
    element.style.top = `${plattform.y}px`;
    element.style.width = `${plattform.breite}px`;
    element.style.height = `${plattform.hoehe}px`;
    spielfeld.appendChild(element);
}

function erstellePlattform(welt, x, y, breite, typ = "normal") {
    const plattform = {
        x,
        y,
        breite,
        hoehe: PLATTFORM_HOEHE,
        typ,
        element: null,
        gegnerAnzahl: 0
    };

    welt.listen.plattformen.push(plattform);
    erstelleElement(plattform);
    return plattform;
}

function begrenzePlattformHoehe(welt, vorherigeY, neuesY) {
    const begrenztesY = Math.max(
        175,
        Math.min(welt.CONFIG.BODEN_Y - 65, neuesY)
    );

    const differenz = begrenztesY - vorherigeY;

    if (Math.abs(differenz) <= MAX_SPRUNG_HOEHE) {
        return begrenztesY;
    }

    return vorherigeY + Math.sign(differenz) * MAX_SPRUNG_HOEHE;
}

function erstellePlattformGruppe(welt) {
    const daten = welt.status.levelDaten;
    let x = daten.naechsteGruppenX;
    let y = daten.letzteY;

    for (let i = 0; i < GRUPPE_PLATTFORMEN; i++) {
        const breite =
            PLATTFORM_BREITE_MIN +
            Math.random() * (PLATTFORM_BREITE_MAX - PLATTFORM_BREITE_MIN);

        if (i === 0) {
            y = begrenzePlattformHoehe(
                welt,
                y,
                welt.CONFIG.BODEN_Y - (85 + Math.random() * 35)
            );
        } else {
            y = begrenzePlattformHoehe(
                welt,
                y,
                y + (-70 + Math.random() * 110)
            );
        }

        const luecke = 85 + Math.random() * 75;
        x += i === 0 ? 0 : Math.min(luecke, MAX_SPRUNG_WEITE - 20);

        erstellePlattform(
            welt,
            x,
            y,
            breite,
            `gruppe-${daten.gruppenNummer}`
        );

        x += breite;
    }

    daten.gruppenNummer += 1;
    daten.naechsteGruppenX = x + 150 + Math.random() * 90;
    daten.letzteY = y;
}

export function erstelleZufaelligePlattformen(welt) {
    welt.listen.plattformen.length = 0;

    const boden = {
        x: 0,
        y: welt.CONFIG.BODEN_Y,
        breite: Number.POSITIVE_INFINITY,
        hoehe: welt.CONFIG.BODEN_HOEHE,
        typ: "boden",
        element: null,
        gegnerAnzahl: 0
    };

    welt.listen.plattformen.push(boden);
    erstelleElement(boden);

    erstellePlattform(
        welt,
        55,
        welt.CONFIG.BODEN_Y - 145,
        260,
        "start"
    );

    welt.status.x = 110;
    welt.status.y = welt.CONFIG.BODEN_Y - 145 - 87;
    welt.status.vorherigesX = welt.status.x;
    welt.status.vorherigesY = welt.status.y;

    welt.status.levelDaten.naechsteGruppenX = 430;
    welt.status.levelDaten.letzteY = welt.CONFIG.BODEN_Y - 145;
    welt.status.levelDaten.gruppenNummer = 0;

    for (let i = 0; i < 12; i++) {
        erstellePlattformGruppe(welt);
    }
}

export function aktualisiereEndlessPlattformen(welt) {
    let weitestePlattformX = welt.status.x;

    for (const p of welt.listen.plattformen) {
        if (p.typ === "boden") {
            continue;
        }

        weitestePlattformX = Math.max(
            weitestePlattformX,
            p.x + p.breite
        );
    }

    let sicherheit = 0;

    while (
        weitestePlattformX < welt.status.x + NACHLADE_ABSTAND &&
        sicherheit < 20
    ) {
        erstellePlattformGruppe(welt);
        sicherheit += 1;

        for (const p of welt.listen.plattformen) {
            if (p.typ !== "boden") {
                weitestePlattformX = Math.max(
                    weitestePlattformX,
                    p.x + p.breite
                );
            }
        }
    }

    welt.listen.plattformen = welt.listen.plattformen.filter(plattform => {
        if (plattform.typ === "boden" || plattform.typ === "start") {
            return true;
        }

        if (
            plattform.x + plattform.breite <
            welt.status.kameraX - ENTFERNEN_HINTER_SPIELER
        ) {
            plattform.element?.remove();
            return false;
        }

        return true;
    });
}

export function animierePlattformen(welt) {
    for (const plattform of welt.listen.plattformen) {
        if (!plattform.element) {
            continue;
        }

        plattform.element.style.left =
            `${plattform.x - welt.status.kameraX}px`;
    }
}

export function plattformenInSichtweite(welt) {
    return welt.listen.plattformen.filter(
        plattform =>
            plattform.typ !== "boden" &&
            plattform.x < welt.status.x + 1900 &&
            plattform.x + plattform.breite > welt.status.x - 350
    );
}
