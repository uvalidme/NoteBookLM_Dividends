// script.js

// Définition du portefeuille utilisateur
let portefeuilleUtilisateur = [
    { "Ticker": "TTE.PA", "Quantite": 100 },
    { "Ticker": "SAN.PA", "Quantite": 50 },
    { "Ticker": "SW.PA", "Quantite": 20 }, 
    { "Ticker": "CS.PA", "Quantite": 40 }, 
    { "Ticker": "AC.PA", "Quantite": 30 } 
];

// --- RÉCUPÉRATION ASYNCHRONE DES COURS (MAJ pour utiliser le backend /api/get-quotes) ---
async function fetchCoursActuels(tickers) {
    try {
        // --- BLOC DE SIMULATION SUPPRIMÉ / REMPLACÉ PAR FETCH ---
        // Appel au point de terminaison Serverless (Serverless Function sur Vercel)
        const response = await fetch('/api/get-quotes', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ tickers: tickers }) 
        });
        
        if (!response.ok) {
            // Log si l'appel API échoue (ex: erreur 500 sur le serveur)
            throw new Error(`Erreur HTTP ${response.status} lors de la récupération des cours.`);
        }
        
        // Retourne le JSON des prix envoyés par get-quotes.js
        return await response.json();
        
    } catch (e) {
        console.error("Erreur critique de communication avec le backend. Affichage par défaut (10.0 €):", e);
        
        // Fallback: Retourne des valeurs par défaut si le backend échoue complètement
        return simulerCoursLocaux(tickers);
    }
}

// Fonction de simulation locale (Conservée uniquement comme mécanisme de repli)
function simulerCoursLocaux(tickers) {
    // Si l'API échoue, nous retournons au mode manuel avec les derniers prix connus
    const simulateur = {
        "TTE.PA": 55.00,
        "SAN.PA": 86.50,
        "SW.PA": 90.00,
        "AC.PA": 41.57, 
        "CS.PA": 39.41, 
        // ... Ajouter les autres prix ici si vous voulez un fallback précis ...
    };
    
    const fallbackQuotes = {};
    tickers.forEach(t => {
        fallbackQuotes[t] = simulateur[t] || 10.0; 
    });
    return fallbackQuotes;
}


// --- FONCTIONS D'ACTION UTILISATEUR (Aucun changement dans cette section) ---

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


// --- FONCTION DE RAFRAÎCHISSEMENT ET DE CALCUL (ASYNCHRONE) ---

async function rafraichirAffichageTracker() {
    // 1. Liste des Tickers à rafraîchir
    const tickersToFetch = portefeuilleUtilisateur.map(p => p.Ticker);

    // 2. Récupérer les cours actuels via l'API (maintenant le backend /api/get-quotes.js)
    const coursActuels = await fetchCoursActuels(tickersToFetch);

    // 3. Filtrer et enrichir les données
    const dataAAfficher = DATA_SBF120
        .filter(sbf => portefeuilleUtilisateur.some(p => p.Ticker === sbf.Ticker))
        .map(actionSBF => {
            const portefeuilleInfo = portefeuilleUtilisateur.find(p => p.Ticker === actionSBF.Ticker);
            
            let action = { ...actionSBF };
            action.Quantite = portefeuilleInfo.Quantite;
            
            // UTILISE LE COURS RÉCUPÉRÉ DU BACKEND
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


// --- GESTION DU TRI ---

function sortTable(key) {
    if (!window.DONNEES_TRACKER_ACTUALISEES) return;
    
    const sortedData = [...window.DONNEES_TRACKER_ACTUALISEES].sort((a, b) => {
        const keyMap = {
            'cours': 'Cours_Actuel',
            'rendement': 'Rendement_Actuel' 
        };
        
        const actualKey = keyMap[key] || key.charAt(0).toUpperCase() + key.slice(1);
        
        const keyA = a[actualKey];
        const keyB = b[actualKey];

        if (typeof keyA === 'number' && typeof keyB === 'number') {
            return keyB - keyA;
        }
        return 0;
    });
    peuplerTableau(sortedData);
}

// --- INITIALISATION ---

document.addEventListener('DOMContentLoaded', () => {
    // Appel de la fonction de rafraîchissement asynchrone
    rafraichirAffichageTracker(); 

    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            sortTable(header.getAttribute('data-sort'));
        });
    });
});
