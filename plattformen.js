const spielfeld = document.getElementById("spielfeld");
const START_PLATTFORMEN = 15;
const NACHLADE_ABSTAND = 2500;
const PLATTFORM_ENTFERNUNG = 1800;

function levelDatenStarten(welt) {
    if (!welt.status.levelDaten) {
        welt.status.levelDaten = { letzteX: 350, letzteY: welt.CONFIG.BODEN_Y - 120 };
    }
}

export function erstelleZufaelligePlattformen(welt) {
    welt.listen.plattformen.length = 0;
    levelDatenStarten(welt);

    welt.listen.plattformen.push({
        x:
            0,
        y:
            welt.CONFIG.BODEN_Y,
        breite: 100000,
        hoehe: 40,
        typ: "boden",
        element: null
    });

    welt.listen.plattformen.push({
        x:
            120,
        y:
            welt.CONFIG.BODEN_Y - 120,
        breite: 220,
        hoehe: 20,
        typ: "start",
        element: null
    });

    welt.status.levelDaten.letzteX = 340;
    welt.status.levelDaten.letzteY = welt.CONFIG.BODEN_Y - 100;

    for (let i = 0; i < START_PLATTFORMEN; i++) {
        erstelleNeuePlattform(welt);
    }
}

function erstelleNeuePlattform(welt) {
    const daten = welt.status.levelDaten;
    let neueY = daten.letzteY;
    const zufall = Math.random();

    if (zufall < 0.35) {
        neueY -= 40 + Math.random() * 50;
    }
    else if (zufall < 0.70) {
        neueY += 40 + Math.random() * 50;
    }

    if (welt.listen.plattformen.length % 4 === 0) {
        neueY = welt.CONFIG.BODEN_Y - 120;
    }

    if (neueY < 120) {
        neueY = 120;
    }

    if (neueY > welt.CONFIG.BODEN_Y - 120) {
        neueY = welt.CONFIG.BODEN_Y - 120;
    }

    const breite = 150 + Math.random() * 100;
    const abstand = 140 + Math.random() * 120;

    daten.letzteX += abstand;

    const plattform = {
        x:
            daten.letzteX,
        y:
            neueY,
        breite,
        hoehe: 20,
        typ: "normal",
        element: null
    };

    welt.listen.plattformen.push(plattform);

    daten.letzteX += breite;
    daten.letzteY = neueY;

    return plattform;
}

export function aktualisiereEndlessPlattformen(welt) {
    levelDatenStarten(welt);

    let weitesteX = 0;

    for (const p of welt.listen.plattformen) {
        if (p.x > weitesteX) {
            weitesteX = p.x;
        }
    }

    if (weitesteX < welt.status.x + NACHLADE_ABSTAND) {
        for (let i = 0; i < 10; i++) {
            const p = erstelleNeuePlattform(welt);
            const element = document.createElement("div");
            element.classList.add("plattform");
            p.element = element;
            element.style.left = p.x + "px";
            element.style.top = p.y + "px";
            element.style.width = p.breite + "px";
            element.style.height = p.hoehe + "px";

            spielfeld.appendChild(element);
        }
    }

    welt.listen.plattformen = welt.listen.plattformen.filter(
        p => {
            if (p.typ === "boden") {
                return true;
            }

            if (p.x < welt.status.kameraX - PLATTFORM_ENTFERNUNG) {
                if (p.element) {
                    p.element.remove();
                }

                return false;
            }

            return true;
        }

    );

}







// ============================================================================
// INITIALISIERUNG
// ============================================================================

export function initialisierePlattformen(welt) {


    for (
        const p of welt.listen.plattformen
    ) {


        const element =
            document.createElement("div");



        element.classList.add(
            "plattform"
        );



        p.element =
            element;



        element.style.left =
            p.x + "px";



        element.style.top =
            p.y + "px";



        element.style.width =
            p.breite + "px";



        element.style.height =
            p.hoehe + "px";



        spielfeld.appendChild(
            element
        );


    }

}






// ============================================================================
// KAMERA
// ============================================================================

export function animierePlattformen(welt) {


    for (
        const p of welt.listen.plattformen
    ) {


        if (
            p.element
        ) {


            p.element.style.left =

                (
                    p.x -
                    welt.status.kameraX
                )

                + "px";


        }


    }


}