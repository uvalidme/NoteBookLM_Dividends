// --- SIMULATION DU MOTEUR DYNAMIQUE ---

function simulerAcquisitionCours(url_cotation) {
    // Dans une application réelle, ce serait le code de web scraping ou l'appel API.
    // Ici, nous utilisons des prix simulés pour démontrer le calcul du Rendement Actuel.
    if (url_cotation.includes("totalenergies")) return 55.0; // Prix simulé
    if (url_cotation.includes("hermes")) return 2100.0;     // Prix simulé
    if (url_cotation.includes("sanofi")) return 86.5;       // Prix simulé
    if (url_cotation.includes("icade")) return 25.0;        // Prix simulé
    
    // Pour les actions sans prix spécifique connu
    return 5.0; 
}

function mettreAJourDonneesDynamiques(data) {
    return data.map(action => {
        // 1. Acquisition du cours actuel ($C_t$)
        const cours_actuel = simulerAcquisitionCours(action.URL_Cotation);
        action.Cours_Actuel = cours_actuel;

        // 2. Calcul du Rendement Actuel ($R_t$)
        let rendement_actuel = 0;
        if (action.Dividende_Fixe > 0 && cours_actuel > 0) {
            rendement_actuel = (action.Dividende_Fixe / cours_actuel) * 100;
        }
        action.Rendement_Actuel = parseFloat(rendement_actuel.toFixed(2));
        
        // Ajout de champs de portefeuille simulés pour l'affichage dans la table [1]
        action.Quantite = action.Societe.includes("ATOS") ? 200 : 50; 
        action.Versement = action.Frequence > 0 ? "2024-09-15" : "N/A";
        action.Statut = action.Frequence > 0 ? "Prévu" : "N/A";
        
        return action;
    });
}

// Données enrichies dynamiquement
let DONNEES_TRACKER_ACTUALISEES = mettreAJourDonneesDynamiques(DATA_SBF120);

// --- FONCTIONS D'AFFICHAGE DU FRONTEND ---

function peuplerTableau(data) {
    const tbody = document.querySelector('#trackerTable tbody');
    tbody.innerHTML = '';
    let totalValeurMarche = 0;
    let totalSocietes = 0;

    data.forEach(action => {
        const row = tbody.insertRow();
        const historique = `${action.Ininterruption}/${action.Croissance}`;
        totalSocietes++;

        // Calcul de la valeur de marché du portefeuille de l'utilisateur (simulation)
        const valeurAction = action.Cours_Actuel * action.Quantite;
        totalValeurMarche += valeurAction;

        // Classe CSS pour les actions sans dividende (Ex: ATOS [5])
        const classZero = (action.Dividende_Fixe === 0) ? 'zero-dividend' : '';
        
        row.insertCell().textContent = action.Societe;
        row.insertCell().textContent = action.Ticker;

        // Colonnes dynamiques
        row.insertCell().innerHTML = `<span class="dynamic ${classZero}">${action.Cours_Actuel.toFixed(2)} €</span>`;
        row.insertCell().textContent = `${action.Dividende_Fixe.toFixed(2)} €`;
        row.insertCell().innerHTML = `<span class="dynamic ${classZero}">${action.Rendement_Actuel.toFixed(2)} %</span>`;

        // Colonnes analytiques statiques
        row.insertCell().textContent = `${action.Payout_Ratio.toFixed(2)} %`;
        row.insertCell().textContent = historique;
        row.insertCell().textContent = action.Frequence > 0 ? `${action.Frequence}x/an` : 'N/A';
        
        // Colonnes du calendrier d'origine [1]
        row.insertCell().textContent = action.Quantite;
        row.insertCell().textContent = action.Versement;
        row.insertCell().textContent = action.Statut;
        row.insertCell().innerHTML = `<button onclick="supprimerAction('${action.Ticker}')">X</button>`;
    });

    // Mise à jour des totaux en haut de page [1]
    document.getElementById('societes').textContent = totalSocietes;
    document.getElementById('total_estime_marche').textContent =';
        
        // Colonnes du calendrier d'origine [1]
        row.insertCell().textContent = action.Quantite;
        row.insertCell().textContent = action.Versement;
        row.insertCell().textContent = action.Statut;
        row.insertCell().innerHTML = `<button onclick="supprimerAction('${action.Ticker}')">X</button>`;
    });

    // Mise à jour des totaux en haut de page [1]
    document.getElementById('societes').textContent = totalSocietes;
    document.getElementById('total_estime_marche').textContent = `${totalValeurMarche.toFixed(2)} €`;
}

// Fonction de tri (simplifiée)
function sortTable(key) {
    const sortedData = [...DONNEES_TRACKER_ACTUALISEES].sort((a, b) => {
        // Le tri est essentiel pour mettre en évidence les meilleurs rendements ou les actions sans dividende
        return b[key.charAt(0).toUpperCase() + key.slice(1)] - a[key.charAt(0).toUpperCase() + key.slice(1)];
    });
    peuplerTableau(sortedData);
}

// Ajoutez des écouteurs de tri
document.addEventListener('DOMContentLoaded', () => {
    peuplerTableau(DONNEES_TRACKER_ACTUALISEES);
    
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            sortTable(header.getAttribute('data-sort'));
        });
    });
});

// Fonctions placeholder pour les actions utilisateur [1]
function ajouterAction() {
    alert("Ajout d'action : Cette fonction interagirait avec la base de données DATA_SBF120 pour permettre à l'utilisateur de choisir une action et de saisir sa quantité.");
}

function editerAction() {
    alert("Édition des données : Permettrait de modifier la Quantité ou le Statut d'une action du portefeuille.");
}

function supprimerAction(ticker) {
     alert(`Suppression de l'action ${ticker} du portefeuille.`);
}
