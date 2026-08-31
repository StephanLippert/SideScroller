const GEGNER_TYPEN = Object.freeze({
    gruen: { klasse: "gegner-gruen", tempo: 1.45, sprung: -10.2, springen: 0.22, schaden: "langsam" },
    violett: { klasse: "gegner-violett", tempo: 1.8, sprung: -11.2, springen: 0.32, schaden: "ruck" },
    rot: { klasse: "gegner-rot", tempo: 2.35, sprung: -12.3, springen: 0.42, schaden: "stark" },
    blau: { klasse: "gegner-blau", tempo: 1.8, sprung: -13.5, springen: 0.52, schaden: "flieg" }
});

function istAktiv(g) {
    return Boolean(g && !g.eliminiert && !g.entfernt);
}

function findeBoden(welt) {
    return welt.listen.plattformen.find(p => p.typ === "boden") || null;
}

function waehleTyp(welt) {
    const erlaubte = welt.CONFIG.gegnerTypen || Object.keys(GEGNER_TYPEN);
    return erlaubte[Math.floor(Math.random() * erlaubte.length)] || "gruen";
}

function waehleSpawnPlattform(welt) {
    const kandidaten = welt.listen.plattformen.filter(p => {
        if (p.typ === "boden" || p.gegnerAnzahl > 0) return false;
        return p.x > welt.status.x + 420 && p.x < welt.status.x + 2100 && p.breite >= welt.CONFIG.GEGNER_BREITE + 25;
    });
    return kandidaten.length ? kandidaten[Math.floor(Math.random() * kandidaten.length)] : null;
}

function kollidiertMitAnderem(welt, x, plattform) {
    return welt.listen.gegner.some(g => istAktiv(g) && g.plattform === plattform && Math.abs(g.x - x) < welt.CONFIG.GEGNER_MIN_ABSTAND);
}

function erstelleElement(typ) {
    const e = document.createElement("div");
    e.classList.add("gegner", GEGNER_TYPEN[typ]?.klasse || "gegner-gruen");
    e.innerHTML = `<div class="gegnerAuge gegnerAugeLinks"></div><div class="gegnerAuge gegnerAugeRechts"></div><div class="gegnerKern"></div>`;
    return e;
}

export function neuenGegnerErzeugen(welt, spielfeld, zielTyp = null) {
    const aktiv = welt.listen.gegner.filter(istAktiv).length;
    if (aktiv >= welt.CONFIG.gegnerMaximal || welt.status.x > welt.CONFIG.MAX_WELT_BREITE - 2500) return false;

    const typ = waehleTyp(welt);
    const regel = GEGNER_TYPEN[typ];
    const bevorzugterTyp = zielTyp || welt.CONFIG.gegnerMix[Math.floor(Math.random() * welt.CONFIG.gegnerMix.length)];
    let plattform;
    let x;

    if (bevorzugterTyp === "plattform") {
        plattform = waehleSpawnPlattform(welt);
        if (!plattform) return false;
        x = plattform.x + 12 + Math.random() * Math.max(8, plattform.breite - welt.CONFIG.GEGNER_BREITE - 24);
    } else {
        plattform = findeBoden(welt);
        if (!plattform) return false;
        x = Math.min(
            welt.CONFIG.MAX_WELT_BREITE - 100,
            welt.status.x + 1100 + Math.random() * 700
        );
    }

    if (kollidiertMitAnderem(welt, x, plattform)) return false;

    const y = plattform.y - welt.CONFIG.GEGNER_HOEHE;
    const e = erstelleElement(typ);
    const jetzt = performance.now();
    const grenzen = plattform.typ === "boden"
        ? { links: Math.max(0, x - 350), rechts: Math.min(welt.CONFIG.MAX_WELT_BREITE - welt.CONFIG.GEGNER_BREITE, x + 850) }
        : { links: plattform.x, rechts: plattform.x + plattform.breite - welt.CONFIG.GEGNER_BREITE };

    const gegner = {
        element: e,
        typ,
        x,
        y,
        vorherigesY: y,
        geschwindigkeitY: 0,
        istAmBoden: true,
        plattform,
        laufLinks: grenzen.links,
        laufRechts: grenzen.rechts,
        richtung: Math.random() < 0.5 ? "links" : "rechts",
        geschwindigkeit: regel.tempo,
        sprungKraft: regel.sprung,
        sprungChance: regel.springen,
        blockiertBis: 0,
        spawnBis: jetzt + 650,
        eliminiert: false,
        entfernt: false
    };

    if (plattform.typ !== "boden") plattform.gegnerAnzahl += 1;
    e.style.left = `${x - welt.status.kameraX}px`;
    e.style.top = `${y}px`;
    e.classList.add("gegner-spawn");
    spielfeld.appendChild(e);
    welt.listen.gegner.push(gegner);
    return true;
}

function entferneGegner(welt, gegner) {
    if (!gegner || gegner.entfernt) return;
    gegner.entfernt = true;
    if (gegner.plattform && gegner.plattform.typ !== "boden") gegner.plattform.gegnerAnzahl = Math.max(0, gegner.plattform.gegnerAnzahl - 1);
    gegner.element?.remove();
    const i = welt.listen.gegner.indexOf(gegner);
    if (i >= 0) welt.listen.gegner.splice(i, 1);
}

function springen(g, welt) {
    if (!g.istAmBoden) return;
    if (Math.random() > g.sprungChance) return;
    g.geschwindigkeitY = g.sprungKraft;
    g.istAmBoden = false;
}

function vertikal(g, welt) {
    g.vorherigesY = g.y;
    g.geschwindigkeitY += welt.CONFIG.SCHWERKRAFT * 0.8;
    g.y += g.geschwindigkeitY;

    let landung = null;
    const untenAlt = g.vorherigesY + welt.CONFIG.GEGNER_HOEHE;
    const untenNeu = g.y + welt.CONFIG.GEGNER_HOEHE;

    for (const p of welt.listen.plattformen) {
        if (g.x + welt.CONFIG.GEGNER_BREITE <= p.x || g.x >= p.x + p.breite) continue;
        if (g.geschwindigkeitY >= 0 && untenAlt <= p.y && untenNeu >= p.y) {
            landung = p;
            break;
        }
    }

    if (landung) {
        g.y = landung.y - welt.CONFIG.GEGNER_HOEHE;
        g.geschwindigkeitY = 0;
        g.istAmBoden = true;
        if (g.plattform !== landung && g.plattform?.typ !== "boden") g.plattform.gegnerAnzahl = Math.max(0, g.plattform.gegnerAnzahl - 1);
        g.plattform = landung;
        if (landung.typ !== "boden") landung.gegnerAnzahl += 1;
        g.laufLinks = landung.typ === "boden" ? Math.max(0, g.x - 350) : landung.x;
        g.laufRechts = landung.typ === "boden" ? Math.min(welt.CONFIG.MAX_WELT_BREITE - welt.CONFIG.GEGNER_BREITE, g.x + 850) : landung.x + landung.breite - welt.CONFIG.GEGNER_BREITE;
        return;
    }

    const boden = findeBoden(welt);
    if (boden && g.y + welt.CONFIG.GEGNER_HOEHE >= boden.y) {
        g.y = boden.y - welt.CONFIG.GEGNER_HOEHE;
        g.geschwindigkeitY = 0;
        g.istAmBoden = true;
        g.plattform = boden;
        g.laufLinks = Math.max(0, g.x - 350);
        g.laufRechts = Math.min(welt.CONFIG.MAX_WELT_BREITE - welt.CONFIG.GEGNER_BREITE, g.x + 850);
    }
}

export function aktualisiereGegner(welt, spielfeld) {
    const jetzt = performance.now();

    for (const g of [...welt.listen.gegner]) {
        if (g.x < welt.status.x - 1500 || g.x > welt.CONFIG.MAX_WELT_BREITE + 500) entferneGegner(welt, g);
    }

    if (!welt.status.spielGestartet || welt.status.spielBeendet) return;

    if (jetzt >= welt.status.levelDaten.naechsterGegnerSpawn) {
        welt.status.levelDaten.naechsterGegnerSpawn = jetzt + welt.CONFIG.gegnerIntervall;
        const aktive = welt.listen.gegner.filter(istAktiv).length;
        if (aktive < welt.CONFIG.gegnerMaximal) {
            neuenGegnerErzeugen(welt, spielfeld);
            if (aktive + 1 < welt.CONFIG.gegnerMaximal && Math.random() < 0.42) neuenGegnerErzeugen(welt, spielfeld);
        }
    }

    const max = welt.CONFIG.gegnerMaximal;
    if (welt.listen.gegner.length > max + 4) {
        welt.listen.gegner.slice(0, welt.listen.gegner.length - max).forEach(g => entferneGegner(welt, g));
    }
}

export function bewegeGegner(welt) {
    const jetzt = performance.now();
    for (const g of [...welt.listen.gegner]) {
        if (g.eliminiert && jetzt >= (g.wegBis || 0)) entferneGegner(welt, g);
    }
    for (let i = 0; i < welt.listen.gegner.length; i += 1) {
        const g = welt.listen.gegner[i];
        if (!istAktiv(g)) continue;

        if (jetzt >= g.spawnBis) g.element.classList.add("aktiv");
        if (jetzt < g.spawnBis) continue;

        if (g.istAmBoden && Math.random() < g.sprungChance * 0.04) springen(g, welt);
        vertikal(g, welt);

        if (g.istAmBoden) {
            g.x += g.richtung === "rechts" ? g.geschwindigkeit : -g.geschwindigkeit;
            if (g.x <= g.laufLinks) {
                g.x = g.laufLinks;
                g.richtung = "rechts";
            }
            if (g.x >= g.laufRechts) {
                g.x = g.laufRechts;
                g.richtung = "links";
            }
        }

        for (let j = i + 1; j < welt.listen.gegner.length; j += 1) {
            const b = welt.listen.gegner[j];
            if (!istAktiv(b) || g.plattform !== b.plattform) continue;
            const delta = b.x - g.x;
            if (Math.abs(delta) < 55) {
                const schub = delta >= 0 ? -0.65 : 0.65;
                g.x += schub;
                b.x -= schub;
            }
        }

        g.element.classList.toggle("gegner-springt", !g.istAmBoden);
        g.element.classList.toggle("gegner-schnell", g.typ === "rot");
        g.element.style.left = `${g.x - welt.status.kameraX}px`;
        g.element.style.top = `${g.y}px`;
        g.element.style.transform = g.richtung === "rechts" ? "scaleX(1)" : "scaleX(-1)";
    }
}

function spielerHitbox(welt) {
    return {
        links: welt.status.x + welt.CONFIG.SPIELER_HITBOX_X,
        rechts: welt.status.x + welt.CONFIG.SPIELER_HITBOX_X + welt.CONFIG.SPIELER_HITBOX_BREITE,
        oben: welt.status.y + welt.CONFIG.SPIELER_HITBOX_Y,
        unten: welt.status.y + welt.CONFIG.SPIELER_HITBOX_Y + welt.CONFIG.SPIELER_HITBOX_HOEHE
    };
}

export function pruefeGegnerKollision(welt) {
    const p = spielerHitbox(welt);
    const jetzt = performance.now();

    for (const g of [...welt.listen.gegner]) {
        if (!istAktiv(g) || jetzt < g.spawnBis) continue;

        const e = { links: g.x + 7, rechts: g.x + welt.CONFIG.GEGNER_BREITE - 7, oben: g.y + 4, unten: g.y + welt.CONFIG.GEGNER_HOEHE - 4 };
        const trifft = p.rechts > e.links && p.links < e.rechts && p.unten > e.oben && p.oben < e.unten;
        if (!trifft) continue;

        const vorherFuss = welt.status.vorherigesY + welt.CONFIG.SPIELER_HITBOX_Y + welt.CONFIG.SPIELER_HITBOX_HOEHE;
        const vonOben = welt.status.geschwindigkeitY > 0 && vorherFuss <= e.oben + 14;

        if (vonOben) {
            welt.status.geschwindigkeitY = welt.CONFIG.SPRUNG_KRAFT * 0.68;
            g.eliminiert = true;
            g.wegBis = jetzt + 280;
            g.element.classList.add("gegner-wegklappen");
            if (g.plattform?.typ !== "boden") g.plattform.gegnerAnzahl = Math.max(0, g.plattform.gegnerAnzahl - 1);
            if (welt.status.levelId === "leicht") welt.status.spielZeit = Math.max(0, welt.status.spielZeit - 2);
        } else if (jetzt >= welt.status.unverwundbarBis) {
            welt.status.unverwundbarBis = jetzt + welt.CONFIG.UNVERWUNDBARKEIT;
            welt.status.blinkBis = jetzt + welt.CONFIG.BLINK_DAUER;
            welt.status.trefferrichtung = welt.status.x < g.x ? -1 : 1;
            welt.status.x += welt.status.trefferrichtung * 26;
            welt.status.geschwindigkeitY = -8;

            if (welt.status.levelId === "leicht") welt.status.spielZeit += 1;
            if (welt.status.levelId === "mittel") {
                welt.status.laufGeschwindigkeitsFaktor = g.typ === "rot" ? 0.58 : 0.75;
                welt.status.laufModifikatorBis = jetzt + (g.typ === "violett" ? 700 : 1300);
            }
            document.getElementById("spieler")?.classList.add("treffer-blinken");
        }
    }
}

export function aktualisiereUnverwundbarkeit(welt) {
    const e = document.getElementById("spieler");
    if (!e) return;
    const jetzt = performance.now();
    if (jetzt >= welt.status.blinkBis) e.classList.remove("treffer-blinken");
    if (jetzt >= welt.status.laufModifikatorBis) welt.status.laufGeschwindigkeitsFaktor = 1;
}
