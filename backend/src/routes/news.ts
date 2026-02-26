import { Router } from 'express';

const router = Router();

// ─── Free news APIs (no key required) ───
// Primary: GNews free tier (100 req/day — set GNEWS_API_KEY in .env for higher limits)
// Fallback: Hacker News + Dev.to APIs (unlimited, no key)

const GNEWS_API_KEY = process.env.GNEWS_API_KEY || '';

/* ═══════════════════════ MAIN ROUTE ═══════════════════════ */
router.get('/', async (req, res) => {
    const { q, page = '1' } = req.query;
    const searchQuery = (q as string) || 'technology';
    const pageNum = parseInt(page as string, 10) || 1;

    try {
        // Try GNews if API key is available
        if (GNEWS_API_KEY) {
            const gnewsResult = await fetchFromGNews(searchQuery, pageNum);
            if (gnewsResult) return res.json(gnewsResult);
        }

        // Fallback: aggregate from free APIs (HackerNews + Dev.to)
        const articles = await fetchFromFreeAPIs(searchQuery, pageNum);
        return res.json({ totalArticles: articles.length, articles });
    } catch (error) {
        console.error('News fetch error:', error);
        // Last resort: fetch from HN top stories
        try {
            const fallback = await fetchHackerNewsTop();
            return res.json({ totalArticles: fallback.length, articles: fallback });
        } catch {
            return res.json({ totalArticles: 0, articles: [] });
        }
    }
});

/* ═══════════════════════ GNEWS ═══════════════════════ */
async function fetchFromGNews(query: string, page: number) {
    try {
        const url = new URL('https://gnews.io/api/v4/search');
        url.searchParams.set('q', query);
        url.searchParams.set('lang', 'en');
        url.searchParams.set('max', '10');
        url.searchParams.set('page', page.toString());
        url.searchParams.set('apikey', GNEWS_API_KEY);

        const response = await fetch(url.toString());
        if (!response.ok) return null;

        const data = await response.json();
        return data;
    } catch {
        return null;
    }
}

/* ═══════════════════════ FREE APIs ═══════════════════════ */
async function fetchFromFreeAPIs(query: string, page: number) {
    const [devtoArticles, hnArticles] = await Promise.allSettled([
        fetchDevTo(query, page),
        fetchHackerNewsSearch(query),
    ]);

    const devto = devtoArticles.status === 'fulfilled' ? devtoArticles.value : [];
    const hn = hnArticles.status === 'fulfilled' ? hnArticles.value : [];

    // Interleave results from both sources
    const merged: any[] = [];
    const maxLen = Math.max(devto.length, hn.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < devto.length) merged.push(devto[i]);
        if (i < hn.length) merged.push(hn[i]);
    }

    return merged.slice(0, 10);
}

/* ═══════════════════════ DEV.TO ═══════════════════════ */
async function fetchDevTo(query: string, page: number) {
    const url = `https://dev.to/api/articles?tag=${encodeURIComponent(query.split(' ')[0].toLowerCase())}&per_page=6&page=${page}`;
    const response = await fetch(url, {
        headers: { 'User-Agent': 'TooProductive/1.0' }
    });
    if (!response.ok) return [];

    const data = await response.json();
    return data.map((a: any) => ({
        title: a.title,
        description: a.description || a.tag_list?.join(', ') || '',
        url: a.url,
        image: a.cover_image || a.social_image || null,
        publishedAt: a.published_at || a.created_at,
        source: { name: 'Dev.to', url: 'https://dev.to' },
    }));
}

/* ═══════════════════════ HACKER NEWS SEARCH ═══════════════════════ */
async function fetchHackerNewsSearch(query: string) {
    const url = `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=6`;
    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();
    return (data.hits || []).map((hit: any) => ({
        title: hit.title,
        description: hit.story_text
            ? hit.story_text.replace(/<[^>]*>/g, '').substring(0, 200)
            : `${hit.title} — ${hit.num_comments || 0} comments, ${hit.points || 0} points on Hacker News`,
        url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
        image: null,
        publishedAt: hit.created_at || new Date().toISOString(),
        source: { name: 'Hacker News', url: 'https://news.ycombinator.com' },
    }));
}

/* ═══════════════════════ HACKER NEWS TOP (ultimate fallback) ═══════════════════════ */
async function fetchHackerNewsTop() {
    const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
    const ids = await idsRes.json();
    const topIds = ids.slice(0, 10);

    const stories = await Promise.all(
        topIds.map(async (id: number) => {
            const storyRes = await fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`);
            const story = await storyRes.json();
            return {
                title: story.title || 'Untitled',
                description: `${story.score || 0} points · ${story.descendants || 0} comments on Hacker News`,
                url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                image: null,
                publishedAt: story.time ? new Date(story.time * 1000).toISOString() : new Date().toISOString(),
                source: { name: 'Hacker News', url: 'https://news.ycombinator.com' },
            };
        })
    );

    return stories;
}

export default router;
