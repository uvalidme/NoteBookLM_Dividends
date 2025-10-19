// script.js

const STOCK_LIST_KEY = 'dividendsDataList';
let isEditing = false;

// 1. Initialisation des données (avec quelques exemples basés sur le SBF 120)
// Utilisation d'un format simple Société, Ticker, Montant Dividende (basé sur [2-4])
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
        // Assure que Quantite et MontantAction sont traités comme des nombres
        const totalAction = (parseFloat(stock.Quantite) || 0) * (parseFloat(stock.MontantAction) || 0);
        return total + totalAction;
    }, 0).toFixed(2);
}

// --- Logique d'Édition ---

function updateQuantity(event) {
    const index = event.target.dataset.index;
    const newQuantity = parseInt(event.target.value, 10);
    
    if (!isNaN(newQuantity) && newQuantity >= 0) {
        dividendsData[index].Quantite = newQuantity;
        // Mettre à jour immédiatement l'affichage pour refléter les totaux
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
        console.log("Données sauvegardées localement.");
    }
    
    renderDividendsTable(); 
}

// --- Rendu de l'Interface ---

function renderDividendsTable() {
    const tableBody = document.getElementById('dividendsTableBody');
    const estimatedTotalElement = document.getElementById('estimatedTotal');
    
    tableBody.innerHTML = '';
    
    dividendsData.forEach((stock, index) => {
        const row = tableBody.insertRow();
        const total = (stock.Quantite * stock.MontantAction).toFixed(2);
        
        row.insertCell().textContent = stock.Societe;
        row.insertCell().textContent = stock.Ticker;
        
        // CELLULE QUANTITÉ (Gestion de l'édition)
        const quantityCell = row.insertCell();
        if (isEditing) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = stock.Quantite;
            input.min = 0;
            input.dataset.index = index; // Liaison avec l'index dans le tableau de données
            input.addEventListener('change', updateQuantity); 
            quantityCell.appendChild(input);
        } else {
            quantityCell.textContent = stock.Quantite;
        }
        
        row.insertCell().textContent = stock.MontantAction.toFixed(2) + '€';
        row.insertCell().textContent = total + '€';
        row.insertCell().textContent = stock.Versement;
        row.insertCell().textContent = stock.Statut;
        
        // Colonne Action (laisser vide pour l'instant)
        row.insertCell().textContent = '';
    });
    
    estimatedTotalElement.textContent = calculateEstimatedTotal() + '€';
}

// --- Démarrage de l'application ---
document.addEventListener('DOMContentLoaded', () => {
    loadLocalData();
    renderDividendsTable();
    
    // Attacher l'écouteur d'événement au bouton Éditer
    document.getElementById('editButton').addEventListener('click', toggleEditMode);
    
    // Évite la simulation pour l'édition de quantité.
    console.log("Interface de gestion des dividendes chargée.");
});
