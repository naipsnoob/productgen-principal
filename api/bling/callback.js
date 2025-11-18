// Vercel Serverless Function
// Path: /api/bling/callback.js

export default async function handler(req, res) {
    // Allow CORS for the frontend
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { code } = req.body;

    if (!code) {
        return res.status(400).json({ message: 'Código de autorização não fornecido.' });
    }

    const clientId = process.env.BLING_CLIENT_ID;
    const clientSecret = process.env.BLING_CLIENT_SECRET;

    if (!clientId || !clientSecret) {
        console.error("ERRO GRAVE: Credenciais do Bling (BLING_CLIENT_ID, BLING_CLIENT_SECRET) não estão configuradas nas variáveis de ambiente da Vercel.");
        return res.status(500).json({ message: 'Erro de configuração no servidor. O administrador foi notificado.' });
    }

    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    const body = new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
    });

    try {
        const response = await fetch('https://api.bling.com.br/Api/v3/oauth/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Authorization': `Basic ${credentials}`,
                'Accept': 'application/json',
            },
            body: body.toString(),
        });

        const data = await response.json();

        if (!response.ok) {
            console.error('Erro ao obter token do Bling:', data);
            return res.status(response.status).json({ message: data.error?.description || 'Erro na API do Bling' });
        }
        
        // Return the successful response to the frontend
        return res.status(200).json(data);

    } catch (error) {
        console.error('Erro interno do proxy:', error);
        return res.status(500).json({ message: 'Erro interno ao conectar-se ao Bling.' });
    }
}
