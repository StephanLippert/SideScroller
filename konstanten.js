export function erschaffeSpielWelt(levelId) {
    const CONFIG = {
        SPIELFELD_BREITE: 1000,
        SPIELFELD_HOEHE: 600,

        SPIELER_BREITE: 80,
        SPIELER_HOEHE: 90,

        SPIELER_HITBOX_X: 28,
        SPIELER_HITBOX_Y: 3,
        SPIELER_HITBOX_BREITE: 24,
        SPIELER_HITBOX_HOEHE: 84,

        SCHWERKRAFT: 0.8,
        SPRUNG_KRAFT: -15,
        LAUF_GESCHWINDIGKEIT: 8,

        BODEN_Y: 560,
        BODEN_HOEHE: 40,

        GEGNER_BREITE: 60,
        GEGNER_HOEHE: 60,
        GEGNER_SPAWN_ENTFERNUNG: 1450,
        GEGNER_MAXIMAL: 12,
        GEGNER_SPAWN_INTERVAL: 2000,
        GEGNER_SPAWN_DAUER: 2000,
        GEGNER_MIN_ABSTAND: 100,
        GEGNER_SPRUNG_KRAFT: -11,
        GEGNER_GRAVITATION: 0.65,

        MUENZE_GROESSE: 30,
        MUENZE_AUFBAUZEIT: 1000,
        MUENZEN_MAXIMAL_LEICHT: 16,
        MUENZEN_HARD_NACHSPAWN: 900,

        UNVERWUNDBARKEIT: 1200,
        BLINK_DAUER: 1200,

        LEVEL_LEICHT_ZIEL: 100,
        LEVEL_MITTEL_ZIEL: 100,
        LEVEL_MITTEL_VERSCHWINDEN: 10000,
        LEVEL_SCHWER_ZEIT: 60
    };

    const bodenY = CONFIG.BODEN_Y - CONFIG.SPIELER_HOEHE;

    const status = {
        levelId,

        x: 110,
        y: bodenY,
        vorherigesX: 110,
        vorherigesY: bodenY,

        geschwindigkeitY: 0,
        istAmBoden: true,
        blickrichtung: "rechts",

        kameraX: 0,

        spielZeit: 0,
        restZeit:
            levelId === "schwer"
                ? CONFIG.LEVEL_SCHWER_ZEIT
                : 0,

        gesammelteMuenzen: 0,

        spielBeendet: false,
        spielGewonnen: false,
        ergebnisGrund: "",
        spielGestartet: false,

        naechsterMuenzVerlust:
            levelId === "mittel"
                ? CONFIG.LEVEL_MITTEL_VERSCHWINDEN
                : null,

        letzteHardMuenze: 0,

        unverwundbarBis: 0,
        blinkBis: 0,
        trefferrichtung: 0,

        laufGeschwindigkeitsFaktor: 1,
        laufModifikatorBis: 0,

        levelDaten: {
            naechsteGruppenX: 420,
            letzteY: CONFIG.BODEN_Y - 145,
            gruppenNummer: 0,
            coinX: 700,
            naechsterGegnerSpawn: 0,
            mittelCoinsMax: 100
        }
    };

    const listen = {
        tasten: {},
        plattformen: [],
        gegner: [],
        muenzen: []
    };

    return {
        CONFIG,
        status,
        listen
    };
}
