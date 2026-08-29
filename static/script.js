function actualiserCountdown() {

    const depart = new Date(
        DATE_DEPART + "T00:00:00"
    );

    const maintenant = new Date();

    const difference =
        depart.getTime() -
        maintenant.getTime();


    const countdown =
        document.getElementById("countdown");


    if (difference <= 0) {

        countdown.textContent =
            "🚀 C'EST LE JOUR DU DÉPART !";

        return;
    }


    const jours = Math.floor(
        difference /
        (1000 * 60 * 60 * 24)
    );


    const heures = Math.floor(
        (difference /
        (1000 * 60 * 60)) % 24
    );


    const minutes = Math.floor(
        (difference /
        (1000 * 60)) % 60
    );


    const secondes = Math.floor(
        (difference /
        1000) % 60
    );


    countdown.textContent =
        `J-${jours} ${heures}h ${minutes}m ${secondes}s`;
}


setInterval(
    actualiserCountdown,
    1000
);

actualiserCountdown();


// ==========================================================
// PROGRESSION
// ==========================================================

function actualiserProgression() {

    const cases =
        document.querySelectorAll(
            ".task-checkbox"
        );


    const terminees =
        document.querySelectorAll(
            ".task-checkbox:checked"
        );


    let progression = 0;


    if (cases.length > 0) {

        progression =
            Math.round(
                (terminees.length /
                cases.length) * 100
            );
    }


    document.getElementById(
        "progress"
    ).style.width = progression + "%";


    document.getElementById(
        "progress-text"
    ).textContent =
        progression + "%";
}


actualiserProgression();


// ==========================================================
// COCHER UNE TÂCHE
// ==========================================================

document.querySelectorAll(
    ".task-checkbox"
).forEach((checkbox) => {


    checkbox.addEventListener(
        "change",
        async function() {


            const jour =
                this.dataset.day;


            const tache =
                this.dataset.task;


            const taskName =
                this.parentElement.querySelector(
                    ".task-name"
                );


            taskName.classList.toggle(
                "completed",
                this.checked
            );


            await fetch(
                "/modifier",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        jour: jour,

                        tache: tache,

                        terminee:
                            this.checked

                    })
                }
            );


            actualiserProgression();

        }
    );

});


// ==========================================================
// AJOUTER UNE TÂCHE
// ==========================================================

document.querySelectorAll(
    ".add-button"
).forEach((button) => {


    button.addEventListener(
        "click",
        ajouterTache
    );

});


document.querySelectorAll(
    ".task-input"
).forEach((input) => {


    input.addEventListener(
        "keydown",
        function(event) {

            if (event.key === "Enter") {

                this.parentElement
                    .querySelector(
                        ".add-button"
                    )
                    .click();
            }

        }
    );

});


async function ajouterTache() {

    const container =
        this.parentElement;


    const input =
        container.querySelector(
            ".task-input"
        );


    const nom =
        input.value.trim();


    if (!nom) {

        input.focus();

        return;
    }


    const card =
        this.closest(".day-card");


    const jour =
        card.dataset.day;


    const response =
        await fetch(
            "/ajouter",
            {

                method: "POST",

                headers: {
                    "Content-Type":
                        "application/json"
                },

                body: JSON.stringify({

                    jour: jour,

                    nom: nom

                })
            }
        );


    const data =
        await response.json();


    if (data.success) {

        location.reload();

    }

}


// ==========================================================
// SUPPRESSION
// ==========================================================

document.querySelectorAll(
    ".delete-task"
).forEach((button) => {


    button.addEventListener(
        "click",
        async function() {


            if (
                !confirm(
                    "Supprimer cette tâche ?"
                )
            ) {
                return;
            }


            const jour =
                this.dataset.day;


            const tache =
                this.dataset.task;


            await fetch(
                "/supprimer",
                {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        jour: jour,

                        tache: tache

                    })
                }
            );


            location.reload();

        }
    );

});


// ==========================================================
// MODE SOMBRE
// ==========================================================

const themeButton =
    document.getElementById(
        "theme-button"
    );


const theme =
    localStorage.getItem(
        "theme"
    );


if (theme === "dark") {

    document.body.classList.add(
        "dark"
    );

    themeButton.textContent =
        "☀️ Mode clair";
}


themeButton.addEventListener(
    "click",
    function() {


        document.body.classList.toggle(
            "dark"
        );


        const sombre =
            document.body.classList.contains(
                "dark"
            );


        localStorage.setItem(
            "theme",
            sombre ? "dark" : "light"
        );


        this.textContent =
            sombre
                ? "☀️ Mode clair"
                : "🌙 Mode sombre";

    }
);


// ==========================================================
// RESET
// ==========================================================

document.getElementById(
    "reset-button"
).addEventListener(
    "click",
    async function() {


        const confirmation =
            confirm(
                "⚠️ Supprimer toutes les tâches ?"
            );


        if (!confirmation) {
            return;
        }


        await fetch(
            "/reset",
            {
                method: "POST"
            }
        );


        location.reload();

    }
);
