export default async function handler(req, res) {
    const { text, sourceLang, targetLang } = req.query;

    if (!text || !targetLang) {
        return res.status(400).json({ error: 'Missing required parameters' });
    }

    const apiKey = process.env.GOOGLE_TRANSLATE_API_KEY; // Use an environment variable
    const url = 'https://translation.googleapis.com/language/translate/v2';

    const params = new URLSearchParams({
        q: text,
        target: targetLang,
        key: apiKey,
    });

    if (sourceLang && sourceLang !== 'auto') {
        params.append('source', sourceLang);
    }

    try {
        const response = await fetch(`${url}?${params}`);
        const data = await response.json();

        if (data.error) {
            return res.status(500).json({ error: data.error.message });
        }

        res.status(200).json(data.data.translations[0]);
    } catch (error) {
        res.status(500).json({ error: 'Translation failed' });
    }
}