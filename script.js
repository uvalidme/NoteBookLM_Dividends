// script.js

// Définition du portefeuille utilisateur
// Utilisé pour stocker les actions sélectionnées par l'utilisateur (Ticker et Quantité)
let portefeuilleUtilisateur = [
    { "Ticker": "TTE.PA", "Quantite": 100 },
    { "Ticker": "SAN.PA", "Quantite": 50 },
    { "Ticker": "SW.PA", "Quantite": 20 } 
];

// --- SIMULATION DU MOTEUR DYNAMIQUE ---

function simulerAcquisitionCours(url_cotation) {
    // Les prix simulés doivent couvrir TOUTES les actions que vous ajoutez dans data.js.
    if (url_cotation.includes("totalenergies")) return 55.0; 
    if (url_cotation.includes("sanofi")) return 86.5;       
    if (url_cotation.includes("sodexo")) return 55.0; 
    if (url_cotation.includes("icade")) return 25.0;
    
    // Prix par défaut: S'applique à toutes les autres actions non simulées explicitement.
    return 10.0; 
}

// --- FONCTIONS D'ACTION UTILISATEUR ---

function ajouterAction() {
    let tickerAAjouter = prompt("Entrez le Ticker de l'action SBF 120 à ajouter :").trim().toUpperCase();
    
    if (!tickerAAjouter) return; 

    // Recherche dans la base DATA_SBF120 complète
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
        // Mise à jour si l'action existe déjà
        portefeuilleUtilisateur[indexExistant].Quantite += quantite;
    } else {
        // Ajout de la nouvelle action
        portefeuilleUtilisateur.push({ Ticker: tickerAAjouter, Quantite: quantite });
    }

    // L'appel à rafraichirAffichageTracker() est CRUCIAL ici
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


// --- FONCTION DE RAFRAÎCHISSEMENT ET DE CALCUL ---

function rafraichirAffichageTracker() {
    // 1. Filtrer la base complète (DATA_SBF120) pour n'afficher que les actions du portefeuille
    const dataAAfficher = DATA_SBF120
        .filter(sbf => portefeuilleUtilisateur.some(p => p.Ticker === sbf.Ticker))
        .map(actionSBF => {
            const portefeuilleInfo = portefeuilleUtilisateur.find(p => p.Ticker === actionSBF.Ticker);
            
            let action = { ...actionSBF };
            action.Quantite = portefeuilleInfo.Quantite; // Assure que la quantité est tirée du portefeuille
            
            // Recalcul des dynamiques
            const cours_actuel = simulerAcquisitionCours(action.URL_Cotation);
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
    rafraichirAffichageTracker(); 

    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            sortTable(header.getAttribute('data-sort'));
        });
    });
});
