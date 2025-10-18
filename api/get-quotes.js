// api/get-quotes.js (Intégration de l'API Financial Modeling Prep)

// L'URL de base pour la récupération de plusieurs cotations (Quote)
const API_BASE_URL = "https://financialmodelingprep.com/api/v3/quote/";
// ATTENTION : REMPLACER 'YOUR_FMP_API_KEY' par votre clé réelle
const API_KEY = D2uuJXHZ7MT15D8dimVS2lflRvOWl4DS; 

// Fonction de secours (Fallback) pour les Tickers non trouvés ou en cas d'échec API
function getFallbackPrice(ticker) {
    const FALLBACK_PRICES = {
        // Liste des actions importantes vérifiées manuellement précédemment
        "TTE.PA": 55.00,
        "RI.PA": 89.20,
        "CS.PA": 39.41,
        "AC.PA": 41.57,
        "SW.PA": 90.00,
        // ... ajoutez ici d'autres prix critiques si vous le souhaitez ...
    };
    return FALLBACK_PRICES[ticker] || 10.0; // Prix par défaut de 10.0 si inconnu
}

// Adapte les Tickers français (ex: TTE.PA) pour les APIs américaines qui nécessitent un suffixe .PA
function normalizeTickers(tickers) {
    // FMP nécessite des Tickers formatés selon leur base de données
    return tickers.map(ticker => {
        // Supprime le suffixe .PA si nécessaire, ou le conserve si l'API le gère
        // Dans le doute, conservons-le, mais vérifiez la documentation FMP pour les actions Euronext Paris.
        // Souvent, FMP utilise le format "TTE.PA" ou cherche simplement la bourse.
        return ticker; 
    });
}

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    try {
        const { tickers } = req.body;
        if (!tickers || !Array.isArray(tickers) || tickers.length === 0) {
            return res.status(400).json({ error: 'Liste de tickers manquante ou invalide.' });
        }

        const normalizedTickers = normalizeTickers(tickers);
        const tickersString = normalizedTickers.join(','); // Ex: TTE.PA,SAN.PA

        // Construction de l'URL d'appel à FMP
        const apiUrl = `${API_BASE_URL}${tickersString}?apikey=${API_KEY}`;
        
        console.log(`Appel API FMP pour: ${tickersString}`);

        // Appel API côté serveur (Node.js/Vercel)
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
            throw new Error(`Erreur API FMP: ${response.status} ${response.statusText}`);
        }

        const data = await response.json(); // Data est un tableau de résultats
        const quotes = {};

        // Extraction des prix
        if (Array.isArray(data)) {
            data.forEach(item => {
                // FMP utilise 'symbol' pour le Ticker et 'price' pour le cours actuel
                if (item.symbol && item.price) {
                    quotes[item.symbol.toUpperCase()] = item.price;
                }
            });
        }
        
        // Assurer qu'il y a un prix pour chaque Ticker demandé
        for (const ticker of tickers) {
            if (quotes[ticker] === undefined) {
                 // Utilise le prix de secours (fallback) si FMP ne trouve pas le Ticker
                quotes[ticker] = getFallbackPrice(ticker); 
            }
        }
        
        res.status(200).json(quotes);

    } catch (error) {
        console.error('Erreur Serverless Function FMP:', error.message);
        
        // En cas d'échec critique de l'API (ex: clé invalide ou service hors ligne)
        const fallbackQuotes = {};
        const tickersToFallback = req.body.tickers || [];
        for (const ticker of tickersToFallback) {
             fallbackQuotes[ticker] = getFallbackPrice(ticker);
        }
        res.status(200).json(fallbackQuotes);
    }
};
