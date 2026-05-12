// Proxy serverless que reenvía peticiones a Polymarket
// Permite que el bot llame a Polymarket desde el navegador sin problemas de CORS

export default async function handler(req, res) {
  // Headers CORS para permitir que tu sitio de Netlify llame a esta función
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Manejar preflight OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Tomamos los parámetros de la URL y los pasamos a Polymarket
    const queryString = new URLSearchParams(req.query).toString();
    const url = `https://gamma-api.polymarket.com/events?${queryString}`;

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Vercel Proxy)',
        'Accept': 'application/json'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Polymarket respondió con HTTP ${response.status}`
      });
    }

    const data = await response.json();

    // Cache de 30 segundos para no saturar Polymarket
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: 'Error al contactar Polymarket',
      details: error.message
    });
  }
}
