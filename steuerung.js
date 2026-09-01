const TASTEN = Object.freeze({
    links: "ArrowLeft",
    rechts: "ArrowRight"
});

let gebunden = false;
let holeAktuelleWelt = () => null;
let starteSpiel = () => { };
let loeseSprungAus = () => { };

function sichereWelt() {
    return holeAktuelleWelt?.() || null;
}

function halteTaste(taste) {
    const welt = sichereWelt();
    if (!welt || welt.status.spielBeendet) return;
    if (!welt.status.spielGestartet) starteSpiel(welt);
    if (!welt.status.spielBeendet) welt.listen.tasten[taste] = true;
}

function loeseTaste(taste) {
    const welt = sichereWelt();
    if (welt) welt.listen.tasten[taste] = false;
}

function bindeHalten(element, taste) {
    if (!element) return;

    const start = (event) => {
        event.preventDefault();
        element.setPointerCapture?.(event.pointerId);
        halteTaste(taste);
    };

    const ende = (event) => {
        event.preventDefault();
        loeseTaste(taste);
    };

    element.addEventListener("pointerdown", start, { passive: false });
    element.addEventListener("pointerup", ende, { passive: false });
    element.addEventListener("pointercancel", ende, { passive: false });
    element.addEventListener("pointerleave", (event) => {
        if (event.buttons === 0) loeseTaste(taste);
    });
}

export function initialisiereSteuerung(getWelt, onStart, onSprung) {
    holeAktuelleWelt = getWelt || (() => null);
    starteSpiel = onStart || (() => { });
    loeseSprungAus = onSprung || (() => { });

    if (gebunden) return;
    gebunden = true;

    const links = document.getElementById("touchLinks");
    const rechts = document.getElementById("touchRechts");
    const sprung = document.getElementById("touchSprung");

    bindeHalten(links, TASTEN.links);
    bindeHalten(rechts, TASTEN.rechts);

    sprung?.addEventListener("pointerdown", (event) => {
        event.preventDefault();
        const welt = sichereWelt();
        if (!welt || welt.status.spielBeendet) return;
        if (!welt.status.spielGestartet) starteSpiel(welt);
        if (!welt.status.spielBeendet) loeseSprungAus();
    }, { passive: false });
}

export function setzeMobileSteuerungSichtbarkeit() {
    const touch = document.getElementById("touchSteuerung");
    if (!touch) return;
    const mobil = window.matchMedia("(hover: none) and (pointer: coarse)").matches
        || (window.innerWidth <= 900 && "ontouchstart" in window);
    touch.classList.toggle("sichtbar", mobil);
}
