export const LEVELEN = {
    leicht: {
        id: "leicht",
        name: "Leicht",
        ziel:
            "Sammle als Erster 100 Münzen. Treffer verlängern die Zeit um 1 Sekunde, Gegner zu besiegen verkürzt sie um 2 Sekunden.",
        highscoreTyp: "zeit",
        anzeige: "100 Münzen – Zeit zählt"
    },

    mittel: {
        id: "mittel",
        name: "Mittel",
        ziel:
            "Sammle 100 Münzen. Alle 10 Sekunden verschwindet eine Münze. Gegner verändern vorübergehend deine Laufgeschwindigkeit.",
        highscoreTyp: "zeit",
        anzeige: "Münzen + Zeit"
    },

    schwer: {
        id: "schwer",
        name: "Schwer",
        ziel:
            "Sammle in 60 Sekunden so viele Münzen wie möglich. Die Münzanzahl entscheidet über den Highscore.",
        highscoreTyp: "muenzen",
        anzeige: "60 Sekunden – maximal viele Münzen"
    }
};

export function holeLevel(levelId) {
    return LEVELEN[levelId] || LEVELEN.leicht;
}
