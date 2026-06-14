// Elemente aus dem HTML holen
const spielfeld = document.getElementById("spielfeld");
const spieler = document.getElementById("spieler");

// Größen direkt aus dem CSS lesen
const SPIELFELD_BREITE = spielfeld.clientWidth;
const SPIELER_BREITE = spieler.clientWidth;
const SPIELER_HOEHE = spieler.clientHeight;

// Spielkonstanten
const BODEN_Y = 550;
const LAUF_GESCHWINDIGKEIT = 5;
const SPRUNG_KRAFT = -20;
const SCHWERKRAFT = 1;

// Plattformen
const plattformen = [
    { x: 100, y: 450, breite: 150, hoehe: 20 },
    { x: 400, y: 350, breite: 200, hoehe: 20 },
    { x: 750, y: 250, breite: 120, hoehe: 20 }
];
for (let plattform of plattformen) {

    const element = document.createElement("div");

    element.classList.add("plattform");

    element.style.left = plattform.x + "px";
    element.style.top = plattform.y + "px";

    element.style.width = plattform.breite + "px";
    element.style.height = plattform.hoehe + "px";

    spielfeld.appendChild(element);
}
// Spielerposition
let x = 100;
let y = BODEN_Y;

// Physik
let geschwindigkeitY = 0;

// Spielerstatus
let istAmBoden = true;

// Gedrückte Tasten
let tasten = {};


// ====================
// Tastatursteuerung
// ====================

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


// ====================
// Spielschleife
// ====================

function spielSchleife() {

    // Bewegung nach rechts
    if (tasten["ArrowRight"]) {
        x += LAUF_GESCHWINDIGKEIT;
    }

    // Bewegung nach links
    if (tasten["ArrowLeft"]) {
        x -= LAUF_GESCHWINDIGKEIT;
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

    // Standardmäßig nicht auf einer Plattform
    let aufPlattform = false;

    const spielerUnterkante = y + SPIELER_HOEHE;
    const spielerOberkante = y;

    const spielerLinks = x;
    const spielerRechts = x + SPIELER_BREITE;

    // Alle Plattformen prüfen
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

    // Bodenprüfung nur wenn keine Plattform getroffen wurde
    if (!aufPlattform && y >= BODEN_Y) {

        y = BODEN_Y;

        geschwindigkeitY = 0;

        istAmBoden = true;
    }

    // Spieler zeichnen
    spieler.style.left = x + "px";
    spieler.style.top = y + "px";

    requestAnimationFrame(spielSchleife);
}


// ====================
// Spielstart
// ====================

spielSchleife();