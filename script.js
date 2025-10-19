script.js
// Données consolidées basées sur les sources (incluant les montants et tickers trouvés)
const dividendData = [
  // TotalEnergies SE (TTEF) [1, 5, 8]
  { societe: "TotalEnergies SE", ticker: "TTEF", quantite: 100, montant_action: 0.79, versement: "06/01/2025" },
  // Kering (KER.PA/PRTP) [1, 6, 9, 12]
  { societe: "Kering", ticker: "PRTP", quantite: 50, montant_action: 2.00, versement: "16/01/2025" },
  // Air Liquide (AIRP/AI.PA) [2, 8, 13]
  { societe: "Air Liquide", ticker: "AIRP", quantite: 200, montant_action: 3.30, versement: "21/05/2025" },
  // BNP Paribas (BNPP) [2, 14, 15]
  { societe: "BNP Paribas", ticker: "BNPP", quantite: 80, montant_action: 4.79, versement: "21/05/2025" },
  // Capgemini (CAPP/CAP.PA) [3, 8, 16, 17]
  { societe: "CapGemini", ticker: "CAPP", quantite: 60, montant_action: 3.40, versement: "22/05/2025" },
  // Thales (TCFP/HO.PA) [3, 5, 8, 18]
  { societe: "Thales", ticker: "TCFP", quantite: 70, montant_action: 2.85, versement: "22/05/2025" },
];

let estTrieAscendant = true;

/**
 * Fonction de tri réutilisable par le champ 'societe' (A-Z ou Z-A).
 */
function trierParSociete(data, asc) {
  const facteur = asc ? 1 : -1;
  // Utilisation de localeCompare pour la robustesse alphabétique
  data.sort((a, b) => a.societe.localeCompare(b.societe) * facteur);
  return data;
}

/**
 * Met à jour le corps du tableau des dividendes (référence [19]).
 */
function afficherTableau(data) {
  const corpsTableau = document.getElementById('corps-dividendes');
  
  if (!corpsTableau) {
    console.error("Erreur: L'ID 'corps-dividendes' (tbody) est manquant. Vérifiez le HTML.");
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
    row.insertCell().textContent = 'Planifié'; // Statut
    row.insertCell().textContent = 'Éditer'; // Action (Référence [19])
  });
}

/**
 * Gestionnaire pour l'événement de clic sur l'en-tête.
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
  // Tri initial A-Z
  trierParSociete(dividendData, estTrieAscendant);
  afficherTableau(dividendData);

  const headerSociete = document.getElementById('header-societe-sort');
  if (headerSociete) {
    headerSociete.style.cursor = 'pointer'; 
    headerSociete.addEventListener('click', handleSort);
  } else {
    console.warn("Avertissement: L'ID 'header-societe-sort' (en-tête Société) n'a pas été trouvé. Le tri n'est pas actif.");
  }
}

document.addEventListener('DOMContentLoaded', init);
