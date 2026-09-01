export const BASIS_CONFIG = Object.freeze({
    SPIELFELD_BREITE: 1000,
    SPIELFELD_HOEHE: 600,
    SPIELER_BREITE: 80,
    SPIELER_HOEHE: 90,
    SPIELER_HITBOX_X: 27,
    SPIELER_HITBOX_Y: 4,
    SPIELER_HITBOX_BREITE: 28,
    SPIELER_HITBOX_HOEHE: 84,
    SCHWERKRAFT: 0.82,
    SPRUNG_KRAFT: -15.2,
    LAUF_GESCHWINDIGKEIT: 7.6,
    BODEN_Y: 560,
    BODEN_HOEHE: 40,
    PLATTFORM_HOEHE: 20,
    GEGNER_BREITE: 60,
    GEGNER_HOEHE: 60,
    GEGNER_MAXIMAL: 10,
    GEGNER_MIN_ABSTAND: 95,
    MUENZE_GROESSE: 30,
    MUENZE_AUFBAUZEIT: 500,
    UNVERWUNDBARKEIT: 1200,
    BLINK_DAUER: 1100,
    MAX_DELTA: 0.035,
    MAX_WELT_BREITE: 80000,
    NACHLADE_ABSTAND: 2600,
    ENTFERNEN_HINTER_SPIELER: 1800
});

const LEVEL_CONFIG = {
    leicht: {
        name: "Leicht",
        ziel: "100 Münzen sammeln",
        startMuenzen: 16,
        muenzenAufVorrat: 18,
        platformGapMin: 70,
        platformGapMax: 105,
        platformWidthMin: 180,
        platformWidthMax: 255,
        maxHoehenAenderung: 85,
        gruppenGroesse: 3,
        startGruppen: 14,
        gegnerIntervall: 2600,
        gegnerMaximal: 8,
        gegnerMix: ["boden", "plattform"],
        gegnerTypen: ["violett", "gruen"],
        zielMuenzen: 100,
        zeitLimit: null,
        spezial: "ruhig"
    },
    mittel: {
        name: "Mittel",
        ziel: "100 Münzen sammeln – Münzen verschwinden mit der Zeit",
        startMuenzen: 22,
        muenzenAufVorrat: 100,
        platformGapMin: 85,
        platformGapMax: 125,
        platformWidthMin: 145,
        platformWidthMax: 215,
        maxHoehenAenderung: 105,
        gruppenGroesse: 3,
        startGruppen: 18,
        gegnerIntervall: 2200,
        gegnerMaximal: 10,
        gegnerMix: ["boden", "plattform"],
        gegnerTypen: ["rot", "violett", "gruen"],
        zielMuenzen: 100,
        zeitLimit: null,
        spezial: "wechselnd"
    },
    schwer: {
        name: "Schwer",
        ziel: "60 Sekunden – so viele Münzen wie möglich",
        startMuenzen: 22,
        muenzenAufVorrat: 28,
        platformGapMin: 105,
        platformGapMax: 155,
        platformWidthMin: 120,
        platformWidthMax: 185,
        maxHoehenAenderung: 120,
        gruppenGroesse: 3,
        startGruppen: 20,
        gegnerIntervall: 1750,
        gegnerMaximal: 12,
        gegnerMix: ["boden", "plattform"],
        gegnerTypen: ["rot", "blau", "violett", "gruen"],
        zielMuenzen: null,
        zeitLimit: 60,
        spezial: "chaos"
    }
};

export function holeLevelConfig(levelId) {
    return LEVEL_CONFIG[levelId] || LEVEL_CONFIG.leicht;
}

export function erschaffeSpielWelt(levelId) {
    const level = holeLevelConfig(levelId);
    const bodenY = BASIS_CONFIG.BODEN_Y - BASIS_CONFIG.SPIELER_HOEHE;

    return {
        CONFIG: {
            ...BASIS_CONFIG,
            ...level,
            SPIELER_BASIS_Y: bodenY
        },
        status: {
            levelId,
            x: 110,
            y: bodenY,
            vorherigesX: 110,
            vorherigesY: bodenY,
            geschwindigkeitY: 0,
            istAmBoden: true,
            blickrichtung: "rechts",
            kameraX: 0,
            spielGestartet: false,
            spielBeendet: false,
            spielGewonnen: false,
            ergebnisGrund: "",
            spielZeit: 0,
            restZeit: level.zeitLimit ?? 0,
            gesammelteMuenzen: 0,
            unverwundbarBis: 0,
            blinkBis: 0,
            trefferrichtung: 0,
            laufGeschwindigkeitsFaktor: 1,
            laufModifikatorBis: 0,
            laufPhase: 0,
            letzterFrame: performance.now(),
            fehler: false,
            levelDaten: {
                naechsteGruppenX: 430,
                letzteY: BASIS_CONFIG.BODEN_Y - 145,
                gruppenNummer: 0,
                naechsterGegnerSpawn: 0,
                naechsterMuenzVerlust: levelId === "mittel" ? 10000 : null,
                naechsterMuenzenNachschub: 0,
                worldSeed: Math.random()
            }
        },
        listen: {
            tasten: Object.create(null),
            plattformen: [],
            gegner: [],
            muenzen: [],
            timer: []
        }
    };
}
