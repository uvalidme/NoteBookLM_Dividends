// script.js

const STOCK_LIST_KEY = 'dividendsDataList';
let isEditing = false;

// --- SBF 120 DATA REFERENCE (Extrait des sources pour Ticker et Dividende/Montant action [1-3]) ---
// Remarque : La Fréquence (Versement) est estimée si non spécifiée clairement dans les sources pour ce format d'objet.
const SBF120_REFERENCE = {
    'TTE.PA': { Societe: 'TOTALENERGIES', MontantAction: 3.34, Frequence: 'Trimestriel' }, // [1, 4]
    'MC.PA': { Societe: 'LVMH', MontantAction: 13.00, Frequence: 'Annuel' }, // [3, 5]
    'AI.PA': { Societe: 'AIR LIQUIDE', MontantAction: 3.30, Frequence: 'Annuel' }, // [3, 5]
    'ICAD.PA': { Societe: 'ICADE', MontantAction: 4.31, Frequence: 'Annuel' }, // [1, 6]
    'BNP.PA': { Societe: 'BNP PARIBAS', MontantAction: 4.79, Frequence: 'Annuel' }, // [1, 7]
    'ORA.PA': { Societe: 'ORANGE', MontantAction: 0.75, Frequence: 'Semestriel' } // [2, 4]
};

// Données initiales
const initialData = [
    { Societe: 'TOTALENERGIES', Ticker: 'TTE.PA', Quantite: 50, MontantAction: 3.34, Versement: 'Trimestriel', Statut: 'Prévu' }, 
    { Societe: 'LVMH', Ticker: 'MC.PA', Quantite: 10, MontantAction: 13.00, Versement: 'Annuel', Statut: 'Versé' },
    { Societe: 'AIR LIQUIDE', Ticker: 'AI.PA', Quantite: 25, MontantAction: 3.30, Versement: 'Annuel', Statut: 'Prévu' }
];

let dividendsData = [];

// --- Fonctions de Persistance et Calcul ---

function loadLocalData() {
    const storedData = localStorage.getItem(STOCK_LIST_KEY);
    if (storedData) {
        dividendsData = JSON.parse(storedData);
    } else {
        dividendsData = initialData;
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
    const index = event.target.dataset.index;
    const newQuantity = Number(event.target.value); 
    
    if (!isNaN(newQuantity) && newQuantity >= 0) {
        dividendsData[index].Quantite = newQuantity; 
        renderDividendsTable(); 
        // Sauvegarde immédiate de la quantité mise à jour
        if (!isEditing) { 
            saveLocalData();
        }
    }
}

function toggleEditMode() {
    isEditing = !isEditing;
    const editButton = document.getElementById('editButton');
    
    if (isEditing) {
        editButton.textContent = 'Sauvegarder';
        console.log("Mode édition activé.");
    } else {
        saveLocalData(); // Sauvegarde finale des modifications
        editButton.textContent = 'Éditer';
        console.log("Données sauvegardées localement.");
    }
    
    renderDividendsTable(); 
}

// --- Logique d'Ajout d'action SBF 120 ---

function addNewStockSBF120() {
    // Liste des tickers disponibles pour faciliter le test
    const availableTickers = Object.keys(SBF120_REFERENCE).join(', ');
    const tickerInput = prompt(`Entrez le Ticker SBF 120 (${availableTickers}) :`).toUpperCase();
    
    if (!tickerInput || !SBF120_REFERENCE[tickerInput]) {
        alert("Ticker non valide ou non supporté. Veuillez choisir parmi : " + availableTickers);
        return;
    }

    const referenceStock = SBF120_REFERENCE[tickerInput];
    
    const quantityInput = prompt(`Entrez la quantité que vous détenez pour ${referenceStock.Societe} :`);
    const quantity = parseInt(quantityInput, 10);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Quantité invalide. L'action n'a pas été ajoutée.");
        return;
    }
    
    const newStock = {
        Societe: referenceStock.Societe,
        Ticker: tickerInput,
        Quantite: quantity,
        MontantAction: referenceStock.MontantAction,
        Versement: referenceStock.Frequence || 'Annuel',
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
    
    tableBody.innerHTML = '';
    
    dividendsData.forEach((stock, index) => {
        const row = tableBody.insertRow();
        const total = (parseFloat(stock.Quantite) * parseFloat(stock.MontantAction)).toFixed(2);
        
        row.insertCell().textContent = stock.Societe;
        row.insertCell().textContent = stock.Ticker;
        
        const quantityCell = row.insertCell();
        if (isEditing) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = stock.Quantite;
            input.min = 0;
            input.style.width = '60px';
            input.dataset.index = index; 
            input.addEventListener('change', updateQuantity); 
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
    
    estimatedTotalElement.textContent = calculateEstimatedTotal() + '€';
}

// --- Démarrage de l'application ---
document.addEventListener('DOMContentLoaded', () => {
    loadLocalData();
    renderDividendsTable();
    
    // Attachement des écouteurs
    const editButton = document.getElementById('editButton');
    if (editButton) {
        editButton.addEventListener('click', toggleEditMode);
    }
    
    const addButton = document.getElementById('addButton');
    if (addButton) {
        addButton.addEventListener('click', addNewStockSBF120);
    }
});
