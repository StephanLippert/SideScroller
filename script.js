const spieler = document.getElementById("spieler");

let x = 100;
let y = 550;

let schwerkraft = 1;
let geschwindigkeitY = 0;

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

    // Schwerkraft anwenden
    geschwindigkeitY += schwerkraft;
    y += geschwindigkeitY;

    // Bodenprüfung
    if (y >= 550) {
        y = 550;
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