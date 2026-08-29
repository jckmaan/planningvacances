from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta
import json
import os

app = Flask(__name__)

DATE_DEBUT = datetime(2026, 9, 17)
DATE_FIN = datetime(2026, 9, 30)

NB_JOURS = (DATE_FIN - DATE_DEBUT).days + 1
FICHIER = "planning.json"

def creer_planning():
    planning = []

    for i in range(NB_JOURS):

        date_jour = DATE_DEBUT + timedelta(days=i)

        planning.append({
            "jour": i + 1,
            "date": date_jour.strftime("%Y-%m-%d"),
            "taches": []
        })

    return planning


def charger_planning():

    if os.path.exists(FICHIER):

        try:
            with open(FICHIER, "r", encoding="utf-8") as fichier:
                return json.load(fichier)

        except (json.JSONDecodeError, OSError):
            pass

    planning = creer_planning()
    sauvegarder_planning(planning)

    return planning


def sauvegarder_planning(planning):

    with open(FICHIER, "w", encoding="utf-8") as fichier:
        json.dump(
            planning,
            fichier,
            ensure_ascii=False,
            indent=4
        )


planning = charger_planning()

@app.route("/")
def index():

    return render_template(
        "index.html",
        planning=planning,
        date_depart=DATE_DEPART.strftime("%Y-%m-%d")
    )

@app.route("/ajouter", methods=["POST"])
def ajouter_tache():

    data = request.json

    jour_index = data.get("jour")
    nom = data.get("nom", "").strip()

    if not nom:
        return jsonify({
            "success": False,
            "message": "La tâche est vide."
        }), 400

    try:
        jour_index = int(jour_index)
    except (TypeError, ValueError):
        return jsonify({
            "success": False,
            "message": "Jour invalide."
        }), 400

    if not 0 <= jour_index < len(planning):
        return jsonify({
            "success": False,
            "message": "Jour invalide."
        }), 400

    planning[jour_index]["taches"].append({
        "nom": nom,
        "terminee": False
    })

    sauvegarder_planning(planning)

    return jsonify({
        "success": True
    })


@app.route("/modifier", methods=["POST"])
def modifier_tache():

    data = request.json

    jour_index = data.get("jour")
    tache_index = data.get("tache")
    terminee = data.get("terminee")

    try:
        jour_index = int(jour_index)
        tache_index = int(tache_index)
    except (TypeError, ValueError):
        return jsonify({
            "success": False
        }), 400

    try:
        planning[jour_index]["taches"][tache_index]["terminee"] = bool(
            terminee
        )

    except (IndexError, KeyError):
        return jsonify({
            "success": False
        }), 400

    sauvegarder_planning(planning)

    return jsonify({
        "success": True
    })


@app.route("/supprimer", methods=["POST"])
def supprimer_tache():

    data = request.json

    jour_index = data.get("jour")
    tache_index = data.get("tache")

    try:
        jour_index = int(jour_index)
        tache_index = int(tache_index)

        del planning[jour_index]["taches"][tache_index]

    except (ValueError, IndexError, KeyError, TypeError):
        return jsonify({
            "success": False
        }), 400

    sauvegarder_planning(planning)

    return jsonify({
        "success": True
    })


@app.route("/reset", methods=["POST"])
def reset():

    global planning

    planning = creer_planning()

    sauvegarder_planning(planning)

    return jsonify({
        "success": True
    })


if __name__ == "__main__":

    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True
    )
