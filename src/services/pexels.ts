import { createClient } from 'pexels';
import fs from 'fs';
import path from 'path';

const FALLBACK_URL = 'https://placehold.co/600x400.png';
const CACHE_FILE = path.join(process.cwd(), 'data', 'pexels-cache.json');

// Pexels client singleton to avoid recreating on every call
let _client: ReturnType<typeof createClient> | null = null;
function getClient() {
    if (!_client) _client = createClient(process.env.PEXELS_API_KEY!);
    return _client;
}

function getCache(): Record<string, string> {
    try {
        if (fs.existsSync(CACHE_FILE)) {
            const data = fs.readFileSync(CACHE_FILE, 'utf-8');
            return JSON.parse(data);
        }
    } catch (e) {
        console.error('Error reading pexels cache:', e);
    }
    return {};
}

function setCache(query: string, url: string) {
    try {
        const cache = getCache();
        cache[query] = url;
        const dir = path.dirname(CACHE_FILE);
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
    } catch (e) {
        console.error('Error writing pexels cache:', e);
    }
}

export async function searchPhoto(query: string): Promise<string> {
    if (!query || !process.env.PEXELS_API_KEY) return FALLBACK_URL;

    const normalizedQuery = query.toLowerCase().trim();
    const cache = getCache();
    if (cache[normalizedQuery]) {
        return cache[normalizedQuery];
    }

    try {
        const result = await getClient().photos.search({
            query: normalizedQuery,
            per_page: 3,
            orientation: 'landscape',
        });

        if ('photos' in result && result.photos.length > 0) {
            // Pick a random photo from the top 3 results for variety
            const idx = Math.floor(Math.random() * result.photos.length);
            const url = result.photos[idx].src.large;
            setCache(normalizedQuery, url);
            return url;
        }
    } catch (e) {
        console.error('Pexels search failed:', e);
    }

    return FALLBACK_URL;
}
