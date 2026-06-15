// ==================================================
// Elemente aus dem HTML holen
// ==================================================

const spielfeld = document.getElementById("spielfeld");
const spieler = document.getElementById("spieler");


// ==================================================
// Bilder des Spielers
// HIER DEINE URLS EINTRAGEN
// ==================================================

const BILD_START = "/images/spieler_stand.png";

const BILD_LINKS_GEHEN = "/images/StickmangLaufenLinks.png";
const BILD_LINKS_STEHEN = "/images/StickmangSeitenansichtLinks.png";
const BILD_LINKS_SPRINGEN = "/images/StickmangSpringenLinks.png";

const BILD_RECHTS_GEHEN = "/images/StickmangLaufenRechts.png";
const BILD_RECHTS_STEHEN = "/images/StickmangSeitenansichtLiRechts.png";
const BILD_RECHTS_SPRINGEN = "/images/StickmangSpringenRechts.png";


// ==================================================
// Größen direkt aus dem CSS lesen
// ==================================================

const SPIELFELD_BREITE = spielfeld.clientWidth;
const SPIELER_BREITE = spieler.clientWidth;
const SPIELER_HOEHE = spieler.clientHeight;


// ==================================================
// Spielkonstanten
// ==================================================

const BODEN_Y = 550;
const LAUF_GESCHWINDIGKEIT = 5;
const SPRUNG_KRAFT = -20;
const SCHWERKRAFT = 1;


// ==================================================
// Plattformen
// ==================================================

const plattformen = [
    { x: 100, y: 300, breite: 160, hoehe: 20 },
    { x: 400, y: 450, breite: 200, hoehe: 20 },
    { x: 750, y: 300, breite: 130, hoehe: 20 }
];


// Plattformen erzeugen

for (let plattform of plattformen) {

    const element = document.createElement("div");

    element.classList.add("plattform");

    element.style.left = plattform.x + "px";
    element.style.top = plattform.y + "px";

    element.style.width = plattform.breite + "px";
    element.style.height = plattform.hoehe + "px";

    spielfeld.appendChild(element);
}


// ==================================================
// Spielerposition
// ==================================================

let x = 100;
let y = BODEN_Y;


// ==================================================
// Physik
// ==================================================

let geschwindigkeitY = 0;


// ==================================================
// Spielerstatus
// ==================================================

let istAmBoden = true;
let blickrichtung = "rechts";


// ==================================================
// Gedrückte Tasten
// ==================================================

let tasten = {};


// ==================================================
// Startbild setzen
// ==================================================

spieler.style.backgroundImage = `url("${BILD_START}")`;
spieler.style.backgroundSize = "contain";
spieler.style.backgroundRepeat = "no-repeat";
spieler.style.backgroundPosition = "center";


// ==================================================
// Tastatursteuerung
// ==================================================

document.addEventListener("keydown", (ereignis) => {

    tasten[ereignis.key] = true;

    if (ereignis.key === "ArrowUp" && istAmBoden) {

        geschwindigkeitY = SPRUNG_KRAFT;
        istAmBoden = false;

    }

});

document.addEventListener("keyup", (ereignis) => {

    tasten[ereignis.key] = false;

});


// ==================================================
// Spielerbild aktualisieren
// ==================================================

function aktualisiereSpielerBild() {

    // Springen links
    if (!istAmBoden && blickrichtung === "links") {

        spieler.style.backgroundImage =
            `url("${BILD_LINKS_SPRINGEN}")`;

        return;
    }

    // Springen rechts
    if (!istAmBoden && blickrichtung === "rechts") {

        spieler.style.backgroundImage =
            `url("${BILD_RECHTS_SPRINGEN}")`;

        return;
    }

    // Laufen links
    if (tasten["ArrowLeft"]) {

        spieler.style.backgroundImage =
            `url("${BILD_LINKS_GEHEN}")`;

        return;
    }

    // Laufen rechts
    if (tasten["ArrowRight"]) {

        spieler.style.backgroundImage =
            `url("${BILD_RECHTS_GEHEN}")`;

        return;
    }

    // Stehen links
    if (blickrichtung === "links") {

        spieler.style.backgroundImage =
            `url("${BILD_LINKS_STEHEN}")`;

        return;
    }

    // Stehen rechts

    spieler.style.backgroundImage =
        `url("${BILD_RECHTS_STEHEN}")`;
}


// ==================================================
// Spielschleife
// ==================================================

function spielSchleife() {

    // Rechts laufen
    if (tasten["ArrowRight"]) {

        x += LAUF_GESCHWINDIGKEIT;
        blickrichtung = "rechts";
    }

    // Links laufen
    if (tasten["ArrowLeft"]) {

        x -= LAUF_GESCHWINDIGKEIT;
        blickrichtung = "links";
    }

    // Linke Grenze
    if (x < 0) {
        x = 0;
    }

    // Rechte Grenze
    if (x > SPIELFELD_BREITE - SPIELER_BREITE) {
        x = SPIELFELD_BREITE - SPIELER_BREITE;
    }

    // Schwerkraft
    geschwindigkeitY += SCHWERKRAFT;
    y += geschwindigkeitY;

    let aufPlattform = false;

    const spielerUnterkante = y + SPIELER_HOEHE;
    const spielerOberkante = y;

    const spielerLinks = x;
    const spielerRechts = x + SPIELER_BREITE;

    // Plattformen prüfen
    for (let plattform of plattformen) {

        const beruehrtPlattformVonOben =
            spielerRechts > plattform.x &&
            spielerLinks < plattform.x + plattform.breite &&
            spielerUnterkante >= plattform.y &&
            spielerOberkante < plattform.y &&
            geschwindigkeitY > 0;

        if (beruehrtPlattformVonOben) {

            y = plattform.y - SPIELER_HOEHE;

            geschwindigkeitY = 0;

            istAmBoden = true;
            aufPlattform = true;

            break;
        }
    }

    // Bodenprüfung
    if (!aufPlattform && y >= BODEN_Y) {

        y = BODEN_Y;

        geschwindigkeitY = 0;

        istAmBoden = true;
    }

    // In der Luft
    if (!aufPlattform && y < BODEN_Y) {

        istAmBoden = false;
    }

    // Bild aktualisieren
    aktualisiereSpielerBild();

    // Spieler zeichnen
    spieler.style.left = x + "px";
    spieler.style.top = y + "px";

    requestAnimationFrame(spielSchleife);
}


// ==================================================
// Spiel starten
// ==================================================

spielSchleife();