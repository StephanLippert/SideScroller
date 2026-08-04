const spielfeld = document.getElementById("spielfeld");
const MUENZ_GROESSE = 30;
const MAX_MUENZEN = 12;

export function neueMuenzeErzeugen(welt) {
    if (welt.listen.muenzen.length >= MAX_MUENZEN) {
        return;
    }

    const element = document.createElement("div");
    element.classList.add("muenze");

    let position;

    const plattformen = welt.listen.plattformen.filter(p => p.typ !== "boden" && p.breite > 80);

    if (plattformen.length > 0 && Math.random() > 0.25) {
        const plattform = plattformen[Math.floor(Math.random() * plattformen.length)];

        position = {
            x: plattform.x + Math.random() * (plattform.breite - MUENZ_GROESSE),
            y: plattform.y - MUENZ_GROESSE - 15
        };
    }
    else {
        position = {
            x: Math.random() * (welt.status.levelDaten ? welt.status.levelDaten.letzteX : welt.CONFIG.WELT_BREITE),
            y: welt.CONFIG.BODEN_Y - MUENZ_GROESSE - 10
        };
    }

    const muenze = { element, x: position.x, y: position.y };

    element.style.left = (muenze.x - welt.status.kameraX) + "px";
    element.style.top = muenze.y + "px";
    element.style.width = MUENZ_GROESSE + "px";
    element.style.height = MUENZ_GROESSE + "px";

    spielfeld.appendChild(element);
    welt.listen.muenzen.push(muenze);
}

export function aktualisiereMuenzen(welt) {
    while (welt.listen.muenzen.length < MAX_MUENZEN) {
        neueMuenzeErzeugen(welt);
    }
}

export function animiereMuenzen(welt) {
    for (const muenze of welt.listen.muenzen) {
        if (muenze.element) {
            muenze.element.style.left = (muenze.x - welt.status.kameraX) + "px";
        }
    }
}

export function pruefeMuenzenKollision(welt) {
    const spieler = welt.status;

    for (let i = welt.listen.muenzen.length - 1; i >= 0; i--) {
        const muenze = welt.listen.muenzen[i];
        const trifft =
            spieler.x + welt.CONFIG.SPIELER_BREITE > muenze.x &&
            spieler.x < muenze.x + MUENZ_GROESSE &&
            spieler.y + welt.CONFIG.SPIELER_HOEHE > muenze.y &&
            spieler.y < muenze.y + MUENZ_GROESSE;

        if (trifft) {
            muenze.element.remove();
            welt.listen.muenzen.splice(i, 1);
            welt.status.gesammelteMuenzen++;
        }
    }
}