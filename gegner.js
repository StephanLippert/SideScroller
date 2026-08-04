const GEGNER_BREITE = 60;
const GEGNER_HOEHE = 60;
const MIN_GEGNER_ABSTAND = 220;
const MAX_GEGNER = 20;
const GEGNER_SPAWN_VOR_SPIELER = 1200;
const GEGNER_ENTFERNEN_HINTER_SPIELER = 1200;

function positionIstFrei(welt, x, y) {
    for (const gegner of welt.listen.gegner) {
        const abstandX = Math.abs(gegner.x - x);
        const abstandY = Math.abs(gegner.y - y);

        if (abstandX < MIN_GEGNER_ABSTAND && abstandY < 100) {
            return false;
        }
    }

    return true;
}

export function neuenGegnerErzeugen(welt, festeX = null) {
    const spielfeld = document.getElementById("spielfeld");

    if (!spielfeld) {
        return;
    }

    const element = document.createElement("div");
    element.classList.add("gegner");
    element.innerHTML = `
        <div class="auge links"></div>
        <div class="auge rechts"></div>

    `;
    const plattformSpawns = [];
    const bodenSpawns = [];

    bodenSpawns.push({
        typ: "boden",
        xMin:
            welt.status.x + GEGNER_SPAWN_VOR_SPIELER,
        xMax:
            welt.status.x + GEGNER_SPAWN_VOR_SPIELER + 900,
        y:
            welt.CONFIG.BODEN_Y - GEGNER_HOEHE
    });

    for (const plattform of welt.listen.plattformen) {
        if (plattform.typ === "boden") {
            continue;
        }

        if (plattform.x < welt.status.x + 300) {
            continue;
        }

        if (plattform.breite < GEGNER_BREITE + 40) {
            continue;
        }

        plattformSpawns.push({
            typ: "plattform",
            plattform,
            xMin:
                plattform.x,
            xMax:
                plattform.x +
                plattform.breite -
                GEGNER_BREITE,
            y:
                plattform.y -
                GEGNER_HOEHE
        });
    }

    let spawnMoeglichkeiten;

    if (plattformSpawns.length > 0 && Math.random() < 0.7) {
        spawnMoeglichkeiten = plattformSpawns;
    }
    else {
        spawnMoeglichkeiten = bodenSpawns;
    }

    let spawn;
    let randomX;
    let randomY;
    let gefunden = false;
    let versuche = 0;

    do {
        spawn = spawnMoeglichkeiten[
            Math.floor(Math.random() * spawnMoeglichkeiten.length)
        ];

        if (festeX !== null) {
            randomX = Math.max(spawn.xMin, Math.min(festeX, spawn.xMax));
        }
        else {
            randomX = spawn.xMin + Math.random() * (spawn.xMax - spawn.xMin);
        }

        randomY = spawn.y;

        if (positionIstFrei(welt, randomX, randomY)) {
            gefunden = true;
        }

        versuche++;
    }
    while (!gefunden && versuche < 100);

    if (!gefunden) {
        return;
    }

    let laufLinks = 0;
    let laufRechts = welt.status.x + 2000;

    if (spawn.typ === "plattform") {
        laufLinks =
            spawn.plattform.x;
        laufRechts =
            spawn.plattform.x +
            spawn.plattform.breite -
            GEGNER_BREITE;
    }

    const neuerGegner = {
        element,
        x: randomX,
        y: randomY,
        laufLinks,
        laufRechts,
        richtung:
            Math.random() > 0.5 ? "rechts" : "links",
        geschwindigkeit:
            1.5 + Math.random() * 1.5,
        bewegtSich: true,
        naechsteEntscheidung:
            Date.now() +
            2000 +
            Math.random() * 3000,

        spawnSchutzBis:
            Date.now() +
            1000
    };

    element.style.left = (neuerGegner.x - welt.status.kameraX) + "px";
    element.style.top = neuerGegner.y + "px";
    element.style.opacity = "0";
    element.style.transition = "opacity 0.8s ease";

    spielfeld.appendChild(element);

    welt.listen.gegner.push(neuerGegner);

    requestAnimationFrame(() => {
        element.style.opacity = "1";
    }
    );

    setTimeout(() => {
        element.style.transition = "";
    },
        1000
    );
}

export function aktualisiereGegner(welt) {
    // Alte Gegner entfernen
    welt.listen.gegner = welt.listen.gegner.filter(
        gegner => {
            const entfernung = welt.status.x - gegner.x;
            if (entfernung > GEGNER_ENTFERNEN_HINTER_SPIELER) {
                if (gegner.element) {
                    gegner.element.remove();
                }

                return false;
            }

            return true;

        }
    );

    // Neue Gegner erzeugen
    while (welt.listen.gegner.length < MAX_GEGNER) {
        const spawnX =
            welt.status.x +
            GEGNER_SPAWN_VOR_SPIELER +
            Math.random() * 800;

        neuenGegnerErzeugen(welt, spawnX);

        break;
    }
}

export function bewegeGegner(welt) {
    verhindereGegnerUeberlappung(welt);

    for (const gegner of welt.listen.gegner) {
        const jetzt = Date.now();
        if (jetzt > gegner.naechsteEntscheidung) {
            gegner.naechsteEntscheidung =
                jetzt +
                2000 +
                Math.random() * 3000;

            const zufall = Math.random();

            if (zufall < 0.35) {
                gegner.richtung = gegner.richtung === "rechts" ? "links" : "rechts";
            }
            else if (zufall < 0.6) {
                gegner.bewegtSich = false;
            }
            else {
                gegner.bewegtSich = true;
            }
        }

        if (!gegner.bewegtSich) {
            continue;
        }

        if (gegner.richtung === "rechts") {
            gegner.x += gegner.geschwindigkeit;
            if (gegner.x >= gegner.laufRechts) {
                gegner.richtung = "links";
            }
        }
        else {
            gegner.x -= gegner.geschwindigkeit;
            if (gegner.x <= gegner.laufLinks) {
                gegner.richtung = "rechts";
            }
        }

        gegner.element.style.left = (gegner.x - welt.status.kameraX) + "px";
        gegner.element.style.transform = gegner.richtung === "rechts" ? "scaleX(1)" : "scaleX(-1)";
    }
}

function verhindereGegnerUeberlappung(welt) {
    for (let i = 0; i < welt.listen.gegner.length; i++) {
        for (let j = i + 1; j < welt.listen.gegner.length; j++) {
            const a = welt.listen.gegner[i];
            const b = welt.listen.gegner[j];
            const beruehrung =
                a.x < b.x + GEGNER_BREITE &&
                a.x + GEGNER_BREITE > b.x &&
                Math.abs(a.y - b.y) < 50;

            if (beruehrung) {
                a.richtung = a.richtung === "rechts" ? "links" : "rechts";
                b.richtung = b.richtung === "rechts" ? "links" : "rechts";
                if (a.x < b.x) {
                    a.x -= 5;
                    b.x += 5;
                }
                else {
                    a.x += 5;
                    b.x -= 5;
                }
            }
        }
    }
}

export function pruefeGegnerKollision(welt) {
    const spieler = welt.status;

    for (let i = welt.listen.gegner.length - 1; i >= 0; i--) {
        const gegner = welt.listen.gegner[i];
        if (Date.now() < gegner.spawnSchutzBis) {
            continue;
        }

        const trifft =
            spieler.x + welt.CONFIG.SPIELER_BREITE > gegner.x
            &&
            spieler.x < gegner.x + GEGNER_BREITE
            &&
            spieler.y + welt.CONFIG.SPIELER_HOEHE > gegner.y
            &&
            spieler.y < gegner.y + GEGNER_HOEHE;

        if (trifft) {
            const vorherigerFuss =
                spieler.y +
                welt.CONFIG.SPIELER_HOEHE -
                spieler.geschwindigkeitY;

            const vonOben =
                spieler.geschwindigkeitY > 0
                &&
                vorherigerFuss <= gegner.y + 15;

            if (vonOben) {
                welt.status.spielZeit += 2;
                welt.status.geschwindigkeitY = welt.CONFIG.SPRUNG_KRAFT * 0.5;
                const element = gegner.element;
                element.style.transition = "transform 0.4s ease, opacity 0.4s ease";
                element.style.transform = "scaleY(0.05)";
                element.style.opacity = "0";

                setTimeout(() => {
                    if (element.parentNode) {
                        element.remove();
                    }
                },
                    400
                );
            }
            else {
                welt.status.spielZeit -= 1;
                if (welt.status.spielZeit < 0) {
                    welt.status.spielZeit = 0;
                }

                if (gegner.element.parentNode) {
                    gegner.element.remove();
                }
            }

            welt.listen.gegner.splice(i, 1);

            setTimeout(() => {
                if (!welt.status.spielBeendet) {
                    neuenGegnerErzeugen(welt);
                }
            },
                welt.CONFIG.GEGNER_RESPAWN
            );
        }
    }
}