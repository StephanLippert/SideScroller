const spieler = document.getElementById("spieler");

// Spielfeld-Einstellungen
const SPIELFELD_BREITE = 1000;
const SPIELER_BREITE = 50;
const BODEN_Y = 550;

// Spielerposition
let x = 100;
let y = BODEN_Y;

// Physik
let schwerkraft = 1;
let geschwindigkeitY = 0;

// Spielerstatus
let istAmBoden = true;

// Speichert den Zustand der gedrückten Tasten
let tasten = {};


// Taste gedrückt
document.addEventListener("keydown", (ereignis) => {

    tasten[ereignis.key] = true;

    if (ereignis.key === "ArrowUp" && istAmBoden) {
        geschwindigkeitY = -15;
        istAmBoden = false;
    }

});


// Taste losgelassen
document.addEventListener("keyup", (ereignis) => {

    tasten[ereignis.key] = false;

});


function spielSchleife() {

    // Nach rechts laufen
    if (tasten["ArrowRight"]) {
        x += 5;
    }

    // Nach links laufen
    if (tasten["ArrowLeft"]) {
        x -= 5;
    }

    // Linke Spielfeldgrenze
    if (x < 0) {
        x = 0;
    }

    // Rechte Spielfeldgrenze
    if (x > SPIELFELD_BREITE - SPIELER_BREITE) {
        x = SPIELFELD_BREITE - SPIELER_BREITE;
    }

    // Schwerkraft anwenden
    geschwindigkeitY += schwerkraft;
    y += geschwindigkeitY;

    // Bodenprüfung
    if (y >= BODEN_Y) {
        y = BODEN_Y;
        geschwindigkeitY = 0;
        istAmBoden = true;
    }

    // Position des Spielers aktualisieren
    spieler.style.left = x + "px";
    spieler.style.top = y + "px";

    requestAnimationFrame(spielSchleife);
}

// Spiel starten
spielSchleife();