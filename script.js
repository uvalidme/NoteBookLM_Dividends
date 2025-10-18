// script.js

// Définition du portefeuille utilisateur
let portefeuilleUtilisateur = [
    { "Ticker": "TTE.PA", "Quantite": 100 },
    { "Ticker": "SAN.PA", "Quantite": 50 },
    { "Ticker": "SW.PA", "Quantite": 20 } 
];

// --- SIMULATION REMPLACÉE PAR LA RÉCUPÉRATION ASYNCHRONE ---
// Cette fonction simule l'appel à une API réelle et renvoie les cours.
// REMPLACER cette fonction par un fetch réel.
async function fetchCoursActuels(tickers) {
    // EN PRODUCTION, CECI SERAIT UN APPEL API RÉEL VERS VOTRE BACKEND :
    // const response = await fetch('/api/get-quotes', { method: 'POST', body: JSON.stringify({ tickers }) });
    // const realTimeQuotes = await response.json();
    // return realTimeQuotes;

    // SIMULATION AVEC PRIX FIXES EN ATTENDANT LE BACKEND :
    const simulateur = {
        "TTE.PA": 55.00,
        "SAN.PA": 86.50,
        "SW.PA": 90.00,
        "AC.PA": 41.57, // Cours corrigé
        "ICAD.PA": 25.00,
        "RUI.PA": 31.00,
        "ATO.PA": 5.00,
        "AI.PA": 173.0,
        // ... Ajouter ici les 120+ prix tant que le backend n'est pas prêt ...
    };
    
    // Filtre pour ne renvoyer que les Tickers demandés
    const realTimeQuotes = {};
    tickers.forEach(t => {
        realTimeQuotes[t] = simulateur[t] || 10.0; // Utilise 10.0 si non trouvé dans la simulation
    });
    return realTimeQuotes;
}

// --- FONCTIONS D'ACTION UTILISATEUR (Aucun changement) ---

function ajouterAction() {
    let tickerAAjouter = prompt("Entrez le Ticker de l'action SBF 120 à ajouter :").trim().toUpperCase();
    
    if (!tickerAAjouter) return; 

    const actionStatique = DATA_SBF120.find(a => a.Ticker === tickerAAjouter);

    if (!actionStatique) {
        alert(`Ticker '${tickerAAjouter}' non trouvé dans la base SBF 120.`);
        return;
    }

    const quantiteStr = prompt(`Combien d'actions ${tickerAAjouter} détenez-vous ?`);
    const quantite = parseInt(quantiteStr, 10);

    if (isNaN(quantite) || quantite <= 0) {
        alert("Quantité invalide. Annulation.");
        return;
    }
    
    const indexExistant = portefeuilleUtilisateur.findIndex(a => a.Ticker === tickerAAjouter);
    
    if (indexExistant !== -1) {
        portefeuilleUtilisateur[indexExistant].Quantite += quantite;
    } else {
        portefeuilleUtilisateur.push({ Ticker: tickerAAjouter, Quantite: quantite });
    }

    rafraichirAffichageTracker();
    alert(`${quantite} actions de ${actionStatique.Societe} (${tickerAAjouter}) ajoutées!`);
}

function supprimerAction(ticker) {
    portefeuilleUtilisateur = portefeuilleUtilisateur.filter(action => action.Ticker !== ticker);
    rafraichirAffichageTracker();
}

function editerAction() {
    alert("Fonctionnalité d'édition simulée.");
}


// --- FONCTION DE RAFRAÎCHISSEMENT ET DE CALCUL (DEVIENT ASYNCHRONE) ---

async function rafraichirAffichageTracker() {
    // 1. Liste des Tickers à rafraîchir
    const tickersToFetch = portefeuilleUtilisateur.map(p => p.Ticker);

    // 2. Récupérer les cours actuels via l'API (simulée ici)
    const coursActuels = await fetchCoursActuels(tickersToFetch);

    // 3. Filtrer et enrichir les données
    const dataAAfficher = DATA_SBF120
        .filter(sbf => portefeuilleUtilisateur.some(p => p.Ticker === sbf.Ticker))
        .map(actionSBF => {
            const portefeuilleInfo = portefeuilleUtilisateur.find(p => p.Ticker === actionSBF.Ticker);
            
            let action = { ...actionSBF };
            action.Quantite = portefeuilleInfo.Quantite;
            
            // UTILISE LE COURS RÉCUPÉRÉ (ou le défaut si l'API ne le trouve pas)
            const cours_actuel = coursActuels[action.Ticker] || 0; 
            action.Cours_Actuel = cours_actuel;
            
            let rendement_actuel = 0;
            if (action.Dividende_Fixe > 0 && cours_actuel > 0) {
                rendement_actuel = (action.Dividende_Fixe / cours_actuel) * 100;
            }
            action.Rendement_Actuel = parseFloat(rendement_actuel.toFixed(2));

            action.Versement = action.Frequence > 0 ? "2024-XX-XX" : "N/A";
            action.Statut = action.Frequence > 0 ? "Prévu" : "N/A";
            
            return action;
        });

    window.DONNEES_TRACKER_ACTUALISEES = dataAAfficher;
    
    peuplerTableau(dataAAfficher); 
}

function peuplerTableau(data) {
    // ... (Le corps de peuplerTableau est trop long, il reste identique) ...
    // NOTE : Assurez-vous que l'initialisation appelle rafraichirAffichageTracker() sans 'await'
    // car 'DOMContentLoaded' n'est pas asynchrone, mais la fonction appellée l'est.

    const tbody = document.querySelector('#trackerTable tbody');
    tbody.innerHTML = '';
    let totalValeurMarche = 0;
    let totalSocietes = 0;

    data.forEach(action => {
        const row = tbody.insertRow();
        const historique = `${action.Ininterruption}/${action.Croissance}`;
        totalSocietes++;

        const valeurAction = action.Cours_Actuel * action.Quantite;
        totalValeurMarche += valeurAction;

        const classZero = (action.Dividende_Fixe === 0) ? 'zero-dividend' : '';
        
        row.insertCell().textContent = action.Societe;
        row.insertCell().textContent = action.Ticker;
        row.insertCell().innerHTML = `<span class="dynamic ${classZero}">${action.Cours_Actuel.toFixed(2)} €</span>`;
        row.insertCell().textContent = `${action.Dividende_Fixe.toFixed(2)} €`;
        row.insertCell().innerHTML = `<span class="dynamic ${classZero}">${action.Rendement_Actuel.toFixed(2)} %</span>`;
        row.insertCell().textContent = `${action.Payout_Ratio.toFixed(2)} %`;
        row.insertCell().textContent = historique;
        row.insertCell().textContent = action.Frequence > 0 ? `${action.Frequence}x/an` : 'N/A';
        
        row.insertCell().textContent = action.Quantite;
        row.insertCell().textContent = action.Versement;
        row.insertCell().textContent = action.Statut;
        row.insertCell().innerHTML = `<button onclick="supprimerAction('${action.Ticker}')">X</button>`;
    });

    document.getElementById('societes').textContent = totalSocietes;
    document.getElementById('total_estime_marche').textContent = `${totalValeurMarche.toFixed(2)} €`;
}


// --- GESTION DU TRI (Reste identique) ---

function sortTable(key) {
    // ... (Reste identique)
}

// --- INITIALISATION (Reste identique) ---

document.addEventListener('DOMContentLoaded', () => {
    // Appel asynchrone (non bloquant)
    rafraichirAffichageTracker(); 

    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            sortTable(header.getAttribute('data-sort'));
        });
    });
});
