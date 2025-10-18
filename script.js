// Définir ici un portefeuille utilisateur initial (qui pourrait être vide)
// Utilisé pour stocker les actions sélectionnées par l'utilisateur (Ticker et Quantité)
let portefeuilleUtilisateur = [
    // Exemple : Portefeuille initial avec 50 actions HERMES
    { "Ticker": "RMS.PA", "Quantite": 50 } 
];

// --- SIMULATION DU MOTEUR DYNAMIQUE ---

function simulerAcquisitionCours(url_cotation) {
    // Les prix sont simulés pour permettre le calcul du rendement actuel
    if (url_cotation.includes("totalenergies")) return 55.0; 
    if (url_cotation.includes("hermes")) return 2100.0;     
    if (url_cotation.includes("sanofi")) return 86.5;       
    if (url_cotation.includes("icade")) return 25.0;        
    if (url_cotation.includes("air-liquide")) return 173.0;
    
    return 5.0; // Prix par défaut
}

// --- FONCTIONS D'ACTION UTILISATEUR ---

function ajouterAction() {
    // 1. Demander le Ticker
    let tickerAAjouter = prompt("Entrez le Ticker de l'action SBF 120 à ajouter (ex: SAN.PA, RMS.PA) :").trim().toUpperCase();
    
    // Vérification de l'annulation ou de la saisie vide
    if (!tickerAAjouter) return; 

    // 2. Trouver les données statiques correspondantes dans la base complète
    const actionStatique = DATA_SBF120.find(a => a.Ticker === tickerAAjouter);

    if (!actionStatique) {
        alert(`Ticker '${tickerAAjouter}' non trouvé dans la base SBF 120. Veuillez vérifier la saisie.`);
        return;
    }

    // 3. Demander la quantité
    const quantiteStr = prompt(`Combien d'actions ${tickerAAjouter} détenez-vous ?`);
    const quantite = parseInt(quantiteStr, 10);

    if (isNaN(quantite) || quantite <= 0) {
        alert("Quantité invalide. Veuillez entrer un nombre entier positif.");
        return;
    }
    
    // 4. Mettre à jour le portefeuille utilisateur
    const indexExistant = portefeuilleUtilisateur.findIndex(a => a.Ticker === tickerAAjouter);
    
    if (indexExistant !== -1) {
        // Mettre à jour la quantité si l'action existe déjà
        portefeuilleUtilisateur[indexExistant].Quantite += quantite;
    } else {
        // Ajouter la nouvelle action au portefeuille
        portefeuilleUtilisateur.push({ Ticker: tickerAAjouter, Quantite: quantite });
    }

    // 5. Mettre à jour l'affichage
    rafraichirAffichageTracker();
    alert(`${quantite} actions de ${actionStatique.Societe} (${tickerAAjouter}) ajoutées!`);
}

function supprimerAction(ticker) {
    // Supprime l'action du portefeuille
    portefeuilleUtilisateur = portefeuilleUtilisateur.filter(action => action.Ticker !== ticker);
    rafraichirAffichageTracker();
}

function editerAction() {
    alert("Fonctionnalité d'édition simulée. Elle permettrait de modifier les quantités ou les dates de versement.");
}


// --- FONCTION DE RAFRAÎCHISSEMENT ET DE CALCUL ---

function rafraichirAffichageTracker() {
    // 1. Déterminer quelles actions afficher (celles du portefeuille utilisateur)
    const dataAAfficher = DATA_SBF120
        .filter(sbf => portefeuilleUtilisateur.some(p => p.Ticker === sbf.Ticker))
        .map(actionSBF => {
            const portefeuilleInfo = portefeuilleUtilisateur.find(p => p.Ticker === actionSBF.Ticker);
            
            // Cloner et enrichir les données
            let action = { ...actionSBF };
            action.Quantite = portefeuilleInfo ? portefeuilleInfo.Quantite : 0;
            
            // Recalculer les dynamiques
            const cours_actuel = simulerAcquisitionCours(action.URL_Cotation);
            action.Cours_Actuel = cours_actuel;
            
            let rendement_actuel = 0;
            if (action.Dividende_Fixe > 0 && cours_actuel > 0) {
                rendement_actuel = (action.Dividende_Fixe / cours_actuel) * 100;
            }
            action.Rendement_Actuel = parseFloat(rendement_actuel.toFixed(2));

            // Ajouter des placeholders pour les champs du calendrier [30]
            action.Versement = action.Frequence > 0 ? "2024-XX-XX" : "N/A";
            action.Statut = action.Frequence > 0 ? "Prévu" : "N/A";
            
            return action;
        });

    // 2. Afficher les données
    peuplerTableau(dataAAfficher); 
}

function peuplerTableau(data) {
    const tbody = document.querySelector('#trackerTable tbody');
    tbody.innerHTML = '';
    let totalValeurMarche = 0;
    let totalSocietes =0 ? "2024-XX-XX" : "N/A";
            action.Statut = action.Frequence > 0 ? "Prévu" : "N/A";
            
            return action;
        });

    // 2. Afficher les données
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

        // Calcul de la valeur de marché du portefeuille [30]
        const valeurAction = action.Cours_Actuel * action.Quantite;
        totalValeurMarche += valeurAction;

        const classZero = (action.Dividende_Fixe === 0) ? 'zero-dividend' : '';
        
        row.insertCell().textContent = action.Societe;
        row.insertCell().textContent = action.Ticker;

        // Colonnes dynamiques
        row.insertCell().innerHTML = `<span class="dynamic ${classZero}">${action.Cours_Actuel.toFixed(2)} €</span>`;
        row.insertCell().textContent = `${action.Dividende_Fixe.toFixed(2)} €`;
        row.insertCell().innerHTML = `<span class="dynamic ${classZero}">${action.Rendement_Actuel.toFixed(2)} %</span>`;

        // Colonnes analytiques statiques [1-3]
        row.insertCell().textContent = `${action.Payout_Ratio.toFixed(2)} %`;
        row.insertCell().textContent = historique;
        row.insertCell().textContent = action.Frequence > 0 ? `${action.Frequence}x/an` : 'N/A';
        
        // Colonnes du calendrier d'origine [30]
        row.insertCell().textContent = action.Quantite;
        row.insertCell().textContent = action.Versement;
        row.insertCell().textContent = action.Statut;
        row.insertCell().innerHTML = `<button onclick="supprimerAction('${action.Ticker}')">X</button>`;
    });

    // Mise à jour des totaux en haut de page [30]
    document.getElementById('societes').textContent = totalSocietes;
    document.getElementById('total_estime_marche').textContent = `${totalValeurMarche.toFixed(2)} €`;
}


// --- GESTION DU TRI ---

// Cette fonction est conservée mais nécessite la conversion du type de données pour les tris numériques.
function sortTable(key) {
    const sortedData = [...DONNEES_TRACKER_ACTUALISEES].sort((a, b) => {
        const keyA = a[key.charAt(0).toUpperCase() + key.slice(1)];
        const keyB = b[key.charAt(0).toUpperCase() + key.slice(1)];

        // Tri numérique pour Cours, Rendement, etc.
        if (!isNaN(keyA) && !isNaN(keyB)) {
            return keyB - keyA;
        }
        // Tri alphabétique par défaut (pour les autres colonnes)
        return keyA > keyB ? 1 : -1;
    });
    peuplerTableau(sortedData);
}

document.addEventListener('DOMContentLoaded', () => {
    // Initialiser l'affichage avec le portefeuille utilisateur
    rafraichirAffichageTracker(); 

    // Gestion des écouteurs de tri (le tri fonctionne sur le tableau affiché)
    document.querySelectorAll('.sortable').forEach(header => {
        header.addEventListener('click', () => {
            sortTable(header.getAttribute('data-sort'));
        });
    });
});
