// script.js

const STOCK_LIST_KEY = 'dividendsDataList';
let isEditing = false;

// Mappage des fréquences pour plus de clarté
const FREQUENCY_MAP = {
    1: 'Annuel',
    2: 'Semestriel',
    4: 'Trimestriel'
};

// Référence SBF 120 (Société: Dividende, Fréquence, basé sur les sources [1-12])
const SBF120_REFERENCE = {
    'ICAD.PA': { Societe: 'ICADE', MontantAction: 4.31, Frequence: FREQUENCY_MAP[1] }, // [1, 4]
    'TTE.PA': { Societe: 'TOTALENERGIES', MontantAction: 3.34, Frequence: FREQUENCY_MAP[3] }, // [1, 6]
    'BNP.PA': { Societe: 'BNP PARIBAS', MontantAction: 4.79, Frequence: FREQUENCY_MAP[17] }, // [1, 5]
    'LVMH.PA': { Societe: 'LVMH', MontantAction: 13.00, Frequence: FREQUENCY_MAP[1] }, // [3, 9] (Correction du Ticker MC.PA par LVMH.PA pour uniformité)
    'AI.PA': { Societe: 'AIR LIQUIDE', MontantAction: 3.30, Frequence: FREQUENCY_MAP[17] }, // [3, 10]
    'ORA.PA': { Societe: 'ORANGE', MontantAction: 0.75, Frequence: FREQUENCY_MAP[1] }, // [2, 6]
    'RUI.PA': { Societe: 'RUBIS', MontantAction: 2.78, Frequence: FREQUENCY_MAP[17] }, // [1, 4, 18]
    'AC.PA': { Societe: 'ACCOR', MontantAction: 1.26, Frequence: FREQUENCY_MAP[17] }, // [2, 8]
    'SAN.PA': { Societe: 'SANOFI', MontantAction: 3.92, Frequence: FREQUENCY_MAP[17] }, // [2, 7]
    'DG.PA': { Societe: 'VINCI', MontantAction: 4.75, Frequence: FREQUENCY_MAP[1] } // [2, 8]
    // Utilisation des Tickers listés dans les sources [13-16, 18-23] pour la recherche
};

// Données initiales (pour éviter un tableau vide au premier lancement)
const initialData = [
    { Societe: 'TOTALENERGIES', Ticker: 'TTE.PA', Quantite: 50, MontantAction: 3.34, Versement: SBF120_REFERENCE['TTE.PA'].Frequence, Statut: 'Prévu' }, 
    { Societe: 'LVMH', Ticker: 'LVMH.PA', Quantite: 10, MontantAction: 13.00, Versement: SBF120_REFERENCE['LVMH.PA'] ? SBF120_REFERENCE['LVMH.PA'].Frequence : 'Semestriel', Statut: 'Versé' },
    { Societe: 'AIR LIQUIDE', Ticker: 'AI.PA', Quantite: 25, MontantAction: 3.30, Versement: SBF120_REFERENCE['AI.PA'].Frequence, Statut: 'Prévu' }
];

let dividendsData = [];

// --- Fonctions de Persistance et Calcul ---

function loadLocalData() {
    const storedData = localStorage.getItem(STOCK_LIST_KEY);
    if (storedData) {
        dividendsData = JSON.parse(storedData);
    } else {
        dividendsData = initialData; // Charge les données initiales si rien n'est trouvé.
    }
}

function saveLocalData() {
    localStorage.setItem(STOCK_LIST_KEY, JSON.stringify(dividendsData));
}

function calculateEstimatedTotal() {
    return dividendsData.reduce((total, stock) => {
        const totalAction = (parseFloat(stock.Quantite) || 0) * (parseFloat(stock.MontantAction) || 0);
        return total + totalAction;
    }, 0).toFixed(2);
}

// --- Logique d'Édition ---

function updateQuantity(event) {
    // S'assurer que nous travaillons avec des nombres entiers pour la quantité
    const index = event.target.dataset.index;
    const newQuantity = Math.max(0, parseInt(event.target.value, 10)); // Empêche les quantités négatives
    
    if (!isNaN(newQuantity)) {
        dividendsData[index].Quantite = newQuantity; 
        renderDividendsTable(); 
    }
}

function toggleEditMode() {
    isEditing = !isEditing;
    const editButton = document.getElementById('editButton');
    
    if (isEditing) {
        editButton.textContent = 'Sauvegarder';
    } else {
        saveLocalData();
        editButton.textContent = 'Éditer';
    }
    
    // Re-rendre le tableau pour appliquer les inputs si en mode édition, ou le texte simple sinon
    renderDividendsTable(); 
}

// --- Logique d'Ajout d'action SBF 120 ---

function addNewStockSBF120() {
    const availableTickers = Object.keys(SBF120_REFERENCE).join(', ');
    
    // Demander le Ticker
    let tickerInput = prompt(`Entrez le Ticker SBF 120 parmi les suivants (${Object.keys(SBF120_REFERENCE).slice(0, 5).join(', ')}, etc.) :`);
    
    if (!tickerInput) return;

    tickerInput = tickerInput.toUpperCase().trim();
    const referenceStock = SBF120_REFERENCE[tickerInput];
    
    if (!referenceStock) {
        alert("Ticker non valide ou non trouvé dans la liste SBF 120 interne.");
        return;
    }

    // Demander la quantité
    const quantityInput = prompt(`Entrez la quantité que vous détenez pour ${referenceStock.Societe} (${tickerInput}) :`);
    const quantity = parseInt(quantityInput, 10);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Quantité invalide. L'action n'a pas été ajoutée.");
        return;
    }
    
    // Création de la nouvelle entrée
    const newStock = {
        Societe: referenceStock.Societe,
        Ticker: tickerInput,
        Quantite: quantity,
        MontantAction: referenceStock.MontantAction,
        Versement: referenceStock.Frequence,
        Statut: 'Prévu' 
    };
    
    dividendsData.push(newStock);
    saveLocalData();
    renderDividendsTable();
}

// --- Rendu de l'Interface ---

function renderDividendsTable() {
    const tableBody = document.getElementById('dividendsTableBody');
    const estimatedTotalElement = document.getElementById('estimatedTotal');
    
    // Vérification: Si tableBody n'existe pas, nous arrêtons l'exécution (problème HTML)
    if (!tableBody) {
        console.error("Erreur: Le corps du tableau (dividendsTableBody) est manquant.");
        return;
    }

    tableBody.innerHTML = '';
    
    dividendsData.forEach((stock, index) => {
        const row = tableBody.insertRow();
        const total = (parseFloat(stock.Quantite) * parseFloat(stock.MontantAction)).toFixed(2);
        
        row.insertCell().textContent = stock.Societe;
        row.insertCell().textContent = stock.Ticker;
        
        // CELLULE QUANTITÉ
        const quantityCell = row.insertCell();
        if (isEditing) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = stock.Quantite;
            input.min = 0;
            input.style.width = '60px';
            input.dataset.index = index; 
            // Écouteur d'événement pour mettre à jour la quantité immédiatement
            input.addEventListener('input', updateQuantity); 
            quantityCell.appendChild(input);
        } else {
            quantityCell.textContent = stock.Quantite;
        }
        
        row.insertCell().textContent = parseFloat(stock.MontantAction).toFixed(2) + '€';
        row.insertCell().textContent = total + '€';
        row.insertCell().textContent = stock.Versement;
        row.insertCell().textContent = stock.Statut;
        
        row.insertCell().textContent = ''; // Colonne Action
    });
    
    // Mise à jour du total estimé
    if (estimatedTotalElement) {
        estimatedTotalElement.textContent = calculateEstimatedTotal() + '€'; // Total estimé [17]
    }
}

// --- Démarrage de l'application ---
document.addEventListener('DOMContentLoaded', () => {
    loadLocalData();
    renderDividendsTable();
    
    // Attachement des écouteurs critiques
    const editButton = document.getElementById('editButton');
    const addButton = document.getElementById('addButton');

    if (editButton) {
        editButton.addEventListener('click', toggleEditMode);
    } else {
        console.error("Erreur: Bouton Éditer (editButton) manquant dans le DOM.");
    }
    
    if (addButton) {
        addButton.addEventListener('click', addNewStockSBF120);
    } else {
        console.error("Erreur: Bouton Ajouter (addButton) manquant dans le DOM.");
    }
});
