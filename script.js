// script.js

const STOCK_LIST_KEY = 'dividendsDataList';
let isEditing = false;

// --- MAPPING INTERNE DES PAIEMENTS SBF 120 (Sources Dividends_List.csv.txt et SBF120_List) ---
// Clé: Ticker SBF 120 (.PA ou Ticker Listé)
const SBF120_PAYMENT_SCHEDULE = {
    // Structure: Ticker: [{Societe, Montant, DateVersement, Versement}]
    'TTE.PA': [ // TotalEnergies SE [44, 174]
        { Societe: 'TotalEnergies SE', Montant: 0.79, DateVersement: '06/01/2025', Versement: 'Trimestriel' }, [1]
        { Societe: 'TotalEnergies SE', Montant: 0.79, DateVersement: '01/04/2025', Versement: 'Trimestriel' }, [5]
        { Societe: 'TotalEnergies SE', Montant: 0.85, DateVersement: '01/07/2025', Versement: 'Trimestriel' }, [27]
        { Societe: 'TotalEnergies SE', Montant: 0.85, DateVersement: '03/10/2025', Versement: 'Trimestriel' } [40]
    ],
    'KER.PA': [ // Kering [44, 174]
        { Societe: 'Kering', Montant: 2.00, DateVersement: '16/01/2025', Versement: 'Acompte' }, [1]
        { Societe: 'Kering', Montant: 4.00, DateVersement: '07/05/2025', Versement: 'Solde' } [11]
    ],
    'DBG.PA': [ { Societe: 'Derichebourg', Montant: 0.13, DateVersement: '12/02/2025', Versement: 'Annuel' } ], [2, 149]
    'RMS.PA': [ // Hermes International [44, 174]
        { Societe: 'Hermès International', Montant: 3.50, DateVersement: '19/02/2025', Versement: 'Acompte' }, [3] 
        { Societe: 'Hermès International', Montant: 12.50, DateVersement: '07/05/2025', Versement: 'Solde' } [11]
    ],
    'GFC.PA': [ // Gecina [46, 177]
        { Societe: 'Gecina SA', Montant: 2.70, DateVersement: '05/03/2025', Versement: 'Trimestriel' }, [4]
        { Societe: 'Gecina SA', Montant: 2.75, DateVersement: '04/07/2025', Versement: 'Trimestriel' } [32]
    ],
    'LI.PA': [ // Klépierre [45, 176]
        { Societe: 'Klépierre', Montant: 0.925, DateVersement: '06/03/2025', Versement: 'Semestriel' }, [4]
        { Societe: 'Klépierre', Montant: 0.925, DateVersement: '10/07/2025', Versement: 'Semestriel' } [34]
    ],
    'ICAD.PA': [ // Icade [44, 175]
        { Societe: 'Icade', Montant: 1.00, DateVersement: '06/03/2025', Versement: 'Annuel' }, [4]
        { Societe: 'Icade', Montant: 1.16, DateVersement: '06/03/2025', Versement: 'Annuel' }, [4]
        { Societe: 'Icade', Montant: 2.15, DateVersement: '03/07/2025', Versement: 'Annuel' } [32]
    ],
    'STMPA.PA': [ // STMicroelectronics [44, 175]
        { Societe: 'STMicroelectronics', Montant: 0.09, DateVersement: '26/03/2025', Versement: 'Trimestriel' }, [5]
        { Societe: 'STMicroelectronics', Montant: 0.09, DateVersement: '25/06/2025', Versement: 'Trimestriel' }, [27]
        { Societe: 'STMicroelectronics', Montant: 0.09, DateVersement: '24/09/2025', Versement: 'Trimestriel' }, [39]
        { Societe: 'STMicroelectronics', Montant: 0.09, DateVersement: '17/12/2025', Versement: 'Trimestriel' } [43]
    ],
    'ARG.PA': [ { Societe: 'Argan SA', Montant: 3.30, DateVersement: '17/04/2025', Versement: 'Annuel' } ], [5, 178]
    'DIM.PA': [ { Societe: 'Sartorius Stedim', Montant: 0.69, DateVersement: '04/04/2025', Versement: 'Annuel' } ], [6, 178]
    'AIR.PA': [ // Airbus SE [44, 175]
        { Societe: 'Airbus SE', Montant: 1.00, DateVersement: '24/04/2025', Versement: 'Annuel' }, [8]
        { Societe: 'Airbus SE', Montant: 2.00, DateVersement: '24/04/2025', Versement: 'Annuel' } [8]
    ],
    'DG.PA': [ // Vinci [44, 174]
        { Societe: 'Vinci', Montant: 3.70, DateVersement: '24/04/2025', Versement: 'Annuel' }, [8]
        { Societe: 'Vinci', Montant: 1.05, DateVersement: '16/10/2025', Versement: 'Acompte' } [41]
    ],
    'STLAP.PA': [ { Societe: 'Stellantis NV', Montant: 0.68, DateVersement: '05/05/2025', Versement: 'Annuel' } ], [8, 175]
    'MC.PA': [ { Societe: 'LVMH', Montant: 7.50, DateVersement: '28/04/2025', Versement: 'Solde' } ], [9, 174, 176]
    'TFI.PA': [ { Societe: 'TF1', Montant: 0.60, DateVersement: '28/04/2025', Versement: 'Annuel' } ], [9, 176]
    'ENGI.PA': [ { Societe: 'Engie', Montant: 1.48, DateVersement: '29/04/2025', Versement: 'Annuel' } ], [9, 174, 177]
    'ITP.PA': [ { Societe: 'Interparfums', Montant: 1.15, DateVersement: '30/04/2025', Versement: 'Annuel' } ], [9, 177]
    'VCT.PA': [ { Societe: 'Vicat', Montant: 2.00, DateVersement: '02/05/2025', Versement: 'Annuel' } ], [9, 175]
    'OPM.PA': [ { Societe: 'OPmobility SE', Montant: 0.36, DateVersement: '02/05/2025', Versement: 'Annuel' } ], [9, 176]
    'VIV.PA': [ { Societe: 'Vivendi', Montant: 0.04, DateVersement: '02/05/2025', Versement: 'Annuel' } ], [9, 177]
    'COV.PA': [ { Societe: 'Covivio', Montant: 3.50, DateVersement: '05/05/2025', Versement: 'Annuel' } ], [10, 176]
    'SCR.PA': [ { Societe: 'SCOR SE', Montant: 1.80, DateVersement: '06/05/2025', Versement: 'Annuel' } ], [11, 178]
    'MERY.PA': [ { Societe: 'Mercialys', Montant: 1.00, DateVersement: '06/05/2025', Versement: 'Annuel' } ], [11, 177]
    'EN.PA': [ { Societe: 'Bouygues', Montant: 2.00, DateVersement: '07/05/2025', Versement: 'Annuel' } ], [11, 174, 176]
    'MMT.PA': [ { Societe: 'Métropole Télévision SA (M6)', Montant: 1.25, DateVersement: '07/05/2025', Versement: 'Annuel' } ], [11, 176]
    'CS.PA': [ { Societe: 'AXA', Montant: 2.15, DateVersement: '07/05/2025', Versement: 'Annuel' } ], [11, 174, 176]
    'OR.PA': [ { Societe: "L'Oréal", Montant: 7.00, DateVersement: '07/05/2025', Versement: 'Annuel' } ], [12, 174, 176]
    'BN.PA': [ { Societe: 'Danone', Montant: 2.15, DateVersement: '07/05/2025', Versement: 'Annuel' } ], [12, 174, 176]
    'EL.PA': [ { Societe: 'EssilorLuxottica', Montant: 3.95, DateVersement: '05/06/2025', Versement: 'Annuel' } ], [12, 174, 176]
    'URW.PA': [ { Societe: 'Unibail-Rodamco', Montant: 3.50, DateVersement: '12/05/2025', Versement: 'Annuel' } ], [12, 175, 178]
    'RNO.PA': [ { Societe: 'Renault', Montant: 2.20, DateVersement: '12/05/2025', Versement: 'Annuel' } ], [12, 174, 177]
    'SAN.PA': [ { Societe: 'Sanofi', Montant: 3.92, DateVersement: '14/05/2025', Versement: 'Annuel' } ], [13, 174, 176]
    'VIE.PA': [ { Societe: 'Veolia', Montant: 1.40, DateVersement: '14/05/2025', Versement: 'Annuel' } ], [13, 174, 176]
    'SU.PA': [ // Schneider Electric [44, 174]
        { Societe: 'Schneider Electric', Montant: 1.37, DateVersement: '15/05/2025', Versement: 'Acompte' }, [13] 
        { Societe: 'Schneider Electric', Montant: 2.53, DateVersement: '15/05/2025', Versement: 'Solde' } [14]
    ],
    'VRLA.PA': [ { Societe: 'Verallia', Montant: 1.70, DateVersement: '15/05/2025', Versement: 'Annuel' } ], [14, 178]
    'RXL.PA': [ { Societe: 'Rexel', Montant: 1.20, DateVersement: '16/05/2025', Versement: 'Annuel' } ], [14, 178]
    'SPIE.PA': [ // Spie [46, 178]
        { Societe: 'Spie', Montant: 0.75, DateVersement: '16/05/2025', Versement: 'Annuel' }, [14]
        { Societe: 'Spie', Montant: 0.30, DateVersement: '18/09/2025', Versement: 'Acompte' } [39]
    ],
    'BNP.PA': [ // BNP Paribas [44, 174]
        { Societe: 'BNP Paribas', Montant: 4.79, DateVersement: '21/05/2025', Versement: 'Annuel' }, [15]
        { Societe: 'BNP Paribas', Montant: 2.59, DateVersement: '30/09/2025', Versement: 'Exceptionnel' } [40]
    ],
    'AI.PA': [ { Societe: 'Air Liquide', Montant: 3.30, DateVersement: '21/05/2025', Versement: 'Annuel' } ], [15, 174]
    'DEC.PA': [ { Societe: 'JC Decaux SA', Montant: 0.55, DateVersement: '21/05/2025', Versement: 'Annuel' } ], [15, 176]
    'NEX.PA': [ { Societe: 'Nexans SA', Montant: 2.60, DateVersement: '21/05/2025', Versement: 'Annuel' } ], [15, 175]
    'CARM.PA': [ { Societe: 'Carmila', Montant: 1.25, DateVersement: '21/05/2025', Versement: 'Annuel' } ], [16, 178]
    'COFA.PA': [ { Societe: 'Coface', Montant: 1.40, DateVersement: '22/05/2025', Versement: 'Annuel' } ], [16, 178]
    'NK.PA': [ { Societe: 'Imerys', Montant: 1.45, DateVersement: '22/05/2025', Versement: 'Annuel' } ], [16, 176]
    'HO.PA': [ // Thales [44, 174]
        { Societe: 'Thales', Montant: 2.85, DateVersement: '22/05/2025', Versement: 'Solde' }, [16]
        { Societe: 'Thales', Montant: 0.95, DateVersement: '04/12/2025', Versement: 'Acompte' } [42]
    ],
    'CAP.PA': [ { Societe: 'Capgemini', Montant: 3.40, DateVersement: '22/05/2025', Versement: 'Annuel' } ], [16, 174]
    'TE.PA': [ { Societe: 'Technip Energies BV', Montant: 0.85, DateVersement: '22/05/2025', Versement: 'Annuel' } ], [16, 179]
    'AM.PA': [ { Societe: 'Dassault Aviation', Montant: 4.72, DateVersement: '22/05/2025', Versement: 'Annuel' } ], [16, 178]
    'FGR.PA': [ { Societe: 'Eiffage', Montant: 4.70, DateVersement: '23/05/2025', Versement: 'Annuel' } ], [177]
    'MF.PA': [ // Wendel Invest. [45, 176]
        { Societe: 'Wendel', Montant: 4.70, DateVersement: '23/05/2025', Versement: 'Annuel' }, [17]
        { Societe: 'Wendel', Montant: 1.50, DateVersement: '20/11/2025', Versement: 'Exceptionnel' } [42]
    ],
    'ML.PA': [ { Societe: 'Michelin', Montant: 1.38, DateVersement: '23/05/2025', Versement: 'Annuel' } ], [17, 174, 178]
    'TEP.PA': [ { Societe: 'Teleperformance', Montant: 4.20, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [17, 175]
    'RF.PA': [ { Societe: 'Eurazeo', Montant: 2.65, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [18, 176]
    'ENX.PA': [ { Societe: 'Euronext', Montant: 2.90, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [18, 175, 179]
    'ACA.PA': [ { Societe: 'Crédit Agricole', Montant: 1.10, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [18, 174, 175]
    'ELIS.PA': [ { Societe: 'Elis Services SA', Montant: 0.45, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [18, 178]
    'VK.PA': [ { Societe: 'Vallourec', Montant: 1.50, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [18, 178]
    'FR.PA': [ { Societe: 'Valeo', Montant: 0.42, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [18, 178]
    'GLE.PA': [ { Societe: 'Société Générale', Montant: 1.09, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [18, 99, 174]
    'AKE.PA': [ { Societe: 'Arkema', Montant: 3.60, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [18, 177]
    'DSY.PA': [ { Societe: 'Dassault Systèmes', Montant: 0.26, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [18, 175, 178]
    'AYV.PA': [ { Societe: 'Ayvens', Montant: 0.37, DateVersement: '28/05/2025', Versement: 'Annuel' } ], [19, 178]
    'FDJU.PA': [ { Societe: 'FDJ United', Montant: 2.05, DateVersement: '03/06/2025', Versement: 'Annuel' } ], [19, 178]
    'SAF.PA': [ { Societe: 'Safran', Montant: 2.90, DateVersement: '02/06/2025', Versement: 'Annuel' } ], [19, 174]
    'EXENS.PA': [ { Societe: 'Exosens', Montant: 0.10, DateVersement: '30/05/2025', Versement: 'Annuel' } ], [19, 179]
    'LR.PA': [ { Societe: 'Legrand', Montant: 2.20, DateVersement: '02/06/2025', Versement: 'Annuel' } ], [20, 175, 177]
    'BB.PA': [ { Societe: 'Société BIC SA', Montant: 3.08, DateVersement: '03/06/2025', Versement: 'Annuel' } ], [20, 176]
    'TRI.PA': [ { Societe: 'Trigano', Montant: 1.75, DateVersement: '03/06/2025', Versement: 'Annuel' } ], [20, 177]
    'CA.PA': [ // Carrefour [44, 174]
        { Societe: 'Carrefour', Montant: 0.23, DateVersement: '03/06/2025', Versement: 'Annuel' }, [20]
        { Societe: 'Carrefour', Montant: 0.92, DateVersement: '03/06/2025', Versement: 'Annuel' } [20]
    ],
    'ERA.PA': [ // Eramet [45, 177]
        { Societe: 'Eramet', Montant: 1.35, DateVersement: '04/06/2025', Versement: 'Annuel' }, [21]
        { Societe: 'Eramet', Montant: 0.15, DateVersement: '04/06/2025', Versement: 'Annuel' } [21]
    ],
    'AC.PA': [ { Societe: 'Accor', Montant: 1.26, DateVersement: '04/06/2025', Versement: 'Annuel' } ], [21, 174]
    'GET.PA': [ { Societe: 'Getlink', Montant: 0.58, DateVersement: '06/06/2025', Versement: 'Annuel' } ], [21, 178]
    'ADP.PA': [ { Societe: 'Aeroports Paris', Montant: 3.00, DateVersement: '05/06/2025', Versement: 'Annuel' } ], [21, 177]
    'SK.PA': [ { Societe: 'Groupe SEB', Montant: 2.80, DateVersement: '05/06/2025', Versement: 'Annuel' } ], [21, 176]
    'SOP.PA': [ { Societe: 'Sopra Steria', Montant: 4.65, DateVersement: '05/06/2025', Versement: 'Annuel' } ], [22, 175]
    'ORA.PA': [ { Societe: 'Orange', Montant: 0.45, DateVersement: '05/06/2025', Versement: 'Semestriel' } ], [22, 174]
    'IPN.PA': [ { Societe: 'Ipsen', Montant: 1.40, DateVersement: '06/06/2025', Versement: 'Annuel' } ], [22, 177]
    'SGO.PA': [ { Societe: 'Saint-Gobain', Montant: 2.20, DateVersement: '11/06/2025', Versement: 'Annuel' } ], [23, 174]
    'BIM.PA': [ { Societe: 'Biomérieux', Montant: 0.90, DateVersement: '11/06/2025', Versement: 'Annuel' } ], [24, 178]
    'BOL.PA': [ { Societe: 'Bolloré', Montant: 0.06, DateVersement: '12/06/2025', Versement: 'Annuel' } ], [24, 146, 175]
    'AMUN.PA': [ { Societe: 'Amundi', Montant: 4.25, DateVersement: '12/06/2025', Versement: 'Annuel' } ], [24, 177]
    'EDEN.PA': [ { Societe: 'Edenred', Montant: 1.21, DateVersement: '12/06/2025', Versement: 'Annuel' } ], [24, 175]
    'ATE.PA': [ { Societe: 'Alten', Montant: 1.50, DateVersement: '18/06/2025', Versement: 'Annuel' } ], [25, 176]
    'RUI.PA': [ { Societe: 'Rubis', Montant: 2.03, DateVersement: '19/06/2025', Versement: 'Annuel' } ], [26, 178]
    'GTT.PA': [ { Societe: 'Gaztransport et Technigaz SA', Montant: 3.83, DateVersement: '19/06/2025', Versement: 'Annuel' } ], [26, 178]
    'PLNW.PA': [ { Societe: 'Planisware', Montant: 0.31, DateVersement: '26/06/2025', Versement: 'Annuel' } ], [28, 179]
    'VIRP.PA': [ { Societe: 'Virbac', Montant: 1.45, DateVersement: '26/06/2025', Versement: 'Annuel' } ], [28, 175]
    'VU.PA': [ { Societe: 'Vusiongroup', Montant: 0.60, DateVersement: '26/06/2025', Versement: 'Annuel' } ], [29, 177]
    'RBT.PA': [ { Societe: 'Robertet', Montant: 10.00, DateVersement: '01/07/2025', Versement: 'Annuel' } ], [30, 175]
    'BVI.PA': [ { Societe: 'Bureau Veritas', Montant: 0.90, DateVersement: '03/07/2025', Versement: 'Annuel' } ], [31, 174, 177]
    'IPS.PA': [ { Societe: 'Ipsos', Montant: 1.85, DateVersement: '03/07/2025', Versement: 'Annuel' } ], [31, 176]
    'PUB.PA': [ { Societe: 'Publicis', Montant: 3.60, DateVersement: '03/07/2025', Versement: 'Annuel' } ], [32, 174]
    'RI.PA': [ // Pernod Ricard [44, 174]
        { Societe: 'Pernod Ricard', Montant: 2.35, DateVersement: '25/07/2025', Versement: 'Acompte' }, [36]
        { Societe: 'Pernod Ricard', Montant: 2.35, DateVersement: '26/11/2025', Versement: 'Solde' } [42]
    ],
    'MRN.PA': [ { Societe: 'Mersen SA', Montant: 0.90, DateVersement: '09/07/2025', Versement: 'Annuel' } ], [34, 175]
    'WLN.PA': [ { Societe: 'Worldline', Montant: 0.00, DateVersement: 'N/A', Versement: 'N/A' } ], [46, 178]
    'ABVX.PA': [ { Societe: 'Abivax', Montant: 0.00, DateVersement: 'N/A', Versement: 'N/A' } ], [46, 178]
    'AF.PA': [ { Societe: 'Air France - KLM', Montant: 0.00, DateVersement: 'N/A', Versement: 'N/A' } ], [46, 179]
    'ALO.PA': [ { Societe: 'Alstom', Montant: 0.00, DateVersement: 'N/A', Versement: 'N/A' } ], [46, 177]
    'MT.PA': [ { Societe: 'Arcelor Mittal', Montant: 0.47, DateVersement: 'N/A', Versement: 'Trimestriel' } ], [44, 179] 
    // ATTENTION: La liste ci-dessus est basée sur les données réelles et remplace la structure précédente.
};


// Données initiales (un paiement par ligne pour TTE, MC/LVMH, AI)
const initialData = [
    { Societe: 'TotalEnergies SE', Ticker: 'TTE.PA', Quantite: 50, MontantAction: SBF120_PAYMENT_SCHEDULE['TTE.PA'].Montant, Versement: SBF120_PAYMENT_SCHEDULE['TTE.PA'].Versement, DateVersement: SBF120_PAYMENT_SCHEDULE['TTE.PA'].DateVersement, Statut: 'Prévu' },
    { Societe: 'LVMH', Ticker: 'MC.PA', Quantite: 10, MontantAction: SBF120_PAYMENT_SCHEDULE['MC.PA'].Montant, Versement: SBF120_PAYMENT_SCHEDULE['MC.PA'].Versement, DateVersement: SBF120_PAYMENT_SCHEDULE['MC.PA'].DateVersement, Statut: 'Versé' },
    { Societe: 'Air Liquide', Ticker: 'AI.PA', Quantite: 25, MontantAction: SBF120_PAYMENT_SCHEDULE['AI.PA'].Montant, Versement: SBF120_PAYMENT_SCHEDULE['AI.PA'].Versement, DateVersement: SBF120_PAYMENT_SCHEDULE['AI.PA'].DateVersement, Statut: 'Prévu' }
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

// --- Logique d'Édition et Suppression ---

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

function deleteDividend(index) {
    if (confirm("Êtes-vous sûr de vouloir supprimer cette ligne de dividende ?")) {
        dividendsData.splice(index, 1);
        saveLocalData();
        renderDividendsTable();
    }
}

// --- Logique d'Ajout d'action SBF 120 (CORRIGÉE) ---

function addNewStockSBF120() {
    // Liste des tickers basés sur les sources SBF 120 [44, 174]
    const tickers = Object.keys(SBF120_PAYMENT_SCHEDULE).sort();
    const availableTickersDisplay = tickers.slice(0, 10).join(', ');
    
    let tickerInput = prompt(`Entrez le Ticker SBF 120 (Ex: TTE.PA, KER.PA). Exemples: ${availableTickersDisplay}...`);
    
    if (!tickerInput) return;

    tickerInput = tickerInput.toUpperCase().trim();
    
    // Vérification stricte
    const payments = SBF120_PAYMENT_SCHEDULE[tickerInput];
    
    if (!payments || payments.length === 0) {
        alert("Ticker non valide ou aucune date de paiement trouvée pour cette société SBF 120.");
        return;
    }

    const quantityInput = prompt(`Entrez la quantité détenue pour ${payments.Societe} (${tickerInput}) :`);
    const quantity = parseInt(quantityInput, 10);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Quantité invalide. L'action n'a pas été ajoutée.");
        return;
    }
    
    // Ajout de TOUS les paiements futurs listés pour ce Ticker
    payments.forEach(payment => {
        const newStock = {
            Societe: payment.Societe,
            Ticker: tickerInput,
            Quantite: quantity,
            MontantAction: payment.Montant,
            Versement: payment.Versement,
            DateVersement: payment.DateVersement,
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
        
        // Quantité (Mode Édition)
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
        
        // Colonne Action (Bouton Supprimer)
        const actionCell = row.insertCell();
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X Supprimer';
        deleteButton.style.cssText = 'background-color:#f44336; color:white; border:none; cursor:pointer; padding: 5px;';
        deleteButton.addEventListener('click', () => deleteDividend(index));
        actionCell.appendChild(deleteButton);
    });
    
    // Mise à jour des totaux
    if (estimatedTotalElement) {
        estimatedTotalElement.textContent = calculateEstimatedTotal() + '€';
    }
    // Calcul du nombre unique de sociétés [180]
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
    const addButton = document.getElementById('addButton'); // Assure que l'ID est bien 'addButton'
    
    if (editButton) {
        editButton.addEventListener('click', toggleEditMode);
    }
    
    if (addButton) {
        addButton.addEventListener('click', addNewStockSBF120);
    }
});
