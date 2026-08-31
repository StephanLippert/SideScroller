function darfMuenzeErzeugtWerden(welt) {
    if (welt.status.levelId === "mittel") return welt.listen.muenzen.length < 100;
    return welt.listen.muenzen.length < welt.CONFIG.muenzenAufVorrat;
}

function findeMuenzenPosition(welt, zielX = null) {
    const kandidaten = welt.listen.plattformen.filter(p => p.typ !== "boden" && p.breite >= 105 && p.x < welt.CONFIG.MAX_WELT_BREITE - 100);
    if (zielX !== null) {
        const nahe = kandidaten.filter(p => Math.abs((p.x + p.breite / 2) - zielX) < 190);
        if (nahe.length) {
            const p = nahe[Math.floor(Math.random() * nahe.length)];
            return { x: p.x + 22 + Math.random() * Math.max(10, p.breite - 52), y: p.y - welt.CONFIG.MUENZE_GROESSE - 14 };
        }
        return { x: Math.max(30, Math.min(welt.CONFIG.MAX_WELT_BREITE - 80, zielX)), y: welt.CONFIG.BODEN_Y - welt.CONFIG.MUENZE_GROESSE - 8 };
    }

    const vorne = kandidaten.filter(p => p.x > welt.status.x + 250 && p.x < welt.status.x + 2200);
    const pool = vorne.length ? vorne : kandidaten;
    if (pool.length) {
        const p = pool[Math.floor(Math.random() * pool.length)];
        return { x: p.x + 22 + Math.random() * Math.max(10, p.breite - 52), y: p.y - welt.CONFIG.MUENZE_GROESSE - 14 };
    }
    return { x: welt.status.x + 900, y: welt.CONFIG.BODEN_Y - welt.CONFIG.MUENZE_GROESSE - 8 };
}

function fuegeMuenzeHinzu(welt, spielfeld, position) {
    if (!darfMuenzeErzeugtWerden(welt)) return false;
    const element = document.createElement("div");
    element.classList.add("muenze", "muenze-aufbau");
    element.innerHTML = "<span>1</span>";
    const muenze = {
        element,
        x: position.x,
        y: position.y,
        bereitAb: performance.now() + welt.CONFIG.MUENZE_AUFBAUZEIT,
        bereit: false,
        bereitsGeloescht: false
    };
    element.style.width = `${welt.CONFIG.MUENZE_GROESSE}px`;
    element.style.height = `${welt.CONFIG.MUENZE_GROESSE}px`;
    spielfeld.appendChild(element);
    welt.listen.muenzen.push(muenze);
    return true;
}

export function initialisiereMuenzen(welt, spielfeld) {
    const count = welt.status.levelId === "mittel" ? 80 : welt.CONFIG.startMuenzen;
    for (let i = 0; i < count; i += 1) {
        const zielX = welt.status.x + 550 + i * (welt.status.levelId === "schwer" ? 220 : 260);
        fuegeMuenzeHinzu(welt, spielfeld, findeMuenzenPosition(welt, zielX));
    }
}

export function aktualisiereMuenzen(welt, spielfeld) {
    const jetzt = performance.now();

    if (welt.status.levelId === "mittel" && welt.status.levelDaten.naechsterMuenzVerlust !== null && jetzt >= welt.status.levelDaten.naechsterMuenzVerlust) {
        welt.status.levelDaten.naechsterMuenzVerlust = jetzt + 10000;
        const kandidaten = welt.listen.muenzen.filter(m => !m.bereitsGeloescht && m.x > welt.status.x + 350);
        if (kandidaten.length) {
            const m = kandidaten[Math.floor(Math.random() * kandidaten.length)];
            m.bereitsGeloescht = true;
            m.element.classList.add("muenze-verschwindet");
        }
    }

    const sichtbareUnbenutzte = welt.listen.muenzen.filter(m => !m.bereitsGeloescht && m.x > welt.status.x - 250).length;
    if (sichtbareUnbenutzte < Math.min(14, welt.CONFIG.muenzenAufVorrat)) {
        const zielX = welt.status.x + 900 + Math.random() * 1400;
        fuegeMuenzeHinzu(welt, spielfeld, findeMuenzenPosition(welt, zielX));
    }

    if (welt.listen.muenzen.length > 120) {
        const zuViel = welt.listen.muenzen.length - 120;
        welt.listen.muenzen.splice(0, zuViel).forEach(m => m.element?.remove());
    }
}

export function animiereMuenzen(welt) {
    const jetzt = performance.now();
    for (const m of welt.listen.muenzen) {
        if (!m.element) continue;
        if (!m.bereit && jetzt >= m.bereitAb) {
            m.bereit = true;
            m.element.classList.remove("muenze-aufbau");
        }
        m.element.style.left = `${m.x - welt.status.kameraX}px`;
        m.element.style.top = `${m.y}px`;
    }
}

export function pruefeMuenzenKollision(welt) {
    const links = welt.status.x + welt.CONFIG.SPIELER_HITBOX_X;
    const rechts = links + welt.CONFIG.SPIELER_HITBOX_BREITE;
    const oben = welt.status.y + welt.CONFIG.SPIELER_HITBOX_Y;
    const unten = oben + welt.CONFIG.SPIELER_HITBOX_HOEHE;

    for (let i = welt.listen.muenzen.length - 1; i >= 0; i -= 1) {
        const m = welt.listen.muenzen[i];
        if (!m.bereit || m.bereitsGeloescht) continue;
        const trifft = rechts > m.x && links < m.x + welt.CONFIG.MUENZE_GROESSE && unten > m.y && oben < m.y + welt.CONFIG.MUENZE_GROESSE;
        if (!trifft) continue;
        m.element?.remove();
        welt.listen.muenzen.splice(i, 1);
        welt.status.gesammelteMuenzen += 1;
    }
}

export function bereinigeVerschwundeneMuenzen(welt) {
    for (let i = welt.listen.muenzen.length - 1; i >= 0; i -= 1) {
        const m = welt.listen.muenzen[i];
        if (m.bereitsGeloescht && m.element && m.element.getAnimations && m.element.getAnimations().every(a => a.playState === "finished")) {
            m.element.remove();
            welt.listen.muenzen.splice(i, 1);
        }
    }
}

export function aktualisiereMuenzHinweis(welt) {
    let hinweis = document.getElementById("muenzenHinweis");
    if (!hinweis) {
        hinweis = document.createElement("div");
        hinweis.id = "muenzenHinweis";
        hinweis.className = "versteckt";
        hinweis.innerHTML = `<span class="muenzenHinweisPfeil">→</span><span class="hinweisMuenze">1</span><span class="muenzenHinweisText">Münze</span>`;
        document.getElementById("spielfeld")?.appendChild(hinweis);
    }

    const naechste = welt.listen.muenzen.filter(m => m.bereit && !m.bereitsGeloescht).sort((a, b) => Math.abs(a.x - welt.status.x) - Math.abs(b.x - welt.status.x))[0];
    if (!naechste) {
        hinweis.classList.add("versteckt");
        return;
    }
    const rechts = naechste.x >= welt.status.x + welt.CONFIG.SPIELFELD_BREITE * 0.55;
    hinweis.classList.remove("versteckt");
    hinweis.classList.toggle("rechts", rechts);
    hinweis.classList.toggle("links", !rechts);
    hinweis.querySelector(".muenzenHinweisPfeil").textContent = rechts ? "→" : "←";
}
