// Données de référence basées sur les titres du SBF 120 des sources [2-5]
const dividendData = [
  { societe: "TotalEnergies SE", ticker: "TTEF", quantite: 100, montant_action: 0.79, versement: "06/01/2025" }, // Montant TotalEnergies [2]
  { societe: "Kering", ticker: "PRTP", quantite: 50, montant_action: 2.00, versement: "16/01/2025" }, // Montant Kering [2]
  { societe: "Air Liquide", ticker: "AIRP", quantite: 200, montant_action: 3.30, versement: "21/05/2025" }, // Montant Air Liquide [4]
  { societe: "Danone", ticker: "DANO", quantite: 80, montant_action: 2.15, versement: "07/05/2025" }, // Montant Danone [3]
  { societe: "BNP Paribas", ticker: "BNPP", quantite: 80, montant_action: 4.79, versement: "21/05/2025" }, // Montant BNP Paribas [4]
  { societe: "Thales", ticker: "TCFP", quantite: 70, montant_action: 2.85, versement: "22/05/2025" }, // Montant Thales [5]
  { societe: "CapGemini", ticker: "CAPP", quantite: 60, montant_action: 3.40, versement: "22/05/2025" }, // Montant Capgemini [5]
];

/**
 * Met à jour le corps du tableau (cible #corps-dividendes).
 */
function afficherTableau(data) {
  const corpsTableau = document.getElementById('corps-dividendes');
  
  if (!corpsTableau) {
    console.error("Erreur critique: L'ID 'corps-dividendes' est manquant dans le HTML.");
    return; 
  }

  corpsTableau.innerHTML = ''; 

  data.forEach(item => {
    const row = corpsTableau.insertRow();
    row.insertCell().textContent = item.societe;
    row.insertCell().textContent = item.ticker;
    row.insertCell().textContent = item.quantite;
    row.insertCell().textContent = item.montant_action.toFixed(2) + ' €';
    row.insertCell().textContent = (item.quantite * item.montant_action).toFixed(2) + ' €';
    row.insertCell().textContent = item.versement;
    row.insertCell().textContent = 'Planifié'; 
    row.insertCell().textContent = 'Éditer'; // Texte simple (selon la version de référence)
  });
}

/**
 * Fonction pour le bouton Ajouter une action (Retour au log console)
 */
function ajouterNouveauTitre() {
  console.log("Ajouter un nouveau titre cliqué. Prêt pour l'implémentation de la modale.");
}

/**
 * Initialisation de l'application et configuration des écouteurs.
 */
function init() {
  // 1. Affichage initial du tableau
  afficherTableau(dividendData);

  // 2. Configuration du bouton Ajouter une action
  const btnAjouter = document.getElementById('btn-ajouter-action');
  if (btnAjouter) {
    btnAjouter.addEventListener('click', ajouterNouveauTitre);
  }
}

document.addEventListener('DOMContentLoaded', init);
