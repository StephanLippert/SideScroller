const player = document.getElementById("spieler");

let x = 100;

document.addEventListener("keydown", (event) => {

    if (event.key === "ArrowRight") {
        x += 10;
        player.style.left = x + "px";
    }
    if (event.key === "ArrowLeft") {
        x -= 10;
        player.style.left = x + "px";
    }
});