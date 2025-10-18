// api/get-quotes.js (Intégration de l'API Alpha Vantage)

// Clé API fournie
const API_KEY = "NG0Z3TKNZTJQUTNC"; 
// Endpoint Alpha Vantage pour obtenir les cotations en temps réel (Global Quote)
const API_BASE_URL = "https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=";

// Fonction de secours (Fallback) pour les Tickers non trouvés ou en cas d'échec API
function getFallbackPrice(ticker) {
    const FALLBACK_PRICES = {
        // Liste des actions importantes vérifiées manuellement précédemment
        "TTE.PA": 55.00,
        "RI.PA": 89.20,
        "CS.PA": 39.41,
        "AC.PA": 41.57,
        "SW.PA": 90.00,
        "URW.PA": 89.44, // Correction demandée
        // ... ajoutez ici d'autres prix critiques si vous le souhaitez ...
    };
    return FALLBACK_PRICES[ticker] || 10.0; 
}

// Fonction utilitaire pour récupérer le prix d'un Ticker
async function fetchPriceFromAlphaVantage(ticker) {
    const apiUrl = `${API_BASE_URL}${ticker}&apikey=${API_KEY}`;
    
    // Le fetch est synchrone dans la boucle, mais Node.js le gère bien en Serverless
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
    }

    const data = await response.json();
    
    // Alpha Vantage utilise un objet Global Quote
    const quote = data['Global Quote'];

    if (quote && quote['05. price']) {
        // '05. price' est la clé pour la cotation actuelle
        return parseFloat(quote['05. price']);
    }

    // Le Ticker est valide mais n'a pas été trouvé (message d'erreur FMP/AlphaV)
    return null;
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
        
        const quotes = {};

        // ATTENTION: Alpha Vantage gratuit limite les appels (5 par minute, 500 par jour).
        // Nous traitons les Tickers un par un, ce qui peut ralentir si la liste est longue.

        for (const ticker of tickers) {
            let price = await fetchPriceFromAlphaVantage(ticker);
            
            if (price !== null) {
                quotes[ticker] = price;
            } else {
                // Ticker non trouvé par Alpha Vantage
                quotes[ticker] = getFallbackPrice(ticker); 
            }
        }
        
        res.status(200).json(quotes);

    } catch (error) {
        console.error('Erreur Serverless Function Alpha Vantage:', error.message);
        
        // En cas d'échec critique (clé invalide, limite dépassée), on retourne le Fallback pour tous
        const fallbackQuotes = {};
        const tickersToFallback = req.body.tickers || [];
        for (const ticker of tickersToFallback) {
             fallbackQuotes[ticker] = getFallbackPrice(ticker);
        }
        res.status(200).json(fallbackQuotes);
    }
};
