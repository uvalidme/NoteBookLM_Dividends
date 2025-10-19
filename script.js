// script.js

const STOCK_LIST_KEY = 'dividendsDataList';
let isEditing = false;

// --- Référence SBF 120 des ÉVÉNEMENTS DE PAIEMENT (Dividende, Date de Paiement) ---
// Données extraites de Dividends_List.csv.txt [1-43] et mappées aux Tickers SBF 120 [44-53]
const SBF120_PAYMENT_SCHEDULE = {
    // Structure: Ticker: [{Societe, Montant, Date, Frequence}]
    'TTE.PA': [
        { Societe: 'TotalEnergies SE', Montant: 0.79, Date: '06/01/2025', Versement: 'Trimestriel' },
        { Societe: 'TotalEnergies SE', Montant: 0.79, Date: '01/04/2025', Versement: 'Trimestriel' },
        { Societe: 'TotalEnergies SE', Montant: 0.85, Date: '01/07/2025', Versement: 'Trimestriel' },
        { Societe: 'TotalEnergies SE', Montant: 0.85, Date: '03/10/2025', Versement: 'Trimestriel' },
        { Societe: 'TotalEnergies SE', Montant: 0.85, Date: '01/07/2025', Versement: 'Trimestriel' } // [1, 5, 27, 40]
    ],
    'KER.PA': [
        { Societe: 'Kering', Montant: 2.00, Date: '16/01/2025', Versement: 'Acompte' },
        { Societe: 'Kering', Montant: 4.00, Date: '07/05/2025', Versement: 'Solde' } // [1, 11]
    ],
    'DBG.PA': [ { Societe: 'Derichebourg', Montant: 0.13, Date: '12/02/2025', Versement: 'Annuel' } ], // [2]
    'RMS.PA': [ 
        { Societe: 'Hermès International', Montant: 3.50, Date: '19/02/2025', Versement: 'Acompte' }, 
        { Societe: 'Hermès International', Montant: 12.50, Date: '07/05/2025', Versement: 'Solde' } // [3, 11]
    ],
    'GFC.PA': [ 
        { Societe: 'Gecina', Montant: 2.70, Date: '05/03/2025', Versement: 'Trimestriel' },
        { Societe: 'Gecina', Montant: 2.75, Date: '04/07/2025', Versement: 'Trimestriel' } // [4, 32]
    ],
    'LI.PA': [ 
        { Societe: 'Klépierre', Montant: 0.925, Date: '06/03/2025', Versement: 'Semestriel' },
        { Societe: 'Klépierre', Montant: 0.925, Date: '10/07/2025', Versement: 'Semestriel' } // [4, 34]
    ],
    'ICAD.PA': [ 
        { Societe: 'Icade', Montant: 1.00, Date: '06/03/2025', Versement: 'Annuel' }, 
        { Societe: 'Icade', Montant: 1.16, Date: '06/03/2025', Versement: 'Annuel' },
        { Societe: 'Icade', Montant: 2.15, Date: '03/07/2025', Versement: 'Annuel' } // [4, 32]
    ],
    'STMPA.PA': [ 
        { Societe: 'STMicroelectronics', Montant: 0.09, Date: '26/03/2025', Versement: 'Trimestriel' },
        { Societe: 'STMicroelectronics', Montant: 0.09, Date: '25/06/2025', Versement: 'Trimestriel' },
        { Societe: 'STMicroelectronics', Montant: 0.09, Date: '24/09/2025', Versement: 'Trimestriel' },
        { Societe: 'STMicroelectronics', Montant: 0.09, Date: '17/12/2025', Versement: 'Trimestriel' } // [5, 27, 39, 43]
    ],
    'ARG.PA': [ { Societe: 'Argan SA', Montant: 3.30, Date: '17/04/2025', Versement: 'Annuel' } ], // [5]
    'DIM.PA': [ { Societe: 'Sartorius Stedim Biotech', Montant: 0.69, Date: '04/04/2025', Versement: 'Annuel' } ], // [6]
    'AIR.PA': [ 
        { Societe: 'Airbus SE', Montant: 1.00, Date: '24/04/2025', Versement: 'Annuel' }, 
        { Societe: 'Airbus SE', Montant: 2.00, Date: '24/04/2025', Versement: 'Annuel' } // [8]
    ],
    'DG.PA': [ 
        { Societe: 'Vinci', Montant: 3.70, Date: '24/04/2025', Versement: 'Annuel' },
        { Societe: 'Vinci', Montant: 1.05, Date: '16/10/2025', Versement: 'Acompte' } // [8, 41]
    ],
    'STLAP.PA': [ { Societe: 'Stellantis NV', Montant: 0.68, Date: '05/05/2025', Versement: 'Annuel' } ], // [8]
    'LVMH.PA': [ { Societe: 'LVMH', Montant: 7.50, Date: '28/04/2025', Versement: 'Solde' } ], // [9]
    'TFI.PA': [ { Societe: 'TF1', Montant: 0.60, Date: '28/04/2025', Versement: 'Annuel' } ], // [9]
    'ENGI.PA': [ { Societe: 'Engie', Montant: 1.48, Date: '29/04/2025', Versement: 'Annuel' } ], // [9]
    'ITP.PA': [ { Societe: 'Interparfums', Montant: 1.15, Date: '30/04/2025', Versement: 'Annuel' } ], // [9]
    'VCT.PA': [ { Societe: 'Vicat', Montant: 2.00, Date: '02/05/2025', Versement: 'Annuel' } ], // [9]
    'OPM.PA': [ { Societe: 'Opmobility SE', Montant: 0.36, Date: '02/05/2025', Versement: 'Annuel' } ], // [9]
    'VIV.PA': [ { Societe: 'Vivendi', Montant: 0.04, Date: '02/05/2025', Versement: 'Annuel' } ], // [9]
    'COV.PA': [ { Societe: 'Covivio', Montant: 3.50, Date: '05/05/2025', Versement: 'Annuel' } ], // [10]
    'SCR.PA': [ { Societe: 'SCOR SE', Montant: 1.80, Date: '06/05/2025', Versement: 'Annuel' } ], // [11]
    'MERY.PA': [ { Societe: 'Mercialys', Montant: 1.00, Date: '06/05/2025', Versement: 'Annuel' } ], // [11]
    'EN.PA': [ { Societe: 'Bouygues', Montant: 2.00, Date: '07/05/2025', Versement: 'Annuel' } ], // [11]
    'MMT.PA': [ { Societe: 'Métropole Télévision SA (M6)', Montant: 1.25, Date: '07/05/2025', Versement: 'Annuel' } ], // [11]
    'CS.PA': [ { Societe: 'AXA', Montant: 2.15, Date: '07/05/2025', Versement: 'Annuel' } ], // [11]
    'OR.PA': [ { Societe: "L'Oréal", Montant: 7.00, Date: '07/05/2025', Versement: 'Annuel' } ], // [12]
    'BN.PA': [ { Societe: 'Danone', Montant: 2.15, Date: '07/05/2025', Versement: 'Annuel' } ], // [12]
    'EL.PA': [ { Societe: 'EssilorLuxottica', Montant: 3.95, Date: '05/06/2025', Versement: 'Annuel' } ], // [12]
    'URW.PA': [ { Societe: 'Unibail-Rodamco', Montant: 3.50, Date: '12/05/2025', Versement: 'Annuel' } ], // [12]
    'RNO.PA': [ { Societe: 'Renault', Montant: 2.20, Date: '12/05/2025', Versement: 'Annuel' } ], // [12]
    'SAN.PA': [ { Societe: 'Sanofi', Montant: 3.92, Date: '14/05/2025', Versement: 'Annuel' } ], // [13]
    'VIE.PA': [ { Societe: 'Veolia', Montant: 1.40, Date: '14/05/2025', Versement: 'Annuel' } ], // [13]
    'SU.PA': [ 
        { Societe: 'Schneider Electric', Montant: 1.37, Date: '15/05/2025', Versement: 'Acompte' }, 
        { Societe: 'Schneider Electric', Montant: 2.53, Date: '15/05/2025', Versement: 'Solde' } // [13, 14]
    ],
    'VRLA.PA': [ { Societe: 'Verallia', Montant: 1.70, Date: '15/05/2025', Versement: 'Annuel' } ], // [14]
    'RXL.PA': [ { Societe: 'Rexel', Montant: 1.20, Date: '16/05/2025', Versement: 'Annuel' } ], // [14]
    'SPIE.PA': [ 
        { Societe: 'Spie', Montant: 0.75, Date: '16/05/2025', Versement: 'Annuel' },
        { Societe: 'Spie', Montant: 0.30, Date: '18/09/2025', Versement: 'Acompte' } // [14, 39]
    ],
    'BNP.PA': [ 
        { Societe: 'BNP Paribas', Montant: 4.79, Date: '21/05/2025', Versement: 'Annuel' },
        { Societe: 'BNP Paribas', Montant: 2.59, Date: '30/09/2025', Versement: 'Exceptionnel' } // [15, 40]
    ],
    'AI.PA': [ { Societe: 'Air Liquide', Montant: 3.30, Date: '21/05/2025', Versement: 'Annuel' } ], // [15]
    'DEC.PA': [ { Societe: 'JC Decaux SA', Montant: 0.55, Date: '21/05/2025', Versement: 'Annuel' } ], // [15]
    'NEX.PA': [ { Societe: 'Nexans SA', Montant: 2.60, Date: '21/05/2025', Versement: 'Annuel' } ], // [15]
    'CARM.PA': [ { Societe: 'Carmila', Montant: 1.25, Date: '21/05/2025', Versement: 'Annuel' } ], // [16]
    'COFA.PA': [ { Societe: 'Coface', Montant: 1.40, Date: '22/05/2025', Versement: 'Annuel' } ], // [16]
    'NK.PA': [ { Societe: 'Imerys', Montant: 1.45, Date: '22/05/2025', Versement: 'Annuel' } ], // [16]
    'HO.PA': [ 
        { Societe: 'Thales', Montant: 2.85, Date: '22/05/2025', Versement: 'Solde' },
        { Societe: 'Thales', Montant: 0.95, Date: '04/12/2025', Versement: 'Acompte' } // [16, 42]
    ],
    'CAP.PA': [ { Societe: 'Capgemini', Montant: 3.40, Date: '22/05/2025', Versement: 'Annuel' } ], // [16]
    'TE.PA': [ { Societe: 'Technip Energies BV', Montant: 0.85, Date: '22/05/2025', Versement: 'Annuel' } ], // [16]
    'AM.PA': [ { Societe: 'Dassault Aviation', Montant: 4.72, Date: '22/05/2025', Versement: 'Annuel' } ], // [16]
    'FGR.PA': [ { Societe: 'Eiffage', Montant: 4.70, Date: '23/05/2025', Versement: 'Annuel' } ], // [16]
    'MF.PA': [ 
        { Societe: 'Wendel', Montant: 4.70, Date: '23/05/2025', Versement: 'Annuel' },
        { Societe: 'Wendel', Montant: 1.50, Date: '20/11/2025', Versement: 'Exceptionnel' } // [17, 42]
    ],
    'TEP.PA': [ { Societe: 'Teleperformance', Montant: 4.20, Date: '28/05/2025', Versement: 'Annuel' } ], // [17]
    'RF.PA': [ { Societe: 'Eurazeo', Montant: 2.65, Date: '28/05/2025', Versement: 'Annuel' } ], // [18]
    'ENX.PA': [ { Societe: 'Euronext', Montant: 2.90, Date: '28/05/2025', Versement: 'Annuel' } ], // [18]
    'ACA.PA': [ { Societe: 'Crédit Agricole', Montant: 1.10, Date: '28/05/2025', Versement: 'Annuel' } ], // [18]
    'ELIS.PA': [ { Societe: 'Elis Services SA', Montant: 0.45, Date: '28/05/2025', Versement: 'Annuel' } ], // [18]
    'VK.PA': [ { Societe: 'Vallourec', Montant: 1.50, Date: '28/05/2025', Versement: 'Annuel' } ], // [18]
    'FR.PA': [ { Societe: 'Valeo', Montant: 0.42, Date: '28/05/2025', Versement: 'Annuel' } ], // [18]
    'GLE.PA': [ 
        { Societe: 'Société Générale', Montant: 1.09, Date: '28/05/2025', Versement: 'Annuel' },
        { Societe: 'Société Générale', Montant: 0.61, Date: '09/10/2025', Versement: 'Trimestriel' } // [18, 41]
    ],
    'AKE.PA': [ { Societe: 'Arkema', Montant: 3.60, Date: '28/05/2025', Versement: 'Annuel' } ], // [18]
    'DSY.PA': [ { Societe: 'Dassault Systèmes', Montant: 0.26, Date: '28/05/2025', Versement: 'Annuel' } ], // [18]
    'AYV.PA': [ { Societe: 'Ayvens', Montant: 0.37, Date: '28/05/2025', Versement: 'Annuel' } ], // [19]
    'FDJU.PA': [ { Societe: 'FDJ United', Montant: 2.05, Date: '03/06/2025', Versement: 'Annuel' } ], // [19]
    'SAF.PA': [ { Societe: 'Safran', Montant: 2.90, Date: '02/06/2025', Versement: 'Annuel' } ], // [19]
    'EXENS.PA': [ { Societe: 'Exosens', Montant: 0.10, Date: '30/05/2025', Versement: 'Annuel' } ], // [19]
    'LR.PA': [ { Societe: 'Legrand', Montant: 2.20, Date: '02/06/2025', Versement: 'Annuel' } ], // [20]
    'BB.PA': [ { Societe: 'Société BIC SA', Montant: 3.08, Date: '03/06/2025', Versement: 'Annuel' } ], // [20]
    'TRI.PA': [ 
        { Societe: 'Trigano', Montant: 1.75, Date: '03/06/2025', Versement: 'Annuel' },
        { Societe: 'Trigano', Montant: 1.85, Date: '08/10/2025', Versement: 'Annuel' } // [20, 41]
    ],
    'CA.PA': [ 
        { Societe: 'Carrefour', Montant: 0.23, Date: '03/06/2025', Versement: 'Annuel' },
        { Societe: 'Carrefour', Montant: 0.92, Date: '03/06/2025', Versement: 'Annuel' } // [20]
    ],
    'ERA.PA': [ 
        { Societe: 'Eramet', Montant: 1.35, Date: '04/06/2025', Versement: 'Annuel' },
        { Societe: 'Eramet', Montant: 0.15, Date: '04/06/2025', Versement: 'Annuel' } // [21]
    ],
    'AC.PA': [ { Societe: 'Accor', Montant: 1.26, Date: '04/06/2025', Versement: 'Annuel' } ], // [21]
    'GET.PA': [ { Societe: 'Getlink', Montant: 0.58, Date: '06/06/2025', Versement: 'Annuel' } ], // [21]
    'ADP.PA': [ { Societe: 'Aeroports Paris', Montant: 3.00, Date: '05/06/2025', Versement: 'Annuel' } ], // [21]
    'SK.PA': [ { Societe: 'Groupe SEB', Montant: 2.80, Date: '05/06/2025', Versement: 'Annuel' } ], // [21]
    'SOP.PA': [ { Societe: 'Sopra Steria', Montant: 4.65, Date: '05/06/2025', Versement: 'Annuel' } ], // [22]
    'ORA.PA': [ { Societe: 'Orange', Montant: 0.45, Date: '05/06/2025', Versement: 'Semestriel' } ], // [22]
    'IPN.PA': [ { Societe: 'Ipsen', Montant: 1.40, Date: '06/06/2025', Versement: 'Annuel' } ], // [22]
    'SGO.PA': [ { Societe: 'Saint-Gobain', Montant: 2.20, Date: '11/06/2025', Versement: 'Annuel' } ], // [23]
    'BIM.PA': [ { Societe: 'Biomérieux', Montant: 0.90, Date: '11/06/2025', Versement: 'Annuel' } ], // [24]
    'BOL.PA': [ 
        { Societe: 'Bolloré', Montant: 0.06, Date: '12/06/2025', Versement: 'Annuel' },
        { Societe: 'Bolloré', Montant: 0.02, Date: '30/09/2025', Versement: 'Exceptionnel' } // [24, 40]
    ],
    'AMUN.PA': [ { Societe: 'Amundi', Montant: 4.25, Date: '12/06/2025', Versement: 'Annuel' } ], // [24]
    'EDEN.PA': [ { Societe: 'Edenred', Montant: 1.21, Date: '12/06/2025', Versement: 'Annuel' } ], // [24]
    'ATE.PA': [ { Societe: 'Alten', Montant: 1.50, Date: '18/06/2025', Versement: 'Annuel' } ], // [25]
    'RUI.PA': [ { Societe: 'Rubis', Montant: 2.03, Date: '19/06/2025', Versement: 'Annuel' } ], // [26]
    'GTT.PA': [ { Societe: 'Gaztransport et Technigaz SA', Montant: 3.83, Date: '19/06/2025', Versement: 'Annuel' } ], // [26]
    'PLNW.PA': [ { Societe: 'Planisware', Montant: 0.31, Date: '26/06/2025', Versement: 'Annuel' } ], // [28]
    'VIRP.PA': [ { Societe: 'Virbac', Montant: 1.45, Date: '26/06/2025', Versement: 'Annuel' } ], // [28]
    'VU.PA': [ { Societe: 'Vusiongroup', Montant: 0.60, Date: '26/06/2025', Versement: 'Annuel' } ], // [29]
    'RBT.PA': [ { Societe: 'Robertet', Montant: 10.00, Date: '01/07/2025', Versement: 'Annuel' } ], // [30]
    'BVI.PA': [ { Societe: 'Bureau Veritas', Montant: 0.90, Date: '03/07/2025', Versement: 'Annuel' } ], // [31]
    'IPS.PA': [ { Societe: 'Ipsos', Montant: 1.85, Date: '03/07/2025', Versement: 'Annuel' } ], // [31]
    'PUB.PA': [ { Societe: 'Publicis', Montant: 3.60, Date: '03/07/2025', Versement: 'Annuel' } ], // [32]
    'RI.PA': [ 
        { Societe: 'Pernod Ricard', Montant: 2.35, Date: '25/07/2025', Versement: 'Acompte' },
        { Societe: 'Pernod Ricard', Montant: 2.35, Date: '26/11/2025', Versement: 'Solde' } // [36, 42]
    ],
    'MT.PA': [ { Societe: 'ArcelorMittal', Montant: 0.47, Date: '10/05/2025', Versement: 'Trimestriel' } ], // Non trouvé dans la liste détaillée, mais SBF 120 [44]
    'ML.PA': [ { Societe: 'Michelin', Montant: 1.38, Date: '23/05/2025', Versement: 'Annuel' } ] // Non trouvé dans la liste détaillée, mais SBF 120 [44]
};


// Données initiales (utilisent un événement de paiement réel)
const initialData = [
    { Societe: 'TOTALENERGIES SE', Ticker: 'TTE.PA', Quantite: 50, MontantAction: SBF120_PAYMENT_SCHEDULE['TTE.PA'].Montant, Versement: SBF120_PAYMENT_SCHEDULE['TTE.PA'].Versement, DateVersement: SBF120_PAYMENT_SCHEDULE['TTE.PA'].Date, Statut: 'Prévu' }, 
    { Societe: 'LVMH', Ticker: 'LVMH.PA', Quantite: 10, MontantAction: SBF120_PAYMENT_SCHEDULE['LVMH.PA'].Montant, Versement: SBF120_PAYMENT_SCHEDULE['LVMH.PA'].Versement, DateVersement: SBF120_PAYMENT_SCHEDULE['LVMH.PA'].Date, Statut: 'Versé' },
    { Societe: 'AIR LIQUIDE', Ticker: 'AI.PA', Quantite: 25, MontantAction: SBF120_PAYMENT_SCHEDULE['AI.PA'].Montant, Versement: SBF120_PAYMENT_SCHEDULE['AI.PA'].Versement, DateVersement: SBF120_PAYMENT_SCHEDULE['AI.PA'].Date, Statut: 'Prévu' }
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
    // Le calcul utilise les montants individuels des paiements listés
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

// --- Logique d'Ajout d'action SBF 120 (MISE À JOUR) ---

function addNewStockSBF120() {
    const availableTickers = Object.keys(SBF120_PAYMENT_SCHEDULE).sort().join(', ');
    
    let tickerInput = prompt(`Entrez le Ticker SBF 120 (Ex: TTE.PA, KER.PA). Tickers disponibles: ${Object.keys(SBF120_PAYMENT_SCHEDULE).slice(0, 5).join(', ')}, etc.`);
    
    if (!tickerInput) return;

    tickerInput = tickerInput.toUpperCase().trim();
    const payments = SBF120_PAYMENT_SCHEDULE[tickerInput];
    
    if (!payments || payments.length === 0) {
        alert("Ticker non valide ou aucune date de dividende trouvée pour ce Ticker SBF 120 pour l'année prochaine dans la liste interne.");
        return;
    }

    const quantityInput = prompt(`Entrez la quantité détenue pour ${payments.Societe} (${tickerInput}) :`);
    const quantity = parseInt(quantityInput, 10);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Quantité invalide. L'action n'a pas été ajoutée.");
        return;
    }
    
    // Ajout de TOUS les événements de paiement pour ce Ticker
    payments.forEach(payment => {
        const newStock = {
            Societe: payment.Societe,
            Ticker: tickerInput,
            Quantite: quantity,
            MontantAction: payment.Montant, // Montant par PAIEMENT
            Versement: payment.Versement || 'Annuel',
            DateVersement: payment.Date, // DATE DE PAIEMENT RENSEIGNÉE
            Statut: 'Prévu' 
        };
        dividendsData.push(newStock);
    });

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
        
        row.insertCell().textContent = parseFloat(stock.MontantAction).toFixed(2) + '€';
        row.insertCell().textContent = total + '€';
        row.insertCell().textContent = stock.Versement;
        
        // Colonne Date Prévue (utilisant la date de paiement du fichier source)
        row.insertCell().textContent = stock.DateVersement || 'N/A'; // [1-43]
        
        row.insertCell().textContent = stock.Statut;
        
        row.insertCell().textContent = ''; // Colonne Action
    });
    
    // Mise à jour des totaux
    if (estimatedTotalElement) {
        estimatedTotalElement.textContent = calculateEstimatedTotal() + '€';
    }
    // Le nombre de sociétés est le nombre unique de tickers
    const uniqueTickers = new Set(dividendsData.map(d => d.Ticker));
    if (totalSocietiesElement) {
        totalSocietiesElement.textContent = uniqueTickers.size;
    }
}

// --- Démarrage de l'application ---
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
