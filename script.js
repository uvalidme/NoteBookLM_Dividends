// script.js

const STOCK_LIST_KEY = 'dividendsDataList';
let isEditing = false;

// --- MAPPING INTERNE DES PAIEMENTS SBF 120 (Sources [1-43], [44-47], [48-53]) ---
// Clé: Ticker SBF 120 (.PA)
// Valeurs : Liste d'objets { Societe, Montant, DateVersement, Versement }

// FONCTION UTILITAIRE pour normaliser les données du CSV
function getSBF120PaymentSchedule() {
    // Association des identifiants CSV aux Tickers SBF 120 réels (Sources [1-43] vs [44-47])
    const MAPPING = {
        'TTEF': 'TTE.PA',    // TotalEnergies SE [1, 5] -> TTE.PA [44, 48]
        'PRTP': 'KER.PA',    // Kering [2, 11] -> KER.PA [44, 50]
        'DBG': 'DBG.PA',     // Derichebourg [2] -> DBG.PA [49]
        'HRMS': 'RMS.PA',    // Hermès International [3, 11] -> RMS.PA [44, 48]
        'GFCP': 'GFC.PA',    // Gecina SA [4, 32] -> GFC.PA [46, 51]
        'LOIM': 'LI.PA',     // Klépierre [4, 34] -> LI.PA [50]
        'ICAD': 'ICAD.PA',   // Icade [4, 32] -> ICAD.PA [44, 49]
        'STMPA': 'STMPA.PA', // STMicroelectronics [5, 27, 39] -> STMPA.PA [44, 54]
        'ARGAN': 'ARG.PA',   // Argan SA [5] -> ARG.PA [46, 52]
        'STDM': 'DIM.PA',    // Sartorius Stedim [6] -> DIM.PA [46, 52]
        'AIR': 'AIR.PA',     // Airbus Group [8] -> AIR.PA [44, 49]
        'SGEF': 'DG.PA',     // Vinci [8, 41] -> DG.PA [44, 48]
        'STLAM': 'STLAP.PA', // Stellantis NV [8] -> STLAP.PA [44, 54]
        'LVMH': 'MC.PA',     // LVMH [9] -> MC.PA [44, 48]
        'TFFP': 'TFI.PA',    // TF1 [9] -> TFI.PA [50]
        'ENGIE': 'ENGI.PA',  // Engie [9] -> ENGI.PA [44, 49]
        'IPAR': 'ITP.PA',    // Interparfums [9] -> ITP.PA [51]
        'VCTP': 'VCT.PA',    // Vicat [9] -> VCT.PA [44, 49]
        'OPM': 'OPM.PA',     // Opmobility [9] -> OPM.PA [50]
        'VIV': 'VIV.PA',     // Vivendi [9] -> VIV.PA [51]
        'CVO': 'COV.PA',     // Covivio [10] -> COV.PA [50]
        'SCOR': 'SCR.PA',    // SCOR [11] -> SCR.PA [46, 52]
        'MERY': 'MERY.PA',   // Mercialys [11] -> MERY.PA [46, 51]
        'BOUY': 'EN.PA',     // Bouygues [11] -> EN.PA [44, 48]
        'MMTP': 'MMT.PA',    // M6 [11] -> MMT.PA [49]
        'AXAF': 'CS.PA',     // AXA [11] -> CS.PA [44, 48]
        'OREP': 'OR.PA',     // L'Oréal [12] -> OR.PA [44, 48]
        'DANO': 'BN.PA',     // Danone [12] -> BN.PA [44, 48]
        'ESLX': 'EL.PA',     // EssilorLuxottica [12] -> EL.PA [44, 50]
        'URW': 'URW.PA',     // Unibail-Rodamco [12] -> URW.PA [44, 49]
        'RENA': 'RNO.PA',    // Renault [12] -> RNO.PA [44, 48]
        'SASY': 'SAN.PA',    // Sanofi [13] -> SAN.PA [44, 48]
        'VIE': 'VIE.PA',     // Veolia [13] -> VIE.PA [44, 48]
        'SCHN': 'SU.PA',     // Schneider Electric [13, 14] -> SU.PA [44, 48]
        'VRLA': 'VRLA.PA',   // Verallia [14] -> VRLA.PA [46, 52]
        'RXL': 'RXL.PA',     // Rexel [14] -> RXL.PA [46, 52]
        'SPIE': 'SPIE.PA',   // Spie [14, 39] -> SPIE.PA [46, 52]
        'BNPP': 'BNP.PA',    // BNP Paribas [15, 40] -> BNP.PA [44, 48]
        'AIRP': 'AI.PA',     // Air Liquide [15] -> AI.PA [44, 48]
        'JCDX': 'DEC.PA',    // JC Decaux SA [15] -> DEC.PA [50]
        'NEXS': 'NEX.PA',    // Nexans SA [15] -> NEX.PA [44, 49]
        'CARM': 'CARM.PA',   // Carmila [16] -> CARM.PA [46, 52]
        'COFA': 'COFA.PA',   // Coface [16] -> COFA.PA [46, 52]
        'IMTP': 'NK.PA',     // Imerys [16] -> NK.PA [50]
        'TCFP': 'HO.PA',     // Thales [16, 42] -> HO.PA [44, 48]
        'CAPP': 'CAP.PA',    // Capgemini [16] -> CAP.PA [44, 48]
        'TE': 'TE.PA',       // Technip Energies BV [16] -> TE.PA [46, 53]
        'AM': 'AM.PA',       // Dassault Aviation [16] -> AM.PA [52]
        'FOUG': 'FGR.PA',    // Eiffage [16] -> FGR.PA [51]
        'MWDP': 'MF.PA',     // Wendel [17, 42] -> MF.PA [50]
        'MICP': 'ML.PA',     // Michelin [17] -> ML.PA [44, 52]
        'TEPRF': 'TEP.PA',   // Teleperformance [17] -> TEP.PA [49]
        'EURA': 'RF.PA',     // Eurazeo [18] -> RF.PA [50]
        'ENX': 'ENX.PA',     // Euronext [18] -> ENX.PA [44, 49]
        'CAGR': 'ACA.PA',    // Crédit Agricole [18] -> ACA.PA [44, 48]
        'ELIS': 'ELIS.PA',   // Elis Services SA [18] -> ELIS.PA [46, 52]
        'VLLP': 'VK.PA',     // Vallourec [18] -> VK.PA [46, 52]
        'VLOF': 'FR.PA',     // Valeo [18] -> FR.PA [46, 52]
        'SOGN': 'GLE.PA',    // Société Générale [18, 41] -> GLE.PA [44, 48]
        'AKE': 'AKE.PA',     // Arkema [18] -> AKE.PA [46, 51]
        'DAST': 'DSY.PA',    // Dassault Systèmes [18] -> DSY.PA [44, 49]
        'AYV': 'AYV.PA',     // Ayvens [19] -> AYV.PA [46, 52]
        'FDJU': 'FDJU.PA',   // FDJ United [19] -> FDJU.PA [46, 52]
        'SAF': 'SAF.PA',     // Safran [19] -> SAF.PA [44, 48]
        'EXENS': 'EXENS.PA', // Exosens [20] -> EXENS.PA [46, 53]
        'LEGD': 'LR.PA',     // Legrand [20] -> LR.PA [44, 49]
        'BICP': 'BB.PA',     // Société BIC SA [20] -> BB.PA [50]
        'TRIA': 'TRI.PA',    // Trigano [20, 41] -> TRI.PA [45, 51]
        'CARR': 'CA.PA',     // Carrefour [20] -> CA.PA [44, 48]
        'ERMT': 'ERA.PA',    // Eramet [21] -> ERA.PA [51]
        'ACCP': 'AC.PA',     // Accor [21] -> AC.PA [44, 48]
        'GETP': 'GET.PA',    // Getlink [21] -> GET.PA [46, 52]
        'ADP': 'ADP.PA',     // Aeroports Paris [21] -> ADP.PA [46, 51]
        'SEBF': 'SK.PA',     // Groupe SEB [21] -> SK.PA [50]
        'SOPR': 'SOP.PA',    // Sopra Steria [22] -> SOP.PA [44, 49]
        'ORAN': 'ORA.PA',    // Orange [22] -> ORA.PA [44, 48]
        'IPN': 'IPSEN.PA',   // Ipsen [22] -> IPN.PA [46, 51]
        'SGOB': 'SGO.PA',    // Saint-Gobain [23] -> SGO.PA [44, 48]
        'BIOX': 'BIM.PA',    // Biomérieux [24] -> BIM.PA [46, 52]
        'BOLL': 'BOL.PA',    // Bolloré [24, 40] -> BOL.PA [44, 49]
        'AMUN': 'AMUN.PA',   // Amundi [24] -> AMUN.PA [45, 51]
        'EDEN': 'EDEN.PA',   // Edenred [24] -> EDEN.PA [44, 49]
        'LTEN': 'ATE.PA',    // Alten [25] -> ATE.PA [50]
        'RUBF': 'RUI.PA',    // Rubis [26] -> RUI.PA [46, 52]
        'GTT': 'GTT.PA',     // Gaztransport et Technigaz SA [26] -> GTT.PA [46, 52]
        'PLNW': 'PLNW.PA',   // Planisware [28] -> PLNW.PA [46, 53]
        'VIRB': 'VIRP.PA',   // Virbac [28] -> VIRP.PA [44, 49]
        'VU': 'VU.PA',       // Vusiongroup [29] -> VU.PA [46, 51]
        'ROBF': 'RBT.PA',    // Robertet [30] -> RBT.PA [44, 49]
        'BVI': 'BVI.PA',     // Bureau Veritas [31] -> BVI.PA [44, 49]
        'ISOS': 'IPS.PA',    // Ipsos [31] -> IPS.PA [50]
        'PUBP': 'PUB.PA',    // Publicis [32] -> PUB.PA [44, 48]
        'CBLP': 'MRN.PA',    // Mersen SA [34] -> MRN.PA [44, 49]
        'PERP': 'RI.PA',     // Pernod Ricard [36, 42] -> RI.PA [44, 48]
        // Tickers sans paiement explicite mais SBF 120 (pour éviter un crash)
        'WLN': 'WLN.PA',      // Worldline [46, 52]
        'ABVX': 'ABVX.PA',    // Abivax [46, 52]
        'AF': 'AF.PA',        // Air France - KLM [52]
        'ALO': 'ALO.PA',      // Alstom [46, 51]
        'ATO': 'ATO.PA',      // Atos [46, 53]
        'SESFd': 'SESG.PA'    // SES Global [55, 56]
    };
    
    // Extraction et normalisation des données de Dividends_List.csv.txt [1-43]
    const RAW_PAYMENTS = [
        // TTE.PA
        { csv_ticker: 'TTEF', Societe: 'TotalEnergies SE', Montant: 0.79, DatePaiement: '06/01/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'TTEF', Societe: 'TotalEnergies SE', Montant: 0.79, DatePaiement: '01/04/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'TTEF', Societe: 'TotalEnergies SE', Montant: 0.85, DatePaiement: '01/07/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'TTEF', Societe: 'TotalEnergies SE', Montant: 0.85, DatePaiement: '03/10/2025', Versement: 'Trimestriel' },
        // KER.PA
        { csv_ticker: 'PRTP', Societe: 'Kering', Montant: 2.00, DatePaiement: '16/01/2025', Versement: 'Acompte' },
        { csv_ticker: 'PRTP', Societe: 'Kering', Montant: 4.00, DatePaiement: '07/05/2025', Versement: 'Solde' },
        // DBG.PA
        { csv_ticker: 'DBG', Societe: 'Derichebourg', Montant: 0.13, DatePaiement: '12/02/2025', Versement: 'Annuel' },
        // RMS.PA
        { csv_ticker: 'HRMS', Societe: 'Hermès International', Montant: 3.50, DatePaiement: '19/02/2025', Versement: 'Acompte' },
        { csv_ticker: 'HRMS', Societe: 'Hermès International', Montant: 12.50, DatePaiement: '07/05/2025', Versement: 'Solde' },
        // GFC.PA
        { csv_ticker: 'GFCP', Societe: 'Gecina SA', Montant: 2.70, DatePaiement: '05/03/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'GFCP', Societe: 'Gecina SA', Montant: 2.75, DatePaiement: '04/07/2025', Versement: 'Trimestriel' },
        // LI.PA
        { csv_ticker: 'LOIM', Societe: 'Klépierre', Montant: 0.925, DatePaiement: '06/03/2025', Versement: 'Semestriel' },
        { csv_ticker: 'LOIM', Societe: 'Klépierre', Montant: 0.925, DatePaiement: '10/07/2025', Versement: 'Semestriel' },
        // ICAD.PA
        { csv_ticker: 'ICAD', Societe: 'Icade', Montant: 1.00, DatePaiement: '06/03/2025', Versement: 'Annuel' },
        { csv_ticker: 'ICAD', Societe: 'Icade', Montant: 1.16, DatePaiement: '06/03/2025', Versement: 'Annuel' },
        { csv_ticker: 'ICAD', Societe: 'Icade', Montant: 2.15, DatePaiement: '03/07/2025', Versement: 'Annuel' },
        // STMPA.PA
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '26/03/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '25/06/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '24/09/2025', Versement: 'Trimestriel' },
        { csv_ticker: 'STMPA', Societe: 'STMicroelectronics', Montant: 0.09, DatePaiement: '17/12/2025', Versement: 'Trimestriel' },
        // ARG.PA
        { csv_ticker: 'ARGAN', Societe: 'Argan SA', Montant: 3.30, DatePaiement: '17/04/2025', Versement: 'Annuel' },
        // DIM.PA
        { csv_ticker: 'STDM', Societe: 'Sartorius Stedim', Montant: 0.69, DatePaiement: '04/04/2025', Versement: 'Annuel' },
        // AIR.PA
        { csv_ticker: 'AIR', Societe: 'Airbus SE', Montant: 1.00, DatePaiement: '24/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'AIR', Societe: 'Airbus SE', Montant: 2.00, DatePaiement: '24/04/2025', Versement: 'Annuel' },
        // DG.PA
        { csv_ticker: 'SGEF', Societe: 'Vinci', Montant: 3.70, DatePaiement: '24/04/2025', Versement: 'Annuel' },
        { csv_ticker: 'SGEF', Societe: 'Vinci', Montant: 1.05, DatePaiement: '16/10/2025', Versement: 'Acompte' },
        // STLAP.PA
        { csv_ticker: 'STLAM', Societe: 'Stellantis NV', Montant: 0.68, DatePaiement: '05/05/2025', Versement: 'Annuel' },
        // MC.PA (LVMH)
        { csv_ticker: 'LVMH', Societe: 'LVMH', Montant: 7.50, DatePaiement: '28/04/2025', Versement: 'Solde' },
        // TFI.PA
        { csv_ticker: 'TFFP', Societe: 'TF1', Montant: 0.60, DatePaiement: '28/04/2025', Versement: 'Annuel' },
        // ENGI.PA
        { csv_ticker: 'ENGIE', Societe: 'Engie', Montant: 1.48, DatePaiement: '29/04/2025', Versement: 'Annuel' },
        // ITP.PA
        { csv_ticker: 'IPAR', Societe: 'Interparfums', Montant: 1.15, DatePaiement: '30/04/2025', Versement: 'Annuel' },
        // VCT.PA
        { csv_ticker: 'VCTP', Societe: 'Vicat', Montant: 2.00, DatePaiement: '02/05/2025', Versement: 'Annuel' },
        // OPM.PA
        { csv_ticker: 'OPM', Societe: 'OPmobility SE', Montant: 0.36, DatePaiement: '02/05/2025', Versement: 'Annuel' },
        // VIV.PA
        { csv_ticker: 'VIV', Societe: 'Vivendi', Montant: 0.04, DatePaiement: '02/05/2025', Versement: 'Annuel' },
        // COV.PA
        { csv_ticker: 'CVO', Societe: 'Covivio', Montant: 3.50, DatePaiement: '05/05/2025', Versement: 'Annuel' },
        // SCR.PA
        { csv_ticker: 'SCOR', Societe: 'SCOR SE', Montant: 1.80, DatePaiement: '06/05/2025', Versement: 'Annuel' },
        // MERY.PA
        { csv_ticker: 'MERY', Societe: 'Mercialys', Montant: 1.00, DatePaiement: '06/05/2025', Versement: 'Annuel' },
        // EN.PA
        { csv_ticker: 'BOUY', Societe: 'Bouygues', Montant: 2.00, DatePaiement: '07/05/2025', Versement: 'Annuel' },
        // MMT.PA
        { csv_ticker: 'MMTP', Societe: 'Métropole Télévision SA (M6)', Montant: 1.25, DatePaiement: '07/05/2025', Versement: 'Annuel' },
        // CS.PA
        { csv_ticker: 'AXAF', Societe: 'AXA', Montant: 2.15, DatePaiement: '07/05/2025', Versement: 'Annuel' },
        // OR.PA
        { csv_ticker: 'OREP', Societe: "L'Oréal", Montant: 7.00, DatePaiement: '07/05/2025', Versement: 'Annuel' },
        // BN.PA
        { csv_ticker: 'DANO', Societe: 'Danone', Montant: 2.15, DatePaiement: '07/05/2025', Versement: 'Annuel' },
        // EL.PA
        { csv_ticker: 'ESLX', Societe: 'EssilorLuxottica', Montant: 3.95, DatePaiement: '05/06/2025', Versement: 'Annuel' },
        // URW.PA
        { csv_ticker: 'URW', Societe: 'Unibail-Rodamco', Montant: 3.50, DatePaiement: '12/05/2025', Versement: 'Annuel' },
        // RNO.PA
        { csv_ticker: 'RENA', Societe: 'Renault', Montant: 2.20, DatePaiement: '12/05/2025', Versement: 'Annuel' },
        // SAN.PA
        { csv_ticker: 'SASY', Societe: 'Sanofi', Montant: 3.92, DatePaiement: '14/05/2025', Versement: 'Annuel' },
        // VIE.PA
        { csv_ticker: 'VIE', Societe: 'Veolia', Montant: 1.40, DatePaiement: '14/05/2025', Versement: 'Annuel' },
        // SU.PA
        { csv_ticker: 'SCHN', Societe: 'Schneider Electric', Montant: 1.37, DatePaiement: '15/05/2025', Versement: 'Acompte' }, 
        { csv_ticker: 'SCHN', Societe: 'Schneider Electric', Montant: 2.53, DatePaiement: '15/05/2025', Versement: 'Solde' },
        // VRLA.PA
        { csv_ticker: 'VRLA', Societe: 'Verallia', Montant: 1.70, DatePaiement: '15/05/2025', Versement: 'Annuel' },
        // RXL.PA
        { csv_ticker: 'RXL', Societe: 'Rexel', Montant: 1.20, DatePaiement: '16/05/2025', Versement: 'Annuel' },
        // SPIE.PA
        { csv_ticker: 'SPIE', Societe: 'Spie', Montant: 0.75, DateVersement: '16/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'SPIE', Societe: 'Spie', Montant: 0.30, DateVersement: '18/09/2025', Versement: 'Acompte' },
        // BNP.PA
        { csv_ticker: 'BNPP', Societe: 'BNP Paribas', Montant: 4.79, DatePaiement: '21/05/2025', Versement: 'Annuel' },
        { csv_ticker: 'BNPP', Societe: 'BNP Paribas', Montant: 2.59, DatePaiement: '30/09/2025', Versement: 'Exceptionnel' },
        // AI.PA
        { csv_ticker: 'AIRP', Societe: 'Air Liquide', Montant: 3.30, DatePaiement: '21/05/2025', Versement: 'Annuel' },
        // DEC.PA
        { csv_ticker: 'JCDX', Societe: 'JC Decaux SA', Montant: 0.55, DatePaiement: '21/05/2025', Versement: 'Annuel' },
        // NEX.PA
        { csv_ticker: 'NEXS', Societe: 'Nexans SA', Montant: 2.60, DatePaiement: '21/05/2025', Versement: 'Annuel' },
        // CARM.PA
        { csv_ticker: 'CARM', Societe: 'Carmila', Montant: 1.25, DatePaiement: '21/05/2025', Versement: 'Annuel' },
        // COFA.PA
        { csv_ticker: 'COFA', Societe: 'Coface', Montant: 1.40, DatePaiement: '22/05/2025', Versement: 'Annuel' },
        // NK.PA
        { csv_ticker: 'IMTP', Societe: 'Imerys', Montant: 1.45, DatePaiement: '22/05/2025', Versement: 'Annuel' },
        // HO.PA
        { csv_ticker: 'TCFP', Societe: 'Thales', Montant: 2.85, DatePaiement: '22/05/2025', Versement: 'Solde' },
        { csv_ticker: 'TCFP', Societe: 'Thales', Montant: 0.95, DatePaiement: '04/12/2025', Versement: 'Acompte' },
        // CAP.PA
        { csv_ticker: 'CAPP', Societe: 'Capgemini', Montant: 3.40, DatePaiement: '22/05/2025', Versement: 'Annuel' },
        // TE.PA
        { csv_ticker: 'TE', Societe: 'Technip Energies BV', Montant: 0.85, DatePaiement: '22/05/2025', Versement: 'Annuel' },
        // AM.PA
        { csv_ticker: 'AM', Societe: 'Dassault Aviation', Montant: 4.72, DatePaiement: '22/05/2025', Versement: 'Annuel' },
        // FGR.PA
        { csv_ticker: 'FOUG', Societe: 'Eiffage', Montant: 4.70, DatePaiement: '23/05/2025', Versement: 'Annuel' },
        // MF.PA
        { csv_ticker: 'MWDP', Societe: 'Wendel', Montant: 4.70, DatePaiement: '23/05/2025', Versement: 'Annuel' },
        // ML.PA
        { csv_ticker: 'MICP', Societe: 'Michelin', Montant: 1.38, DatePaiement: '23/05/2025', Versement: 'Annuel' },
        // TEP.PA
        { csv_ticker: 'TEPRF', Societe: 'Teleperformance', Montant: 4.20, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // RF.PA
        { csv_ticker: 'EURA', Societe: 'Eurazeo', Montant: 2.65, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // ENX.PA
        { csv_ticker: 'ENX', Societe: 'Euronext', Montant: 2.90, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // ACA.PA
        { csv_ticker: 'CAGR', Societe: 'Crédit Agricole', Montant: 1.10, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // ELIS.PA
        { csv_ticker: 'ELIS', Societe: 'Elis Services SA', Montant: 0.45, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // VK.PA
        { csv_ticker: 'VLLP', Societe: 'Vallourec', Montant: 1.50, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // FR.PA
        { csv_ticker: 'VLOF', Societe: 'Valeo', Montant: 0.42, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // GLE.PA
        { csv_ticker: 'SOGN', Societe: 'Société Générale', Montant: 1.09, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // AKE.PA
        { csv_ticker: 'AKE', Societe: 'Arkema', Montant: 3.60, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // DSY.PA
        { csv_ticker: 'DAST', Societe: 'Dassault Systèmes', Montant: 0.26, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // AYV.PA
        { csv_ticker: 'AYV', Societe: 'Ayvens', Montant: 0.37, DatePaiement: '28/05/2025', Versement: 'Annuel' },
        // FDJU.PA
        { csv_ticker: 'FDJU', Societe: 'FDJ United', Montant: 2.05, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        // SAF.PA
        { csv_ticker: 'SAF', Societe: 'Safran', Montant: 2.90, DatePaiement: '02/06/2025', Versement: 'Annuel' },
        // EXENS.PA
        { csv_ticker: 'EXENS', Societe: 'Exosens', Montant: 0.10, DatePaiement: '30/05/2025', Versement: 'Annuel' },
        // LR.PA
        { csv_ticker: 'LEGD', Societe: 'Legrand', Montant: 2.20, DatePaiement: '02/06/2025', Versement: 'Annuel' },
        // BB.PA
        { csv_ticker: 'BICP', Societe: 'Société BIC SA', Montant: 3.08, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        // TRI.PA
        { csv_ticker: 'TRIA', Societe: 'Trigano', Montant: 1.75, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        // CA.PA
        { csv_ticker: 'CARR', Societe: 'Carrefour', Montant: 0.23, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'CARR', Societe: 'Carrefour', Montant: 0.92, DatePaiement: '03/06/2025', Versement: 'Annuel' },
        // ERA.PA
        { csv_ticker: 'ERMT', Societe: 'Eramet', Montant: 1.35, DatePaiement: '04/06/2025', Versement: 'Annuel' },
        { csv_ticker: 'ERMT', Societe: 'Eramet', Montant: 0.15, DatePaiement: '04/06/2025', Versement: 'Annuel' },
        // AC.PA
        { csv_ticker: 'ACCP', Societe: 'Accor', Montant: 1.26, DatePaiement: '04/06/2025', Versement: 'Annuel' },
        // GET.PA
        { csv_ticker: 'GETP', Societe: 'Getlink', Montant: 0.58, DatePaiement: '06/06/2025', Versement: 'Annuel' },
        // ADP.PA
        { csv_ticker: 'ADP', Societe: 'Aeroports Paris', Montant: 3.00, DatePaiement: '05/06/2025', Versement: 'Annuel' },
        // SK.PA
        { csv_ticker: 'SEBF', Societe: 'Groupe SEB', Montant: 2.80, DatePaiement: '05/06/2025', Versement: 'Annuel' },
        // SOP.PA
        { csv_ticker: 'SOPR', Societe: 'Sopra Steria', Montant: 4.65, DatePaiement: '05/06/2025', Versement: 'Annuel' },
        // ORA.PA
        { csv_ticker: 'ORAN', Societe: 'Orange', Montant: 0.45, DatePaiement: '05/06/2025', Versement: 'Semestriel' },
        // IPN.PA
        { csv_ticker: 'IPN', Societe: 'Ipsen', Montant: 1.40, DatePaiement: '06/06/2025', Versement: 'Annuel' },
        // SGO.PA
        { csv_ticker: 'SGOB', Societe: 'Saint-Gobain', Montant: 2.20, DatePaiement: '11/06/2025', Versement: 'Annuel' },
        // BIM.PA
        { csv_ticker: 'BIOX', Societe: 'Biomérieux', Montant: 0.90, DatePaiement: '11/06/2025', Versement: 'Annuel' },
        // BOL.PA
        { csv_ticker: 'BOLL', Societe: 'Bolloré', Montant: 0.06, DatePaiement: '12/06/2025', Versement: 'Annuel' },
        // AMUN.PA
        { csv_ticker: 'AMUN', Societe: 'Amundi', Montant: 4.25, DatePaiement: '12/06/2025', Versement: 'Annuel' },
        // EDEN.PA
        { csv_ticker: 'EDEN', Societe: 'Edenred', Montant: 1.21, DatePaiement: '12/06/2025', Versement: 'Annuel' },
        // ATE.PA
        { csv_ticker: 'LTEN', Societe: 'Alten', Montant: 1.50, DatePaiement: '18/06/2025', Versement: 'Annuel' },
        // RUI.PA
        { csv_ticker: 'RUBF', Societe: 'Rubis', Montant: 2.03, DatePaiement: '19/06/2025', Versement: 'Annuel' },
        // GTT.PA
        { csv_ticker: 'GTT', Societe: 'Gaztransport et Technigaz SA', Montant: 3.83, DatePaiement: '19/06/2025', Versement: 'Annuel' },
        // PLNW.PA
        { csv_ticker: 'PLNW', Societe: 'Planisware', Montant: 0.31, DatePaiement: '26/06/2025', Versement: 'Annuel' },
        // VIRP.PA
        { csv_ticker: 'VIRB', Societe: 'Virbac', Montant: 1.45, DatePaiement: '26/06/2025', Versement: 'Annuel' },
        // VU.PA
        { csv_ticker: 'VU', Societe: 'Vusiongroup', Montant: 0.60, DatePaiement: '26/06/2025', Versement: 'Annuel' },
        // RBT.PA
        { csv_ticker: 'ROBF', Societe: 'Robertet', Montant: 10.00, DatePaiement: '01/07/2025', Versement: 'Annuel' },
        // BVI.PA
        { csv_ticker: 'BVI', Societe: 'Bureau Veritas', Montant: 0.90, DatePaiement: '03/07/2025', Versement: 'Annuel' },
        // IPS.PA
        { csv_ticker: 'ISOS', Societe: 'Ipsos', Montant: 1.85, DatePaiement: '03/07/2025', Versement: 'Annuel' },
        // PUB.PA
        { csv_ticker: 'PUBP', Societe: 'Publicis', Montant: 3.60, DatePaiement: '03/07/2025', Versement: 'Annuel' },
        // MRN.PA
        { csv_ticker: 'CBLP', Societe: 'Mersen SA', Montant: 0.90, DatePaiement: '09/07/2025', Versement: 'Annuel' },
        // RI.PA
        { csv_ticker: 'PERP', Societe: 'Pernod Ricard', Montant: 2.35, DatePaiement: '25/07/2025', Versement: 'Acompte' },
        { csv_ticker: 'PERP', Societe: 'Pernod Ricard', Montant: 2.35, DatePaiement: '26/11/2025', Versement: 'Solde' },
        // MT.PA (Non dans CSV, mais SBF 120)
        // ALO.PA, ATO.PA, WLN.PA, AF.PA (Dividende 0€ ou non listé dans les sources CSV)
        { csv_ticker: 'WLN', Societe: 'Worldline', Montant: 0.00, DatePaiement: 'N/A', Versement: 'N/A' }
    ];

    const schedule = {};
    RAW_PAYMENTS.forEach(payment => {
        const sbfTicker = MAPPING[payment.csv_ticker];
        
        // Si le Ticker SBF 120 est trouvé, nous ajoutons le paiement
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


// Données initiales (CORRIGÉES: Lecture sécurisée du premier paiement disponible)
// Nous prenons le premier événement de paiement pour TTE.PA, MC.PA, et AI.PA pour l'initialisation.
const initialData = [
    { 
        Societe: 'TotalEnergies SE', Ticker: 'TTE.PA', Quantite: 50, 
        MontantAction: SBF120_PAYMENT_SCHEDULE['TTE.PA'] ? SBF120_PAYMENT_SCHEDULE['TTE.PA'].MontantAction : 0, 
        Versement: SBF120_PAYMENT_SCHEDULE['TTE.PA'] ? SBF120_PAYMENT_SCHEDULE['TTE.PA'].Versement : 'N/A', 
        DateVersement: SBF120_PAYMENT_SCHEDULE['TTE.PA'] ? SBF120_PAYMENT_SCHEDULE['TTE.PA'].DateVersement : 'N/A', 
        Statut: 'Prévu' 
    },
    { 
        Societe: 'LVMH', Ticker: 'MC.PA', Quantite: 10, 
        MontantAction: SBF120_PAYMENT_SCHEDULE['MC.PA'] ? SBF120_PAYMENT_SCHEDULE['MC.PA'].MontantAction : 0, 
        Versement: SBF120_PAYMENT_SCHEDULE['MC.PA'] ? SBF120_PAYMENT_SCHEDULE['MC.PA'].Versement : 'N/A', 
        DateVersement: SBF120_PAYMENT_SCHEDULE['MC.PA'] ? SBF120_PAYMENT_SCHEDULE['MC.PA'].DateVersement : 'N/A', 
        Statut: 'Versé' 
    },
    { 
        Societe: 'Air Liquide', Ticker: 'AI.PA', Quantite: 25, 
        MontantAction: SBF120_PAYMENT_SCHEDULE['AI.PA'] ? SBF120_PAYMENT_SCHEDULE['AI.PA'].MontantAction : 0, 
        Versement: SBF120_PAYMENT_SCHEDULE['AI.PA'] ? SBF120_PAYMENT_SCHEDULE['AI.PA'].Versement : 'N/A', 
        DateVersement: SBF120_PAYMENT_SCHEDULE['AI.PA'] ? SBF120_PAYMENT_SCHEDULE['AI.PA'].DateVersement : 'N/A', 
        Statut: 'Prévu' 
    }
];

let dividendsData = [];

// --- Fonctions de Persistance, Calcul, Édition, Suppression (inchangées) ---

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

    // Récupérer le nom de la société depuis le premier paiement
    const societyName = payments.Societe;

    const quantityInput = prompt(`Entrez la quantité détenue pour ${societyName} (${tickerInput}) :`);
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
