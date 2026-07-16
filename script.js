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

// - Plattformen erzeugen -

// Die Plattformen existieren bisher nur als Daten innerhalb des Arrays.
// Jetzt werden daraus echte HTML-Elemente erzeugt.
for (let plattform of plattformen) {

    // - Neues HTML-Element erstellen -
    //
    // Ergebnis im HTML:
    // <div></div>
    const element = document.createElement("div");


    // - CSS-Klasse "plattform" hinzufügen -
    //
    // Dadurch greifen später die Styles aus der CSS-Datei.
    element.classList.add("plattform");


    // - Horizontale Position setzen -
    //
    // Beispiel:
    // left: 100px;
    element.style.left = plattform.x + "px";


    // - Vertikale Position setzen -
    //
    // Beispiel:
    // top: 300px;
    element.style.top = plattform.y + "px";


    // - Breite der Plattform setzen -
    //
    // Beispiel:
    // width: 160px;
    element.style.width = plattform.breite + "px";


    // - Höhe der Plattform setzen -
    //
    // Beispiel:
    // height: 20px;
    element.style.height = plattform.hoehe + "px";


    // - Die fertige Plattform wird dem Spielfeld hinzugefügt -
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


// -----> Münzanimation starten <-----
// ==================================================

// Diese Funktion lässt die Münzen an ihre endgültige Position fahren.
function animiereMuenzen() {

    // Alle Münzen überprüfen.
    for (let muenze of muenzen) {

        // Bereits fertige Animationen überspringen.
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

        // Neue Position anwenden.
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

function neuenGegnerErzeugen() {

    // Sind bereits genug Gegner vorhanden?
    if (gegner.length >= MAX_GEGNER) {

        return;
    }

    // Zufällige Position.

    const zufallX =
        Math.floor(
            Math.random() *
            (SPIELFELD_BREITE - 60)
        );

    const neuerGegner = {

        x: zufallX,

        y: BODEN_Y,

        erledigt: false

    };

    const element =
        document.createElement("div");

    element.classList.add("gegner");

    element.style.left =
        neuerGegner.x + "px";

    element.style.top =
        neuerGegner.y + "px";

    neuerGegner.element = element;

    spielfeld.appendChild(element);

    gegner.push(neuerGegner);
}

// -----> Gegner überprüfen <-----
// ==================================================

function pruefeGegner() {

    const spielerLinks = x;
    const spielerRechts = x + SPIELER_BREITE;

    const spielerOben = y;
    const spielerUnten = y + SPIELER_HOEHE;

    for (let i = gegner.length - 1; i >= 0; i--) {

        const g = gegner[i];

        const gegnerLinks = g.x;
        const gegnerRechts = g.x + GEGNER_BREITE;

        const gegnerOben = g.y;
        const gegnerUnten = g.y + GEGNER_HOEHE;

        const beruehrung =

            spielerRechts > gegnerLinks &&
            spielerLinks < gegnerRechts &&
            spielerUnten > gegnerOben &&
            spielerOben < gegnerUnten;

        if (beruehrung &&
            geschwindigkeitY > 0 &&
            spielerUnten < gegnerOben + 30) {

            g.element.remove();

            gegner.splice(i, 1);

            spielZeit++;

            aktualisiereZeitAnzeige();

            setTimeout(() => {

                neuenGegnerErzeugen();

            }, GEGNER_RESPAWN);
        }
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


// -----> Spielschleife <-----
// ==================================================

// Diese Funktion ist das Herzstück des Spiels.
// Sie wird immer wieder aufgerufen (ca. 60-mal pro Sekunde).
//
// Hier passieren:
// - Bewegung
// - Springen
// - Schwerkraft
// - Plattform-Kollisionen
// - Bildwechsel
// - Zeichnen des Spielers
function spielSchleife() {

    // Ist das Spiel beendet?
    // Dann keine weitere Bewegung mehr.
    if (spielBeendet) {
        return;
    }

    // -----> Rechts laufen <-----
    // ==================================================

    // Prüfen:
    // Wird aktuell die rechte Pfeiltaste gehalten?
    if (tasten["ArrowRight"]) {

        // Spieler nach rechts bewegen.
        //
        // Beispiel:
        // start bei x = 100
        //
        // Nach einem Frame:
        // x = 105
        x += LAUF_GESCHWINDIGKEIT;

        // Merken, dass der Spieler nach rechts schaut.
        // Diese Information wird später für das richtige Bild benötigt.
        blickrichtung = "rechts";
    }

    // -----> Links laufen <-----
    // ==================================================

    // Prüfen:
    // Wird aktuell die linke Pfeiltaste gehalten?
    if (tasten["ArrowLeft"]) {

        // Spieler nach links bewegen.
        x -= LAUF_GESCHWINDIGKEIT;

        // Blickrichtung speichern.
        blickrichtung = "links";
    }

    // -----> Linke Grenze <-----
    // ==================================================

    // Verhindern, dass der Spieler
    // aus dem Spielfeld herausläuft.
    if (x < 0) {

        // Spieler exakt an den linken Rand setzen.
        x = 0;
    }

    // -----> Rechte Grenze <-----
    // ==================================================

    // Prüfen:
    // Ist der Spieler weiter rechts als erlaubt?
    if (x > SPIELFELD_BREITE - SPIELER_BREITE) {

        // Spieler an den rechten Rand setzen.
        x = SPIELFELD_BREITE - SPIELER_BREITE;
    }

    // -----> Schwerkraft <-----
    // ==================================================

    // Die Schwerkraft wirkt in jedem Frame.
    // Dadurch wird die Fallgeschwindigkeit immer größer.
    geschwindigkeitY += SCHWERKRAFT;

    // Die aktuelle Geschwindigkeit auf die Y-Position anwenden.
    //
    // Negative Geschwindigkeit:
    // → nach oben
    //
    // Positive Geschwindigkeit:
    // → nach unten
    y += geschwindigkeitY;

    // -----> Plattformstatus <-----
    // ==================================================

    // Zu Beginn gehen wir davon aus, dass der Spieler auf keiner Plattform steht.
    let aufPlattform = false;

    // -----> Position der Spielerkanten berechnen <-----
    // ==================================================

    // Unterkante des Spielers.
    //
    // Beispiel:
    // y = 300
    // Höhe = 80
    //
    // Unterkante = 380
    const spielerUnterkante = y + SPIELER_HOEHE;

    // Oberkante des Spielers.
    const spielerOberkante = y;

    // Linke Seite des Spielers.
    const spielerLinks = x;

    // Rechte Seite des Spielers.
    const spielerRechts = x + SPIELER_BREITE;

    // -----> Plattformen prüfen <-----
    // ==================================================

    // Jede Plattform einzeln untersuchen.
    for (let plattform of plattformen) {

        // Prüfen, ob der Spieler auf einer Plattform landet.
        const beruehrtPlattformVonOben =

            // Spieler überlappt die Plattform auf der X-Achse.
            spielerRechts > plattform.x &&

            // Spieler überlappt die Plattform weiterhin auf der X-Achse.
            spielerLinks < plattform.x + plattform.breite &&

            // Die Füße des Spielers haben die Plattform erreicht.
            spielerUnterkante >= plattform.y &&

            // Der Spieler befindet sich noch oberhalb der Plattform.
            // Dadurch werden Treffer von unten verhindert.
            spielerOberkante < plattform.y &&

            // Der Spieler muss fallen.
            // Positive Werte bedeuten Bewegung nach unten.
            geschwindigkeitY > 0;

        // Wurde eine Landung erkannt?
        if (beruehrtPlattformVonOben) {

            // Spieler exakt auf die Plattform setzen.
            // Die Füße des Spielers landen dadurch sauber auf der Oberkante.
            y = plattform.y - SPIELER_HOEHE;

            // Vertikale Bewegung stoppen.
            geschwindigkeitY = 0;

            // Spieler steht wieder.
            istAmBoden = true;

            // Merken:
            // Der Spieler befindet sich auf einer Plattform.
            aufPlattform = true;

            // Weitere Plattformen müssen nicht mehr geprüft werden.
            break;
        }
    }

    // -----> Bodenprüfung <-----
    // ==================================================

    // Falls keine Plattform getroffen wurde und der Spieler den Boden erreicht hat.
    if (!aufPlattform && y >= BODEN_Y) {

        // Spieler auf die Bodenhöhe setzen.
        y = BODEN_Y;

        // Fallbewegung stoppen.
        geschwindigkeitY = 0;

        // Spieler steht wieder.
        istAmBoden = true;
    }

    // -----> Spieler befindet sich in der Luft <-----
    // ==================================================

    // Wenn keine Plattform getroffen wurde und der Spieler noch oberhalb des Bodens ist.
    if (!aufPlattform && y < BODEN_Y) {

        // Spieler springt oder fällt gerade.
        istAmBoden = false;
    }

    // -----> Münzen aktualisieren <-----
    // ==================================================


    // Münzen bewegen.

    animiereMuenzen();


    // Prüfen,
    // ob Münzen eingesammelt wurden.

    pruefeMuenzen();

    // -----> Gegner überprüfen <-----
    // ==================================================

    function pruefeGegner() {

        const spielerLinks = x;
        const spielerRechts = x + SPIELER_BREITE;

        const spielerOben = y;
        const spielerUnten = y + SPIELER_HOEHE;

        for (let i = gegner.length - 1; i >= 0; i--) {

            const aktuellerGegner =
                gegner[i];

            const gegnerLinks =
                aktuellerGegner.x;

            const gegnerRechts =
                aktuellerGegner.x + 60;

            const gegnerOben =
                aktuellerGegner.y;

            const gegnerUnten =
                aktuellerGegner.y + 60;

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
                aktuellerGegner.element.remove();
                gegner.splice(i, 1);
                spielZeit++;
                aktualisiereZeitAnzeige();
                setTimeout(() => {
                    neuenGegnerErzeugen();
                }, GEGNER_RESPAWN);
            }
        }
    }

    pruefeGegner();
    pruefeAlleMuenzen();

    // -----> Prüfen ob alle Münzen eingesammelt wurden <-----
    // ==================================================

    function pruefeAlleMuenzen() {

        // Gibt es noch eine Münze,
        // die nicht eingesammelt wurde?
        const nochVorhanden =
            muenzen.some(muenze => !muenze.eingesammelt);

        // Wenn keine mehr vorhanden ist,
        // werden vier neue erzeugt.
        if (!nochVorhanden) {

            // Altes Array leeren.
            muenzen.length = 0;

            // Vier neue Münzen erzeugen.
            for (let i = 0; i < 4; i++) {

                neueMuenzeErzeugen();
            }
        }
    }

    // -----> Passendes Bild auswählen <-----
    // ==================================================

    // Entscheidet:
    // - springen
    // - laufen
    // - stehen
    aktualisiereSpielerBild();

    // -----> Spieler zeichnen <-----
    // ==================================================

    // Neue X-Position im Browser anzeigen.
    spieler.style.left = x + "px";

    // Neue Y-Position im Browser anzeigen.
    spieler.style.top = y + "px";

    // -----> Nächsten Frame starten <-----
    // ==================================================

    // Browser auffordern, die Spielschleife erneut aufzurufen.
    // Dadurch läuft das Spiel permanent weiter.
    requestAnimationFrame(spielSchleife);
};

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