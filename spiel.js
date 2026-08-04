import { erschaffeSpielWelt } from "./konstanten.js";
import {
    initialisierePlattformen,
    erstelleZufaelligePlattformen,
    animierePlattformen,
    aktualisiereEndlessPlattformen
} from "./plattformen.js";
import {
    neueMuenzeErzeugen,
    animiereMuenzen,
    pruefeMuenzenKollision,
    aktualisiereMuenzen
} from "./muenzen.js";
import {
    neuenGegnerErzeugen,
    bewegeGegner,
    pruefeGegnerKollision,
    aktualisiereGegner
} from "./gegner.js";
import {
    speichereHighscore,
    zeigeHighscore
} from "./highscore.js";

const spielfeld = document.getElementById("spielfeld");
const zeitAnzeige = document.getElementById("zeitAnzeige");
const muenzAnzeige = document.getElementById("muenzAnzeige");
const gameOverBildschirm = document.getElementById("gameOverBildschirm");
const endErgebnisText = document.getElementById("endErgebnisText");
const spielerNameInput = document.getElementById("spielerNameInput");
const speichernButton = document.getElementById("speichernButton");
const neustartButton = document.getElementById("neustartButton");

let welt;
let letzterZeitstempel = performance.now();

function aktualisiereZeitAnzeige() {
    zeitAnzeige.innerText = "Zeit: " + Math.max(0, Math.ceil(welt.status.spielZeit));
}

function aktualisiereMuenzenAnzeige() {
    muenzAnzeige.innerText = "Münzen: " + welt.status.gesammelteMuenzen;
}

function aktualisiereSpielerBild() {
    const spieler = document.getElementById("spieler");
    if (!spieler)
        return;

    spieler.style.transform = welt.status.blickrichtung === "links" ? "scaleX(-1)" : "scaleX(1)";
}

function spielStarten() {
    spielfeld.innerHTML = '<div id="spieler"></div>';
    welt = erschaffeSpielWelt();
    gameOverBildschirm.classList.add("versteckt");
    erstelleZufaelligePlattformen(welt);
    initialisierePlattformen(welt);

    for (let i = 0; i < 5; i++) {
        neuenGegnerErzeugen(welt);
    }

    for (let i = 0; i < 8; i++) {
        neueMuenzeErzeugen(welt);
    }

    spielfeld.style.backgroundSize = welt.CONFIG.WELT_BREITE + "px 100%";

    letzterZeitstempel = performance.now();

    requestAnimationFrame(spielSchleife);
}

spielfeld.style.background = `
linear-gradient(
to right,
#6090d9 0%,
#729cdb 33%,
#4c6fa0 66%,
#30475e 100%
)
`;

spielfeld.style.backgroundRepeat = "no-repeat";

window.addEventListener("keydown", (event) => {
    if (!welt)
        return;

    welt.listen.tasten[event.key] = true;

    if (event.key === "ArrowUp" && welt.status.istAmBoden) {
        welt.status.geschwindigkeitY = welt.CONFIG.SPRUNG_KRAFT;
        welt.status.istAmBoden = false;
    }
}
);

window.addEventListener("keyup", (event) => {
    if (!welt)
        return;

    welt.listen.tasten[event.key] = false;
}
);

function spielBeenden() {
    welt.status.spielBeendet = true;
    endErgebnisText.innerText =
        `Du hast ${welt.status.gesammelteMuenzen} Münzen gesammelt!`;
    zeigeHighscore();
    gameOverBildschirm.classList.remove("versteckt");
}

speichernButton.addEventListener("click", () => {
    const name = spielerNameInput.value.trim() || "Spieler";
    speichereHighscore(name, welt.status.gesammelteMuenzen);
    zeigeHighscore();
    spielerNameInput.value = "";
}
);

neustartButton.addEventListener("click", () => {
    spielStarten();
}
);

function pruefePlattformKollision() {
    let stehtAufPlattform = false;
    const sLinks = welt.status.x;
    const sRechts = welt.status.x + welt.CONFIG.SPIELER_BREITE;
    const sUnten = welt.status.y + welt.CONFIG.SPIELER_HOEHE;
    const vorherigesUnten = sUnten - welt.status.geschwindigkeitY;

    for (const p of welt.listen.plattformen) {
        const pLinks = p.x;
        const pRechts = p.x + p.breite;
        const pOben = p.y;

        if (sRechts > pLinks && sLinks < pRechts) {
            if (vorherigesUnten <= pOben + 5 && sUnten >= pOben && welt.status.geschwindigkeitY >= 0) {
                welt.status.y = pOben - welt.CONFIG.SPIELER_HOEHE;
                welt.status.geschwindigkeitY = 0;
                welt.status.istAmBoden = true;
                stehtAufPlattform = true;
                break;
            }
        }
    }

    if (!stehtAufPlattform) {
        welt.status.istAmBoden = false;
    }
}

function ermittleLinkeWeltGrenze() {
    let linkestePlattform = Infinity;

    for (const p of welt.listen.plattformen) {
        if (p.typ === "boden") {
            continue;
        }

        if (p.x < linkestePlattform) {
            linkestePlattform = p.x;
        }
    }

    if (linkestePlattform === Infinity) {
        return 0;
    }

    return Math.max(0, linkestePlattform - 100);


}

function spielSchleife(jetzt) {
    if (welt.status.spielBeendet)
        return;
    const deltaZeit = (jetzt - letzterZeitstempel) / 1000;
    letzterZeitstempel = jetzt;

    if (deltaZeit > 0 && deltaZeit < 1) {
        welt.status.spielZeit -= deltaZeit;

        if (welt.status.spielZeit <= 0) {
            welt.status.spielZeit = 0;
            spielBeenden();
            return;
        }
    }

    if (welt.listen.tasten.ArrowRight) {
        welt.status.x += welt.CONFIG.LAUF_GESCHWINDIGKEIT;
        welt.status.blickrichtung = "rechts";
    }

    if (welt.listen.tasten.ArrowLeft) {
        welt.status.x -= welt.CONFIG.LAUF_GESCHWINDIGKEIT;
        welt.status.blickrichtung = "links";
    }

    const linkeGrenze = ermittleLinkeWeltGrenze();

    if (welt.status.x < linkeGrenze) {
        welt.status.x = linkeGrenze;
    }

    const rechteGrenze = welt.CONFIG.WELT_BREITE - welt.CONFIG.SPIELER_BREITE;

    if (welt.status.x > rechteGrenze) {
        welt.status.x = rechteGrenze;
    }

    welt.status.geschwindigkeitY += welt.CONFIG.SCHWERKRAFT;
    welt.status.y += welt.status.geschwindigkeitY;

    pruefePlattformKollision();

    welt.status.kameraX = welt.status.x - welt.CONFIG.SPIELFELD_BREITE / 2;
    const kameraLinkeGrenze = linkeGrenze - welt.CONFIG.SPIELFELD_BREITE / 2;

    if (welt.status.kameraX < kameraLinkeGrenze) {
        welt.status.kameraX = kameraLinkeGrenze;
    }

    if (welt.status.kameraX < 0) {
        welt.status.kameraX = 0;
    }

    if (welt.status.kameraX > welt.CONFIG.WELT_BREITE - welt.CONFIG.SPIELFELD_BREITE) {
        welt.status.kameraX = welt.CONFIG.WELT_BREITE - welt.CONFIG.SPIELFELD_BREITE;
    }

    spielfeld.style.backgroundPositionX = -welt.status.kameraX + "px";

    aktualisiereEndlessPlattformen(welt);
    aktualisiereMuenzen(welt);
    aktualisiereGegner(welt);
    bewegeGegner(welt);
    animiereMuenzen(welt);
    animierePlattformen(welt);
    pruefeMuenzenKollision(welt);
    pruefeGegnerKollision(welt);

    const spieler = document.getElementById("spieler");

    if (spieler) {
        aktualisiereSpielerBild();
        spieler.style.left = (welt.status.x - welt.status.kameraX) + "px";
        spieler.style.top = welt.status.y + "px";
    }

    aktualisiereZeitAnzeige();
    aktualisiereMuenzenAnzeige();
    requestAnimationFrame(spielSchleife);
}

spielStarten();