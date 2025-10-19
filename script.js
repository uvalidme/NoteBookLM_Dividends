// script.js

const STOCK_LIST_KEY = 'dividendsDataList';
let isEditing = false;

// Mappage Fréquence (basé sur les sources [2, 5-13])
const FREQUENCY_MAP = {
    1: 'Annuel',
    2: 'Semestriel',
    4: 'Trimestriel',
    // Si la fréquence n'est pas claire, 'Annuel' est la valeur par défaut
};

// Référence SBF 120 complète (Dividendes et Tickers)
// Tickers et Dividendes extraits des sources [2-13, 23, 24] et [14-22, 25].
const SBF120_DIVIDENDS_REFERENCE = {
    // Tickers et Dividendes (Montant/action)
    'ICAD.PA': { Societe: 'ICADE', MontantAction: 4.31, Versement: FREQUENCY_MAP[2] }, // [2, 5]
    'SODX.PA': { Societe: 'SODEXO', MontantAction: 8.89, Versement: FREQUENCY_MAP[1] }, // [2, 5]
    'MMT.PA': { Societe: 'M6 METROPOLE TELEVISION', MontantAction: 1.25, Versement: FREQUENCY_MAP[1] }, // [2, 5]
    'VK.PA': { Societe: 'VALLOUREC', MontantAction: 1.50, Versement: FREQUENCY_MAP[1] }, // [2, 5]
    'MERY.PA': { Societe: 'MERCIALYS', MontantAction: 1.00, Versement: FREQUENCY_MAP[1] }, // [2, 5]
    'COFA.PA': { Societe: 'COFACE', MontantAction: 1.40, Versement: FREQUENCY_MAP[1] }, // [2, 5]
    'RUI.PA': { Societe: 'RUBIS', MontantAction: 2.78, Versement: FREQUENCY_MAP[1] }, // [2, 5]
    'SOLB.PA': { Societe: 'SOLVAY', MontantAction: 2.43, Versement: FREQUENCY_MAP[2] }, // [2, 5]
    'CA.PA': { Societe: 'CARREFOUR', MontantAction: 1.15, Versement: FREQUENCY_MAP[1] }, // [2, 5]
    // SOCIETE EUROPEENNE DES SATELLITES Ticker manquant
    'FDJU.PA': { Societe: 'FDJ UNITED', MontantAction: 2.05, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'VRLA.PA': { Societe: 'VERALLIA', MontantAction: 1.70, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'STLAP.PA': { Societe: 'STELLANTIS NV', MontantAction: 0.68, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'ENGI.PA': { Societe: 'ENGIE', MontantAction: 1.48, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'CARM.PA': { Societe: 'CARMILA', MontantAction: 1.25, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'TFI.PA': { Societe: 'TF1', MontantAction: 0.60, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'AKE.PA': { Societe: 'ARKEMA', MontantAction: 3.60, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'NK.PA': { Societe: 'IMERYS', MontantAction: 1.45, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'ACA.PA': { Societe: 'CREDIT AGRICOLE', MontantAction: 1.10, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'GFC.PA': { Societe: 'GECINA', MontantAction: 5.45, Versement: FREQUENCY_MAP[2] }, // [2, 6]
    'TEP.PA': { Societe: 'TELEPERFORMANCE', MontantAction: 4.20, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'AMUN.PA': { Societe: 'AMUNDI', MontantAction: 4.25, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'BNP.PA': { Societe: 'BNP PARIBAS', MontantAction: 4.79, Versement: FREQUENCY_MAP[1] }, // [2, 6]
    'RNO.PA': { Societe: 'RENAULT', MontantAction: 2.20, Versement: FREQUENCY_MAP[1] }, // [2, 7]
    'APAM.PA': { Societe: 'APERAM', MontantAction: 2.00, Versement: FREQUENCY_MAP[4] }, // [2, 7]
    'TTE.PA': { Societe: 'TOTALENERGIES SE', MontantAction: 3.34, Versement: FREQUENCY_MAP[4] }, // [2, 7]
    'COV.PA': { Societe: 'COVIVIO', MontantAction: 3.50, Versement: FREQUENCY_MAP[1] }, // [2, 7]
    'SCR.PA': { Societe: 'SCOR SE', MontantAction: 1.80, Versement: FREQUENCY_MAP[1] }, // [2, 7]
    'MF.PA': { Societe: 'WENDEL', MontantAction: 4.70, Versement: FREQUENCY_MAP[1] }, // [2, 7]
    'EDEN.PA': { Societe: 'EDENRED', MontantAction: 1.21, Versement: FREQUENCY_MAP[1] }, // [2, 7]
    'BB.PA': { Societe: 'BIC', MontantAction: 3.08, Versement: FREQUENCY_MAP[1] }, // [2, 7]
    'SK.PA': { Societe: 'SEB', MontantAction: 2.80, Versement: FREQUENCY_MAP[1] }, // [2, 7]
    'LI.PA': { Societe: 'KLEPIERRE', MontantAction: 1.85, Versement: FREQUENCY_MAP[2] }, // [2, 7]
    'CS.PA': { Societe: 'AXA', MontantAction: 2.15, Versement: FREQUENCY_MAP[1] }, // [2, 7]
    'RI.PA': { Societe: 'PERNOD-RICARD', MontantAction: 4.70, Versement: FREQUENCY_MAP[2] }, // [3, 7]
    'ORA.PA': { Societe: 'ORANGE', MontantAction: 0.75, Versement: FREQUENCY_MAP[2] }, // [3, 7]
    'IPS.PA': { Societe: 'IPSOS', MontantAction: 1.85, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'ML.PA': { Societe: 'MICHELIN', MontantAction: 1.38, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'ARG.PA': { Societe: 'ARGAN', MontantAction: 3.30, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'EN.PA': { Societe: 'BOUYGUES', MontantAction: 2.00, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'GTT.PA': { Societe: 'GAZTRANSPORT ET TECHNIGAZ', MontantAction: 7.50, Versement: FREQUENCY_MAP[2] }, // [3, 8]
    'VIE.PA': { Societe: 'VEOLIA', MontantAction: 1.40, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'RF.PA': { Societe: 'EURAZEO', MontantAction: 2.65, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'SAN.PA': { Societe: 'SANOFI', MontantAction: 3.92, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'RXL.PA': { Societe: 'REXEL', MontantAction: 1.20, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'OPM.PA': { Societe: 'OPMOBILITY', MontantAction: 0.60, Versement: FREQUENCY_MAP[2] }, // [3, 8]
    'FR.PA': { Societe: 'VALEO', MontantAction: 0.42, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'PUB.PA': { Societe: 'PUBLICIS GROUPE', MontantAction: 3.60, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'FGR.PA': { Societe: 'EIFFAGE', MontantAction: 4.70, Versement: FREQUENCY_MAP[1] }, // [3, 8]
    'DG.PA': { Societe: 'VINCI', MontantAction: 4.75, Versement: FREQUENCY_MAP[2] }, // [3, 9]
    'URW.PA': { Societe: 'UNIBAIL-RODAMCO-WESTFIELD', MontantAction: 3.50, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'ITP.PA': { Societe: 'INTERPARFUMS', MontantAction: 1.15, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'GET.PA': { Societe: 'GETLINK SE', MontantAction: 0.58, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'DEC.PA': { Societe: 'JCDECAUX', MontantAction: 0.55, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'MRN.PA': { Societe: 'MERSEN', MontantAction: 0.90, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'AYV.PA': { Societe: 'AYVENS', MontantAction: 0.37, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'SOP.PA': { Societe: 'SOPRA STERIA GROUP', MontantAction: 4.65, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'BVI.PA': { Societe: 'BUREAU VERITAS', MontantAction: 0.90, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'VCT.PA': { Societe: 'VICAT', MontantAction: 2.00, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'RCO.PA': { Societe: 'REMY COINTREAU', MontantAction: 1.50, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'AC.PA': { Societe: 'ACCOR', MontantAction: 1.26, Versement: FREQUENCY_MAP[1] }, // [3, 9]
    'CAP.PA': { Societe: 'CAPGEMINI', MontantAction: 3.40, Versement: FREQUENCY_MAP[1] }, // [3, 10]
    'BN.PA': { Societe: 'DANONE', MontantAction: 2.15, Versement: FREQUENCY_MAP[1] }, // [3, 10]
    'ADP.PA': { Societe: 'AEROPORTS DE PARIS', MontantAction: 3.00, Versement: FREQUENCY_MAP[1] }, // [3, 10]
    'ERA.PA': { Societe: 'ERAMET', MontantAction: 1.50, Versement: FREQUENCY_MAP[1] }, // [3, 10]
    'TRI.PA': { Societe: 'TRIGANO', MontantAction: 3.60, Versement: FREQUENCY_MAP[2] }, // [3, 10]
    'SGO.PA': { Societe: 'SAINT-GOBAIN', MontantAction: 2.20, Versement: FREQUENCY_MAP[1] }, // [3, 10]
    'ENX.PA': { Societe: 'EURONEXT N.V.', MontantAction: 2.90, Versement: FREQUENCY_MAP[1] }, // [3, 10]
    'PLX.PA': { Societe: 'PLUXEE', MontantAction: 0.35, Versement: FREQUENCY_MAP[1] }, // [3, 10]
    'TE.PA': { Societe: 'TECHNIP ENERGIES', MontantAction: 0.85, Versement: FREQUENCY_MAP[1] }, // [4, 10]
    'ATE.PA': { Societe: 'ALTEN', MontantAction: 1.50, Versement: FREQUENCY_MAP[1] }, // [4, 10]
    'SPIE.PA': { Societe: 'SPIE', MontantAction: 1.00, Versement: FREQUENCY_MAP[2] }, // [4, 10]
    'DBG.PA': { Societe: 'DERICHEBOURG', MontantAction: 0.13, Versement: FREQUENCY_MAP[1] }, // [4, 10]
    'LVMH.PA': { Societe: 'LVMH', MontantAction: 13.00, Versement: FREQUENCY_MAP[2] }, // [4, 10]
    'NEX.PA': { Societe: 'NEXANS', MontantAction: 2.60, Versement: FREQUENCY_MAP[1] }, // [4, 11]
    'GLE.PA': { Societe: 'SOCIETE GENERALE', MontantAction: 1.09, Versement: FREQUENCY_MAP[2] }, // [4, 11]
    'KER.PA': { Societe: 'KERING', MontantAction: 6.00, Versement: FREQUENCY_MAP[2] }, // [4, 11]
    'AI.PA': { Societe: 'AIR LIQUIDE', MontantAction: 3.30, Versement: FREQUENCY_MAP[1] }, // [4, 11]
    'ELIS.PA': { Societe: 'ELIS S.A.', MontantAction: 0.45, Versement: FREQUENCY_MAP[1] }, // [4, 11]
    'OR.PA': { Societe: "L'OREAL", MontantAction: 7.00, Versement: FREQUENCY_MAP[1] }, // [4, 11]
    'AM.PA': { Societe: 'DASSAULT AVIATION', MontantAction: 4.72, Versement: FREQUENCY_MAP[1] }, // [4, 11]
    'BOL.PA': { Societe: 'BOLLORE', MontantAction: 0.08, Versement: FREQUENCY_MAP[2] }, // [4, 11]
    'PLNW.PA': { Societe: 'PLANISWARE', MontantAction: 0.31, Versement: FREQUENCY_MAP[1] }, // [4, 11]
    'SU.PA': { Societe: 'SCHNEIDER ELECTRIC', MontantAction: 3.90, Versement: FREQUENCY_MAP[1] }, // [4, 11]
    'LR.PA': { Societe: 'LEGRAND', MontantAction: 2.20, Versement: FREQUENCY_MAP[1] }, // [4, 11]
    'HO.PA': { Societe: 'THALES', MontantAction: 3.70, Versement: FREQUENCY_MAP[2] }, // [4, 11]
    'AIR.PA': { Societe: 'AIRBUS SE', MontantAction: 3.00, Versement: FREQUENCY_MAP[1] }, // [4, 12]
    'MT.PA': { Societe: 'ARCELORMITTAL', MontantAction: 0.47, Versement: FREQUENCY_MAP[2] }, // [4, 12]
    'VIV.PA': { Societe: 'VIVENDI', MontantAction: 0.04, Versement: FREQUENCY_MAP[1] }, // [4, 12]
    'EL.PA': { Societe: 'ESSILORLUXOTTICA', MontantAction: 3.95, Versement: FREQUENCY_MAP[1] }, // [4, 12]
    'STMPA.PA': { Societe: 'STMICROELECTRONICS', MontantAction: 0.31, Versement: FREQUENCY_MAP[4] }, // [4, 12]
    'IPN.PA': { Societe: 'IPSEN', MontantAction: 1.40, Versement: FREQUENCY_MAP[1] }, // [4, 12]
    'RBT.PA': { Societe: 'ROBERTET', MontantAction: 10.00, Versement: FREQUENCY_MAP[1] }, // [4, 12]
    'RMS.PA': { Societe: 'HERMES INTERNATIONAL', MontantAction: 26.00, Versement: FREQUENCY_MAP[2] }, // [4, 12]
    'SAF.PA': { Societe: 'SAFRAN', MontantAction: 2.90, Versement: FREQUENCY_MAP[1] }, // [4, 12]
    'ERF.PA': { Societe: 'EUROFINS SCIENTIF', MontantAction: 0.60, Versement: FREQUENCY_MAP[1] }, // [4, 12]
    'DSY.PA': { Societe: 'DASSAULT SYSTEMES', MontantAction: 0.26, Versement: FREQUENCY_MAP[1] }, // [4, 12]
    'BIM.PA': { Societe: 'BIOMERIEUX', MontantAction: 0.90, Versement: FREQUENCY_MAP[1] }, // [4, 12]
    'VIRP.PA': { Societe: 'VIRBAC SA', MontantAction: 1.45, Versement: FREQUENCY_MAP[1] }, // [4, 13]
    'DIM.PA': { Societe: 'SARTORIUS STEDIM BIOTECH', MontantAction: 0.69, Versement: FREQUENCY_MAP[1] }, // [4, 13]
    'VU.PA': { Societe: 'VUSIONGROUP', MontantAction: 0.60, Versement: FREQUENCY_MAP[1] }, // [4, 13]
    'EXENS.PA': { Societe: 'EXOSENS', MontantAction: 0.10, Versement: FREQUENCY_MAP[1] }, // [4, 13]
    'WLN.PA': { Societe: 'WORLDLINE', MontantAction: 0.00, Versement: FREQUENCY_MAP }, // [23, 24]
    'AF.PA': { Societe: 'AIR FRANCE-KLM', MontantAction: 0.00, Versement: FREQUENCY_MAP }, // [4, 13]
    'ALO.PA': { Societe: 'ALSTOM', MontantAction: 0.00, Versement: FREQUENCY_MAP }, // [13, 23]
    'ATO.PA': { Societe: 'ATOS', MontantAction: 0.00, Versement: FREQUENCY_MAP } // [13, 23]
};


// Données initiales (pour peupler la table dès le début)
const initialData = [
    { Societe: 'TOTALENERGIES SE', Ticker: 'TTE.PA', Quantite: 50, MontantAction: SBF120_DIVIDENDS_REFERENCE['TTE.PA'].MontantAction, Versement: SBF120_DIVIDENDS_REFERENCE['TTE.PA'].Versement, Statut: 'Prévu' }, 
    { Societe: 'LVMH', Ticker: 'LVMH.PA', Quantite: 10, MontantAction: SBF120_DIVIDENDS_REFERENCE['LVMH.PA'].MontantAction, Versement: SBF120_DIVIDENDS_REFERENCE['LVMH.PA'].Versement, Statut: 'Versé' },
    { Societe: 'AIR LIQUIDE', Ticker: 'AI.PA', Quantite: 25, MontantAction: SBF120_DIVIDENDS_REFERENCE['AI.PA'].MontantAction, Versement: SBF120_DIVIDENDS_REFERENCE['AI.PA'].Versement, Statut: 'Prévu' }
];

let dividendsData = [];

// --- Fonctions de Persistance et Calcul ---

function loadLocalData() {
    const storedData = localStorage.getItem(STOCK_LIST_KEY);
    if (storedData) {
        dividendsData = JSON.parse(storedData);
    } else {
        dividendsData = initialData; // Charge les données initiales
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
    const newQuantity = Math.max(0, parseInt(event.target.value, 10));
    
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
    
    renderDividendsTable(); 
}

// --- Logique d'Ajout d'action SBF 120 ---

function addNewStockSBF120() {
    // La liste complète des tickers est maintenant dans SBF120_DIVIDENDS_REFERENCE
    
    let tickerInput = prompt(`Entrez le Ticker SBF 120 (Ex: ICAD.PA, BNP.PA, LVMH.PA, TTE.PA).`);
    
    if (!tickerInput) return;

    tickerInput = tickerInput.toUpperCase().trim();
    const referenceStock = SBF120_DIVIDENDS_REFERENCE[tickerInput];
    
    if (!referenceStock) {
        alert("Ticker non valide ou non trouvé dans la liste SBF 120 interne. Veuillez vérifier la casse (ex: TTE.PA).");
        return;
    }

    const quantityInput = prompt(`Entrez la quantité détenue pour ${referenceStock.Societe} (Dividende/action: ${referenceStock.MontantAction}€) :`);
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
        Versement: referenceStock.Versement || 'Annuel',
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
        
        // Montant/action (Dividende)
        row.insertCell().textContent = parseFloat(stock.MontantAction).toFixed(2) + '€';
        
        // Total estimé (Calculé)
        row.insertCell().textContent = total + '€';
        
        row.insertCell().textContent = stock.Versement;
        row.insertCell().textContent = stock.Statut;
        
        row.insertCell().textContent = ''; // Colonne Action
    });
    
    // Mise à jour des totaux et du nombre de sociétés
    if (estimatedTotalElement) {
        estimatedTotalElement.textContent = calculateEstimatedTotal() + '€';
    }
    if (totalSocietiesElement) {
        totalSocietiesElement.textContent = dividendsData.length; // [1]
    }
}

// --- Démarrage de l'application ---
document.addEventListener('DOMContentLoaded', () => {
    loadLocalData();
    renderDividendsTable();
    
    // Attachement des écouteurs des boutons
    const editButton = document.getElementById('editButton');
    const addButton = document.getElementById('addButton');

    if (editButton) {
        editButton.addEventListener('click', toggleEditMode);
    }
    
    if (addButton) {
        addButton.addEventListener('click', addNewStockSBF120);
    }
});
