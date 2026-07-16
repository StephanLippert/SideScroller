// -----> Elemente aus dem HTML holen <-----
// ==================================================

// Suche im HTML nach dem Element mit der ID "spielfeld" oder ID "spieler" usw.
//
// Beispiel:
// <div id="spielfeld"></div>
//
// Das gefundene HTML-Element wird in einer Konstanten
// (z.B. spielfeld) gespeichert, damit hier darauf zugegriffen werden kann.
const spielfeld = document.getElementById("spielfeld");
const spieler = document.getElementById("spieler");
const punkteAnzeige = document.getElementById("punkteAnzeige");
const zeitAnzeige = document.getElementById("zeitAnzeige");

// -----> Bilder des Spielers <-----
// ==================================================

// - Startbild des Spielers
const BILD_START = "/images/StickmanStandingStart.png";

// - Spieler läuft nach links
const BILD_LINKS_GEHEN = "/images/StickmangLaufenLinks.png";

// - Spieler steht still (Blickrichtung links)
const BILD_LINKS_STEHEN = "/images/StickmangSeitenansichtLinks.png";

// - Spieler springt (Blickrichtung links)
const BILD_LINKS_SPRINGEN = "/images/StickmangSpringenLinks.png";

// - Spieler läuft nach rechts
const BILD_RECHTS_GEHEN = "/images/StickmangLaufenRechts.png";

// - Spieler steht still (Blickrichtung rechts)
const BILD_RECHTS_STEHEN = "/images/StickmangSeitenansichtRechts.png";

// - Spieler springt (Blickrichtung rechts)
const BILD_RECHTS_SPRINGEN = "/images/StickmangSpringenRechts.png";


// -----> Größen direkt aus dem CSS lesen <-----
// ==================================================

// - Die tatsächliche Breite des Spielfelds auslesen -
// clientWidth liefert die aktuell gerenderte Breite des HTML-Elements in Pixeln.
//
// Beispiel im CSS:
//
// #spielfeld {
//     width: 1000px;
// }
//
// Ergebnis:
// SPIELFELD_BREITE = 1000
const SPIELFELD_BREITE = spielfeld.clientWidth;

// - Die Breite der Spielfigur auslesen -
//
// Diese Information wird später benötigt,
// damit der Spieler nicht über den rechten
// Rand hinauslaufen kann.
const SPIELER_BREITE = spieler.clientWidth;


// - Die Höhe der Spielfigur auslesen -
//
// Diese Information wird später für die Kollisionsprüfung mit Plattformen benötigt.
//
// Beispiel:
//
// Plattformoberkante
// -------------------
//
// Spielerhöhe = 80 Pixel
//
// Dann kann exakt berechnet werden, wo der Spieler landen soll.
const SPIELER_HOEHE = spieler.clientHeight;


// -----> Spielkonstanten <-----
// ==================================================

// - Y-Position des Bodens -
//
// Spieler steht auf dem Boden, sobald seine obere linke Ecke diese Position erreicht.
// Größere Werte liegen weiter unten.
const BODEN_Y = 550;


// - Laufgeschwindigkeit -
//
// Bei jedem Bild der Spielschleife wird die X-Position um diesen Wert verändert.
// - Höherer Wert       → schneller laufen
// - Niedrigerer Wert   → langsamer laufen
const LAUF_GESCHWINDIGKEIT = 5;


// - Sprungkraft -
//
// Negative Werte bewegen den Spieler nach oben.
// Warum negativ?
// Im Browser zeigt die Y-Achse nach unten:
//
// Y = 0       → ganz oben
// Y = 100     → weiter unten
//
// Deshalb bedeutet:
//
// -20 → nach oben
// +20 → nach unten
const SPRUNG_KRAFT = -20;


// - Stärke der Schwerkraft -
//
// Dieser Wert wird in jedem Frame zur vertikalen Geschwindigkeit addiert.
// Dadurch wird der Spieler nach unten gezogen.
const SCHWERKRAFT = 1;

// -----> Scrollende Welt und Kamera (NEU) <-----
// ==================================================

// Die gesamte Breite unserer Spielwelt (entspricht 3 Bildschirmen à 1000 Pixel).
const WELT_BREITE = 3000;

// Der aktuelle Kamera-Verschiebungs-Wert auf der X-Achse.
// Bestimmt, wie weit die gesamte Welt nach links geschoben wird.
let kameraX = 0;


// -----> Plattformen <-----
// ==================================================

// Jede Plattform ist ein Objekt mit:
//
// x       → horizontale Position
// y       → vertikale Position
// breite  → Breite der Plattform
// hoehe   → Höhe der Plattform
//
// Beispiel:
//
// { x: 100, y: 300, breite: 160, hoehe: 20 }
//
// bedeutet:
//
// Start bei X = 100
// Start bei Y = 300
// Breite = 160 Pixel
// Höhe = 20 Pixel
const plattformen = [

    { x: 100, y: 300, breite: 160, hoehe: 20 },

    { x: 400, y: 450, breite: 200, hoehe: 20 },

    { x: 750, y: 300, breite: 130, hoehe: 20 }

]

// - Plattformen erzeugen (FÜR KAMERA-UPDATE GEÄNDERT) -
for (let plattform of plattformen) {

    // Neues HTML-Element erstellen.
    const element = document.createElement("div");

    // CSS-Klasse "plattform" hinzufügen.
    element.classList.add("plattform");

    // WICHTIG: Wir speichern das HTML-Element direkt im Plattform-Objekt ab!
    // Dadurch können wir es später in der Spielschleife verschieben.
    plattform.element = element;

    // Vertikale Position setzen (Y bleibt fest).
    element.style.top = plattform.y + "px";

    // Breite der Plattform setzen.
    element.style.width = plattform.breite + "px";

    // Höhe der Plattform setzen.
    element.style.height = plattform.hoehe + "px";

    // Die fertige Plattform wird dem Spielfeld hinzugefügt.
    spielfeld.appendChild(element);
}

// -----> Münzen <-----
// ==================================================

// Jede Münze besitzt:
//
// x
// → horizontale Position.
//
// y
// → endgültige Position.
//
// startY
// → Startposition der Animation.
//
// typ
// → bestimmt die Animation.
//
// "plattform"
// → Münze kommt von oben.
//
// "boden"
// → Münze kommt aus dem Boden.
//
// eingesammelt
// → verhindert mehrfaches Einsammeln.
//
// animationFertig
// → verhindert Einsammeln während des Erscheinens.
//
// element
// → speichert das HTML-Element.



const muenzen = [


    // Münze auf einer Plattform.
    {
        x: 170,
        y: 250,
        startY: 100,
        typ: "plattform",
        eingesammelt: false,
        animationFertig: false
    },

    // Münze auf dem Boden.
    {
        x: 300,
        y: BODEN_Y,
        startY: BODEN_Y + 50,
        typ: "boden",
        eingesammelt: false,
        animationFertig: false
    },

    // Weitere Plattform-Münze.
    {
        x: 500,
        y: 400,
        startY: 250,
        typ: "plattform",
        eingesammelt: false,
        animationFertig: false
    },

    // Weitere Boden-Münze.
    {
        x: 700,
        y: BODEN_Y,
        startY: BODEN_Y + 50,
        typ: "boden",
        eingesammelt: false,
        animationFertig: false
    }
];


// -----> Münzen erzeugen <-----
// ==================================================


// Jede Münze aus dem Array wird als HTML-Element erzeugt.
for (let muenze of muenzen) {

    // Neues HTML-Element erstellen.
    const element = document.createElement("div");

    // CSS-Klasse hinzufügen.
    element.classList.add("muenze");

    // Die dauerhafte Drehanimation aktivieren.
    element.classList.add("muenzeDrehen");

    // Startposition setzen.
    element.style.left = muenze.x + "px";
    element.style.top = muenze.startY + "px";


    // HTML-Element speichern.
    // Dadurch kann die Münze später:
    //
    // - bewegt werden
    // - animiert werden
    // - entfernt werden
    muenze.element = element;

    // Münze ins Spielfeld einfügen.
    spielfeld.appendChild(element);
}

// -----> Neue Münze erzeugen <-----
// ==================================================

// Erstellt eine neue Münze an einer zufälligen Position.
function neueMuenzeErzeugen() {

    // Zufällige X-Position.
    const zufallX =
        Math.floor(Math.random() * (SPIELFELD_BREITE - 40));

    // Zufällig entscheiden:
    // Plattform oder Boden.
    const typ =
        Math.random() < 0.5 ? "boden" : "plattform";

    let y;
    let startY;

    // Boden-Münze.
    if (typ === "boden") {

        y = BODEN_Y;
        startY = BODEN_Y + 50;
    }

    // Plattform-Münze.
    else {
        // Zufällige Plattform auswählen.
        const plattform =
            plattformen[
            Math.floor(Math.random() * plattformen.length)
            ];

        y = plattform.y - 50;
        startY = y - 150;
    }

    // Neue Münze als Objekt erzeugen.
    const muenze = {

        x: zufallX,
        y: y,
        startY: startY,
        typ: typ,
        eingesammelt: false,
        animationFertig: false
    };

    // HTML-Element erzeugen.
    const element =
        document.createElement("div");
    element.classList.add("muenze");
    element.classList.add("muenzeDrehen");
    element.style.left =
        muenze.x + "px";

    element.style.top =
        muenze.startY + "px";

    muenze.element = element;
    spielfeld.appendChild(element);

    // Neue Münze ins Array speichern.
    muenzen.push(muenze);
}


// -----> Münzanimation starten (FÜR KAMERA-UPDATE GEÄNDERT) <-----
// ===============================================================

function animiereMuenzen() {

    // Alle Münzen überprüfen.
    for (let muenze of muenzen) {

        // WICHTIG: Die X-Position der Münze muss IMMER an die Kamera angepasst werden.
        // Das sorgt dafür, dass Münzen beim Laufen mitscrollen!
        muenze.element.style.left = (muenze.x - kameraX) + "px";

        // Bereits fertige Y-Animationen überspringen.
        if (muenze.animationFertig) {
            continue;
        }

        // Plattform-Münzen kommen von oben.
        if (muenze.typ === "plattform") {

            // Langsam nach unten bewegen.
            muenze.startY += 2;

            // Ziel erreicht?
            if (muenze.startY >= muenze.y) {

                // Exakte Position setzen.
                muenze.startY = muenze.y;

                // Animation abschließen.
                muenze.animationFertig = true;
            }
        }

        // Boden-Münzen kommen aus dem Boden.
        if (muenze.typ === "boden") {

            // Langsam nach oben bewegen.
            muenze.startY -= 2;

            // Ziel erreicht?
            if (muenze.startY <= muenze.y - 30) {

                // Exakte Position setzen.
                muenze.startY = muenze.y - 30;

                // Animation abschließen.
                muenze.animationFertig = true;
            }
        }

        // Neue Y-Position anwenden.
        muenze.element.style.top = muenze.startY + "px";
    }
}

// -----> Münzen überprüfen <-----
// ==================================================


// Prüft jede Spielrunde, ob der Spieler eine Münze berührt.
function pruefeMuenzen() {

    // Position des Spielers berechnen.
    const spielerLinks = x;
    const spielerRechts =
        x + SPIELER_BREITE;

    const spielerOben = y;
    const spielerUnten =
        y + SPIELER_HOEHE;

    // Jede Münze prüfen.
    for (let muenze of muenzen) {

        // Bereits eingesammelte Münzen werden übersprungen.
        if (muenze.eingesammelt) {
            continue;
        }

        // Münzen dürfen erst eingesammelt werden, wenn sie fertig erschienen sind.
        if (!muenze.animationFertig) {
            continue;
        }

        // Münzposition bestimmen.
        const muenzeLinks = muenze.x;
        const muenzeRechts =
            muenze.x + 30;

        const muenzeOben =
            muenze.startY;

        const muenzeUnten =
            muenze.startY + 30;

        // Prüfen, ob Spieler und Münze sich berühren.
        const beruehrtMuenze =
            spielerRechts > muenzeLinks &&

            spielerLinks < muenzeRechts &&

            spielerUnten > muenzeOben &&

            spielerOben < muenzeUnten;

        // Münze getroffen?
        if (beruehrtMuenze) {

            // Status ändern.
            muenze.eingesammelt = true;

            // CSS-Animation starten.
            muenze.element.classList.remove(
                "muenzeDrehen"
            );

            muenze.element.classList.add(
                "muenzeEingesammelt"
            );

            // Nach der Animation Element entfernen.
            setTimeout(() => {
                muenze.element.remove();
            }, 400);

            // Punkt hinzufügen.
            punkte++;

            // Anzeige aktualisieren.
            aktualisierePunkteAnzeige();
        }
    }
}

// -----> Gegner <-----
// ==================================================

// Alle Gegner werden hier gespeichert.
const gegner = [];

// Maximale Anzahl.
const MAX_GEGNER = 6;

// Nach 5 Sekunden erscheint ein neuer Gegner.
const GEGNER_RESPAWN = 5000;

// -----> Gegner erzeugen <-----
// ==================================================

// Konstanten für die Gegner hinzufügen (falls noch nicht vorhanden)
const GEGNER_BREITE = 60;
const GEGNER_HOEHE = 60;
const GEGNER_GESCHWINDIGKEIT = 2; // Bestimmt, wie schnell die Gegner laufen

function neuenGegnerErzeugen() {

    // Sind bereits genug Gegner vorhanden?
    if (gegner.length >= MAX_GEGNER) {
        return;
    }

    // Zufällig entscheiden:
    // Boden oder Plattform?
    const typ = Math.random() < 0.5 ? "boden" : "plattform";

    let startY;
    let minX;
    let maxX;

    // - Gegner startet auf dem Boden -
    if (typ === "boden") {
        startY = BODEN_Y;

        // Darf sich auf dem kompletten Spielfeld bewegen
        minX = 0;
        maxX = SPIELFELD_BREITE - GEGNER_BREITE;
    }
    // - Gegner startet auf einer Plattform -
    else {
        // Zufällige Plattform auswählen
        const plattform = plattformen[Math.floor(Math.random() * plattformen.length)];

        // Y-Position anpassen, damit der Gegner auf der Plattform steht
        startY = plattform.y - GEGNER_HOEHE;

        // Laufgrenzen festlegen (damit er nicht in die Luft läuft)
        minX = plattform.x;
        maxX = plattform.x + plattform.breite - GEGNER_BREITE;
    }

    // Zufällige Start-X-Position innerhalb seiner erlaubten Grenzen
    const zufallX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;

    // Zufällige Startrichtung
    // Math.random() < 0.5 erzeugt eine 50/50 Chance
    // 1 = rechts, -1 = links
    const startRichtung = Math.random() < 0.5 ? 1 : -1;

    // Das neue Gegner-Objekt mit allen wichtigen Daten
    const neuerGegner = {
        x: zufallX,
        y: startY,
        minX: minX,          // Wie weit darf er nach links?
        maxX: maxX,          // Wie weit darf er nach rechts?
        richtung: startRichtung, // Aktuelle Laufrichtung
        erledigt: false
    };

    // HTML-Element erstellen
    const element = document.createElement("div");
    element.classList.add("gegner");
    element.style.left = neuerGegner.x + "px";
    element.style.top = neuerGegner.y + "px";

    neuerGegner.element = element;

    // Ins Spielfeld einfügen
    spielfeld.appendChild(element);

    // In unsere Liste aufnehmen
    gegner.push(neuerGegner);
}

// -----> Gegner bewegen <-----
// ==================================================

// Diese Funktion lässt alle existierenden Gegner laufen.
function bewegeGegner() {

    for (let aktuellerGegner of gegner) {

        // - Willkürlicher Richtungswechsel -
        // 
        // In jedem Frame besteht eine winzige Chance (ca. 1%), 
        // dass der Gegner plötzlich einfach umdreht.
        if (Math.random() < 0.01) {
            aktuellerGegner.richtung *= -1;
        }

        // - Gegner bewegen -
        //
        // Richtung (1 oder -1) * Geschwindigkeit (z.B. 2)
        // Dadurch geht es entweder +2 (rechts) oder -2 (links)
        aktuellerGegner.x += aktuellerGegner.richtung * GEGNER_GESCHWINDIGKEIT;


        // - Linke Grenze prüfen -
        //
        // Ist der Gegner zu weit nach links gelaufen?
        if (aktuellerGegner.x <= aktuellerGegner.minX) {

            // Exakt an den Rand setzen
            aktuellerGegner.x = aktuellerGegner.minX;

            // Zwingend nach rechts umdrehen
            aktuellerGegner.richtung = 1;
        }

        // - Rechte Grenze prüfen -
        //
        // Ist der Gegner zu weit nach rechts gelaufen?
        if (aktuellerGegner.x >= aktuellerGegner.maxX) {

            // Exakt an den Rand setzen
            aktuellerGegner.x = aktuellerGegner.maxX;

            // Zwingend nach links umdrehen
            aktuellerGegner.richtung = -1;
        }

        // Bild spiegeln, je nach Richtung
        if (aktuellerGegner.richtung === "rechts") {
            aktuellerGegner.element.style.transform = "scaleX(1)";
        } else {
            aktuellerGegner.element.style.transform = "scaleX(-1)";
        }

        // Gegner auf dem Bildschirm positionieren (MIT KAMERA-VERSCHIEBUNG GEÄNDERT)
        aktuellerGegner.element.style.left = (aktuellerGegner.x - kameraX) + "px";
    }
}


// -----> Spielerposition <-----
// ==================================================

// Aktuelle X-Position des Spielers.
// Die X-Achse verläuft von links nach rechts.
//
// Beispiel:
//
// x = 0     → ganz links
// x = 100   → 100 Pixel von links entfernt
// x = 500   → weiter rechts
//
// Der Spieler startet hier bei X = 100.
let x = 100;


// Aktuelle Y-Position des Spielers.
// Die Y-Achse verläuft im Browser von oben nach unten.
//
// Beispiel:
//
// y = 0     → ganz oben
// y = 100   → etwas weiter unten
// y = 550   → Bodenhöhe
//
// Der Spieler startet direkt auf dem Boden.
let y = BODEN_Y;


// -----> Physik <-----
// ==================================================

// Speichert die aktuelle vertikale Geschwindigkeit.
// Dieser Wert bestimmt:
// - wie schnell der Spieler nach oben fliegt
// - wie schnell er nach unten fällt
//
// Beispiele:
//
// geschwindigkeitY = -20
// → Spieler bewegt sich stark nach oben
//
// geschwindigkeitY = -5
// → Spieler bewegt sich leicht nach oben
//
// geschwindigkeitY = 0
// → keine vertikale Bewegung
//
// geschwindigkeitY = 10
// → Spieler fällt nach unten
let geschwindigkeitY = 0;



// -----> Spielerstatus <-----
// ==================================================

// Speichert, ob der Spieler aktuell auf einer
// festen Oberfläche steht.
// - true  = Spieler steht auf Boden oder Plattform
// - false = Spieler befindet sich in der Luft
// Diese Variable verhindert später, dass unendlich oft gesprungen werden kann.
let istAmBoden = true;


// Speichert die aktuelle Blickrichtung.
// Mögliche Werte:
//
// "links"
// "rechts"
//
// Diese Information wird später benötigt,
// damit das richtige Bild angezeigt wird.
let blickrichtung = "rechts";


// -----> Punkte <-----
// ==================================================


// Speichert die Anzahl
// der eingesammelten Münzen.

let punkte = 0;


// -----> Timer <-----
// ==================================================
// Speichert die verbleibende Spielzeit in Sekunden.
// Das Spiel startet mit 60 Sekunden.
let spielZeit = 60;


// Speichert, ob das Spiel bereits beendet wurde.
//
// false
// → Spiel läuft.
//
// true
// → Spiel ist beendet.
let spielBeendet = false;


// -----> Punkteanzeige aktualisieren <-----
// ==================================================


// Diese Funktion schreibt
// den aktuellen Punktestand
// in das HTML-Element.
//
// Beispiel:
//
// Münzen: 0
//
// wird zu:
//
// Münzen: 1

function aktualisierePunkteAnzeige() {
    punkteAnzeige.textContent =
        "Münzen: " + punkte;
}


// -----> Gedrückte Tasten <-----
// ==================================================

// Objekt zum Speichern aller aktuell gedrückten Tasten.
//
// Beispiel:
//
// Spieler drückt Pfeil rechts:
// tasten["ArrowRight"] = true;
//
// Spieler lässt Pfeil rechts los:
// tasten["ArrowRight"] = false;
//
// Dadurch kann das Spiel jederzeit prüfen, welche Tasten gerade gehalten werden.
let tasten = {};


// -----> Startbild setzen <-----
// ==================================================

// Hintergrundbild des Spieler-Elements setzen.
// Es wird das zuvor definierte Startbild geladen.
spieler.style.backgroundImage = `url("${BILD_START}")`;

// -----> Spielfeld-Hintergrund für Kamera einrichten (NEU HINZUGEFÜGT) <-----
// =========================================================================

// Wir färben das Spielfeld mit 3 verschiedenen Blautönen ein.
// Jeder Farbton ist genau 1000px breit (insgesamt 3000px Weltbreite).
spielfeld.style.background = "linear-gradient(to right, #24539e 0%, #093371 33.33%, #4c77b4 33.33%, #87aadc 66.66%, #30475e 66.66%, #30475e 100%)";

// Die Hintergrundgröße muss auf die gesamte Weltbreite gestreckt werden.
spielfeld.style.backgroundSize = WELT_BREITE + "px 100%";

// Verhindern, dass sich der Hintergrund wiederholt.
spielfeld.style.backgroundRepeat = "no-repeat";
// Das Bild soll vollständig sichtbar sein.
//
// "contain" bedeutet:
//
// Das Bild wird so skaliert, dass es komplett in das Element passt.
// Nichts wird abgeschnitten.
spieler.style.backgroundSize = "contain";


// Das Bild soll nicht mehrfach wiederholt werden.
// Standardmäßig könnten Hintergrundbilder gekachelt werden.
// Mit "no-repeat" wird das verhindert.
spieler.style.backgroundRepeat = "no-repeat";


// Das Bild wird mittig im Element ausgerichtet.
// Horizontal: Mitte
// Vertikal: Mitte
spieler.style.backgroundPosition = "center";


// ------> Tastatursteuerung <-----
// ==================================================

// Listener für das Drücken einer Taste.
// Jedes Mal wenn eine Taste gedrückt wird,
// wird diese Funktion automatisch ausgeführt.
document.addEventListener("keydown", (ereignis) => {

    // Die gedrückte Taste wird im Objekt gespeichert.
    // Beispiel für drücken der Pfeiltaste rechts:
    tasten[ereignis.key] = true;


    // Prüfen:
    // Wurde die Pfeil-hoch-Taste gedrückt?
    // UND steht der Spieler auf dem Boden?
    if (ereignis.key === "ArrowUp" && istAmBoden) {

        // Dem Spieler eine negative Startgeschwindigkeit geben.
        // Negative Werte bewegen ihn nach oben.
        geschwindigkeitY = SPRUNG_KRAFT;


        // Der Spieler verlässt den Boden.
        // Dadurch wird verhindert,
        // dass direkt erneut gesprungen werden kann.
        istAmBoden = false;
    }
});

// Listener für das Loslassen einer Taste.
// Diese Funktion wird aufgerufen, sobald eine Taste losgelassen wird.
document.addEventListener("keyup", (ereignis) => {

    // Die Taste wird wieder auf false gesetzt.
    //
    // Beispiel:
    //
    // Vorher:
    // tasten["ArrowRight"] = true
    //
    // Nachher:
    // tasten["ArrowRight"] = false
    //
    // Dadurch weiß das Spiel, dass die Taste nicht mehr gehalten wird.
    tasten[ereignis.key] = false;
});


// -----> Spielerbild aktualisieren <-----
// ==================================================

// Diese Funktion entscheidet, welches Bild aktuell angezeigt werden soll.
// Sie wird später in jeder Spielrunde erneut aufgerufen.
// Dadurch kann das Bild sofort wechseln, wenn der Spieler:
// - läuft
// - stehen bleibt
// - springt
function aktualisiereSpielerBild() {

    // - Springen nach links -

    // Prüfen:
    // - Spieler befindet sich in der Luft 
    // - Blickrichtung ist links
    if (!istAmBoden && blickrichtung === "links") {

        // Sprungbild für links anzeigen.
        spieler.style.backgroundImage =
            `url("${BILD_LINKS_SPRINGEN}")`;

        // Wenn es zutrifft -> Funktion wird sofort beendet und die restlichen Prüfungen übersprungen.
        return;
    }

    // - Springen nach rechts -

    // Prüfen:
    // - Spieler befindet sich in der Luft
    // - Blickrichtung ist rechts
    if (!istAmBoden && blickrichtung === "rechts") {

        // Sprungbild für rechts anzeigen.
        spieler.style.backgroundImage =
            `url("${BILD_RECHTS_SPRINGEN}")`;

        // Weitere Prüfungen überspringen.
        return;
    }

    // - Laufen nach links -

    // Prüfen:
    // Wird die linke Pfeiltaste gehalten?
    if (tasten["ArrowLeft"]) {

        // Laufbild für links anzeigen.
        spieler.style.backgroundImage =
            `url("${BILD_LINKS_GEHEN}")`;

        // Keine weiteren Prüfungen nötig.
        return;
    }

    // - Laufen nach rechts -

    // Prüfen:
    // Wird die rechte Pfeiltaste gehalten?
    if (tasten["ArrowRight"]) {

        // Laufbild für rechts anzeigen.
        spieler.style.backgroundImage =
            `url("${BILD_RECHTS_GEHEN}")`;

        // Funktion verlassen.
        return;
    }

    // - Stehen nach links -

    // Wenn keine Lauftaste gedrückt wird,
    // aber die letzte Blickrichtung links war,
    // soll das linke Standbild angezeigt werden.
    if (blickrichtung === "links") {

        spieler.style.backgroundImage =
            `url("${BILD_LINKS_STEHEN}")`;

        return;
    }


    // - Stehen nach rechts -

    // Wenn keine der vorherigen Bedingungen zutrifft, bleibt nur noch:
    // - Spieler steht
    // - Blickrichtung rechts
    //
    // Deshalb wird hier das rechte Standbild gesetzt.
    spieler.style.backgroundImage =
        `url("${BILD_RECHTS_STEHEN}")`;
};


// -----> Spielschleife (NEU & SORTIERT) <-----
// ==================================================

// Diese Funktion ist das Herzstück des Spiels.
// Sie wird immer wieder aufgerufen (ca. 60-mal pro Sekunde).
//
// Hier passieren nun in der richtigen Reihenfolge:
// 1. Bewegung nach links/rechts
// 2. Gegner bewegen & Kollision prüfen (wichtig für den Sprung-Bounce!)
// 3. Plattform- und Bodenprüfung
// 4. Münzen bewegen & einsammeln
// 5. Bildwechsel & Zeichnen des Spielers
// -----> Spielschleife mit Kamera-Scrolling (KOMPLETT ERSETZT) <-----
// ===================================================================

function spielSchleife() {

    // Ist das Spiel beendet?
    // Dann keine weitere Bewegung mehr erlauben.
    if (spielBeendet) {
        return;
    }


    // -----> Rechts laufen <-----
    // ==================================================

    // Prüfen: Wird aktuell die rechte Pfeiltaste gehalten?
    if (tasten["ArrowRight"]) {

        // Spieler nach rechts bewegen.
        x += LAUF_GESCHWINDIGKEIT;

        // Blickrichtung für das Bild speichern.
        blickrichtung = "rechts";
    }


    // -----> Links laufen <-----
    // ==================================================

    // Prüfen: Wird aktuell die linke Pfeiltaste gehalten?
    if (tasten["ArrowLeft"]) {

        // Spieler nach links bewegen.
        x -= LAUF_GESCHWINDIGKEIT;

        // Blickrichtung speichern.
        blickrichtung = "links";
    }


    // -----> Linke Grenze der WELT <-----
    // ==================================================

    // Verhindern, dass der Spieler links aus der kompletten 3000px-Welt läuft.
    if (x < 0) {
        x = 0;
    }


    // -----> Rechte Grenze der WELT (KORRIGIERT) <-----
    // ==================================================

    // WICHTIG: Die Grenze ist jetzt die WELT_BREITE (3000px) statt der Spielfeldbreite!
    if (x > WELT_BREITE - SPIELER_BREITE) {
        x = WELT_BREITE - SPIELER_BREITE;
    }


    // -----> Schwerkraft anwenden <-----
    // ==================================================

    // Die Schwerkraft zieht den Spieler in jedem Frame weiter nach unten.
    geschwindigkeitY += SCHWERKRAFT;

    // Die berechnete Geschwindigkeit auf die Y-Position anwenden.
    y += geschwindigkeitY;


    // ==================================================
    // -----> DIE KAMERA-BERECHNUNG (NEU) <-----
    // ==================================================

    // Die Kamera versucht immer, genau mittig über dem Spieler zu sein.
    // Formel: Spieler-X minus halbe Bildschirmbreite (500px) minus halbe Spielerbreite.
    kameraX = x - (SPIELFELD_BREITE / 2) - (SPIELER_BREITE / 2);

    // Begrenzung links: Die Kamera darf nicht weiter nach links als zum Start (0).
    if (kameraX < 0) {
        kameraX = 0;
    }

    // Begrenzung rechts: Die Kamera darf nicht über das Ende der 3000px-Welt hinausschauen.
    if (kameraX > WELT_BREITE - SPIELFELD_BREITE) {
        kameraX = WELT_BREITE - SPIELFELD_BREITE;
    }

    // -----> Hintergrund mitbewegen <-----
    // Wir verschieben das Hintergrundbild genau entgegengesetzt zur Kamera.
    // Das erzeugt den perfekten Scrolling-Effekt der 3 Blautöne!
    spielfeld.style.backgroundPositionX = -kameraX + "px";


    // ==================================================
    // -----> GEGNER- UND MÜNZ-LOGIK <-----
    // ==================================================

    // Gegner bewegen.
    bewegeGegner();

    // Gegner-Kollision prüfen (VOR der Bodenprüfung für den Bounce!).
    pruefeGegner();

    // Münzen-Nachschub prüfen.
    pruefeAlleMuenzen();

    // Münzen animieren (bewegt sie auch relativ zur Kamera).
    animiereMuenzen();

    // Münzen einsammeln prüfen.
    pruefeMuenzen();


    // ==================================================
    // -----> PLATFORM- UND BODENPRÜFUNG <-----
    // ==================================================

    // Zu Beginn gehen wir davon aus, dass der Spieler auf keiner Plattform steht.
    let aufPlattform = false;

    // Positionen berechnen.
    const spielerUnterkante = y + SPIELER_HOEHE;
    const spielerOberkante = y;
    const spielerLinks = x;
    const spielerRechts = x + SPIELER_BREITE;

    // Plattformen prüfen.
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

    // Bodenprüfung.
    if (!aufPlattform && y >= BODEN_Y) {
        y = BODEN_Y;
        geschwindigkeitY = 0;
        istAmBoden = true;
    }

    // Wenn keine Plattform getroffen wurde und der Spieler noch über dem Boden ist.
    if (!aufPlattform && y < BODEN_Y) {
        istAmBoden = false;
    }


    // ==================================================
    // -----> PLATTFORMEN RELATIV ZUR KAMERA ZEICHNEN <--
    // ==================================================

    // Jede Plattform muss nun relativ zur Kamera verschoben gezeichnet werden!
    for (let plattform of plattformen) {
        plattform.element.style.left = (plattform.x - kameraX) + "px";
    }


    // ==================================================
    // -----> INTERNE FUNKTIONEN <-----
    // ==================================================

    // Prüft, ob der Spieler auf einen Gegner springt.
    function pruefeGegner() {
        const spielerLinks = x;
        const spielerRechts = x + SPIELER_BREITE;
        const spielerOben = y;
        const spielerUnten = y + SPIELER_HOEHE;

        for (let i = gegner.length - 1; i >= 0; i--) {
            const aktuellerGegner = gegner[i];

            const gegnerLinks = aktuellerGegner.x;
            const gegnerRechts = aktuellerGegner.x + 60;
            const gegnerOben = aktuellerGegner.y;
            const gegnerUnten = aktuellerGegner.y + 60;

            const beruehrung =
                spielerRechts > gegnerLinks &&
                spielerLinks < gegnerRechts &&
                spielerUnten > gegnerOben &&
                spielerOben < gegnerUnten;

            if (
                beruehrung &&
                geschwindigkeitY > 0 &&
                spielerUnten < gegnerOben + 25
            ) {
                // Gegner entfernen.
                aktuellerGegner.element.remove();
                gegner.splice(i, 1);

                // Der Bounce-Effekt!
                geschwindigkeitY = SPRUNG_KRAFT;
                istAmBoden = false;

                // Belohnung.
                spielZeit++;
                aktualisiereZeitAnzeige();

                // Respawn.
                setTimeout(() => {
                    neuenGegnerErzeugen();
                }, GEGNER_RESPAWN);
            }
        }
    }

    // Spawnt neue Münzen, wenn alle weggeschnappt wurden.
    function pruefeAlleMuenzen() {
        const nochVorhanden = muenzen.some(muenze => !muenze.eingesammelt);
        if (!nochVorhanden) {
            muenzen.length = 0;
            for (let i = 0; i < 4; i++) {
                neueMuenzeErzeugen();
            }
        }
    }


    // ==================================================
    // -----> ZEICHNEN & NÄCHSTER FRAME <-----
    // ==================================================

    // Aussehen des Spielers aktualisieren.
    aktualisiereSpielerBild();

    // WICHTIG: Auch der Spieler wird jetzt relativ zur Kamera gezeichnet!
    spieler.style.left = (x - kameraX) + "px";
    spieler.style.top = y + "px";

    // Spielschleife erneut triggern.
    requestAnimationFrame(spielSchleife);
}

aktualisierePunkteAnzeige();

aktualisiereZeitAnzeige();


// -----> Spieltimer starten <-----
// ==================================================

// Diese Funktion wird
// jede Sekunde aufgerufen.
const timer = setInterval(() => {
    // Ist das Spiel bereits beendet?
    if (spielBeendet) {
        return;
    }
    // Eine Sekunde abziehen.
    spielZeit--;

    // Anzeige aktualisieren.
    aktualisiereZeitAnzeige();

    // Zeit abgelaufen?
    if (spielZeit <= 0) {
        // Spiel beenden.
        spielBeendet = true;

        // Timer anhalten.
        clearInterval(timer);

        // Nachricht anzeigen.
        alert(
            "Spiel beendet!\n\n" +
            "Du hast " +
            punkte +
            " Münzen gesammelt."
        );
    }
}, 1000);


// -----> Timeranzeige aktualisieren <-----
// ==================================================

// Schreibt die verbleibende Zeit in das HTML.
function aktualisiereZeitAnzeige() {
    zeitAnzeige.textContent =
        "Zeit: " + spielZeit;
}

// -----> Gegner erzeugen <-----
// ==================================================

for (let i = 0; i < MAX_GEGNER; i++) {
    neuenGegnerErzeugen();
}

// -----> Spiel starten <-----
// ==================================================

// Die Spielschleife zum ersten Mal aufrufen.
// Warum nur einmal?
// Weil sich die Funktion anschließend selbst immer wieder neu startet:
//
// spielSchleife()
//      ↓
// requestAnimationFrame(spielSchleife)
//      ↓
// spielSchleife()
//      ↓
// requestAnimationFrame(spielSchleife)
//      ↓
// spielSchleife()
//      ↓
// ...
//
// Dadurch entsteht eine Endlosschleife, die vom Browser gesteuert wird.
// Ohne diese Zeile würde das Spiel niemals beginnen.
spielSchleife();