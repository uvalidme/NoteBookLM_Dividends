// Définir ici un portefeuille utilisateur initial (qui pourrait être vide)
let portefeuilleUtilisateur = [
    // Exemple : un utilisateur possède déjà 100 actions TOTALENERGIES
    { "Ticker": "TTE.PA", "Quantite": 100 } 
];

// NOTE : La fonction mettreAJourDonneesDynamiques doit être appelée 
// avec la DATA_SBF120 complète pour les calculs.

// --- NOUVELLE FONCTION POUR L'AJOUT D'ACTION ---
function ajouterAction() {
    // 1. Demander à l'utilisateur quelle action ajouter (Simplification pour le code)
    const tickerAAjouter = prompt("Entrez le Ticker de l'action SBF 120 à ajouter (ex: SAN.PA pour SANOFI, RMS.PA pour HERMES):").toUpperCase();
    
    if (!tickerAAjouter) return; // Annulation

    // 2. Trouver les données statiques correspondantes
    const actionStatique = DATA_SBF120.find(a => a.Ticker === tickerAAjouter);

    if (!actionStatique) {
        alert("Ticker non trouvé dans la base SBF 120.");
        return;
    }

    // 3. Demander la quantité
    const quantite = parseInt(prompt(`Combien d'actions ${tickerAAjouter} détenez-vous ?`), 10);

    if (isNaN(quantite) || quantite <= 0) {
        alert("Quantité invalide.");
        return;
    }
    
    // 4. Vérifier si l'action existe déjà dans le portefeuille utilisateur
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
    alert(`${quantite} actions de ${actionStatique.Societe} ajoutées!`);
}


// --- NOUVELLE FONCTION DE RAFRAÎCHISSEMENT GLOBAL ---

function rafraichirAffichageTracker() {
    // 1. Fusionner les données statiques (SBF120) avec les données utilisateur (Portefeuille)
    const dataAAfficher = DATA_SBF120.filter(sbf => 
        portefeuilleUtilisateur.some(p => p.Ticker === sbf.Ticker)
    ).map(actionSBF => {
        // Trouver la quantité dans le portefeuille
        const portefeuilleInfo = portefeuilleUtilisateur.find(p => p.Ticker === actionSBF.Ticker);
        
        // Cloner et enrichir les données
        let action = { ...actionSBF };
        action.Quantite = portefeuilleInfo ? portefeuilleInfo.Quantite : 0;
        
        // Recalculer les dynamiques (simulées)
        const cours_actuel = simulerAcquisitionCours(action.URL_Cotation);
        action.Cours_Actuel = cours_actuel;
        
        let rendement_actuel = 0;
        if (action.Dividende_Fixe > 0 && cours_actuel > 0) {
            rendement_actuel = (action.Dividende_Fixe / cours_actuel) * 100;
        }
        action.Rendement_Actuel = parseFloat(rendement_actuel.toFixed(2));

        return action;
    });

    // 2. Afficher seulement les actions du portefeuille
    peuplerTableau(dataAAfficher); 
}

// Modifier le point de départ pour charger l'interface avec les données de l'utilisateur
document.addEventListener('DOMContentLoaded', () => {
    // Le tableau sera initialement rempli par les actions déjà définies dans portefeuilleUtilisateur
    rafraichirAffichageTracker(); 

    // ... (Ajouter ici la logique de tri si elle n'y est pas encore)
});

// Supprimer la ligne d'initialisation précédente :
// let DONNEES_TRACKER_ACTUALISEES = mettreAJourDonneesDynamiques(DATA_SBF120); 
