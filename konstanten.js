export function erschaffeSpielWelt() {
    const CONFIG = {
        // Sichtbarer Spielbereich
        SPIELFELD_BREITE: 1000,

        // Gesamte Levelgröße
        WELT_BREITE: 100000,

        // Spielergröße
        SPIELER_BREITE: 80,
        SPIELER_HOEHE: 90,

        // Physik
        SCHWERKRAFT: 0.8,
        SPRUNG_KRAFT: -15,

        // Bewegung
        LAUF_GESCHWINDIGKEIT: 8,

        // Bodenhöhe
        BODEN_Y: 560,

        // Gegner-System
        GEGNER_RESPAWN: 3000
    };

    const status = {
        // Spielerposition
        x: 100,
        // Spieler startet auf dem Boden
        // minus eigener Höhe
        y: CONFIG.BODEN_Y - CONFIG.SPIELER_HOEHE,

        // Bewegung
        geschwindigkeitY: 0,

        // Bodenstatus
        istAmBoden: true,

        // Richtung
        blickrichtung: "rechts",

        // Kamera
        kameraX: 0,

        // Spielzeit
        spielZeit: 60,


        // Münzzähler
        gesammelteMuenzen: 0,

        // Spiel beendet?
        spielBeendet: false
    };

    const listen = {

        // Tasteneingaben
        tasten: {},

        // Plattformen
        plattformen: [],

        // Gegner
        gegner: [],

        // Münzen
        muenzen: []
    };

    return {
        CONFIG,
        status,
        listen
    };
}