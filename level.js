import { holeLevelConfig } from "./konstanten.js";

export const LEVELEN = Object.freeze({
    leicht: {
        id: "leicht",
        name: "Leicht",
        beschreibung: "Breitere Plattformen, ruhigeres Tempo und gut verteilte Gegner.",
        ziel: "100 Münzen sammeln"
    },
    mittel: {
        id: "mittel",
        name: "Mittel",
        beschreibung: "Engere Sprünge, stärkere Gegner und regelmäßig verschwindende Münzen.",
        ziel: "100 Münzen möglichst schnell sammeln"
    },
    schwer: {
        id: "schwer",
        name: "Schwer",
        beschreibung: "Kurze Plattformen, große Lücken, schnelle Gegner und 60 Sekunden Zeit.",
        ziel: "In 60 Sekunden möglichst viele Münzen"
    }
});

export function holeLevel(levelId) {
    return LEVELEN[levelId] || LEVELEN.leicht;
}

export function holeLevelRegeln(levelId) {
    return holeLevelConfig(levelId);
}
