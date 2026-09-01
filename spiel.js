import { erschaffeSpielWelt } from "./konstanten.js";
import { holeLevel } from "./level.js";
import { erstelleSpielerElement, setzeSpielerDarstellung, setzeSpielerposition } from "./spieler.js";
import { erstelleZufaelligePlattformen, aktualisiereEndlessPlattformen, animierePlattformen } from "./plattformen.js";
import { initialisiereMuenzen, aktualisiereMuenzen, animiereMuenzen, pruefeMuenzenKollision, aktualisiereMuenzHinweis, bereinigeVerschwundeneMuenzen } from "./muenzen.js";
import { aktualisiereGegner, bewegeGegner, pruefeGegnerKollision, aktualisiereUnverwundbarkeit } from "./gegner.js";
import { speichereHighscore, zeigeStartHighscores, zeigeHighscoreListe, holeBestenwert } from "./highscore.js";
import { initialisiereSteuerung, setzeMobileSteuerungSichtbarkeit } from "./steuerung.js";

const startBildschirm = document.getElementById("startBildschirm");
const spielBereich = document.getElementById("spielBereich");
const spielfeld = document.getElementById("spielfeld");
const spielfeldHuelle = document.getElementById("spielfeldHuelle");
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
let frameId = 0;
let aktuellesLevel = "leicht";
let spielBeendenAngezeigt = false;

function passeSpielfeldAn() {
    if (!spielfeld || !spielfeldHuelle || !welt) return;
    const basisBreite = welt.CONFIG.SPIELFELD_BREITE;
    const basisHoehe = welt.CONFIG.SPIELFELD_HOEHE;
    const verfuegbareBreite = Math.max(1, spielfeldHuelle.clientWidth);
    const verfuegbareHoehe = Math.max(1, spielfeldHuelle.clientHeight);
    const scale = Math.min(verfuegbareBreite / basisBreite, verfuegbareHoehe / basisHoehe);
    const sichererScale = Math.max(0.35, Math.min(1.15, scale));
    spielfeld.style.setProperty("--game-scale", String(sichererScale));
    spielfeldHuelle.style.setProperty("--game-scale", String(sichererScale));
}

function formatSekunden(wert) {
    return Math.max(0, Number(wert) || 0).toFixed(1).replace(".", ",");
}

function entferneAlteObjekte() {
    spielfeld.querySelectorAll(".plattform, .gegner, .muenze, #muenzenHinweis, #spieler").forEach(e => e.remove());
}

function richteSpielfeldEin(levelId) {
    spielfeld.className = `level-${levelId}`;
    const spieler = erstelleSpielerElement();
    spielfeld.appendChild(spieler);
}

function breiteHitbox(welt, x = welt.status.x, y = welt.status.y) {
    return {
        links: x + welt.CONFIG.SPIELER_HITBOX_X,
        rechts: x + welt.CONFIG.SPIELER_HITBOX_X + welt.CONFIG.SPIELER_HITBOX_BREITE,
        oben: y + welt.CONFIG.SPIELER_HITBOX_Y,
        unten: y + welt.CONFIG.SPIELER_HITBOX_Y + welt.CONFIG.SPIELER_HITBOX_HOEHE
    };
}

function pruefePlattformKollision() {
    if (!welt) return;

    const cfg = welt.CONFIG;
    let x = welt.status.x;
    let y = welt.status.y;
    const vorherX = welt.status.vorherigesX;
    const vorherY = welt.status.vorherigesY;
    const vorher = breiteHitbox(welt, vorherX, vorherY);

    for (const p of welt.listen.plattformen) {
        if (p.typ === "boden") continue;
        const links = x + cfg.SPIELER_HITBOX_X;
        const rechts = links + cfg.SPIELER_HITBOX_BREITE;
        const oben = y + cfg.SPIELER_HITBOX_Y;
        const unten = oben + cfg.SPIELER_HITBOX_HOEHE;
        if (unten <= p.y || oben >= p.y + p.hoehe) continue;

        if (vorher.rechts <= p.x && rechts > p.x) x = p.x - cfg.SPIELER_HITBOX_X - cfg.SPIELER_HITBOX_BREITE - 0.01;
        else if (vorher.links >= p.x + p.breite && links < p.x + p.breite) x = p.x + p.breite - cfg.SPIELER_HITBOX_X + 0.01;
    }

    welt.status.x = Math.max(0, x);
    const jetzt = breiteHitbox(welt, welt.status.x, y);
    let landung = null;
    let decke = null;

    for (const p of welt.listen.plattformen) {
        if (jetzt.rechts <= p.x || jetzt.links >= p.x + p.breite) continue;

        if (welt.status.geschwindigkeitY >= 0 && vorher.unten <= p.y && jetzt.unten >= p.y) {
            if (!landung || p.y < landung.y) landung = p;
        } else if (welt.status.geschwindigkeitY < 0 && vorher.oben >= p.y + p.hoehe && jetzt.oben <= p.y + p.hoehe) {
            if (!decke || p.y + p.hoehe > decke.y + decke.hoehe) decke = p;
        }
    }

    if (landung) {
        welt.status.y = landung.y - cfg.SPIELER_HITBOX_Y - cfg.SPIELER_HITBOX_HOEHE;
        welt.status.geschwindigkeitY = 0;
        welt.status.istAmBoden = true;
        welt.status.aktuellePlattform = landung;
        return;
    }

    if (decke) {
        welt.status.y = decke.y + decke.hoehe - cfg.SPIELER_HITBOX_Y;
        welt.status.geschwindigkeitY = 0.3;
        welt.status.istAmBoden = false;
        return;
    }

    const bodenY = cfg.BODEN_Y - cfg.SPIELER_HOEHE;
    if (welt.status.y >= bodenY && welt.status.geschwindigkeitY >= 0) {
        welt.status.y = bodenY;
        welt.status.geschwindigkeitY = 0;
        welt.status.istAmBoden = true;
        welt.status.aktuellePlattform = welt.listen.plattformen.find(p => p.typ === "boden") || null;
        return;
    }

    welt.status.istAmBoden = false;
    welt.status.aktuellePlattform = null;
}

function bewegeSpieler(delta) {
    const cfg = welt.CONFIG;
    welt.status.vorherigesX = welt.status.x;
    welt.status.vorherigesY = welt.status.y;

    const richtung = (welt.listen.tasten.ArrowRight ? 1 : 0) - (welt.listen.tasten.ArrowLeft ? 1 : 0);
    if (richtung !== 0) {
        welt.status.x += richtung * cfg.LAUF_GESCHWINDIGKEIT * welt.status.laufGeschwindigkeitsFaktor;
        welt.status.blickrichtung = richtung > 0 ? "rechts" : "links";
        welt.status.laufPhase += delta * 14;
    } else {
        welt.status.laufPhase += delta * 2;
    }

    welt.status.x = Math.max(0, Math.min(cfg.MAX_WELT_BREITE - cfg.SPIELER_BREITE, welt.status.x));
    welt.status.geschwindigkeitY += cfg.SCHWERKRAFT;
    welt.status.geschwindigkeitY = Math.min(22, welt.status.geschwindigkeitY);
    welt.status.y += welt.status.geschwindigkeitY;

    pruefePlattformKollision();
}

function aktualisiereKamera() {
    const ziel = welt.status.x - welt.CONFIG.SPIELFELD_BREITE * 0.42;
    welt.status.kameraX = Math.max(0, Math.min(welt.CONFIG.MAX_WELT_BREITE - welt.CONFIG.SPIELFELD_BREITE, ziel));
}

function aktualisiereZeit(delta) {
    if (welt.status.levelId === "schwer") {
        welt.status.restZeit = Math.max(0, welt.status.restZeit - delta);
        if (welt.status.restZeit <= 0) beendeSpiel(true, "zeit-abgelaufen");
    } else {
        welt.status.spielZeit += delta;
    }
}

function aktualisiereAnzeige() {
    if (!welt) return;
    const level = holeLevel(welt.status.levelId);
    levelAnzeige.textContent = level.name;
    if (welt.status.levelId === "schwer") {
        zeitAnzeige.textContent = `Zeit: ${formatSekunden(welt.status.restZeit)}`;
        zielAnzeige.textContent = "Ziel: 60 Sek.";
    } else {
        zeitAnzeige.textContent = `Zeit: ${formatSekunden(welt.status.spielZeit)}`;
        zielAnzeige.textContent = welt.status.levelId === "mittel" ? "Ziel: 100 Münzen" : "Ziel: 100 Münzen";
    }
    muenzAnzeige.textContent = `Münzen: ${welt.status.gesammelteMuenzen}`;
}

function pruefeLevelziel() {
    if (!welt || welt.status.spielBeendet) return;
    if (welt.status.levelId === "leicht" && welt.status.gesammelteMuenzen >= welt.CONFIG.zielMuenzen) beendeSpiel(true, "ziel-erreicht");
    if (welt.status.levelId === "mittel" && welt.status.gesammelteMuenzen >= welt.CONFIG.zielMuenzen) beendeSpiel(true, "alle-muenzen");
}

function spielStarten(levelId) {
    aktuellesLevel = levelId;
    spielBeendenAngezeigt = false;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    welt = erschaffeSpielWelt(levelId);

    entferneAlteObjekte();
    richteSpielfeldEin(levelId);
    startBildschirm.classList.add("versteckt");
    gameOverBildschirm.classList.add("versteckt");
    spielBereich.classList.remove("versteckt");

    erstelleZufaelligePlattformen(welt, spielfeld);
    initialisiereMuenzen(welt, spielfeld);
    animierePlattformen(welt);
    animiereMuenzen(welt);
    setzeSpielerDarstellung(welt);
    setzeSpielerposition(welt);
    aktualisiereAnzeige();
    aktualisiereMuenzHinweis(welt);
    passeSpielfeldAn();
    setzeMobileSteuerungSichtbarkeit();
}

function starteEigentlichesSpiel() {
    if (!welt || welt.status.spielGestartet || welt.status.spielBeendet) return;
    welt.status.spielGestartet = true;
    welt.status.letzterFrame = performance.now();
    welt.status.levelDaten.naechsterGegnerSpawn = performance.now() + welt.CONFIG.gegnerIntervall;
    frameId = requestAnimationFrame(spielSchleife);
}

function springe() {
    if (!welt || !welt.status.spielGestartet || !welt.status.istAmBoden || welt.status.spielBeendet) return;
    welt.status.geschwindigkeitY = welt.CONFIG.SPRUNG_KRAFT;
    welt.status.istAmBoden = false;
}

function beendeSpiel(gewonnen, grund) {
    if (!welt || welt.status.spielBeendet) return;
    welt.status.spielBeendet = true;
    welt.status.spielGewonnen = gewonnen;
    welt.status.ergebnisGrund = grund;
}

function sichereFehlerbehandlung() {
    if (!welt || welt.status.fehler) return;
    welt.status.fehler = true;
    welt.status.spielBeendet = true;
    welt.status.spielGewonnen = false;
    welt.status.ergebnisGrund = "sicherheitsstopp";
}

function formatiereEnde() {
    const level = holeLevel(welt.status.levelId);
    const zeit = welt.status.levelId === "schwer" ? welt.CONFIG.zeitLimit - welt.status.restZeit : welt.status.spielZeit;
    if (welt.status.ergebnisGrund === "sicherheitsstopp") {
        endTitel.textContent = "Spiel sicher angehalten";
        endErgebnisText.textContent = `Gesammelt: ${welt.status.gesammelteMuenzen} Münzen.`;
    } else if (level.id === "leicht") {
        endTitel.textContent = welt.status.spielGewonnen ? "100 Münzen geschafft!" : "Level beendet";
        endErgebnisText.textContent = `Du hast ${welt.status.gesammelteMuenzen} Münzen gesammelt und ${formatSekunden(zeit)} Sekunden benötigt.`;
    } else if (level.id === "mittel") {
        endTitel.textContent = welt.status.spielGewonnen ? "Alle 100 Münzen!" : "Die Münzen sind weg";
        endErgebnisText.textContent = `Du hast ${welt.status.gesammelteMuenzen} Münzen in ${formatSekunden(zeit)} Sekunden eingesammelt.`;
    } else {
        endTitel.textContent = "Zeit abgelaufen!";
        endErgebnisText.textContent = `Du hast ${welt.status.gesammelteMuenzen} Münzen in ${formatSekunden(zeit)} Sekunden gesammelt.`;
    }
    zeigeHighscoreListe(level.id, highscoreListe);
}

function zeigeErgebnis() {
    if (!welt || spielBeendenAngezeigt) return;
    spielBeendenAngezeigt = true;
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    spielBereich.classList.add("versteckt");
    gameOverBildschirm.classList.remove("versteckt");
    spielerNameInput.value = "";
    formatiereEnde();

    const level = holeLevel(welt.status.levelId);
    const zeit = level.id === "schwer" ? welt.CONFIG.zeitLimit - welt.status.restZeit : welt.status.spielZeit;
    const best = holeBestenwert(level.id);
    const neuerHighscore = level.id === "schwer"
        ? !best || welt.status.gesammelteMuenzen > best.muenzen || (welt.status.gesammelteMuenzen === best.muenzen && zeit < best.zeit)
        : welt.status.spielGewonnen && (!best || zeit < best.zeit);
    speichernButton.disabled = !neuerHighscore;
    speichernButton.textContent = neuerHighscore ? "Highscore speichern" : "Kein neuer Highscore";
}

function spielSchleife(jetzt) {
    if (!welt || welt.status.spielBeendet) {
        zeigeErgebnis();
        return;
    }

    try {
        const rawDelta = (jetzt - welt.status.letzterFrame) / 1000;
        const delta = Math.max(0, Math.min(welt.CONFIG.MAX_DELTA, rawDelta || 0));
        welt.status.letzterFrame = jetzt;

        aktualisiereZeit(delta);
        if (welt.status.spielBeendet) {
            zeigeErgebnis();
            return;
        }

        animierePlattformen(welt);
        bewegeSpieler(delta);
        aktualisiereEndlessPlattformen(welt, spielfeld);
        aktualisiereKamera();
        aktualisiereMuenzen(welt, spielfeld);
        aktualisiereGegner(welt, spielfeld);
        bewegeGegner(welt);
        pruefeMuenzenKollision(welt);
        pruefeGegnerKollision(welt);
        aktualisiereUnverwundbarkeit(welt);
        bereinigeVerschwundeneMuenzen(welt);
        pruefeLevelziel();

        if (welt.status.spielBeendet) {
            zeigeErgebnis();
            return;
        }

        animierePlattformen(welt);
        animiereMuenzen(welt);
        setzeSpielerDarstellung(welt);
        setzeSpielerposition(welt);
        aktualisiereMuenzHinweis(welt);
        aktualisiereAnzeige();
        spielfeld.style.backgroundPosition = `${-(welt.status.kameraX * 0.15)}px 0px`;

        frameId = requestAnimationFrame(spielSchleife);
    } catch (error) {
        console.error("Spielschleife beendet:", error);
        sichereFehlerbehandlung();
        zeigeErgebnis();
    }
}

function tastendruck(event) {
    if (!welt || welt.status.spielBeendet) return;
    if (!["ArrowLeft", "ArrowRight", "ArrowUp", " "].includes(event.key)) return;
    event.preventDefault();
    if (!welt.status.spielGestartet) starteEigentlichesSpiel();
    welt.listen.tasten[event.key] = true;
    if (event.key === "ArrowUp" || event.key === " ") springe();
}

window.addEventListener("keydown", tastendruck);
window.addEventListener("keyup", event => {
    if (welt) welt.listen.tasten[event.key] = false;
});
window.addEventListener("resize", () => {
    passeSpielfeldAn();
    setzeMobileSteuerungSichtbarkeit();
});

window.addEventListener("orientationchange", () => {
    window.setTimeout(() => {
        passeSpielfeldAn();
        setzeMobileSteuerungSichtbarkeit();
    }, 120);
});

window.addEventListener("blur", () => {
    if (!welt) return;
    welt.listen.tasten = Object.create(null);
});
window.addEventListener("error", event => {
    if (welt?.status.spielGestartet && !welt.status.spielBeendet) {
        console.error(event.error || event.message);
        sichereFehlerbehandlung();
    }
});
window.addEventListener("unhandledrejection", event => {
    if (welt?.status.spielGestartet && !welt.status.spielBeendet) {
        console.error(event.reason);
        sichereFehlerbehandlung();
    }
});

document.querySelectorAll(".levelStartButton").forEach(button => button.addEventListener("click", () => spielStarten(button.dataset.level)));

speichernButton.addEventListener("click", () => {
    if (!welt || speichernButton.disabled) return;
    const name = spielerNameInput.value.trim() || "Spieler";
    const zeit = welt.status.levelId === "schwer" ? welt.CONFIG.zeitLimit - welt.status.restZeit : welt.status.spielZeit;
    speichereHighscore(welt.status.levelId, name, welt.status.gesammelteMuenzen, zeit);
    speichernButton.disabled = true;
    speichernButton.textContent = "Gespeichert";
    zeigeHighscoreListe(welt.status.levelId, highscoreListe);
    initialisiereSteuerung(() => welt, () => starteEigentlichesSpiel(), springe);
    zeigeStartHighscores();
    setzeMobileSteuerungSichtbarkeit();

    if ("serviceWorker" in navigator && (location.protocol === "https:" || location.hostname === "localhost")) {
        navigator.serviceWorker.register("./sw.js").catch(() => { });
    }
});

neustartButton.addEventListener("click", () => spielStarten(aktuellesLevel));
startMenuButton.addEventListener("click", () => {
    if (frameId) cancelAnimationFrame(frameId);
    frameId = 0;
    welt = null;
    spielBeendenAngezeigt = false;
    entferneAlteObjekte();
    spielBereich.classList.add("versteckt");
    gameOverBildschirm.classList.add("versteckt");
    startBildschirm.classList.remove("versteckt");
    zeigeStartHighscores();
});

zeigeStartHighscores();
