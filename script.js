// script.js
// ... (Définition de STOCK_LIST_KEY, isEditing, SBF120_PAYMENT_SCHEDULE, initialData, loadLocalData, saveLocalData, calculateEstimatedTotal, updateQuantity, toggleEditMode, addNewStockSBF120) ...

// --- Nouvelle Logique de Suppression ---

function deleteDividend(index) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette ligne de dividende ?")) {
        // Supprime 1 élément à partir de l'index donné
        dividendsData.splice(index, 1);
        saveLocalData();
        renderDividendsTable();
        console.log(`Ligne ${index} supprimée.`);
    }
}


// --- Rendu de l'Interface (MODIFIÉ) ---

function renderDividendsTable() {
    const tableBody = document.getElementById('dividendsTableBody');
    const estimatedTotalElement = document.getElementById('estimatedTotal');
    const totalSocietiesElement = document.getElementById('totalSocieties');
    
    if (!tableBody) return; 

    tableBody.innerHTML = '';
    
    dividendsData.forEach((stock, index) => {
        const row = tableBody.insertRow();
        const total = (parseFloat(stock.Quantite) * parseFloat(stock.MontantAction)).toFixed(2);
        
        row.insertCell().textContent = stock.Societe;
        row.insertCell().textContent = stock.Ticker;
        
        // CELLULE QUANTITÉ (Mode Édition)
        const quantityCell = row.insertCell();
        if (isEditing) {
            const input = document.createElement('input');
            input.type = 'number';
            input.value = stock.Quantite;
            input.min = 0;
            input.style.width = '60px';
            input.dataset.index = index; 
            input.addEventListener('input', updateQuantity); 
            quantityCell.appendChild(input);
        } else {
            quantityCell.textContent = stock.Quantite;
        }
        
        row.insertCell().textContent = parseFloat(stock.MontantAction).toFixed(2) + '€';
        row.insertCell().textContent = total + '€';
        row.insertCell().textContent = stock.Versement;
        row.insertCell().textContent = stock.DateVersement || 'N/A';
        row.insertCell().textContent = stock.Statut;
        
        // NOUVEAU: Colonne Action (Bouton Supprimer)
        const actionCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X Supprimer';
        deleteButton.style.backgroundColor = '#f44336'; // Style simple
        deleteButton.style.color = 'white';
        deleteButton.style.border = 'none';
        deleteButton.style.cursor = 'pointer';
        
        // IMPORTANT: Attacher l'événement de suppression en liant l'index
        deleteButton.addEventListener('click', () => deleteDividend(index));
        actionCell.appendChild(deleteButton);
    });
    
    // Mise à jour des totaux
    if (estimatedTotalElement) {
        estimatedTotalElement.textContent = calculateEstimatedTotal() + '€';
    }
    const uniqueTickers = new Set(dividendsData.map(d => d.Ticker));
    if (totalSocietiesElement) {
        totalSocietiesElement.textContent = uniqueTickers.size;
    }
}

// --- Démarrage de l'application (inchangé) ---
document.addEventListener('DOMContentLoaded', () => {
    loadLocalData();
    renderDividendsTable();
    
    const editButton = document.getElementById('editButton');
    if (editButton) {
        editButton.addEventListener('click', toggleEditMode);
    }
    
    const addButton = document.getElementById('addButton');
    if (addButton) {
        addButton.addEventListener('click', addNewStockSBF120);
    }
});
