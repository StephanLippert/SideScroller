const SVG_NS = "http://www.w3.org/2000/svg";

function linie(svg, x1, y1, x2, y2, breite = 5) {
    const el = document.createElementNS(SVG_NS, "line");
    el.setAttribute("x1", x1);
    el.setAttribute("y1", y1);
    el.setAttribute("x2", x2);
    el.setAttribute("y2", y2);
    el.setAttribute("stroke", "#ffffff");
    el.setAttribute("stroke-width", breite);
    el.setAttribute("stroke-linecap", "round");
    svg.appendChild(el);
    return el;
}

function kreis(svg, cx, cy, r) {
    const el = document.createElementNS(SVG_NS, "circle");
    el.setAttribute("cx", cx);
    el.setAttribute("cy", cy);
    el.setAttribute("r", r);
    el.setAttribute("fill", "#ffffff");
    svg.appendChild(el);
    return el;
}

export function erstelleSpielerElement() {
    const element = document.createElement("div");
    element.id = "spieler";
    element.setAttribute("aria-hidden", "true");

    const svg = document.createElementNS(SVG_NS, "svg");
    svg.setAttribute("viewBox", "0 0 80 90");
    svg.setAttribute("width", "80");
    svg.setAttribute("height", "90");
    svg.setAttribute("focusable", "false");

    kreis(svg, 40, 16, 11);
    const koerper = linie(svg, 40, 27, 40, 58, 5.5);
    const linkerArm = linie(svg, 40, 34, 22, 49, 5);
    const rechterArm = linie(svg, 40, 34, 58, 49, 5);
    const linkesBein = linie(svg, 40, 58, 25, 82, 5.5);
    const rechtesBein = linie(svg, 40, 58, 55, 82, 5.5);

    element.appendChild(svg);
    element._stickman = { linkerArm, rechterArm, linkesBein, rechtesBein, koerper };
    return element;
}

export function setzeSpielerDarstellung(welt) {
    const element = document.getElementById("spieler");
    if (!element || !welt) return;

    const { linkerArm, rechterArm, linkesBein, rechtesBein } = element._stickman || {};
    const bewegtSich = Boolean(
        welt.status.spielGestartet &&
        (welt.listen.tasten.ArrowLeft || welt.listen.tasten.ArrowRight)
    );
    const luft = !welt.status.istAmBoden;

    let phase = bewegtSich ? Math.sin(welt.status.laufPhase) : 0;
    let armA = 49 + phase * 8;
    let armB = 49 - phase * 8;
    let legA = 82 - phase * 11;
    let legB = 82 + phase * 11;

    if (luft) {
        armA = 45;
        armB = 45;
        legA = 78;
        legB = 78;
    }

    linkerArm?.setAttribute("x2", 22 + phase * 10);
    linkerArm?.setAttribute("y2", armA);
    rechterArm?.setAttribute("x2", 58 - phase * 10);
    rechterArm?.setAttribute("y2", armB);
    linkesBein?.setAttribute("x2", 25 + phase * 10);
    linkesBein?.setAttribute("y2", legA);
    rechtesBein?.setAttribute("x2", 55 - phase * 10);
    rechtesBein?.setAttribute("y2", legB);

    element.classList.toggle("spieler-laeuft", bewegtSich && !luft);
    element.classList.toggle("spieler-springt", luft);
    element.classList.toggle("spieler-links", welt.status.blickrichtung === "links");
}

export function setzeSpielerposition(welt) {
    const element = document.getElementById("spieler");
    if (!element || !welt) return;
    element.style.left = `${welt.status.x - welt.status.kameraX}px`;
    element.style.top = `${welt.status.y}px`;
}
