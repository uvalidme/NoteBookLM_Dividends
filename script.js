// Données consolidées (Exemples SBF 120 basés sur les sources [2-4])
const dividendData = [
  { societe: "TotalEnergies SE", ticker: "TTEF", quantite: 100, montant_action: 0.79, versement: "06/01/2025" },
  { societe: "Kering", ticker: "PRTP", quantite: 50, montant_action: 2.00, versement: "16/01/2025" },
  { societe: "Air Liquide", ticker: "AIRP", quantite: 200, montant_action: 3.30, versement: "21/05/2025" },
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
 * Met à jour le corps du tableau des dividendes (cible #corps-dividendes).
 */
function afficherTableau(data) {
  const corpsTableau = document.getElementById('corps-dividendes');
  
  // VÉRIFICATION CRITIQUE
  if (!corpsTableau) {
    console.error("Erreur critique: L'ID 'corps-dividendes' est manquant.");
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
    row.insertCell().textContent = 'Éditer'; // Correspond à la colonne Action
  });
}

/**
 * Gestionnaire pour le tri (inverse l'ordre).
 */
function handleSort() {
  estTrieAscendant = !estTrieAscendant;
  trierParSociete(dividendData, estTrieAscendant);
  afficherTableau(dividendData);
}

/**
 * Initialisation de l'application.
 */
function init() {
  // Tri initial et affichage
  trierParSociete(dividendData, estTrieAscendant);
  afficherTableau(dividendData);

  const headerSociete = document.getElementById('header-societe-sort');
  if (headerSociete) {
    headerSociete.style.cursor = 'pointer'; 
    headerSociete.addEventListener('click', handleSort);
  } else {
    // VÉRIFICATION CRITIQUE
    console.warn("L'ID 'header-societe-sort' n'a pas été trouvé. Le tri ne sera pas actif.");
  }
}

document.addEventListener('DOMContentLoaded', init);
