// Données initiales basées sur les sources (TTEF, Kering, Air Liquide, Danone, etc. [2-6])
const dividendData = [
  { societe: "TotalEnergies SE", ticker: "TTEF", quantite: 100, montant_action: 0.79, versement: "06/01/2025" }, 
  { societe: "Kering", ticker: "PRTP", quantite: 50, montant_action: 2.00, versement: "16/01/2025" }, 
  { societe: "Air Liquide", ticker: "AIRP", quantite: 200, montant_action: 3.30, versement: "21/05/2025" }, 
  { societe: "Danone", ticker: "DANO", quantite: 80, montant_action: 2.15, versement: "07/05/2025" }, 
  { societe: "BNP Paribas", ticker: "BNPP", quantite: 80, montant_action: 4.79, versement: "21/05/2025" },
  { societe: "Thales", ticker: "TCFP", quantite: 70, montant_action: 2.85, versement: "22/05/2025" },
];

let estTrieAscendant = true;

/**
 * Fonction de tri alphabétique par nom de société.
 */
function trierParSociete(data, asc) {
  const facteur = asc ? 1 : -1;
  data.sort((a, b) => a.societe.localeCompare(b.societe) * facteur);
  return data;
}

/**
 * Gère le clic sur le bouton Éditer dans le tableau.
 */
function handleEditAction(ticker) {
    console.log(`Action Éditer cliquée pour le titre: ${ticker}. Fonctionnalité à développer.`);
}

/**
 * Met à jour le corps du tableau (cible #corps-dividendes).
 */
function afficherTableau(data) {
  const corpsTableau = document.getElementById('corps-dividendes');
  
  // Si l'ID manque, on ne fait rien pour éviter de tout casser.
  if (!corpsTableau) return; 

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

    // CRÉATION DU BOUTON ÉDITER DANS LA COLONNE ACTION
    const actionCell = row.insertCell();
    const editButton = document.createElement('button');
    editButton.textContent = 'Éditer';
    editButton.classList.add('btn-action');
    editButton.addEventListener('click', () => handleEditAction(item.ticker));
    actionCell.appendChild(editButton);
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

// =========================================================
// GESTION DE LA MODALE D'AJOUT
// =========================================================

function fermerModal() {
  const modal = document.getElementById('modal-ajout-action');
  if (modal) modal.style.display = 'none';
}

function ajouterNouveauTitre() {
  // Ouvre la modale
  const modal = document.getElementById('modal-ajout-action');
  if (modal) modal.style.display = 'block';
  console.log("Ouverture du formulaire d'ajout d'action.");
}

function handleFormSubmission(event) {
    event.preventDefault();

    const nouvelleAction = {
        societe: document.getElementById('input-societe').value,
        ticker: document.getElementById('input-ticker').value.toUpperCase(),
        quantite: parseFloat(document.getElementById('input-quantite').value),
        montant_action: parseFloat(document.getElementById('input-montant').value),
        versement: document.getElementById('input-versement').value,
    };

    // Ajout de la nouvelle action, puis tri et mise à jour
    dividendData.push(nouvelleAction);
    trierParSociete(dividendData, estTrieAscendant);
    afficherTableau(dividendData);

    console.log("Nouvelle action ajoutée et affichée:", nouvelleAction);

    // Réinitialiser et fermer la modale
    document.getElementById('form-ajout-dividende').reset();
    fermerModal();
}

/**
 * Initialisation de l'application et configuration des écouteurs.
 */
function init() {
  // 1. Tri initial et affichage
  trierParSociete(dividendData, estTrieAscendant);
  afficherTableau(dividendData);

  // 2. Configuration du tri sur la colonne Société (header-societe-sort)
  const headerSociete = document.getElementById('header-societe-sort');
  if (headerSociete) {
    headerSociete.addEventListener('click', handleSort);
  }
  
  // 3. Configuration des événements de la modale
  const btnAjouter = document.getElementById('btn-ajouter-action');
  if (btnAjouter) {
    btnAjouter.addEventListener('click', ajouterNouveauTitre);
  }
  
  const btnFermer = document.getElementById('btn-fermer-modal');
  if (btnFermer) {
    btnFermer.addEventListener('click', fermerModal);
  }

  const formAjout = document.getElementById('form-ajout-dividende');
  if (formAjout) {
      formAjout.addEventListener('submit', handleFormSubmission);
  }
}

document.addEventListener('DOMContentLoaded', init);
