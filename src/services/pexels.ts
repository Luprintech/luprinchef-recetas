import { createClient } from 'pexels';

const FALLBACK_URL = 'https://placehold.co/600x400.png';

export async function searchPhoto(query: string): Promise<string> {
    if (!query || !process.env.PEXELS_API_KEY) return FALLBACK_URL;

    try {
        const client = createClient(process.env.PEXELS_API_KEY);
        const result = await client.photos.search({
            query: `${query} food dish`,
            per_page: 1,
            orientation: 'landscape',
        });

        if ('photos' in result && result.photos.length > 0) {
            return result.photos[0].src.large;
        }
    } catch (e) {
        console.error('Pexels search failed:', e);
    }

    return FALLBACK_URL;
}
