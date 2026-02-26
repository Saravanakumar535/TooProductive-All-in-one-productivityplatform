import { useState, useEffect, useCallback } from 'react';
import { Search, ExternalLink, Clock, TrendingUp, Hash, Bookmark, ChevronLeft, ChevronRight, Zap, ArrowUpRight, Newspaper } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

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

function FeaturedCard({ article }: { article: Article }) {
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
                    {article.image ? (
                        <img src={article.image} alt={article.title}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                    ) : (
                        <div className="w-full h-full min-h-[280px] bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                            <Newspaper className="w-20 h-20 text-indigo-200" />
                        </div>
                    )}
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
    return (
        <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.06 }}
            onClick={() => window.open(article.url, '_blank')}
            className="news-card cursor-pointer group flex flex-col"
        >
            <div className="relative h-52 overflow-hidden">
                {article.image ? (
                    <img src={article.image} alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-600 group-hover:scale-110"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center">
                        <Newspaper className="w-14 h-14 text-indigo-200" />
                    </div>
                )}
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

export function NewsFeed() {
    const [articles, setArticles] = useState<Article[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeCategory, setActiveCategory] = useState('trending');
    const [searchQuery, setSearchQuery] = useState('');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchNews = useCallback(async (cat: string, search: string, p: number) => {
        setLoading(true);
        try {
            const params: any = { page: p };
            if (search.trim()) { params.q = search.trim(); }
            else { const category = categories.find(c => c.id === cat); params.q = category?.query || 'technology'; }
            const res = await axios.get('/api/news', { params });
            setArticles(res.data.articles || []);
            setTotalPages(Math.ceil((res.data.totalArticles || 10) / 10));
        } catch (err) { console.error('Failed to fetch news:', err); setArticles([]); }
        finally { setLoading(false); }
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
