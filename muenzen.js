const spielfeld =
    document.getElementById("spielfeld");

function sichtbareMuenzen(welt) {
    const links =
        welt.status.kameraX;

    const rechts =
        welt.status.kameraX +
        welt.CONFIG.SPIELFELD_BREITE;

    return welt.listen.muenzen.filter(
        muenze =>
            muenze.x +
            welt.CONFIG.MUENZE_GROESSE >=
            links &&
            muenze.x <= rechts
    );
}

function muenzeDarfErzeugtWerden(
    welt
) {
    if (
        welt.status.levelId ===
        "mittel"
    ) {
        return (
            welt.listen.muenzen.length < 100 &&
            welt.listen.muenzen.length <
            welt.status.levelDaten
                .mittelCoinsMax
        );
    }

    if (
        welt.status.levelId ===
        "leicht"
    ) {
        return (
            welt.listen.muenzen.length <
            welt.CONFIG.MUENZEN_MAXIMAL_LEICHT
        );
    }

    return (
        welt.listen.muenzen.length <
        18
    );
}

function zufaelligeMuenzenPosition(
    welt,
    bevorzugterX = null
) {
    const plattformen =
        welt.listen.plattformen.filter(
            p =>
                p.typ !== "boden" &&
                p.breite >= 110
        );

    if (
        bevorzugterX !== null
    ) {
        const nahePlattformen =
            plattformen.filter(
                p => {
                    const mitte =
                        p.x +
                        p.breite / 2;

                    return (
                        Math.abs(
                            mitte -
                            bevorzugterX
                        ) < 170
                    );
                }
            );

        if (
            nahePlattformen.length
        ) {
            const plattform =
                nahePlattformen[
                Math.floor(
                    Math.random() *
                    nahePlattformen.length
                )
                ];

            return {
                x:
                    plattform.x +
                    20 +
                    Math.random() *
                    Math.max(
                        10,
                        plattform.breite -
                        welt.CONFIG.MUENZE_GROESSE -
                        40
                    ),

                y:
                    plattform.y -
                    welt.CONFIG.MUENZE_GROESSE -
                    16
            };
        }

        return {
            x: bevorzugterX,
            y:
                welt.CONFIG.BODEN_Y -
                welt.CONFIG.MUENZE_GROESSE -
                8
        };
    }

    if (
        plattformen.length &&
        Math.random() > 0.2
    ) {
        const kandidaten =
            plattformen.filter(
                p =>
                    p.x >
                    welt.status.x - 300
            );

        const quelle =
            kandidaten.length
                ? kandidaten
                : plattformen;

        const plattform =
            quelle[
            Math.floor(
                Math.random() *
                quelle.length
            )
            ];

        return {
            x:
                plattform.x +
                20 +
                Math.random() *
                Math.max(
                    10,
                    plattform.breite -
                    welt.CONFIG.MUENZE_GROESSE -
                    40
                ),

            y:
                plattform.y -
                welt.CONFIG.MUENZE_GROESSE -
                16
        };
    }

    return {
        x:
            welt.status.x +
            600 +
            Math.random() * 1300,

        y:
            welt.CONFIG.BODEN_Y -
            welt.CONFIG.MUENZE_GROESSE -
            8
    };
}

function fuegeMuenzeHinzu(
    welt,
    position
) {
    const element =
        document.createElement("div");

    element.classList.add(
        "muenze",
        "muenze-aufbau"
    );

    element.innerHTML =
        "<span>1</span>";

    const muenze = {
        element,
        x: position.x,
        y: position.y,

        bereitAb:
            performance.now() +
            welt.CONFIG.MUENZE_AUFBAUZEIT,

        bereit: false
    };

    element.style.left =
        `${muenze.x -
        welt.status.kameraX}px`;

    element.style.top =
        `${muenze.y}px`;

    element.style.width =
        `${welt.CONFIG.MUENZE_GROESSE}px`;

    element.style.height =
        `${welt.CONFIG.MUENZE_GROESSE}px`;

    spielfeld.appendChild(
        element
    );

    welt.listen.muenzen.push(
        muenze
    );
}

export function initialisiereMuenzen(
    welt
) {
    if (
        welt.status.levelId ===
        "mittel"
    ) {
        welt.status.levelDaten
            .mittelCoinsMax = 100;

        for (
            let i = 0;
            i < 100;
            i++
        ) {
            const x =
                550 +
                i * 230 +
                (i % 3) * 70;

            fuegeMuenzeHinzu(
                welt,
                zufaelligeMuenzenPosition(
                    welt,
                    x
                )
            );
        }

        return;
    }

    if (
        welt.status.levelId ===
        "leicht"
    ) {
        for (
            let i = 0;
            i < 14;
            i++
        ) {
            fuegeMuenzeHinzu(
                welt,
                zufaelligeMuenzenPosition(
                    welt,
                    welt.status.x +
                    600 +
                    i * 240
                )
            );
        }

        return;
    }

    for (
        let i = 0;
        i < 16;
        i++
    ) {
        fuegeMuenzeHinzu(
            welt,
            zufaelligeMuenzenPosition(
                welt,
                welt.status.x +
                500 +
                i * 260
            )
        );
    }
}

export function neueMuenzeErzeugen(
    welt,
    festeX = null
) {
    if (
        !muenzeDarfErzeugtWerden(
            welt
        )
    ) {
        return;
    }

    fuegeMuenzeHinzu(
        welt,
        zufaelligeMuenzenPosition(
            welt,
            festeX
        )
    );
}

export function aktualisiereMuenzen(
    welt
) {
    const jetzt =
        performance.now();

    if (
        welt.status.levelId ===
        "leicht"
    ) {
        while (
            welt.listen.muenzen.length <
            welt.CONFIG.MUENZEN_MAXIMAL_LEICHT &&
            !welt.status.spielBeendet
        ) {
            neueMuenzeErzeugen(
                welt,
                welt.status.x +
                900 +
                Math.random() * 1100
            );
        }
    }

    if (
        welt.status.levelId ===
        "schwer"
    ) {
        while (
            welt.listen.muenzen.filter(
                muenze =>
                    muenze.x >
                    welt.status.x - 250
            ).length < 16 &&
            welt.listen.muenzen.length <
            28 &&
            !welt.status.spielBeendet
        ) {
            neueMuenzeErzeugen(
                welt,
                welt.status.x +
                850 +
                Math.random() *
                1500
            );
        }
    }

    if (
        welt.status.levelId ===
        "mittel" &&
        welt.status
            .naechsterMuenzVerlust !==
        null &&
        jetzt >=
        welt.status
            .naechsterMuenzVerlust
    ) {
        const kandidaten =
            welt.listen.muenzen.filter(
                muenze =>
                    !muenze.bereitsGeloescht
            );

        if (
            kandidaten.length
        ) {
            const muenze =
                kandidaten[
                Math.floor(
                    Math.random() *
                    kandidaten.length
                )
                ];

            muenze.bereitsGeloescht =
                true;

            muenze.element.classList.add(
                "muenze-verschwindet"
            );

            setTimeout(() => {
                const index =
                    welt.listen.muenzen.indexOf(
                        muenze
                    );

                if (
                    index >= 0
                ) {
                    welt.listen.muenzen.splice(
                        index,
                        1
                    );
                }

                muenze.element?.remove();
            }, 250);
        }

        welt.status.naechsterMuenzVerlust +=
            welt.CONFIG.LEVEL_MITTEL_VERSCHWINDEN;
    }

    if (
        welt.status.levelId ===
        "mittel" &&
        welt.status.gesammelteMuenzen >=
        welt.CONFIG.LEVEL_MITTEL_ZIEL
    ) {
        welt.status.spielBeendet =
            true;

        welt.status.spielGewonnen =
            true;

        welt.status.ergebnisGrund =
            "alle-muenzen";
    }

    if (
        welt.status.levelId ===
        "mittel" &&
        welt.listen.muenzen.length === 0 &&
        welt.status.gesammelteMuenzen <
        welt.CONFIG.LEVEL_MITTEL_ZIEL
    ) {
        welt.status.spielBeendet =
            true;

        welt.status.spielGewonnen =
            false;

        welt.status.ergebnisGrund =
            "muenzen-weg";
    }
}

export function animiereMuenzen(
    welt
) {
    const jetzt =
        performance.now();

    for (
        const muenze of welt.listen.muenzen
    ) {
        if (
            !muenze.element
        ) {
            continue;
        }

        if (
            !muenze.bereit &&
            jetzt >=
            muenze.bereitAb
        ) {
            muenze.bereit =
                true;

            muenze.element.classList.remove(
                "muenze-aufbau"
            );
        }

        muenze.element.style.left =
            `${muenze.x -
            welt.status.kameraX}px`;
    }
}

export function pruefeMuenzenKollision(
    welt
) {
    const spielerLinks =
        welt.status.x +
        welt.CONFIG.SPIELER_HITBOX_X;

    const spielerRechts =
        spielerLinks +
        welt.CONFIG.SPIELER_HITBOX_BREITE;

    const spielerOben =
        welt.status.y +
        welt.CONFIG.SPIELER_HITBOX_Y;

    const spielerUnten =
        spielerOben +
        welt.CONFIG.SPIELER_HITBOX_HOEHE;

    for (
        let i =
            welt.listen.muenzen.length - 1;
        i >= 0;
        i--
    ) {
        const muenze =
            welt.listen.muenzen[i];

        if (
            !muenze.bereit ||
            muenze.bereitsGeloescht
        ) {
            continue;
        }

        const trifft =
            spielerRechts >
            muenze.x &&
            spielerLinks <
            muenze.x +
            welt.CONFIG.MUENZE_GROESSE &&
            spielerUnten >
            muenze.y &&
            spielerOben <
            muenze.y +
            welt.CONFIG.MUENZE_GROESSE;

        if (!trifft) {
            continue;
        }

        muenze.element.remove();

        welt.listen.muenzen.splice(
            i,
            1
        );

        welt.status.gesammelteMuenzen +=
            1;

        if (
            welt.status.levelId ===
            "leicht" &&
            welt.status.gesammelteMuenzen >=
            welt.CONFIG.LEVEL_LEICHT_ZIEL
        ) {
            welt.status.spielBeendet =
                true;

            welt.status.spielGewonnen =
                true;

            welt.status.ergebnisGrund =
                "ziel-erreicht";
        }
    }
}

export function aktualisiereMuenzHinweis(
    welt
) {
    let hinweis =
        document.getElementById(
            "muenzenHinweis"
        );

    if (!hinweis) {
        hinweis =
            document.createElement(
                "div"
            );

        hinweis.id =
            "muenzenHinweis";

        hinweis.classList.add(
            "versteckt"
        );

        hinweis.innerHTML = `
            <span class="muenzenHinweisPfeil">→</span>
            <span class="hinweisMuenze">1</span>
            <span class="muenzenHinweisText"></span>
        `;

        spielfeld.appendChild(
            hinweis
        );
    }

    const sichtbare =
        sichtbareMuenzen(
            welt
        ).some(
            muenze =>
                muenze.bereit &&
                !muenze.bereitsGeloescht
        );

    const ausserhalb =
        welt.listen.muenzen.filter(
            muenze =>
                muenze.bereit &&
                !muenze.bereitsGeloescht
        );

    if (
        sichtbare ||
        ausserhalb.length === 0
    ) {
        hinweis.classList.add(
            "versteckt"
        );

        return;
    }

    const naechste =
        ausserhalb.reduce(
            (beste, muenze) => {
                if (!beste) {
                    return muenze;
                }

                return Math.abs(
                    muenze.x -
                    welt.status.x
                ) <
                    Math.abs(
                        beste.x -
                        welt.status.x
                    )
                    ? muenze
                    : beste;
            },
            null
        );

    const rechts =
        naechste.x >
        welt.status.x;

    hinweis.classList.remove(
        "versteckt"
    );

    hinweis.classList.toggle(
        "links",
        !rechts
    );

    hinweis.classList.toggle(
        "rechts",
        rechts
    );

    hinweis.querySelector(
        ".muenzenHinweisPfeil"
    ).textContent =
        rechts
            ? "→"
            : "←";

    hinweis.querySelector(
        ".muenzenHinweisText"
    ).textContent =
        "Münze";
}