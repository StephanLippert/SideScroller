const spieler = document.getElementById("spieler");

let x = 100;
let y = 550;

let schwerkraft = 1;
let geschwindigkeitY = 0;

let istAmBoden = true;

document.addEventListener("keydown", (ereignis) => {

    if (ereignis.key === "ArrowRight") {
        x += 10;
    }

    if (ereignis.key === "ArrowLeft") {
        x -= 10;
    }

    if (ereignis.key === "ArrowUp" && istAmBoden) {
        geschwindigkeitY = -15;
        istAmBoden = false;
    }

});

function spielSchleife() {

    geschwindigkeitY += schwerkraft;
    y += geschwindigkeitY;

    if (y >= 550) {
        y = 550;
        geschwindigkeitY = 0;
        istAmBoden = true;
    }

    spieler.style.left = x + "px";
    spieler.style.top = y + "px";

    requestAnimationFrame(spielSchleife);
}

spielSchleife();