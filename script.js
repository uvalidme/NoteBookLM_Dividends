// Données consolidées et vérifiées (SBF 120)
const dividendData = [
  { societe: "TotalEnergies SE", ticker: "TTEF", quantite: 100, montant_action: 0.79, versement: "06/01/2025" }, 
  { societe: "Kering", ticker: "PRTP", quantite: 50, montant_action: 2.00, versement: "16/01/2025" }, 
  { societe: "Air Liquide", ticker: "AIRP", quantite: 200, montant_action: 3.30, versement: "21/05/2025" }, 
  { societe: "Danone", ticker: "DANO", quantite: 80, montant_action: 2.15, versement: "07/05/2025" }, 
  { societe: "BNP Paribas", ticker: "BNPP", quantite: 80, montant_action: 4.79, versement: "21/05/2025" }, 
  { societe: "CapGemini", ticker: "CAPP", quantite: 60, montant_action: 3.40, versement: "22/05/2025" }, 
  { societe: "Thales", ticker: "TCFP", quantite: 70, montant_action: 2.85, versement: "22/05/2025" }, 
];

let estTrieAscendant = true;

/**
 * Fonction de tri par nom de société.
 */
function trierParSociete(data, asc) {
  const facteur = asc ? 1 : -1;
  data.sort((a, b) => a.societe.localeCompare(b.societe) * facteur);
  return data;
}

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
    row.insertCell().textContent = 'Éditer'; 
  });
}

/**
 * Gestionnaire pour l'événement de tri sur le header.
 */
function handleSort() {
  estTrieAscendant = !estTrieAscendant;
  trierParSociete(dividendData, estTrieAscendant);
  afficherTableau(dividendData);
}

/**
 * Fonction pour le bouton Ajouter une action (Alerte pour preuve visuelle)
 */
function ajouterNouveauTitre() {
  // ALERTE POUR PROUVER QUE LE BOUTON EST CONNECTÉ
  alert("Le bouton Ajouter un titre fonctionne ! La fonctionnalité réelle sera développée à la prochaine étape.");
}

/**
 * Initialisation de l'application et configuration des écouteurs.
 */
function init() {
  // 1. Initialisation du tri et affichage du tableau
  trierParSociete(dividendData, estTrieAscendant);
  afficherTableau(dividendData);

  // 2. Configuration du tri sur la colonne Société (ID: header-societe-sort)
  const headerSociete = document.getElementById('header-societe-sort');
  if (headerSociete) {
    headerSociete.style.cursor = 'pointer'; 
    headerSociete.addEventListener('click', handleSort);
  } else {
    console.warn("L'ID 'header-societe-sort' non trouvé. Tri inactif.");
  }
  
  // 3. Configuration du bouton Ajouter une action (ID: btn-ajouter-action)
  const btnAjouter = document.getElementById('btn-ajouter-action');
  if (btnAjouter) {
    btnAjouter.addEventListener('click', ajouterNouveauTitre);
  } else {
    // Si ce message apparaît dans la console, le problème est dans votre index.html
    console.error("Le bouton 'Ajouter une action' (ID: btn-ajouter-action) est manquant. Événement non attaché.");
  }
}

document.addEventListener('DOMContentLoaded', init);
