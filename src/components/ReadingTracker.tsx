import { useState, useEffect } from 'react';
import { Plus, BookOpen, Trash2, TrendingUp, Search, Library, ExternalLink, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionSection } from './ui/MotionSection';
import { AnimatedCard } from './ui/AnimatedCard';
import { GradientButton } from './ui/GradientButton';
import { cn } from '../lib/utils';

interface Book {
  id: string;
  title: string;
  author: string;
  totalPages: number;
  currentPage: number;
  status: 'reading' | 'completed' | 'planned';
  startedAt?: string;
  completedAt?: string;
  coverUrl?: string;
  description?: string;
  isbn?: string;
  previewLink?: string;
}

interface GoogleBook {
  id: string;
  volumeInfo: {
    title: string;
    authors?: string[];
    pageCount?: number;
    description?: string;
    imageLinks?: {
      thumbnail?: string;
      smallThumbnail?: string;
    };
    industryIdentifiers?: Array<{
      type: string;
      identifier: string;
    }>;
    previewLink?: string;
    averageRating?: number;
    ratingsCount?: number;
  };
}

export function ReadingTracker() {
  const [books, setBooks] = useState<Book[]>([]);
  const [activeTab, setActiveTab] = useState<'my-books' | 'discover'>('my-books');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newBook, setNewBook] = useState({
    title: '',
    author: '',
    totalPages: '',
    status: 'reading' as 'reading' | 'completed' | 'planned',
  });

  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<GoogleBook[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useEffect(() => {
    const savedBooks = localStorage.getItem('tooproductive_books');
    if (savedBooks) {
      setBooks(JSON.parse(savedBooks));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('tooproductive_books', JSON.stringify(books));
  }, [books]);

  const searchBooks = async () => {
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setHasSearched(true);

    try {
      const response = await fetch(
        `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(searchQuery)}&maxResults=20`
      );
      const data = await response.json();
      setSearchResults(data.items || []);
    } catch (error) {
      console.error('Error searching books:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const addBookFromSearch = (googleBook: GoogleBook) => {
    const volumeInfo = googleBook.volumeInfo;
    const book: Book = {
      id: Date.now().toString(),
      title: volumeInfo.title,
      author: volumeInfo.authors?.join(', ') || 'Unknown Author',
      totalPages: volumeInfo.pageCount || 0,
      currentPage: 0,
      status: 'planned',
      coverUrl: volumeInfo.imageLinks?.thumbnail?.replace('http://', 'https://'),
      description: volumeInfo.description,
      isbn: volumeInfo.industryIdentifiers?.[0]?.identifier,
      previewLink: volumeInfo.previewLink,
    };

    setBooks([book, ...books]);
    alert(`"${book.title}" added to your library.`);
  };

  const addBook = () => {
    if (!newBook.title || !newBook.author || !newBook.totalPages) return;

    const book: Book = {
      id: Date.now().toString(),
      title: newBook.title,
      author: newBook.author,
      totalPages: parseInt(newBook.totalPages),
      currentPage: newBook.status === 'completed' ? parseInt(newBook.totalPages) : 0,
      status: newBook.status,
      startedAt: newBook.status === 'reading' ? new Date().toISOString() : undefined,
      completedAt: newBook.status === 'completed' ? new Date().toISOString() : undefined,
    };

    setBooks([book, ...books]);
    setNewBook({ title: '', author: '', totalPages: '', status: 'reading' });
    setShowAddForm(false);
  };

  const updateProgress = (id: string, newPage: number) => {
    setBooks(books.map(book => {
      if (book.id === id) {
        const updatedBook = { ...book, currentPage: Math.min(newPage, book.totalPages) };
        if (updatedBook.currentPage >= updatedBook.totalPages && book.status !== 'completed') {
          updatedBook.status = 'completed';
          updatedBook.completedAt = new Date().toISOString();
        }
        return updatedBook;
      }
      return book;
    }));
  };

  const deleteBook = (id: string) => {
    setBooks(books.filter(book => book.id !== id));
  };

  const totalBooksRead = books.filter(b => b.status === 'completed').length;
  const totalPagesRead = books.reduce((sum, b) => sum + b.currentPage, 0);
  const currentlyReading = books.filter(b => b.status === 'reading').length;

  const statusData = [
    { name: 'Reading', value: books.filter(b => b.status === 'reading').length, color: '#00e5ff' },
    { name: 'Completed', value: books.filter(b => b.status === 'completed').length, color: '#10b981' },
    { name: 'Planned', value: books.filter(b => b.status === 'planned').length, color: '#b026ff' },
  ].filter(d => d.value > 0);

  const statusColors = {
    reading: 'bg-brand-cyan/20 text-brand-cyan border-brand-cyan/30',
    completed: 'bg-green-500/20 text-green-400 border-green-500/30',
    planned: 'bg-brand-purple/20 text-brand-purple border-brand-purple/30',
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-6xl mx-auto">
      <MotionSection delay={0.1}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary inline-block">
              Knowledge <span className="text-gradient-brand">Library</span>
            </h1>
            <p className="text-text-muted text-lg">Your cognitive expansion log.</p>
          </div>
          {activeTab === 'my-books' && (
            <GradientButton onClick={() => setShowAddForm(!showAddForm)}>
              <Plus className="w-5 h-5" /> Ingest Data
            </GradientButton>
          )}
        </div>
      </MotionSection>

      {/* Tab Navigation */}
      <MotionSection delay={0.2}>
        <div className="flex p-1 bg-bg-tertiary backdrop-blur-md rounded-xl w-max border border-border-subtle relative">
          <button
            onClick={() => setActiveTab('my-books')}
            className={cn(
              "px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all relative z-10",
              activeTab === 'my-books' ? "text-text-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            {activeTab === 'my-books' && (
              <motion.div layoutId="readingTabs" className="absolute inset-0 bg-bg-elevated rounded-lg" />
            )}
            <BookOpen className="w-4 h-4" /> Nexus
          </button>
          <button
            onClick={() => setActiveTab('discover')}
            className={cn(
              "px-6 py-2.5 rounded-lg flex items-center gap-2 font-medium transition-all relative z-10",
              activeTab === 'discover' ? "text-text-primary" : "text-text-muted hover:text-text-primary"
            )}
          >
            {activeTab === 'discover' && (
              <motion.div layoutId="readingTabs" className="absolute inset-0 bg-bg-elevated rounded-lg" />
            )}
            <Library className="w-4 h-4" /> Discovery Protocol
          </button>
        </div>
      </MotionSection>

      <AnimatePresence mode="wait">
        {activeTab === 'my-books' ? (
          <motion.div
            key="my-books"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Volumes Digested", val: totalBooksRead, icon: BookOpen, color: "text-green-400" },
                { title: "Active Processing", val: currentlyReading, icon: TrendingUp, color: "text-brand-cyan" },
                { title: "Total Pages Integrated", val: totalPagesRead, icon: Star, color: "text-brand-purple" }
              ].map((stat, i) => (
                <AnimatedCard key={i} className="flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="p-3 bg-bg-tertiary rounded-xl border border-border-subtle">
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                    <span className="text-text-muted font-medium">{stat.title}</span>
                  </div>
                  <div className="text-4xl font-bold text-text-primary">{stat.val}</div>
                </AnimatedCard>
              ))}
            </div>

            {/* Add Book Form */}
            <AnimatePresence>
              {showAddForm && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="glass-panel p-6 rounded-2xl border border-border-subtle space-y-4 mb-6">
                    <h3 className="text-xl font-bold text-text-primary mb-2">Manual Data Entry</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        value={newBook.title}
                        onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                        placeholder="Artifact Title"
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                      />
                      <input
                        type="text"
                        value={newBook.author}
                        onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                        placeholder="Creator"
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                      />
                      <input
                        type="number"
                        value={newBook.totalPages}
                        onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
                        placeholder="Total Pages"
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                      />
                      <select
                        value={newBook.status}
                        onChange={(e) => setNewBook({ ...newBook, status: e.target.value as any })}
                        className="w-full px-5 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-purple/50"
                      >
                        <option value="reading">Active Reading</option>
                        <option value="completed">Completed</option>
                        <option value="planned">Queued</option>
                      </select>
                    </div>
                    <div className="flex gap-4 pt-2">
                      <GradientButton onClick={addBook} className="w-full md:w-auto">
                        Ingest Data
                      </GradientButton>
                      <button onClick={() => setShowAddForm(false)} className="px-6 py-3 text-text-muted hover:text-text-primary transition-colors font-medium">
                        Cancel
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Books List */}
              <div className="lg:col-span-2 space-y-4">
                {books.length === 0 ? (
                  <div className="glass-panel rounded-2xl p-16 text-center border border-border-subtle">
                    <BookOpen className="w-20 h-20 text-brand-purple/40 mx-auto mb-6" />
                    <p className="text-text-muted text-lg font-medium">Library empty. Initiate discovery or enter data manually.</p>
                  </div>
                ) : (
                  books.map((book, index) => {
                    const progress = book.totalPages > 0 ? (book.currentPage / book.totalPages) * 100 : 0;
                    return (
                      <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        key={book.id}
                        className="glass-panel rounded-2xl p-6 border border-border-subtle flex gap-6 group hover:border-brand-purple/30 transition-colors"
                      >
                        {book.coverUrl ? (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-24 h-36 object-cover rounded-xl shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:scale-105 transition-transform"
                          />
                        ) : (
                          <div className="w-24 h-36 bg-bg-tertiary border border-border-subtle rounded-xl flex items-center justify-center group-hover:bg-bg-elevated transition-colors shadow-inner">
                            <BookOpen className="w-8 h-8 text-text-muted" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-xl font-bold text-text-primary mb-1 truncate pr-4">{book.title}</h3>
                              <p className="text-text-muted font-medium tracking-wide text-sm">by {book.author}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className={cn("text-xs px-3 py-1 rounded-full border backdrop-blur-sm font-medium tracking-wide uppercase", statusColors[book.status])}>
                                {book.status}
                              </span>
                              <button onClick={() => deleteBook(book.id)} className="p-2 text-text-muted hover:text-brand-pink hover:bg-brand-pink/10 rounded-xl transition-all opacity-0 flex-shrink-0 group-hover:opacity-100">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {book.description && (
                            <p className="text-sm text-text-muted line-clamp-2 mt-2 mb-4 pr-12">
                              {book.description.replace(/<[^>]*>/g, '')}
                            </p>
                          )}

                          {book.status !== 'planned' && (
                            <div className="mt-auto">
                              <div className="flex items-center justify-between text-xs text-brand-cyan mb-2 font-medium tracking-wide">
                                <span>Integration Progress</span>
                                <span>{book.currentPage} / {book.totalPages} Pages</span>
                              </div>
                              <div className="w-full bg-bg-tertiary border border-border-subtle rounded-full h-2 mb-4 overflow-hidden relative p-0.5">
                                <div
                                  className="bg-gradient-to-r from-brand-cyan to-brand-purple h-full rounded-full relative"
                                  style={{ width: `${progress}%` }}
                                >
                                  <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
                                </div>
                              </div>

                              {book.status === 'reading' && (
                                <div className="flex gap-3">
                                  <input
                                    type="number"
                                    min="0"
                                    max={book.totalPages}
                                    value={book.currentPage}
                                    onChange={(e) => updateProgress(book.id, parseInt(e.target.value) || 0)}
                                    className="w-24 px-3 py-1.5 bg-bg-tertiary border border-border-subtle text-text-primary rounded-lg focus:outline-none focus:border-brand-cyan text-sm text-center"
                                  />
                                  <button
                                    onClick={() => updateProgress(book.id, book.totalPages)}
                                    className="px-4 py-1.5 bg-brand-cyan/20 text-brand-cyan border border-brand-cyan/30 rounded-lg hover:bg-brand-cyan hover:text-black transition-colors text-sm font-medium"
                                  >
                                    Mark 100%
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>

              {/* Chart */}
              {statusData.length > 0 && (
                <div className="lg:col-span-1 h-full">
                  <AnimatedCard tilt={false} className="border border-border-subtle h-[400px]">
                    <h3 className="text-xl font-bold text-text-primary mb-6">Library Telemetry</h3>
                    <ResponsiveContainer width="100%" height="80%">
                      <PieChart>
                        <Pie
                          data={statusData}
                          cx="50%"
                          cy="50%"
                          innerRadius={70}
                          outerRadius={90}
                          paddingAngle={5}
                          dataKey="value"
                          stroke="none"
                        >
                          {statusData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'rgba(17, 17, 26, 0.9)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(255,255,255,0.1)',
                            borderRadius: '12px',
                            color: 'white'
                          }}
                        />
                        <Legend wrapperStyle={{ paddingTop: '20px' }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </AnimatedCard>
                </div>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="discover"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Search Bar */}
            <div className="glass-panel rounded-2xl p-8 border border-border-subtle">
              <h3 className="text-2xl font-bold text-text-primary mb-6">Global Search Query</h3>
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative group">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted group-focus-within:text-brand-cyan transition-colors" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
                    placeholder="Search nexus by title, author, or ISBN..."
                    className="w-full pl-12 pr-6 py-4 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50 focus:border-transparent transition-all backdrop-blur-md text-lg"
                  />
                </div>
                <GradientButton onClick={searchBooks} disabled={isSearching} className="md:w-48 py-4 px-8 text-lg">
                  {isSearching ? 'Scanning...' : 'Search'}
                </GradientButton>
              </div>
            </div>

            {/* Results Grid */}
            <AnimatePresence>
              {isSearching && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="text-center py-20"
                >
                  <div className="w-16 h-16 border-4 border-brand-cyan/20 border-t-brand-cyan rounded-full mx-auto mb-6 animate-spin shadow-[0_0_30px_rgba(0,229,255,0.3)]" />
                  <p className="text-text-muted font-medium tracking-wide">Interfacing with global network...</p>
                </motion.div>
              )}

              {!isSearching && hasSearched && searchResults.length === 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                  className="glass-panel flex flex-col items-center justify-center p-20 rounded-2xl border border-border-subtle"
                >
                  <Search className="w-16 h-16 text-text-secondary mb-6" />
                  <p className="text-text-muted font-medium text-lg">Null results. Adjust search parameters.</p>
                </motion.div>
              )}

              {!isSearching && searchResults.length > 0 && (
                <motion.div
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                >
                  {searchResults.map((googleBook, index) => {
                    const volumeInfo = googleBook.volumeInfo;
                    const isAlreadyAdded = books.some(
                      b => b.title === volumeInfo.title && b.author === volumeInfo.authors?.join(', ')
                    );

                    return (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: index * 0.05 }}
                        key={googleBook.id}
                        className="glass-panel rounded-2xl p-6 border border-border-subtle flex flex-col hover:border-brand-purple/30 transition-colors"
                      >
                        <div className="flex gap-4 mb-4">
                          {volumeInfo.imageLinks?.thumbnail ? (
                            <img
                              src={volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')}
                              alt={volumeInfo.title}
                              className="w-20 h-28 object-cover rounded-lg shadow-lg"
                            />
                          ) : (
                            <div className="w-20 h-28 bg-bg-tertiary border border-border-subtle rounded-lg flex items-center justify-center">
                              <BookOpen className="w-6 h-6 text-text-muted" />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <h4 className="text-text-primary font-bold line-clamp-2 mb-1">{volumeInfo.title}</h4>
                            <p className="text-sm text-text-muted line-clamp-2">
                              {volumeInfo.authors?.join(', ') || 'Unknown Author'}
                            </p>
                            {volumeInfo.pageCount && (
                              <p className="text-xs text-brand-cyan/80 mt-2 font-medium">{volumeInfo.pageCount} pages</p>
                            )}
                          </div>
                        </div>

                        {volumeInfo.description && (
                          <p className="text-sm text-text-muted line-clamp-3 mb-6 flex-1">
                            {volumeInfo.description.replace(/<[^>]*>/g, '')}
                          </p>
                        )}

                        <div className="mt-auto flex gap-3">
                          <GradientButton
                            variant={isAlreadyAdded ? "secondary" : "primary"}
                            onClick={() => !isAlreadyAdded && addBookFromSearch(googleBook)}
                            className={cn("flex-1 py-2 text-sm", isAlreadyAdded && "opacity-50 cursor-not-allowed")}
                          >
                            {isAlreadyAdded ? 'Ingested' : 'Add to Nexus'}
                          </GradientButton>
                          {volumeInfo.previewLink && (
                            <a
                              href={volumeInfo.previewLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-4 py-2 border border-border-subtle text-text-primary rounded-xl hover:bg-bg-elevated transition-colors flex items-center justify-center"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>

            {!hasSearched && (
              <div className="glass-panel rounded-2xl p-16 text-center border border-border-subtle">
                <Library className="w-20 h-20 text-brand-cyan/40 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-text-primary mb-4">Discover External Archives</h3>
                <p className="text-text-muted mb-8 max-w-lg mx-auto">
                  Access the global knowledge graph to import new targets into your local reading pipeline.
                </p>
                <div className="flex flex-wrap gap-3 justify-center">
                  {['Algorithms', 'Cyberpunk', 'Quantum Mechanics', 'Philosophy'].map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setSearchQuery(tag);
                        setTimeout(searchBooks, 100);
                      }}
                      className="px-5 py-2.5 bg-bg-tertiary hover:bg-brand-cyan/20 border border-border-subtle hover:border-brand-cyan/30 hover:text-brand-cyan text-text-muted rounded-full transition-all text-sm font-medium tracking-wide"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

