const HIGHSCORE_KEY = "highscore";

export function speichereHighscore(name, muenzen) {
    let highscore = [];

    try {
        highscore = JSON.parse(localStorage.getItem(HIGHSCORE_KEY)) || [];
    }
    catch {
        highscore = [];
    };

    highscore.push({ name: name, muenzen: muenzen, datum: new Date().toLocaleDateString("de-DE") });
    highscore.sort((a, b) => b.muenzen - a.muenzen);
    highscore = highscore.slice(0, 10);

    localStorage.setItem(HIGHSCORE_KEY, JSON.stringify(highscore));
}

export function ladeHighscore() {
    try {
        return (JSON.parse(localStorage.getItem(HIGHSCORE_KEY)) || []);
    }
    catch {
        return [];
    }
}

export function zeigeHighscore() {
    const liste = document.getElementById("highscoreListe");

    if (!liste) return;

    // Alten Inhalt entfernen.
    liste.innerHTML = "";

    // Highscores laden.
    const highscore = ladeHighscore();

    highscore.forEach((eintrag, index) => {
        const li = document.createElement("li");
        li.textContent = `${index + 1}. ${eintrag.name} - ${eintrag.muenzen} Münzen`;
        liste.appendChild(li);
    });
}