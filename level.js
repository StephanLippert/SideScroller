export const LEVEL_1 = {
    name: "Büro Etage 1",
    breite: 5000,
    abschnitte: [
        { typ: "start", laenge: 700, schwierigkeit: 1 },
        { typ: "sprung", laenge: 900, schwierigkeit: 1 },
        { typ: "gegner", laenge: 1200, schwierigkeit: 2 },
        { typ: "normal", laenge: 1200, schwierigkeit: 2 },
        { typ: "challenge", laenge: 1000, schwierigkeit: 3 },
        { typ: "ziel", laenge: 300, schwierigkeit: 1 }
    ]
};

export const LEVEL_2 = {
    name: "Server Etage",
    breite: 8000,
    abschnitte: [
        { typ: "start", laenge: 800, schwierigkeit: 1 },
        { typ: "sprung", laenge: 1500, schwierigkeit: 2 },
        { typ: "gegner", laenge: 2000, schwierigkeit: 3 },
        { typ: "challenge", laenge: 3000, schwierigkeit: 4 },
        { typ: "ziel", laenge: 700, schwierigkeit: 2 }
    ]
};