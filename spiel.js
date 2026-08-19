import { erschaffeSpielWelt } from "./konstanten.js";
import {
    erstelleZufaelligePlattformen,
    aktualisiereEndlessPlattformen,
    animierePlattformen
} from "./plattformen.js";
import {
    initialisiereMuenzen,
    aktualisiereMuenzen,
    animiereMuenzen,
    pruefeMuenzenKollision,
    aktualisiereMuenzHinweis
} from "./muenzen.js";
import {
    aktualisiereGegner,
    bewegeGegner,
    pruefeGegnerKollision,
    aktualisiereUnverwundbarkeit
} from "./gegner.js";
import { holeLevel } from "./level.js";
import {
    speichereHighscore,
    zeigeStartHighscores,
    zeigeHighscoreListe,
    holeBestenwert
} from "./highscore.js";

const startBildschirm = document.getElementById("startBildschirm");
const spielBereich = document.getElementById("spielBereich");
const spielfeld = document.getElementById("spielfeld");
const levelAnzeige = document.getElementById("levelAnzeige");
const zeitAnzeige = document.getElementById("zeitAnzeige");
const zielAnzeige = document.getElementById("zielAnzeige");
const muenzAnzeige = document.getElementById("muenzAnzeige");
const gameOverBildschirm = document.getElementById("gameOverBildschirm");
const endTitel = document.getElementById("endTitel");
const endErgebnisText = document.getElementById("endErgebnisText");
const spielerNameInput = document.getElementById("spielerNameInput");
const speichernButton = document.getElementById("speichernButton");
const neustartButton = document.getElementById("neustartButton");
const startMenuButton = document.getElementById("startMenuButton");
const highscoreListe = document.getElementById("highscoreListe");

let welt = null;
let frameId = null;
let letzterZeitstempel = performance.now();
let aktuellesLevel = "leicht";
let spielBeendenAngezeigt = false;

function formatSekunden(wert) {
    return `${Math.max(0, wert).toFixed(1).replace(".", ",")}`;
}

function setzeSpielerBild() {
    const spielerElement = document.getElementById("spieler");

    if (!spielerElement || !welt) {
        return;
    }

    const bewegtSich =
        welt.status.spielGestartet &&
        (welt.listen.tasten.ArrowLeft || welt.listen.tasten.ArrowRight);

    const istInLuft = !welt.status.istAmBoden;
    let datei = "StickmanStandingStart.png";

    if (istInLuft) {
        datei =
            welt.status.blickrichtung === "rechts"
                ? "StickmangSpringenRechts.png"
                : "StickmangSpringenLinks.png";
    } else if (bewegtSich) {
        datei =
            welt.status.blickrichtung === "rechts"
                ? "StickmangLaufenRechts.png"
                : "StickmangLaufenLinks.png";
    } else if (welt.status.spielGestartet) {
        datei =
            welt.status.blickrichtung === "rechts"
                ? "StickmangSeitenansichtRechts.png"
                : "StickmangSeitenansichtLinks.png";
    }

    const neuerPfad = `url("./images/${datei}")`;

    if (spielerElement.style.backgroundImage !== neuerPfad) {
        spielerElement.style.backgroundImage = neuerPfad;
    }

    spielerElement.classList.toggle("spieler-laeuft", Boolean(bewegtSich && !istInLuft));
}

function setzeSpielerposition() {
    const spielerElement = document.getElementById("spieler");

    if (!spielerElement || !welt) {
        return;
    }

    spielerElement.style.left =
        `${welt.status.x - welt.status.kameraX}px`;
    spielerElement.style.top = `${welt.status.y}px`;
}

function aktualisiereAnzeigen() {
    if (!welt) {
        return;
    }

    const level = holeLevel(welt.status.levelId);
    levelAnzeige.textContent = level.name;

    if (welt.status.levelId === "schwer") {
        zeitAnzeige.textContent =
            `Zeit: ${formatSekunden(welt.status.restZeit)}`;
        zielAnzeige.textContent = "60 Sek.";
    } else if (welt.status.levelId === "mittel") {
        zeitAnzeige.textContent =
            `Zeit: ${formatSekunden(welt.status.spielZeit)}`;
        zielAnzeige.textContent = "Ziel: 100 Münzen";
    } else {
        zeitAnzeige.textContent =
            `Zeit: ${formatSekunden(welt.status.spielZeit)}`;
        zielAnzeige.textContent = "Ziel: 100 Münzen";
    }

    muenzAnzeige.textContent =
        `Münzen: ${welt.status.gesammelteMuenzen}`;
}

function entferneDynamischeElemente() {
    spielfeld
        .querySelectorAll(".plattform, .gegner, .muenze, #muenzenHinweis")
        .forEach(element => element.remove());

    const vorhandenerSpieler = document.getElementById("spieler");
    vorhandenerSpieler?.remove();

    const spielerElement = document.createElement("div");
    spielerElement.id = "spieler";
    spielfeld.appendChild(spielerElement);
}

function richteSpielfeldFuerSpielEin() {
    const spielerElement = document.getElementById("spieler");

    if (!spielerElement) {
        return;
    }

    spielerElement.className = "";
    spielerElement.style.backgroundImage =
        'url("./images/StickmanStandingStart.png")';
}

function renderBereitZustand() {
    if (!welt) {
        return;
    }

    welt.status.kameraX = 0;
    setzeSpielerBild();
    setzeSpielerposition();
    animierePlattformen(welt);
    animiereMuenzen(welt);
    aktualisiereAnzeigen();
    aktualisiereMuenzHinweis(welt);
}

function zeigeStartbildschirm() {
    if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
    }

    welt = null;
    spielBeendenAngezeigt = false;

    spielBereich.classList.add("versteckt");
    gameOverBildschirm.classList.add("versteckt");
    startBildschirm.classList.remove("versteckt");

    zeigeStartHighscores();
}

function spielStarten(levelId) {
    aktuellesLevel = levelId;
    spielBeendenAngezeigt = false;

    if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
    }

    welt = erschaffeSpielWelt(levelId);

    entferneDynamischeElemente();
    richteSpielfeldFuerSpielEin();

    startBildschirm.classList.add("versteckt");
    gameOverBildschirm.classList.add("versteckt");
    spielBereich.classList.remove("versteckt");

    erstelleZufaelligePlattformen(welt);
    initialisiereMuenzen(welt);

    welt.status.spielGestartet = false;
    welt.status.levelDaten.naechsterGegnerSpawn =
        performance.now() + welt.CONFIG.GEGNER_SPAWN_INTERVAL;

    letzterZeitstempel = performance.now();
    renderBereitZustand();
}

function starteEigentlichesSpiel() {
    if (!welt || welt.status.spielGestartet || welt.status.spielBeendet) {
        return;
    }

    welt.status.spielGestartet = true;
    letzterZeitstempel = performance.now();

    aktualisiereGegner(welt);
    setzeSpielerBild();
    frameId = requestAnimationFrame(spielSchleife);
}

function breiteHitbox(x = welt.status.x, y = welt.status.y) {
    return {
        links: x + welt.CONFIG.SPIELER_HITBOX_X,
        rechts:
            x +
            welt.CONFIG.SPIELER_HITBOX_X +
            welt.CONFIG.SPIELER_HITBOX_BREITE,
        oben: y + welt.CONFIG.SPIELER_HITBOX_Y,
        unten:
            y +
            welt.CONFIG.SPIELER_HITBOX_Y +
            welt.CONFIG.SPIELER_HITBOX_HOEHE
    };
}

function ermittleLinkeGrenze() {
    return 0;
}

function pruefePlattformKollision() {
    const aktuelleX = welt.status.x;
    const aktuelleY = welt.status.y;
    const vorherigeX = welt.status.vorherigesX;
    const vorherigeY = welt.status.vorherigesY;

    const hitboxBreite = welt.CONFIG.SPIELER_HITBOX_BREITE;
    const hitboxHoehe = welt.CONFIG.SPIELER_HITBOX_HOEHE;
    const hitboxOffsetX = welt.CONFIG.SPIELER_HITBOX_X;
    const hitboxOffsetY = welt.CONFIG.SPIELER_HITBOX_Y;

    const vorherLinks = vorherigeX + hitboxOffsetX;
    const vorherRechts = vorherLinks + hitboxBreite;
    const vorherOben = vorherigeY + hitboxOffsetY;
    const vorherUnten = vorherOben + hitboxHoehe;

    let x = aktuelleX;
    let y = aktuelleY;

    // 1. Zuerst horizontale Kollisionen behandeln.
    //    Dadurch kann der Spieler Plattformen weder von links noch
    //    von rechts durchlaufen.
    for (const plattform of welt.listen.plattformen) {
        const istBoden = plattform.typ === "boden";
        if (istBoden) continue;

        const plattformLinks = plattform.x;
        const plattformRechts = plattform.x + plattform.breite;
        const plattformOben = plattform.y;
        const plattformUnten = plattform.y + plattform.hoehe;

        const aktuellesLinks = x + hitboxOffsetX;
        const aktuellesRechts = aktuellesLinks + hitboxBreite;
        const aktuellesOben = y + hitboxOffsetY;
        const aktuellesUnten = aktuellesOben + hitboxHoehe;

        const vertikalUeberlappt =
            aktuellesUnten > plattformOben &&
            aktuellesOben < plattformUnten;

        if (!vertikalUeberlappt) continue;

        if (
            vorherRechts <= plattformLinks &&
            aktuellesRechts > plattformLinks
        ) {
            x = plattformLinks - hitboxOffsetX - hitboxBreite - 0.01;
        } else if (
            vorherLinks >= plattformRechts &&
            aktuellesLinks < plattformRechts
        ) {
            x = plattformRechts - hitboxOffsetX + 0.01;
        }
    }

    welt.status.x = x;

    // Aktuelle Hitbox nach der horizontalen Korrektur.
    const jetztLinks = x + hitboxOffsetX;
    const jetztRechts = jetztLinks + hitboxBreite;
    const jetztOben = y + hitboxOffsetY;
    const jetztUnten = jetztOben + hitboxHoehe;

    let landung = null;
    let deckenkollision = null;

    // 2. Vertikale Kollisionen.
    //    Von oben landen: nur wenn der Spieler im vorherigen Frame
    //    noch oberhalb der Plattform war und nach unten bewegt wurde.
    //    Von unten: ebenfalls stoppen. Dadurch kann man nicht durch
    //    eine Plattform nach oben hindurch springen.
    for (const plattform of welt.listen.plattformen) {
        const plattformLinks = plattform.x;
        const plattformRechts =
            plattform.x + plattform.breite;
        const plattformOben = plattform.y;
        const plattformUnten =
            plattform.y + plattform.hoehe;

        const horizontalUeberlappt =
            jetztRechts > plattformLinks &&
            jetztLinks < plattformRechts;

        if (!horizontalUeberlappt) continue;

        if (
            welt.status.geschwindigkeitY >= 0 &&
            vorherUnten <= plattformOben &&
            jetztUnten >= plattformOben
        ) {
            if (
                !landung ||
                plattformOben < landung.y
            ) {
                landung = plattform;
            }
            continue;
        }

        if (
            welt.status.geschwindigkeitY < 0 &&
            vorherOben >= plattformUnten &&
            jetztOben <= plattformUnten
        ) {
            if (
                !deckenkollision ||
                plattformUnten > deckenkollision.y
            ) {
                deckenkollision = plattform;
            }
        }
    }

    if (landung) {
        welt.status.y =
            landung.y - hitboxOffsetY - hitboxHoehe;

        welt.status.geschwindigkeitY = 0;
        welt.status.istAmBoden = true;
        return;
    }

    if (deckenkollision) {
        welt.status.y =
            deckenkollision.y - hitboxOffsetY;

        welt.status.geschwindigkeitY = 0.25;
        welt.status.istAmBoden = false;
        return;
    }

    const bodenY =
        welt.CONFIG.BODEN_Y - welt.CONFIG.SPIELER_HOEHE;

    if (
        welt.status.y >= bodenY &&
        welt.status.geschwindigkeitY >= 0
    ) {
        welt.status.y = bodenY;
        welt.status.geschwindigkeitY = 0;
        welt.status.istAmBoden = true;
        return;
    }

    welt.status.istAmBoden = false;
}

function ermittleLaufGeschwindigkeit() {
    if (!welt) {
        return 0;
    }

    return (
        welt.CONFIG.LAUF_GESCHWINDIGKEIT *
        welt.status.laufGeschwindigkeitsFaktor
    );
}

function bewegeSpieler() {
    welt.status.vorherigesX = welt.status.x;
    welt.status.vorherigesY = welt.status.y;

    const geschwindigkeit = ermittleLaufGeschwindigkeit();

    if (welt.listen.tasten.ArrowRight) {
        welt.status.x += geschwindigkeit;
        welt.status.blickrichtung = "rechts";
    }

    if (welt.listen.tasten.ArrowLeft) {
        welt.status.x -= geschwindigkeit;
        welt.status.blickrichtung = "links";
    }

    welt.status.x = Math.max(
        ermittleLinkeGrenze(),
        welt.status.x
    );

    welt.status.geschwindigkeitY += welt.CONFIG.SCHWERKRAFT;
    welt.status.y += welt.status.geschwindigkeitY;

    pruefePlattformKollision();
}

function aktualisiereKamera() {
    welt.status.kameraX = Math.max(
        0,
        welt.status.x - welt.CONFIG.SPIELFELD_BREITE / 2
    );
}

function aktualisiereLevelZeit(deltaZeit) {
    if (welt.status.levelId === "schwer") {
        welt.status.restZeit = Math.max(
            0,
            welt.status.restZeit - deltaZeit
        );

        if (welt.status.restZeit <= 0) {
            welt.status.spielBeendet = true;
            welt.status.spielGewonnen = true;
            welt.status.ergebnisGrund = "zeit-abgelaufen";
        }

        return;
    }

    welt.status.spielZeit = Math.max(
        0,
        welt.status.spielZeit + deltaZeit
    );
}

function aktualisiereHintergrund() {
    const versatz = -(welt.status.kameraX * 0.15);
    spielfeld.style.backgroundPosition = `${versatz}px 0px`;
}

function formatiereEnde() {
    const level = holeLevel(welt.status.levelId);
    const zeit =
        welt.status.levelId === "schwer"
            ? welt.CONFIG.LEVEL_SCHWER_ZEIT - welt.status.restZeit
            : welt.status.spielZeit;

    if (welt.status.levelId === "leicht") {
        endTitel.textContent =
            welt.status.spielGewonnen
                ? "100 Münzen geschafft!"
                : "Level beendet";

        endErgebnisText.textContent =
            `Du hast ${welt.status.gesammelteMuenzen} Münzen gesammelt und ${formatSekunden(zeit)} Sekunden benötigt.`;
    } else if (welt.status.levelId === "mittel") {
        if (welt.status.ergebnisGrund === "alle-muenzen") {
            endTitel.textContent = "Alle 100 Münzen!";
        } else {
            endTitel.textContent = "Die Zeit der Münzen ist vorbei";
        }

        endErgebnisText.textContent =
            `Du hast ${welt.status.gesammelteMuenzen} Münzen in ${formatSekunden(zeit)} Sekunden eingesammelt.`;
    } else {
        endTitel.textContent = "Zeit abgelaufen!";
        endErgebnisText.textContent =
            `Du hast ${welt.status.gesammelteMuenzen} Münzen in ${formatSekunden(zeit)} Sekunden gesammelt.`;
    }

    zeigeHighscoreListe(level.id, highscoreListe);
}

function spielBeenden() {
    if (
        !welt ||
        !welt.status.spielBeendet ||
        spielBeendenAngezeigt
    ) {
        return;
    }

    spielBeendenAngezeigt = true;

    if (frameId) {
        cancelAnimationFrame(frameId);
        frameId = null;
    }

    const level = holeLevel(welt.status.levelId);
    const zeit =
        level.id === "schwer"
            ? welt.CONFIG.LEVEL_SCHWER_ZEIT - welt.status.restZeit
            : welt.status.spielZeit;
    const bestwert = holeBestenwert(level.id);

    spielBereich.classList.add("versteckt");
    gameOverBildschirm.classList.remove("versteckt");

    spielerNameInput.value = "";
    formatiereEnde();

    let istBestwert = false;

    if (level.id === "schwer") {
        istBestwert =
            !bestwert ||
            welt.status.gesammelteMuenzen > bestwert.muenzen ||
            (
                welt.status.gesammelteMuenzen === bestwert.muenzen &&
                zeit < bestwert.zeit
            );
    } else if (level.id === "mittel") {
        istBestwert =
            welt.status.spielGewonnen &&
            (
                !bestwert ||
                zeit < bestwert.zeit
            );
    } else {
        istBestwert =
            welt.status.spielGewonnen &&
            (!bestwert || zeit < bestwert.zeit);
    }

    speichernButton.disabled = !istBestwert;
    speichernButton.textContent =
        istBestwert ? "Highscore speichern" : "Kein neuer Highscore";
}

function spielSchleife(jetzt) {
    if (!welt || welt.status.spielBeendet) {
        spielBeenden();
        return;
    }

    const deltaZeit = Math.min(
        0.05,
        Math.max(0, (jetzt - letzterZeitstempel) / 1000)
    );

    letzterZeitstempel = jetzt;

    aktualisiereLevelZeit(deltaZeit);

    if (welt.status.spielBeendet) {
        spielBeenden();
        return;
    }

    bewegeSpieler();
    aktualisiereEndlessPlattformen(welt);
    aktualisiereKamera();

    aktualisiereMuenzen(welt);
    aktualisiereGegner(welt);
    bewegeGegner(welt);

    pruefeMuenzenKollision(welt);
    pruefeGegnerKollision(welt);
    aktualisiereUnverwundbarkeit(welt);

    if (
        welt.status.levelId === "leicht" &&
        welt.status.gesammelteMuenzen >= welt.CONFIG.LEVEL_LEICHT_ZIEL
    ) {
        welt.status.spielBeendet = true;
        welt.status.spielGewonnen = true;
        welt.status.ergebnisGrund = "ziel-erreicht";
    }

    if (welt.status.spielBeendet) {
        spielBeenden();
        return;
    }

    animierePlattformen(welt);
    animiereMuenzen(welt);
    aktualisiereMuenzHinweis(welt);
    setzeSpielerBild();
    setzeSpielerposition();
    aktualisiereAnzeigen();
    aktualisiereHintergrund();

    frameId = requestAnimationFrame(spielSchleife);
}

function tastendruckStartetSpiel(event) {
    if (
        !welt ||
        welt.status.spielBeendet ||
        !["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.key)
    ) {
        return;
    }

    event.preventDefault();

    if (!welt.status.spielGestartet) {
        welt.listen.tasten[event.key] = true;
        starteEigentlichesSpiel();

        if (event.key === "ArrowUp" || event.key === " ") {
            welt.status.geschwindigkeitY = welt.CONFIG.SPRUNG_KRAFT;
            welt.status.istAmBoden = false;
        }

        return;
    }

    welt.listen.tasten[event.key] = true;

    if (
        (event.key === "ArrowUp" || event.key === " ") &&
        welt.status.istAmBoden
    ) {
        welt.status.geschwindigkeitY = welt.CONFIG.SPRUNG_KRAFT;
        welt.status.istAmBoden = false;
    }
}

window.addEventListener("keydown", tastendruckStartetSpiel);

window.addEventListener("keyup", event => {
    if (!welt) {
        return;
    }

    welt.listen.tasten[event.key] = false;
});

document.querySelectorAll(".levelStartButton").forEach(button => {
    button.addEventListener("click", () => {
        spielStarten(button.dataset.level);
    });
});

speichernButton.addEventListener("click", () => {
    if (!welt || speichernButton.disabled) {
        return;
    }

    const name = spielerNameInput.value.trim() || "Spieler";
    const zeit =
        welt.status.levelId === "schwer"
            ? welt.CONFIG.LEVEL_SCHWER_ZEIT - welt.status.restZeit
            : welt.status.spielZeit;

    speichereHighscore(
        welt.status.levelId,
        name,
        welt.status.gesammelteMuenzen,
        zeit
    );

    speichernButton.disabled = true;
    speichernButton.textContent = "Gespeichert";

    zeigeHighscoreListe(welt.status.levelId, highscoreListe);
    zeigeStartHighscores();
});

neustartButton.addEventListener("click", () => {
    spielStarten(aktuellesLevel);
});

startMenuButton.addEventListener("click", () => {
    zeigeStartbildschirm();
});

richteSpielfeldFuerSpielEin();
zeigeStartbildschirm();
