// script.js

const STOCK_LIST_KEY = 'dividendsDataList';
let isEditing = false;

// --- MAPPING INTERNE DES PAIEMENTS SBF 120 (Sources) ---
// Utilisation d'une fonction pour définir la table de paiements basée sur le croisement des sources (Dividends_List.csv.txt et SBF120_List)

function getSBF120PaymentSchedule() {
    // Association des identifiants CSV aux Tickers SBF 120 réels (Sources,,)
    const MAPPING = {
        'TTEF': 'TTE.PA', 'PRTP': 'KER.PA', 'DBG': 'DBG.PA', 'HRMS': 'RMS.PA', 'GFCP': 'GFC.PA', 'LOIM': 'LI.PA', 'ICAD': 'ICAD.PA', 'STMPA': 'STMPA.PA', 'ARGAN': 'ARG.PA', 'STDM': 'DIM.PA', 'AIR': 'AIR.PA', 'SGEF': 'DG.PA', 'STLAM': 'STLAP.PA', 'LVMH': 'MC.PA', 'TFFP': 'TFI.PA', 'ENGIE': 'ENGI.PA', 'IPAR': 'ITP.PA', 'VCTP': 'VCT.PA', 'OPM': 'OPM.PA', 'VIV': 'VIV.PA', 'CVO': 'COV.PA', 'SCOR': 'SCR.PA', 'MERY': 'MERY.PA', 'BOUY': 'EN.PA', 'MMTP': 'MMT.PA', 'AXAF': 'CS.PA', 'OREP': 'OR.PA', 'DANO': 'BN.PA', 'ESLX': 'EL.PA', 'URW': 'URW.PA', 'RENA': 'RNO.PA', 'SASY': 'SAN.PA', 'VIE': 'VIE.PA', 'SCHN': 'SU.PA', 'VRLA': 'VRLA.PA', 'RXL': 'RXL.PA', 'SPIE': 'SPIE.PA', 'BNPP': 'BNP.PA', 'AIRP': 'AI.PA', 'JCDX': 'DEC.PA', 'NEXS': 'NEX.PA', 'CARM': 'CARM.PA', 'COFA': 'COFA.PA', 'IMTP': 'NK.PA', 'TCFP': 'HO.PA', 'CAPP': 'CAP.PA', 'TE': 'TE.PA', 'AM': 'AM.PA', 'FOUG': 'FGR.PA', 'MWDP': 'MF.PA', 'MICP': 'ML.PA', 'TEPRF': 'TEP.PA', 'EURA': 'RF.PA', 'ENX': 'ENX.PA', 'CAGR': 'ACA.PA', 'ELIS': 'ELIS.PA', 'VLLP': 'VK.PA', 'VLOF': 'FR.PA', 'SOGN': 'GLE.PA', 'AKE': 'AKE.PA', 'DAST': 'DSY.PA', 'AYV': 'AYV.PA', 'FDJU': 'FDJU.PA', 'SAF': 'SAF.PA', 'EXENS': 'EXENS.PA', 'LEGD': 'LR.PA', 'BICP': 'BB.PA', 'TRIA': 'TRI.PA', 'CARR': 'CA.PA', 'ERMT': 'ERA.PA', 'ACCP': 'AC.PA', 'GETP': 'GET.PA', 'ADP': 'ADP.PA', 'SEBF': 'SK.PA', 'SOPR': 'SOP.PA', 'ORAN': 'ORA.PA', 'IPN': 'IPSEN.PA', 'SGOB': 'SGO.PA', 'BIOX': 'BIM.PA', 'BOLL': 'BOL.PA', 'AMUN': 'AMUN.PA', 'EDEN': 'EDEN.PA', 'LTEN': 'ATE.PA', 'RUBF': 'RUI.PA', 'GTT': 'GTT.PA', 'PLNW': 'PLNW.PA', 'VIRB': 'VIRP.PA', 'VU': 'VU.PA', 'ROBF': 'RBT.PA', 'BVI': 'BVI.PA', 'ISOS': 'IPS.PA', 'PUBP': 'PUB.PA', 'CBLP': 'MRN.PA', 'PERP': 'RI.PA', 'WLN': 'WLN.PA', 'AF': 'AF.PA', 'ALO': 'ALO.PA', 'ATO': 'ATO.PA', 'SESFd': 'SESG.PA'
    };
    
    // Paiements bruts (issus de Dividends_List.csv.txt [2-44])
    const RAW_PAYMENTS = [
        { csv_ticker: 'TTEF', Societe: 'TotalEnergies SE', Montant: 0.79, DatePaiement: '06/01/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'TTEF', Societe: 'TotalEnergies SE', Montant: 0.79, DatePaiement: '01/04/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'TTEF', Societe: 'TotalEnergies SE', Montant: 0.85, DatePaiement: '01/07/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'TTEF', Societe: 'TotalEnergies SE', Montant: 0.85, DatePaiement: '03/10/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'PRTP', Societe: 'Kering', Montant: 2.00, DatePaiement: '16/01/2025', Versement: 'Acompte' },
        { csv_ticker: 'PRTP', Societe: 'Kering', Montant: 4.00, DatePaiement: '07/05/2025', Versement: 'Solde' },
        { csv_ticker: 'DBG', Societe: 'Derichebourg', Montant: 0.13, DatePaiement: '12/02/2025', Versement: 'Annuel' },
        { csv_ticker: 'HRMS', Societe: 'Hermès International', Montant: 3.50, DatePaiement: '19/02/2025', Versement: 'Acompte' },
        { csv_ticker: 'HRMS', Societe: 'Hermès International', Montant: 12.50, DatePaiement: '07/05/2025', Versement: 'Solde' },
        { csv_ticker: 'GFCP', Societe: 'Gecina SA', Montant: 2.70, DatePaiement: '05/03/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'GFCP', Societe: 'Gecina SA', Montant: 2.75, DatePaiement: '04/07/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'LOIM', Societe: 'Klépierre', Montant: 0.925, DatePaiement: '06/03/2025', Versement: 'Semestriel' },
        { csv_ticker: 'LOIM', Societe: 'Klépierre', Montant: 0.925, DatePaiement: '10/07/2025', Versement: 'Semestriel' },
        { csv_ticker: 'ICAD', Societe: 'Icade', Montant: 1.00, DatePaiement: '06/03/2025', Versement: 'Annuel' },
        { csv_ticker: 'ICAD', Societe: 'Icade', Montant: 1.16, DatePaiement: '06/03/2025', Versement: 'Annuel' },
        { csv_ticker: 'ICAD', Societe: 'Icade', Montant: 2.15, DatePaiement: '03/07/2025', Versement: 'Annuel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '26/03/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '25/06/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '24/09/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '17/12/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'ARGAN', Societe: 'Argan SA', Montant: 3.30, DatePaiement: '17/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'STDM', Societe: 'Sartorius Stedim', Montant: 0.69, DatePaiement: '04/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'AIR', Societe: 'Airbus SE', Montant: 1.00, DatePaiement: '24/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'AIR', Societe: 'Airbus SE', Montant: 2.00, DatePaiement: '24/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'SGEF', Societe: 'Vinci', Montant: 3.70, DatePaiement: '24/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'SGEF', Societe: 'Vinci', Montant: 1.05, DatePaiement: '16/10/2025', Versement: 'Acompte' },
        { csv_ticker: 'STLAM', Societe: 'Stellantis NV', Montant: 0.68, DatePaiement: '05/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'LVMH', Societe: 'LVMH', Montant: 7.50, DatePaiement: '28/04/2025', Versement: 'Solde' },
        { csv_ticker: 'TFFP', Societe: 'TF1', Montant: 0.60, DatePaiement: '28/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'ENGIE', Societe: 'Engie', Montant: 1.48, DatePaiement: '29/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'IPAR', Societe: 'Interparfums', Montant: 1.15, DatePaiement: '30/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'VCTP', Societe: 'Vicat', Montant: 2.00, DatePaiement: '02/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'OPM', Societe: 'OPmobility SE', Montant: 0.36, DatePaiement: '02/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'VIV', Societe: 'Vivendi', Montant: 0.04, DatePaiement: '02/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'CVO', Societe: 'Covivio', Montant: 3.50, DatePaiement: '05/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'SCOR', Societe: 'SCOR SE', Montant: 1.80, DatePaiement: '06/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'MERY', Societe: 'Mercialys', Montant: 1.00, DatePaiement: '06/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'BOUY', Societe: 'Bouygues', Montant: 2.00, DatePaiement: '07/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'MMTP', Societe: 'Métropole Télévision SA (M6)', Montant: 1.25, DatePaiement: '07/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'AXAF', Societe: 'AXA', Montant: 2.15, DatePaiement: '07/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'OREP', Societe: "L'Oréal", Montant: 7.00, DatePaiement: '07/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'DANO', Societe: 'Danone', Montant: 2.15, DatePaiement: '07/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'ESLX', Societe: 'EssilorLuxottica', Montant: 3.95, DatePaiement: '05/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'URW', Societe: 'Unibail-Rodamco', Montant: 3.50, DatePaiement: '12/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'RENA', Societe: 'Renault', Montant: 2.20, DatePaiement: '12/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'SASY', Societe: 'Sanofi', Montant: 3.92, DatePaiement: '14/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'VIE', Societe: 'Veolia', Montant: 1.40, DatePaiement: '14/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'SCHN', Societe: 'Schneider Electric', Montant: 1.37, DatePaiement: '15/05/2025', Versement: 'Acompte' }, 
        { csv_ticker: 'SCHN', Societe: 'Schneider Electric', Montant: 2.53, DatePaiement: '15/05/2025', Versement: 'Solde' },
        { csv_ticker: 'VRLA', Societe: 'Verallia', Montant: 1.70, DatePaiement: '15/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'RXL', Societe: 'Rexel', Montant: 1.20, DatePaiement: '16/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'SPIE', Societe: 'Spie', Montant: 0.75, DatePaiement: '16/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'SPIE', Societe: 'Spie', Montant: 0.30, DatePaiement: '18/09/2025', Versement: 'Acompte' },
        { csv_ticker: 'BNPP', Societe: 'BNP Paribas', Montant: 4.79, DatePaiement: '21/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'BNPP', Societe: 'BNP Paribas', Montant: 2.59, DatePaiement: '30/09/2025', Versement: 'Exceptionnel' },
        { csv_ticker: 'AIRP', Societe: 'Air Liquide', Montant: 3.30, DatePaiement: '21/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'JCDX', Societe: 'JC Decaux SA', Montant: 0.55, DatePaiement: '21/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'NEXS', Societe: 'Nexans SA', Montant: 2.60, DatePaiement: '21/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'CARM', Societe: 'Carmila', Montant: 1.25, DatePaiement: '21/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'COFA', Societe: 'Coface', Montant: 1.40, DatePaiement: '22/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'IMTP', Societe: 'Imerys', Montant: 1.45, DatePaiement: '22/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'TCFP', Societe: 'Thales', Montant: 2.85, DatePaiement: '22/05/2025', Versement: 'Solde' },
        { csv_ticker: 'TCFP', Societe: 'Thales', Montant: 0.95, DatePaiement: '04/12/2025', Versement: 'Acompte' },
        { csv_ticker: 'CAPP', Societe: 'Capgemini', Montant: 3.40, DatePaiement: '22/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'TE', Societe: 'Technip Energies BV', Montant: 0.85, DatePaiement: '22/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'AM', Societe: 'Dassault Aviation', Montant: 4.72, DatePaiement: '22/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'FOUG', Societe: 'Eiffage', Montant: 4.70, DatePaiement: '23/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'MWDP', Societe: 'Wendel', Montant: 4.70, DatePaiement: '23/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'MICP', Societe: 'Michelin', Montant: 1.38, DatePaiement: '23/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'TEPRF', Societe: 'Teleperformance', Montant: 4.20, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'EURA', Societe: 'Eurazeo', Montant: 2.65, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'ENX', Societe: 'Euronext', Montant: 2.90, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'CAGR', Societe: 'Crédit Agricole', Montant: 1.10, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'ELIS', Societe: 'Elis Services SA', Montant: 0.45, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'VLLP', Societe: 'Vallourec', Montant: 1.50, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'VLOF', Societe: 'Valeo', Montant: 0.42, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'SOGN', Societe: 'Société Générale', Montant: 1.09, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'AKE', Societe: 'Arkema', Montant: 3.60, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'DAST', Societe: 'Dassault Systèmes', Montant: 0.26, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'AYV', Societe: 'Ayvens', Montant: 0.37, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'FDJU', Societe: 'FDJ United', Montant: 2.05, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'SAF', Societe: 'Safran', Montant: 2.90, DatePaiement: '02/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'EXENS', Societe: 'Exosens', Montant: 0.10, DatePaiement: '30/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'LEGD', Societe: 'Legrand', Montant: 2.20, DatePaiement: '02/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'BICP', Societe: 'Société BIC SA', Montant: 3.08, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'TRIA', Societe: 'Trigano', Montant: 1.75, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'CARR', Societe: 'Carrefour', Montant: 0.23, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'CARR', Societe: 'Carrefour', Montant: 0.92, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'ERMT', Societe: 'Eramet', Montant: 1.35, DatePaiement: '04/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'ERMT', Societe: 'Eramet', Montant: 0.15, DatePaiement: '04/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'ACCP', Societe: 'Accor', Montant: 1.26, DatePaiement: '04/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'GETP', Societe: 'Getlink', Montant: 0.58, DatePaiement: '06/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'ADP', Societe: 'Aeroports Paris', Montant: 3.00, DatePaiement: '05/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'SEBF', Societe: 'Groupe SEB', Montant: 2.80, DatePaiement: '05/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'SOPR', Societe: 'Sopra Steria', Montant: 4.65, DatePaiement: '05/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'ORAN', Societe: 'Orange', Montant: 0.45, DatePaiement: '05/06/2025', Versement: 'Semestriel' },
        { csv_ticker: 'IPN', Societe: 'Ipsen', Montant: 1.40, DatePaiement: '06/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'SGOB', Societe: 'Saint-Gobain', Montant: 2.20, DatePaiement: '11/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'BIOX', Societe: 'Biomérieux', Montant: 0.90, DatePaiement: '11/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'BOLL', Societe: 'Bolloré', Montant: 0.06, DatePaiement: '12/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'AMUN', Societe: 'Amundi', Montant: 4.25, DatePaiement: '12/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'EDEN', Societe: 'Edenred', Montant: 1.21, DatePaiement: '12/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'LTEN', Societe: 'Alten', Montant: 1.50, DatePaiement: '18/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'RUBF', Societe: 'Rubis', Montant: 2.03, DatePaiement: '19/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'GTT', Societe: 'Gaztransport et Technigaz SA', Montant: 3.83, DatePaiement: '19/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'PLNW', Societe: 'Planisware', Montant: 0.31, DatePaiement: '26/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'VIRB', Societe: 'Virbac', Montant: 1.45, DatePaiement: '26/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'VU', Societe: 'Vusiongroup', Montant: 0.60, DatePaiement: '26/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'ROBF', Societe: 'Robertet', Montant: 10.00, DatePaiement: '01/07/2025', Versement: 'Annuel' },
        { csv_ticker: 'BVI', Societe: 'Bureau Veritas', Montant: 0.90, DatePaiement: '03/07/2025', Versement: 'Annuel' },
        { csv_ticker: 'ISOS', Societe: 'Ipsos', Montant: 1.85, DatePaiement: '03/07/2025', Versement: 'Annuel' },
        { csv_ticker: 'PUBP', Societe: 'Publicis', Montant: 3.60, DatePaiement: '03/07/2025', Versement: 'Annuel' },
        { csv_ticker: 'PERP', Societe: 'Pernod Ricard', Montant: 2.35, DatePaiement: '25/07/2025', Versement: 'Acompte' },
        { csv_ticker: 'PERP', Societe: 'Pernod Ricard', Montant: 2.35, DatePaiement: '26/11/2025', Versement: 'Solde' },
        { csv_ticker: 'CBLP', Societe: 'Mersen SA', Montant: 0.90, DatePaiement: '09/07/2025', Versement: 'Annuel' },
        // Ajout de tickers SBF 120 sans dividende listé pour éviter crash
        { csv_ticker: 'WLN', Societe: 'Worldline', Montant: 0.00, DatePaiement: 'N/A', Versement: 'N/A' },
        { csv_ticker: 'AF', Societe: 'Air France - KLM', Montant: 0.00, DatePaiement: 'N/A', Versement: 'N/A' },
        { csv_ticker: 'ALO', Societe: 'Alstom', Montant: 0.00, DatePaiement: 'N/A', Versement: 'N/A' },
        { csv_ticker: 'ATO', Societe: 'Atos', Montant: 0.00, DatePaiement: 'N/A', Versement: 'N/A' }
    ];

    const schedule = {};
    RAW_PAYMENTS.forEach(payment => {
        const sbfTicker = MAPPING[payment.csv_ticker];
        
        if (sbfTicker) {
            if (!schedule[sbfTicker]) {
                schedule[sbfTicker] = [];
            }
            schedule[sbfTicker].push({
                Societe: payment.Societe,
                MontantAction: parseFloat(payment.Montant || 0),
                DateVersement: payment.DatePaiement,
                Versement: payment.Versement
            });
        }
    });

    return schedule;
}

const SBF120_PAYMENT_SCHEDULE = getSBF120PaymentSchedule();


// Données initiales (Lecture sécurisée du premier paiement disponible)
const initialData = [
    SBF120_PAYMENT_SCHEDULE['TTE.PA'] ? { ...SBF120_PAYMENT_SCHEDULE['TTE.PA'], Ticker: 'TTE.PA', Quantite: 50, Statut: 'Prévu' } : null,
    SBF120_PAYMENT_SCHEDULE['MC.PA'] ? { ...SBF120_PAYMENT_SCHEDULE['MC.PA'], Ticker: 'MC.PA', Quantite: 10, Statut: 'Versé' } : null,
    SBF120_PAYMENT_SCHEDULE['AI.PA'] ? { ...SBF120_PAYMENT_SCHEDULE['AI.PA'], Ticker: 'AI.PA', Quantite: 25, Statut: 'Prévu' } : null
].filter(item => item !== null); // Retirer les items nuls si le ticker est introuvable

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

// Fonction de calcul du Total Estime (qui est le Total Annuel)
function calculateEstimatedTotal() {
    return calculateMetrics().totalAnnuel;
}

// NOUVELLE FONCTION: Calcul des métriques Versés, Prochains, Annuel
function calculateMetrics() {
    let totalVerses = 0;
    let totalProchains = 0;
    let totalAnnuel = 0;

    dividendsData.forEach(stock => {
        const total = (parseFloat(stock.Quantite) || 0) * (parseFloat(stock.MontantAction) || 0);
        
        totalAnnuel += total;

        if (stock.Statut === 'Versé') {
            totalVerses += total;
        } else if (stock.Statut === 'Prévu') {
            totalProchains += total;
        }
    });

    return {
        totalVerses: totalVerses.toFixed(2),
        totalProchains: totalProchains.toFixed(2),
        totalAnnuel: totalAnnuel.toFixed(2)
    };
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

// --- Logique d'Ajout d'action SBF 120 (STABILISÉE) ---

function addNewStockSBF120() {
    const tickers = Object.keys(SBF120_PAYMENT_SCHEDULE).sort();
    const availableTickersDisplay = tickers.slice(0, 10).join(', ');
    
    let tickerInput = prompt(`Entrez le Ticker SBF 120 (Ex: TTE.PA, KER.PA). Exemples: ${availableTickersDisplay}...`);
    
    if (!tickerInput) return;

    tickerInput = tickerInput.toUpperCase().trim();
    
    const payments = SBF120_PAYMENT_SCHEDULE[tickerInput];
    
    if (!payments || payments.length === 0) {
        alert("Ticker non valide ou aucune date de paiement trouvée pour cette société SBF 120. Veuillez vérifier la casse (ex: TTE.PA).");
        return;
    }

    // Le nom de la société est extrait du premier paiement
    const societyName = payments.Societe;

    const quantityInput = prompt(`Entrez la quantité détenue pour ${societyName} (${tickerInput}) :`);
    const quantity = parseInt(quantityInput, 10);

    if (isNaN(quantity) || quantity <= 0) {
        alert("Quantité invalide. L'action n'a pas été ajoutée.");
        return;
    }
    
    // Ajout de TOUS les paiements listés pour ce Ticker
    payments.forEach(payment => {
        const newStock = {
            Societe: payment.Societe,
            Ticker: tickerInput,
            Quantite: quantity,
            MontantAction: payment.MontantAction,
            Versement: payment.Versement,
            DateVersement: payment.DateVersement,
            Statut: 'Prévu' 
        };
        dividendsData.push(newStock);
    });

    saveLocalData();
    renderDividendsTable();
}

// --- Rendu de l'Interface (Mise à jour des métriques) ---

function renderDividendsTable() {
    const tableBody = document.getElementById('dividendsTableBody');
    const estimatedTotalElement = document.getElementById('estimatedTotal');
    const totalSocietiesElement = document.getElementById('totalSocieties');
    
    if (!tableBody) return; 

    const metrics = calculateMetrics();
    
    // Mise à jour des métriques dans le bandeau supérieur
    if (document.getElementById('totalVerses')) {
        document.getElementById('totalVerses').textContent = metrics.totalVerses + '€';
    }
    if (document.getElementById('totalProchains')) {
        document.getElementById('totalProchains').textContent = metrics.totalProchains + '€';
    }
    if (document.getElementById('totalAnnuel')) {
        document.getElementById('totalAnnuel').textContent = metrics.totalAnnuel + '€';
    }

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
    
    // Mise à jour du Total Estimé
    if (estimatedTotalElement) {
        estimatedTotalElement.textContent = metrics.totalAnnuel + '€';
    }
    
    // Mise à jour du Nombre de Sociétés
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
    const addButton = document.getElementById('addButton');
    
    if (editButton) {
        editButton.addEventListener('click', toggleEditMode);
    }
    
    if (addButton) {
        addButton.addEventListener('click', addNewStockSBF120);
    }
});
