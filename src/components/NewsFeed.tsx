import { useState, useEffect, useCallback } from 'react';
import { Search, ExternalLink, Clock, TrendingUp, Hash, Bookmark, ChevronLeft, ChevronRight, Zap, ArrowUpRight, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Article {
    title: string;
    description: string;
    url: string;
    image: string | null;
    publishedAt: string;
    source: { name: string; url: string };
}

const categories = [
    { id: 'trending', label: '🔥 Trending', query: 'technology' },
    { id: 'ai', label: '🤖 AI', query: 'artificial intelligence' },
    { id: 'webdev', label: '🌐 Web Dev', query: 'web development' },
    { id: 'cybersecurity', label: '🔒 Cybersecurity', query: 'cybersecurity' },
    { id: 'startups', label: '🚀 Startups', query: 'tech startups' },
];

const trendingTopics = [
    'React 19', 'Rust', 'AI Agents', 'WebAssembly', 'Edge Computing',
    'Bun Runtime', 'TypeScript 6', 'LLMs', 'Kubernetes', 'Next.js 15',
];

const techKeywords = [
    'Machine Learning', 'DevOps', 'Cloud Native', 'Serverless',
    'GraphQL', 'Microservices', 'Docker', 'CI/CD',
];

function timeAgo(dateStr: string): string {
    const now = new Date();
    const date = new Date(dateStr);
    const diffMs = now.getTime() - date.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffH = Math.floor(diffMin / 60);
    if (diffH < 24) return `${diffH}h ago`;
    const diffD = Math.floor(diffH / 24);
    if (diffD === 1) return 'Yesterday';
    return `${diffD}d ago`;
}

function CardSkeleton({ large }: { large?: boolean }) {
    return (
        <div className={`news-card ${large ? 'col-span-full' : ''}`}>
            <div className={`${large ? 'h-72' : 'h-52'} skeleton rounded-none`} />
            <div className="p-7 space-y-4">
                <div className="h-6 skeleton w-4/5" />
                <div className="h-4 skeleton w-full" />
                <div className="h-4 skeleton w-3/5" />
                <div className="flex justify-between mt-5">
                    <div className="h-4 skeleton w-24" />
                    <div className="h-4 skeleton w-20" />
                </div>
            </div>
        </div>
    );
}

// Fallback images — high-quality tech-themed photos for articles without images
const FALLBACK_IMAGES = [
    'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&q=80', // circuit board
    'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80', // cybersecurity
    'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?w=800&q=80', // laptop code
    'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&q=80', // monitor code
    'https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=800&q=80', // code screen
    'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&q=80', // matrix
    'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&q=80', // abstract tech
    'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&q=80', // laptop desk
    'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&q=80', // server room
    'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80', // earth tech
    'https://images.unsplash.com/photo-1535378917042-10a22c95931a?w=800&q=80', // AI robot
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&q=80', // team working
    'https://images.unsplash.com/photo-1563986768609-322da13575f2?w=800&q=80', // chip closeup
    'https://images.unsplash.com/photo-1580894894513-541e068a3e2b?w=800&q=80', // phone app
    'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80', // desk setup
    'https://images.unsplash.com/photo-1531297484001-80022131f5a1?w=800&q=80', // purple laptop
    'https://images.unsplash.com/photo-1573164713988-8665fc963095?w=800&q=80', // woman coding
    'https://images.unsplash.com/photo-1605810230434-7631ac76ec81?w=800&q=80', // screens wall
    'https://images.unsplash.com/photo-1562813733-b31f71025d54?w=800&q=80', // dark terminal
    'https://images.unsplash.com/photo-1487058792275-0ad4aaf24ca7?w=800&q=80', // colorful code
];

function isRealImage(url: string | null): boolean {
    if (!url) return false;
    // Filter out Dev.to auto-generated social preview images (plain text on colored bg)
    if (url.includes('social_previews') || url.includes('dev.to/social')) return false;
    // Filter out tiny placeholder thumbnails
    if (url.includes('self') || url.includes('default') || url.includes('nsfw')) return false;
    return true;
}

function getArticleImage(article: Article, index: number): string {
    if (isRealImage(article.image)) return article.image!;
    // Deterministic fallback based on title hash so same article always gets same image
    let hash = 0;
    for (let i = 0; i < article.title.length; i++) hash = ((hash << 5) - hash) + article.title.charCodeAt(i);
    return FALLBACK_IMAGES[Math.abs(hash + index) % FALLBACK_IMAGES.length];
}

function FeaturedCard({ article }: { article: Article }) {
    const imgSrc = getArticleImage(article, 0);
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            onClick={() => window.open(article.url, '_blank')}
            className="featured-card cursor-pointer group"
        >
            <div className="flex flex-col lg:flex-row">
                <div className="relative lg:w-3/5 h-64 lg:h-auto overflow-hidden">
                    <img src={imgSrc} alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[0]; }} />
                    <div className="absolute inset-0 bg-gradient-to-r from-white/60 via-transparent to-transparent lg:block hidden" />
                    <div className="absolute inset-0 bg-gradient-to-t from-white/70 to-transparent lg:hidden" />
                    <div className="absolute top-5 left-5">
                        <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-indigo-600 text-white text-xs font-semibold shadow-lg shadow-indigo-200">
                            <Zap className="w-3.5 h-3.5" /> Featured
                        </span>
                    </div>
                </div>

                <div className="lg:w-2/5 p-8 lg:p-10 flex flex-col justify-center">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-lg bg-indigo-50 text-accent-blue text-sm font-semibold">
                            {article.source.name}
                        </span>
                        <span className="text-text-muted text-sm flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5" /> {timeAgo(article.publishedAt)}
                        </span>
                    </div>
                    <h2 className="text-2xl lg:text-[1.75rem] font-bold text-text-primary leading-tight mb-4 group-hover:text-accent-blue transition-colors duration-300">
                        {article.title}
                    </h2>
                    <p className="text-text-secondary text-[0.9375rem] leading-relaxed mb-6 line-clamp-3">
                        {article.description || 'Tap to read the full article and explore the latest developments.'}
                    </p>
                    <button className="inline-flex items-center gap-2 text-accent-blue font-semibold text-[0.9375rem] group-hover:gap-3 transition-all duration-300">
                        Read Full Article <ArrowUpRight className="w-4.5 h-4.5" />
                    </button>
                </div>
            </div>
        </motion.div>
    );
}

function NewsCard({ article, index }: { article: Article; index: number }) {
    const imgSrc = getArticleImage(article, index + 1);
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            onClick={() => window.open(article.url, '_blank')}
            className="news-card cursor-pointer group flex flex-col"
        >
            <div className="relative h-52 overflow-hidden">
                <img src={imgSrc} alt={article.title}
                    className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
                    onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]; }} />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                <div className="absolute bottom-4 left-4">
                    <span className="px-3 py-1 rounded-lg bg-white/90 backdrop-blur-md text-text-primary text-xs font-medium shadow-sm">
                        {article.source.name}
                    </span>
                </div>
            </div>

            <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-text-primary leading-snug mb-3 group-hover:text-accent-blue transition-colors duration-300 line-clamp-2">
                    {article.title}
                </h3>
                <p className="text-text-muted text-[0.875rem] leading-relaxed mb-5 line-clamp-3 flex-1">
                    {article.description || 'No description available for this article.'}
                </p>
                <div className="flex items-center justify-between pt-4 border-t border-border-subtle">
                    <span className="text-text-muted text-[0.8125rem] flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" /> {timeAgo(article.publishedAt)}
                    </span>
                    <span className="inline-flex items-center gap-1.5 text-accent-blue text-[0.8125rem] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        Read More <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// ── Direct browser-side news fetchers (no backend needed) ──────────

async function fetchDevTo(query: string): Promise<Article[]> {
    try {
        const tag = query.split(' ')[0].toLowerCase().replace(/[^a-z0-9]/g, '');
        const res = await fetch(
            `https://dev.to/api/articles?tag=${encodeURIComponent(tag)}&per_page=20`,
            { headers: { 'User-Agent': 'TooProductive/1.0' } }
        );
        if (!res.ok) return [];
        const data = await res.json();
        return data.map((a: any) => ({
            title: a.title,
            description: a.description || a.tag_list?.join(', ') || '',
            url: a.url,
            image: a.cover_image || null,  // skip social_image — it's just auto-generated text on white bg
            publishedAt: a.published_at || a.created_at,
            source: { name: 'Dev.to', url: 'https://dev.to' },
        }));
    } catch { return []; }
}

async function fetchHNSearch(query: string): Promise<Article[]> {
    try {
        const res = await fetch(
            `https://hn.algolia.com/api/v1/search?query=${encodeURIComponent(query)}&tags=story&hitsPerPage=20`
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.hits || []).map((hit: any) => ({
            title: hit.title,
            description: hit.story_text
                ? hit.story_text.replace(/<[^>]*>/g, '').substring(0, 200)
                : `${hit.num_comments || 0} comments · ${hit.points || 0} points on Hacker News`,
            url: hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`,
            image: null,
            publishedAt: hit.created_at || new Date().toISOString(),
            source: { name: 'Hacker News', url: 'https://news.ycombinator.com' },
        }));
    } catch { return []; }
}

async function fetchHNTop(): Promise<Article[]> {
    try {
        const idsRes = await fetch('https://hacker-news.firebaseio.com/v0/topstories.json');
        const ids: number[] = await idsRes.json();
        const top = ids.slice(0, 20);
        const stories = await Promise.allSettled(
            top.map(id => fetch(`https://hacker-news.firebaseio.com/v0/item/${id}.json`).then(r => r.json()))
        );
        return stories
            .filter(r => r.status === 'fulfilled' && r.value?.title)
            .map((r: any) => ({
                title: r.value.title,
                description: `${r.value.score || 0} points · ${r.value.descendants || 0} comments on Hacker News`,
                url: r.value.url || `https://news.ycombinator.com/item?id=${r.value.id}`,
                image: null,
                publishedAt: r.value.time ? new Date(r.value.time * 1000).toISOString() : new Date().toISOString(),
                source: { name: 'Hacker News', url: 'https://news.ycombinator.com' },
            }));
    } catch { return []; }
}

async function fetchReddit(query: string): Promise<Article[]> {
    try {
        const res = await fetch(
            `https://www.reddit.com/r/technology/search.json?q=${encodeURIComponent(query)}&sort=hot&limit=15&restrict_sr=on&t=week`
        );
        if (!res.ok) return [];
        const data = await res.json();
        return (data.data?.children || []).filter((c: any) => !c.data.over_18).map((c: any) => ({
            title: c.data.title,
            description: c.data.selftext
                ? c.data.selftext.substring(0, 200)
                : `${c.data.score || 0} upvotes · ${c.data.num_comments || 0} comments`,
            url: c.data.url_overridden_by_dest || `https://reddit.com${c.data.permalink}`,
            image: c.data.thumbnail && c.data.thumbnail.startsWith('http') ? c.data.thumbnail : null,
            publishedAt: new Date(c.data.created_utc * 1000).toISOString(),
            source: { name: 'Reddit', url: 'https://reddit.com/r/technology' },
        }));
    } catch { return []; }
}

async function fetchAllNews(query: string): Promise<Article[]> {
    const [devto, hn, reddit] = await Promise.allSettled([
        fetchDevTo(query),
        fetchHNSearch(query),
        fetchReddit(query),
    ]);
    const devtoArticles = devto.status === 'fulfilled' ? devto.value : [];
    const hnArticles = hn.status === 'fulfilled' ? hn.value : [];
    const redditArticles = reddit.status === 'fulfilled' ? reddit.value : [];

    // Interleave all sources for variety
    const merged: Article[] = [];
    const maxLen = Math.max(devtoArticles.length, hnArticles.length, redditArticles.length);
    for (let i = 0; i < maxLen; i++) {
        if (i < devtoArticles.length) merged.push(devtoArticles[i]);
        if (i < hnArticles.length) merged.push(hnArticles[i]);
        if (i < redditArticles.length) merged.push(redditArticles[i]);
    }

    // Remove duplicates by title similarity
    const unique = merged.filter((a, i, arr) =>
        arr.findIndex(b => b.title.toLowerCase() === a.title.toLowerCase()) === i
    );

    if (unique.length > 0) return unique.slice(0, 30);

    // Ultimate fallback: HN top stories
    return fetchHNTop();
}

export function NewsFeed() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('trending');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchNews = useCallback(async (cat: string, search: string, _p: number) => {
        setLoading(true);
        try {
            const q = search.trim() || categories.find(c => c.id === cat)?.query || 'technology';
            const data = await fetchAllNews(q);
            setArticles(data);
            setTotalPages(Math.ceil(data.length / 10) || 1);
        } catch (err) {
            console.error('Failed to fetch news:', err);
            setArticles([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchNews(activeCategory, searchQuery, page); }, [activeCategory, page, fetchNews]);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault(); setPage(1); fetchNews(activeCategory, searchQuery, 1);
    };

    const featuredArticle = articles[0];
    const remainingArticles = articles.slice(1);

    return (
        <div className="pb-16">
            {/* Page Header */}
            <div className="mb-10">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-accent-blue" />
                    </div>
                    <span className="text-accent-blue text-sm font-semibold tracking-wide uppercase">Tech News</span>
                </div>
                <h1 className="text-4xl md:text-[2.75rem] font-extrabold text-text-primary leading-tight mb-3 tracking-tight">
                    Stay Ahead of the <span className="text-gradient-brand">Curve</span>
                </h1>
                <p className="text-text-secondary text-lg max-w-2xl leading-relaxed">
                    Curated technology news from the world's top sources. AI, development, cybersecurity, and startup updates—all in one place.
                </p>
            </div>

            {/* Search */}
            <form onSubmit={handleSearch} className="mb-8">
                <div className="relative max-w-2xl">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
                    <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                        className="input-dark pl-icon pr-28 py-4 text-base" />
                    <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary py-2.5 px-6 text-sm">Search</button>
                </div>
            </form>

            {/* Categories */}
            <div className="flex flex-wrap gap-3 mb-10">
                {categories.map(cat => (
                    <button key={cat.id}
                        onClick={() => { setActiveCategory(cat.id); setPage(1); setSearchQuery(''); }}
                        className={`category-pill ${activeCategory === cat.id ? 'active' : ''}`}>
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="flex flex-col xl:flex-row gap-8">
                <div className="flex-1 min-w-0">
                    {loading ? (
                        <div className="space-y-8">
                            <CardSkeleton large />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">{[1, 2, 3, 4].map(i => <CardSkeleton key={i} />)}</div>
                        </div>
                    ) : articles.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-28 text-center">
                            <div className="w-20 h-20 rounded-2xl bg-bg-secondary flex items-center justify-center mb-6">
                                <Newspaper className="w-10 h-10 text-text-muted/30" />
                            </div>
                            <h3 className="text-xl font-bold text-text-primary mb-2">No articles found</h3>
                            <p className="text-text-muted text-[0.9375rem] max-w-md">Try a different search term or browse a different category.</p>
                        </div>
                    ) : (
                        <>
                            {featuredArticle && <FeaturedCard article={featuredArticle} />}
                            <div className="flex items-center gap-4 my-10">
                                <h2 className="text-xl font-bold text-text-primary whitespace-nowrap">Latest Stories</h2>
                                <div className="flex-1 h-px bg-gradient-to-r from-border-default to-transparent" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                                {remainingArticles.map((article, i) => (
                                    <NewsCard key={`${article.url}-${i}`} article={article} index={i} />
                                ))}
                            </div>
                        </>
                    )}

                    {/* Pagination */}
                    {!loading && articles.length > 0 && (
                        <div className="flex items-center justify-center gap-4 mt-12 pt-8 border-t border-border-subtle">
                            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary text-sm font-medium hover:bg-bg-tertiary hover:border-border-default disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                                <ChevronLeft className="w-4 h-4" /> Previous
                            </button>
                            <div className="flex items-center gap-1">
                                {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
                                    const pn = i + 1;
                                    return (
                                        <button key={pn} onClick={() => setPage(pn)}
                                            className={`w-10 h-10 rounded-xl text-sm font-semibold transition-all ${page === pn ? 'bg-accent-blue text-white shadow-lg shadow-indigo-200' : 'text-text-muted hover:text-text-primary hover:bg-bg-secondary'
                                                }`}>{pn}</button>
                                    );
                                })}
                            </div>
                            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
                                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-bg-secondary border border-border-subtle text-text-secondary text-sm font-medium hover:bg-bg-tertiary hover:border-border-default disabled:opacity-25 disabled:cursor-not-allowed transition-all">
                                Next <ChevronRight className="w-4 h-4" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <aside className="w-full xl:w-[340px] flex-shrink-0 space-y-7">
                    <div className="dark-card">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center"><TrendingUp className="w-4 h-4 text-accent-blue" /></div>
                            <h3 className="text-base font-bold text-text-primary">Trending Topics</h3>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {trendingTopics.map(topic => (
                                <button key={topic}
                                    onClick={() => { setSearchQuery(topic); setPage(1); fetchNews(activeCategory, topic, 1); }}
                                    className="px-4 py-2 rounded-xl bg-bg-secondary text-text-secondary text-[0.8125rem] font-medium hover:bg-indigo-50 hover:text-accent-blue transition-all border border-border-subtle hover:border-indigo-200">
                                    {topic}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="dark-card">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center"><Hash className="w-4 h-4 text-accent-purple" /></div>
                            <h3 className="text-base font-bold text-text-primary">Tech Keywords</h3>
                        </div>
                        <div className="flex flex-wrap gap-2.5">
                            {techKeywords.map(kw => (
                                <button key={kw}
                                    onClick={() => { setSearchQuery(kw); setPage(1); fetchNews(activeCategory, kw, 1); }}
                                    className="px-4 py-2 rounded-xl bg-violet-50 text-accent-purple text-[0.8125rem] font-medium hover:bg-violet-100 transition-all border border-violet-100 hover:border-violet-200">
                                    #{kw}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="dark-card">
                        <div className="flex items-center gap-2.5 mb-5">
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center"><Bookmark className="w-4 h-4 text-accent-green" /></div>
                            <h3 className="text-base font-bold text-text-primary">Suggested Reads</h3>
                        </div>
                        {articles.length > 2 ? (
                            <div className="space-y-3.5">
                                {articles.slice(0, 5).map((a, i) => (
                                    <a key={i} href={a.url} target="_blank" rel="noopener noreferrer"
                                        className="block p-4 rounded-xl bg-bg-secondary hover:bg-bg-tertiary border border-border-subtle hover:border-border-default transition-all group">
                                        <p className="text-text-primary text-[0.8125rem] font-semibold leading-snug line-clamp-2 group-hover:text-accent-blue transition-colors mb-2">{a.title}</p>
                                        <p className="text-text-muted text-xs flex items-center gap-1.5">
                                            <span className="text-accent-blue/80">{a.source.name}</span><span>·</span>{timeAgo(a.publishedAt)}
                                        </p>
                                    </a>
                                ))}
                            </div>
                        ) : (
                            <p className="text-text-muted text-sm">Browse a category to see suggestions.</p>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
