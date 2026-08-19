const GEGNER_ENTFERNUNG_HINTER_SPIELER = 1400;
const STOSS_DAUER = 1000;

function istAktiverGegner(gegner) {
    return gegner && !gegner.eliminiert && !gegner.entfernt;
}

function findeBoden(welt) {
    return welt.listen.plattformen.find(p => p.typ === "boden") || null;
}

function findePlattformSpawn(welt) {
    const kandidaten = welt.listen.plattformen.filter(plattform => {
        if (plattform.typ === "boden") {
            return false;
        }

        if ((plattform.gegnerAnzahl || 0) > 0) {
            return false;
        }

        return (
            plattform.x > welt.status.x + 450 &&
            plattform.x < welt.status.x + welt.CONFIG.GEGNER_SPAWN_ENTFERNUNG + 900 &&
            plattform.breite >= welt.CONFIG.GEGNER_BREITE + 25
        );
    });

    if (!kandidaten.length) {
        return null;
    }

    return kandidaten[Math.floor(Math.random() * kandidaten.length)];
}

function findeBodenSpawn(welt) {
    const boden = findeBoden(welt);

    if (!boden) {
        return null;
    }

    return {
        plattform: boden,
        x:
            welt.status.x +
            welt.CONFIG.GEGNER_SPAWN_ENTFERNUNG +
            250 +
            Math.random() * 500
    };
}

function istZuNahAnGegner(welt, x, plattform) {
    return welt.listen.gegner.some(gegner => {
        if (!istAktiverGegner(gegner)) {
            return false;
        }

        if (gegner.plattform !== plattform) {
            return false;
        }

        return Math.abs(gegner.x - x) < welt.CONFIG.GEGNER_MIN_ABSTAND;
    });
}

function erstelleGegnerElement() {
    const element = document.createElement("div");
    element.classList.add("gegner", "gegner-spawn");
    element.innerHTML = `
        <div class="gegnerAuge gegnerAugeLinks"></div>
        <div class="gegnerAuge gegnerAugeRechts"></div>
    `;
    return element;
}

function ermittleLaufgrenzen(welt, plattform, x) {
    if (plattform.typ === "boden") {
        return {
            links: Math.max(0, x - 320),
            rechts: x + 850
        };
    }

    return {
        links: plattform.x,
        rechts: plattform.x + plattform.breite - welt.CONFIG.GEGNER_BREITE
    };
}

export function neuenGegnerErzeugen(welt, zielTyp = "plattform") {
    const aktiveAnzahl = welt.listen.gegner.filter(istAktiverGegner).length;

    if (aktiveAnzahl >= welt.CONFIG.GEGNER_MAXIMAL) {
        return false;
    }

    const boden = findeBoden(welt);
    const plattform = findePlattformSpawn(welt);

    let spawnPlattform = null;
    let x = null;

    if (zielTyp === "boden") {
        const spawn = findeBodenSpawn(welt);

        if (!spawn) {
            return false;
        }

        spawnPlattform = spawn.plattform;
        x = spawn.x;
    } else {
        if (!plattform) {
            return false;
        }

        spawnPlattform = plattform;
        x =
            plattform.x +
            12 +
            Math.random() *
            Math.max(10, plattform.breite - welt.CONFIG.GEGNER_BREITE - 24);
    }

    if (!spawnPlattform || x === null) {
        return false;
    }

    if (istZuNahAnGegner(welt, x, spawnPlattform)) {
        return false;
    }

    const y = spawnPlattform.y - welt.CONFIG.GEGNER_HOEHE;
    const grenzen = ermittleLaufgrenzen(welt, spawnPlattform, x);
    const element = erstelleGegnerElement();
    const jetzt = performance.now();

    const gegner = {
        element,
        x,
        y,
        vorherigesY: y,
        geschwindigkeitY: 0,
        istAmBoden: true,
        plattform: spawnPlattform,
        laufLinks: grenzen.links,
        laufRechts: grenzen.rechts,
        richtung: Math.random() > 0.5 ? "rechts" : "links",
        geschwindigkeit: 1.5 + Math.random() * 1.1,
        blockiertBis: 0,
        spawnStart: jetzt,
        spawnSchutzBis: jetzt + welt.CONFIG.GEGNER_SPAWN_DAUER,
        sprungZaehler: 0,
        naechsterSprung: 0,
        eliminiert: false,
        entfernt: false,
        aktiv: false
    };

    if (spawnPlattform.typ !== "boden") {
        spawnPlattform.gegnerAnzahl = 1;
    }

    element.style.left = `${x - welt.status.kameraX}px`;
    element.style.top = `${y}px`;
    document.getElementById("spielfeld").appendChild(element);
    welt.listen.gegner.push(gegner);

    window.setTimeout(() => {
        if (!gegner.element || gegner.eliminiert || gegner.entfernt) {
            return;
        }

        gegner.aktiv = true;
        gegner.element.classList.add("aktiv");
        gegner.element.classList.remove("gegner-spawn");
    }, welt.CONFIG.GEGNER_SPAWN_DAUER);

    return true;
}

function entferneGegnerAusWelt(welt, gegner) {
    if (gegner.entfernt) {
        return;
    }

    gegner.entfernt = true;

    if (
        gegner.plattform &&
        gegner.plattform.typ !== "boden" &&
        gegner.plattform.gegnerAnzahl > 0
    ) {
        gegner.plattform.gegnerAnzahl = 0;
    }

    const index = welt.listen.gegner.indexOf(gegner);

    if (index >= 0) {
        welt.listen.gegner.splice(index, 1);
    }

    gegner.element?.remove();
}

function gegnerSpringen(gegner, welt) {
    if (
        gegner.sprungZaehler <= 0 ||
        !gegner.istAmBoden ||
        performance.now() < gegner.naechsterSprung
    ) {
        return;
    }

    gegner.geschwindigkeitY = welt.CONFIG.GEGNER_SPRUNG_KRAFT;
    gegner.istAmBoden = false;
    gegner.sprungZaehler -= 1;
    gegner.naechsterSprung = performance.now() + 70;
}

function aktualisiereVertikal(gegner, welt) {
    if (gegner.istAmBoden && gegner.sprungZaehler <= 0) {
        return;
    }

    gegner.vorherigesY = gegner.y;
    gegner.geschwindigkeitY += welt.CONFIG.GEGNER_GRAVITATION;
    gegner.y += gegner.geschwindigkeitY;

    let gelandet = false;

    for (const plattform of welt.listen.plattformen) {
        const links = gegner.x;
        const rechts = gegner.x + welt.CONFIG.GEGNER_BREITE;
        const unten = gegner.y + welt.CONFIG.GEGNER_HOEHE;
        const vorherigesUnten = gegner.vorherigesY + welt.CONFIG.GEGNER_HOEHE;

        if (
            rechts <= plattform.x ||
            links >= plattform.x + plattform.breite
        ) {
            continue;
        }

        if (
            gegner.geschwindigkeitY >= 0 &&
            vorherigesUnten <= plattform.y &&
            unten >= plattform.y
        ) {
            gegner.y = plattform.y - welt.CONFIG.GEGNER_HOEHE;
            gegner.geschwindigkeitY = 0;
            gegner.istAmBoden = true;
            gegner.plattform = plattform;

            if (plattform.typ !== "boden") {
                plattform.gegnerAnzahl = 1;
            }

            gelandet = true;
            break;
        }
    }

    if (
        !gelandet &&
        gegner.y + welt.CONFIG.GEGNER_HOEHE >= welt.CONFIG.BODEN_Y
    ) {
        gegner.y = welt.CONFIG.BODEN_Y - welt.CONFIG.GEGNER_HOEHE;
        gegner.geschwindigkeitY = 0;
        gegner.istAmBoden = true;
        gegner.plattform = findeBoden(welt);
    }
}

function stosseGegnerAuseinander(a, b) {
    if (!istAktiverGegner(a) || !istAktiverGegner(b)) {
        return;
    }

    if (a.plattform !== b.plattform) {
        return;
    }

    const gleicheEbene = Math.abs(a.y - b.y) < 35;
    const beruehrung =
        a.x < b.x + 60 &&
        a.x + 60 > b.x;

    if (!gleicheEbene || !beruehrung) {
        return;
    }

    const jetzt = performance.now();

    if (a.blockiertBis > jetzt || b.blockiertBis > jetzt) {
        return;
    }

    if (a.x <= b.x) {
        a.richtung = "links";
        b.richtung = "rechts";
    } else {
        a.richtung = "rechts";
        b.richtung = "links";
    }

    a.blockiertBis = jetzt + STOSS_DAUER;
    b.blockiertBis = jetzt + STOSS_DAUER;
}

export function aktualisiereGegner(welt) {
    for (const gegner of [...welt.listen.gegner]) {
        if (
            istAktiverGegner(gegner) &&
            gegner.x < welt.status.x - GEGNER_ENTFERNUNG_HINTER_SPIELER
        ) {
            entferneGegnerAusWelt(welt, gegner);
        }
    }

    if (!welt.status.spielGestartet || welt.status.spielBeendet) {
        return;
    }

    const jetzt = performance.now();

    if (!welt.status.levelDaten.naechsterGegnerSpawn) {
        welt.status.levelDaten.naechsterGegnerSpawn = jetzt + welt.CONFIG.GEGNER_SPAWN_INTERVAL;
        return;
    }

    if (jetzt < welt.status.levelDaten.naechsterGegnerSpawn) {
        return;
    }

    welt.status.levelDaten.naechsterGegnerSpawn = jetzt + welt.CONFIG.GEGNER_SPAWN_INTERVAL;

    const aktiveAnzahl = welt.listen.gegner.filter(istAktiverGegner).length;

    if (aktiveAnzahl >= welt.CONFIG.GEGNER_MAXIMAL) {
        return;
    }

    const haelfte = Math.floor(welt.CONFIG.GEGNER_MAXIMAL / 2);

    if (aktiveAnzahl <= haelfte) {
        neuenGegnerErzeugen(welt, "boden");
        if (welt.listen.gegner.filter(istAktiverGegner).length < welt.CONFIG.GEGNER_MAXIMAL) {
            neuenGegnerErzeugen(welt, "plattform");
        }
    } else {
        const ersteArt = Math.random() < 0.5 ? "boden" : "plattform";
        neuenGegnerErzeugen(welt, ersteArt);
        if (welt.listen.gegner.filter(istAktiverGegner).length < welt.CONFIG.GEGNER_MAXIMAL) {
            neuenGegnerErzeugen(welt, ersteArt === "boden" ? "plattform" : "boden");
        }
    }
}

export function bewegeGegner(welt) {
    for (let i = 0; i < welt.listen.gegner.length; i++) {
        const gegner = welt.listen.gegner[i];

        if (!istAktiverGegner(gegner)) {
            continue;
        }

        if (!gegner.aktiv) {
            gegner.element.style.left = `${gegner.x - welt.status.kameraX}px`;
            gegner.element.style.top = `${gegner.y}px`;
            continue;
        }

        gegnerSpringen(gegner, welt);
        aktualisiereVertikal(gegner, welt);

        const jetzt = performance.now();

        if (jetzt >= gegner.blockiertBis && gegner.istAmBoden) {
            if (gegner.richtung === "rechts") {
                gegner.x += gegner.geschwindigkeit;
            } else {
                gegner.x -= gegner.geschwindigkeit;
            }

            if (gegner.x <= gegner.laufLinks) {
                gegner.x = gegner.laufLinks;
                gegner.richtung = "rechts";
            }

            if (gegner.x >= gegner.laufRechts) {
                gegner.x = gegner.laufRechts;
                gegner.richtung = "links";
            }
        }

        for (let j = i + 1; j < welt.listen.gegner.length; j++) {
            stosseGegnerAuseinander(gegner, welt.listen.gegner[j]);
        }

        gegner.element.style.left = `${gegner.x - welt.status.kameraX}px`;
        gegner.element.style.top = `${gegner.y}px`;
        gegner.element.classList.toggle("gegner-springt", !gegner.istAmBoden);
        gegner.element.style.transform =
            gegner.richtung === "rechts" ? "scaleX(1)" : "scaleX(-1)";
    }
}

function spielerHitbox(welt) {
    return {
        links: welt.status.x + welt.CONFIG.SPIELER_HITBOX_X,
        rechts:
            welt.status.x +
            welt.CONFIG.SPIELER_HITBOX_X +
            welt.CONFIG.SPIELER_HITBOX_BREITE,
        oben: welt.status.y + welt.CONFIG.SPIELER_HITBOX_Y,
        unten:
            welt.status.y +
            welt.CONFIG.SPIELER_HITBOX_Y +
            welt.CONFIG.SPIELER_HITBOX_HOEHE
    };
}

function gegnerHitbox(welt, gegner) {
    return {
        links: gegner.x + 7,
        rechts: gegner.x + welt.CONFIG.GEGNER_BREITE - 7,
        oben: gegner.y + 5,
        unten: gegner.y + welt.CONFIG.GEGNER_HOEHE - 4
    };
}

function gegnerAusschalten(welt, gegner) {
    gegner.eliminiert = true;

    if (
        gegner.plattform &&
        gegner.plattform.typ !== "boden"
    ) {
        gegner.plattform.gegnerAnzahl = 0;
    }

    gegner.element.classList.remove("gegner-spawn", "aktiv");
    gegner.element.classList.add("gegner-wegklappen");

    window.setTimeout(() => {
        entferneGegnerAusWelt(welt, gegner);
    }, 450);
}

function spielerTreffer(welt, gegner) {
    const jetzt = performance.now();

    if (jetzt < welt.status.unverwundbarBis) {
        return;
    }

    welt.status.unverwundbarBis = jetzt + welt.CONFIG.UNVERWUNDBARKEIT;
    welt.status.blinkBis = jetzt + welt.CONFIG.BLINK_DAUER;
    welt.status.trefferrichtung = welt.status.x < gegner.x ? -1 : 1;
    welt.status.geschwindigkeitY = -8;
    welt.status.x += welt.status.trefferrichtung * 22;

    if (welt.status.levelId === "leicht") {
        welt.status.spielZeit += 1;
    }

    if (welt.status.levelId === "mittel") {
        welt.status.laufGeschwindigkeitsFaktor = 0.75;
        welt.status.laufModifikatorBis = jetzt + 1000;
    }

    const spieler = document.getElementById("spieler");
    spieler?.classList.remove("treffer-blinken");
    void spieler?.offsetWidth;
    spieler?.classList.add("treffer-blinken");

    gegner.sprungZaehler = 2;
    gegner.naechsterSprung = jetzt;
}

export function aktualisiereUnverwundbarkeit(welt) {
    const spieler = document.getElementById("spieler");

    if (!spieler) {
        return;
    }

    const jetzt = performance.now();

    if (jetzt >= welt.status.blinkBis) {
        spieler.classList.remove("treffer-blinken");
    }

    if (
        welt.status.levelId === "mittel" &&
        jetzt >= welt.status.laufModifikatorBis
    ) {
        welt.status.laufGeschwindigkeitsFaktor = 1;
    }
}

export function pruefeGegnerKollision(welt) {
    const spieler = spielerHitbox(welt);

    for (const gegner of [...welt.listen.gegner]) {
        if (
            !istAktiverGegner(gegner) ||
            !gegner.aktiv ||
            performance.now() < gegner.spawnSchutzBis
        ) {
            continue;
        }

        const feind = gegnerHitbox(welt, gegner);

        const trifft =
            spieler.rechts > feind.links &&
            spieler.links < feind.rechts &&
            spieler.unten > feind.oben &&
            spieler.oben < feind.unten;

        if (!trifft) {
            continue;
        }

        const vorherigerFuss =
            welt.status.vorherigesY +
            welt.CONFIG.SPIELER_HITBOX_Y +
            welt.CONFIG.SPIELER_HITBOX_HOEHE;

        const vonOben =
            welt.status.geschwindigkeitY > 0 &&
            vorherigerFuss <= feind.oben + 12;

        if (vonOben) {
            welt.status.geschwindigkeitY = welt.CONFIG.SPRUNG_KRAFT * 0.68;

            if (welt.status.levelId === "leicht") {
                welt.status.spielZeit = Math.max(0, welt.status.spielZeit - 2);
            }

            if (welt.status.levelId === "mittel") {
                welt.status.laufGeschwindigkeitsFaktor = 1.5;
                welt.status.laufModifikatorBis = performance.now() + 2000;
            }

            gegnerAusschalten(welt, gegner);
        } else {
            spielerTreffer(welt, gegner);
        }
    }
}
