// script.js

const STOCK_LIST_KEY = 'dividendsDataList';
let isEditing = false;

// --- UTILITIES: Date Parsing Sécurisé (JJ/MM/AAAA) ---
function parseDateDDMMYYYY(dateStr) {
    if (!dateStr || dateStr === 'N/A') return null;
    
    const parts = dateStr.split('/');
    if (parts.length !== 3) return null;
    
    const day = parseInt(parts, 10);
    const month = parseInt(parts, 10) - 1; // Le mois est basé sur 0 (0 = Janvier)
    const year = parseInt(parts, 10);
    
    if (isNaN(day) || isNaN(month) || isNaN(year)) return null;
    
    // Fixé à 23:59:59 pour la comparaison
    return new Date(year, month, day, 23, 59, 59);
}


// --- MAPPING INTERNE DES PAIEMENTS SBF 120 ---
function getSBF120PaymentSchedule() {
    // Mapping complet des tickers basé sur les sources (cac40_sbf120.txt, SBF120_List.pdf, URLs)
    const MAPPING = {
        'TTEF': 'TTE.PA', 'PRTP': 'KER.PA', 'DBG': 'DBG.PA', 'HRMS': 'RMS.PA', 'GFCP': 'GFC.PA', 'LOIM': 'LI.PA', 'ICAD': 'ICAD.PA', 'STMPA': 'STMPA.PA', 'ARGAN': 'ARG.PA', 'STDM': 'DIM.PA', 'AIR': 'AIR.PA', 'SGEF': 'DG.PA', 'STLAM': 'STLAP.PA', 'LVMH': 'MC.PA', 'TFFP': 'TFI.PA', 'ENGIE': 'ENGI.PA', 'IPAR': 'ITP.PA', 'VCTP': 'VCT.PA', 'OPM': 'OPM.PA', 'VIV': 'VIV.PA', 'CVO': 'COV.PA', 'SCOR': 'SCR.PA', 'MERY': 'MERY.PA', 'BOUY': 'EN.PA', 'MMTP': 'MMT.PA', 'AXAF': 'CS.PA', 'OREP': 'OR.PA', 'DANO': 'BN.PA', 'ESLX': 'EL.PA', 'URW': 'URW.PA', 'RENA': 'RNO.PA', 'SASY': 'SAN.PA', 'VIE': 'VIE.PA', 'SCHN': 'SU.PA', 'VRLA': 'VRLA.PA', 'RXL': 'RXL.PA', 'SPIE': 'SPIE.PA', 'BNPP': 'BNP.PA', 'AIRP': 'AI.PA', 'JCDX': 'DEC.PA', 'NEXS': 'NEX.PA', 'CARM': 'CARM.PA', 'COFA': 'COFA.PA', 'IMTP': 'NK.PA', 'TCFP': 'HO.PA', 'CAPP': 'CAP.PA', 'TE': 'TE.PA', 'AM': 'AM.PA', 'FOUG': 'FGR.PA', 'MWDP': 'MF.PA', 'MICP': 'ML.PA', 'TEPRF': 'TEP.PA', 'EURA': 'RF.PA', 'ENX': 'ENX.PA', 'CAGR': 'ACA.PA', 'ELIS': 'ELIS.PA', 'VLLP': 'VK.PA', 'VLOF': 'FR.PA', 'SOGN': 'GLE.PA', 'AKE': 'AKE.PA', 'DAST': 'DSY.PA', 'AYV': 'AYV.PA', 'FDJU': 'FDJU.PA', 'SAF': 'SAF.PA', 'EXENS': 'EXENS.PA', 'LEGD': 'LR.PA', 'BICP': 'BB.PA', 'TRIA': 'TRI.PA', 'CARR': 'CA.PA', 'ERMT': 'ERA.PA', 'ACCP': 'AC.PA', 'GETP': 'GET.PA', 'ADP': 'ADP.PA', 'SEBF': 'SK.PA', 'SOPR': 'SOP.PA', 'ORAN': 'ORA.PA', 'IPN': 'IPSEN.PA', 'SGOB': 'SGO.PA', 'BIOX': 'BIM.PA', 'BOLL': 'BOL.PA', 'AMUN': 'AMUN.PA', 'EDEN': 'EDEN.PA', 'LTEN': 'ATE.PA', 'RUBF': 'RUI.PA', 'GTT': 'GTT.PA', 'PLNW': 'PLNW.PA', 'VIRB': 'VIRP.PA', 'VU': 'VU.PA', 'ROBF': 'RBT.PA', 'BVI': 'BVI.PA', 'ISOS': 'IPS.PA', 'PUBP': 'PUB.PA', 'CBLP': 'MRN.PA', 'PERP': 'RI.PA', 'WLN': 'WLN.PA', 'AF': 'AF.PA', 'ALO': 'ALO.PA', 'ATO': 'ATO.PA', 'SESFd': 'SESG.PA'
    };
    
    // Paiements bruts (extraits des sources Dividends_List.csv.txt [6-29])
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
        { csv_ticker: 'ICAD', Societe: 'Icade', Montant: 2.15, DatePaiement: '03/07/2025', Versement: 'Annuel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '26/03/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '25/06/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '24/09/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '17/12/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'ARGAN', Societe: 'Argan SA', Montant: 3.30, DatePaiement: '17/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'STDM', Societe: 'Sartorius Stedim', Montant: 0.69, DatePaiement: '04/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'AIR', Societe: 'Airbus SE', Montant: 3.00, DatePaiement: '24/04/2025', Versement: 'Annuel' },
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
        { csv_ticker: 'SCHN', Societe: 'Schneider Electric', Montant: 3.90, DatePaiement: '15/05/2025', Versement: 'Annuel' },
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
        { csv_ticker: 'CARR', Societe: 'Carrefour', Montant: 1.15, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'ERMT', Societe: 'Eramet', Montant: 1.50, DatePaiement: '04/06/2025', Versement: 'Annuel' },
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
        // Tickers SBF 120 sans dividende listé ou date explicite:
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

// STABILISATION DE L'INITIALISATION des données pour ne pas planter
function getInitialStockData() {
    // Utilisation de ?. pour s'assurer que l'objet existe avant de tenter d'y accéder.
    return [
        SBF120_PAYMENT_SCHEDULE['TTE.PA']?. ? { ...SBF120_PAYMENT_SCHEDULE['TTE.PA'], Ticker: 'TTE.PA', Quantite: 50, Statut: 'Prévu' } : null,
        SBF120_PAYMENT_SCHEDULE['MC.PA']?. ? { ...SBF120_PAYMENT_SCHEDULE['MC.PA'], Ticker: 'MC.PA', Quantite: 10, Statut: 'Versé' } : null,
        SBF120_PAYMENT_SCHEDULE['AI.PA']?. ? { ...SBF120_PAYMENT_SCHEDULE['AI.PA'], Ticker: 'AI.PA', Quantite: 25, Statut: 'Prévu' } : null,
        SBF120_PAYMENT_SCHEDULE['DSY.PA']?. ? { ...SBF120_PAYMENT_SCHEDULE['DSY.PA'], Ticker: 'DSY.PA', Quantite: 30, Statut: 'Prévu' } : null 
    ].filter(item => item !== null);
}

let dividendsData = [];

// --- Fonctions de Persistance et Calcul ---

function loadLocalData() {
    const storedData = localStorage.getItem(STOCK_LIST_KEY);
    if (storedData) {
        // Tente de parser, si échec (données corrompues), utilise les données initiales
        try {
            dividendsData = JSON.parse(storedData);
            if (!Array.isArray(dividendsData) || dividendsData.length === 0) {
                dividendsData = getInitialStockData();
            }
        } catch (e) {
            console.error("Erreur de lecture du Local Storage, réinitialisation des données.");
            dividendsData = getInitialStockData();
        }
    } else {
        dividendsData = getInitialStockData();
    }
}

function saveLocalData() {
    localStorage.setItem(STOCK_LIST_KEY, JSON.stringify(dividendsData));
}

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

// --- LOGIQUE DE DATE (V3, corrigée) ---
function updateDividendStatusByDate() {
    // Date de référence: 19/10/2025
    const today = new Date(2025, 9, 19, 0, 0, 0).getTime(); 

    dividendsData.forEach(stock => {
        const dateStr = stock.DateVersement;
        
        const paymentDateObj = parseDateDDMMYYYY(dateStr);
        
        if (paymentDateObj !== null) {
            if (paymentDateObj.getTime() <= today) { 
                stock.Statut = 'Versé';
            } else {
                stock.Statut = 'Prévu';
            }
        } else {
            stock.Statut = 'N/A';
        }
    });
}


// --- Logique d'Édition et Suppression ---

function updateQuantity(event) {
    const index = event.target.dataset.index;
    const newQuantity = Math.max(0, parseInt(event.target.value, 10));
    
    if (!isNaN(newQuantity)) {
        dividendsData[index].Quantite = newQuantity; 
        renderDividendsTable(); 
        saveLocalData();
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

// --- Logique d'Ajout d'action SBF 120 (COMPLET) ---

function addNewStockSBF120() {
    const tickers = Object.keys(SBF120_PAYMENT_SCHEDULE).sort();
    const availableTickersDisplay = tickers.slice(0, 10).join(', ');
    
    let tickerInput = prompt(`Entrez le Ticker SBF 120 (Ex: TTE.PA, DSY.PA). Exemples: ${availableTickersDisplay}...`);
    
    if (!tickerInput) return;

    tickerInput = tickerInput.toUpperCase().trim();
    
    const payments = SBF120_PAYMENT_SCHEDULE[tickerInput];
    
    if (!payments || payments.length === 0) {
        alert("Ticker non valide ou aucune date de paiement trouvée pour cette société SBF 120. Veuillez vérifier la casse (ex: TTE.PA).");
        return;
    }

    // Récupérer le nom de la société à partir du premier paiement
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


// --- Rendu de l'Interface (AVEC TRI ET CENTRAGE) ---

function renderDividendsTable() {
    // 1. Mise à jour dynamique du statut
    updateDividendStatusByDate();

    // 2. Tri Alphabétique (Société)
    dividendsData.sort((a, b) => {
        const societeA = a.Societe.toUpperCase();
        const societeB = b.Societe.toUpperCase();
        if (societeA < societeB) return -1;
        if (societeA > societeB) return 1;
        return 0;
    });

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
        
        // Colonne 1: Société (Gauche)
        row.insertCell().textContent = stock.Societe;
        // Colonne 2: Ticker (Gauche)
        row.insertCell().textContent = stock.Ticker;
        
        // Colonnes centrées/droitisées selon la demande de style
        
        // Colonne 3: Quantité
        const quantityCell = row.insertCell();
        quantityCell.classList.add('col-center'); 
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
        
        // Colonne 4: Montant/action
        row.insertCell().classList.add('col-center');
        row.lastChild.textContent = parseFloat(stock.MontantAction).toFixed(2) + '€';
        
        // Colonne 5: Total estimé
        row.insertCell().classList.add('col-center');
        row.lastChild.textContent = total + '€';
        
        // Colonne 6: Versement
        row.insertCell().classList.add('col-center');
        row.lastChild.textContent = stock.Versement;
        
        // Colonne 7: Date Prévue
        row.insertCell().classList.add('col-center');
        row.lastChild.textContent = stock.DateVersement || 'N/A';
        
        // Colonne 8: Statut
        const statutCell = row.insertCell();
        statutCell.classList.add('col-center');
        statutCell.textContent = stock.Statut; 
        
        // Colonne 9: Action
        const actionCell = row.insertCell();
        actionCell.classList.add('col-center', 'action-cell');
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X Supprimer';
        deleteButton.style.cssText = 'background-color:#f44336; color:white; border:none; cursor:pointer; padding: 5px;';
        deleteButton.addEventListener('click', () => deleteDividend(index));
        actionCell.appendChild(deleteButton);
    });
    
    // Mise à jour des totaux
    if (estimatedTotalElement) {
        estimatedTotalElement.textContent = metrics.totalAnnuel + '€';
    }
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
