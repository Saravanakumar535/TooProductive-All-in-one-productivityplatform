import { useState, useEffect } from 'react';
import { Plus, BookOpen, Trash2, TrendingUp, Search, Library, ExternalLink, Star } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

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

  // Discovery/Search state
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
      // Using Google Books API (no API key required for basic usage)
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
    
    // Show success message (you could add a toast notification here)
    alert(`"${book.title}" has been added to your reading list!`);
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
    { name: 'Reading', value: books.filter(b => b.status === 'reading').length, color: '#3b82f6' },
    { name: 'Completed', value: books.filter(b => b.status === 'completed').length, color: '#10b981' },
    { name: 'Planned', value: books.filter(b => b.status === 'planned').length, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  const statusColors = {
    reading: 'bg-blue-100 text-blue-700 border-blue-300',
    completed: 'bg-green-100 text-green-700 border-green-300',
    planned: 'bg-purple-100 text-purple-700 border-purple-300',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-slate-900 mb-2">Reading Hub</h1>
          <p className="text-slate-600">Discover books and track your reading journey</p>
        </div>
        {activeTab === 'my-books' && (
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Book
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-2">
        <button
          onClick={() => setActiveTab('my-books')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'my-books'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          My Books
        </button>
        <button
          onClick={() => setActiveTab('discover')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors ${
            activeTab === 'discover'
              ? 'bg-gradient-to-r from-purple-600 to-blue-600 text-white'
              : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Library className="w-4 h-4" />
          Discover Books
        </button>
      </div>

      {/* My Books Tab */}
      {activeTab === 'my-books' && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-green-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-slate-600">Books Completed</span>
              </div>
              <div className="text-slate-900">{totalBooksRead}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-slate-600">Currently Reading</span>
              </div>
              <div className="text-slate-900">{currentlyReading}</div>
            </div>
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BookOpen className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-slate-600">Total Pages Read</span>
              </div>
              <div className="text-slate-900">{totalPagesRead}</div>
            </div>
          </div>

          {/* Add Book Form */}
          {showAddForm && (
            <div className="bg-white rounded-xl p-6 shadow-sm">
              <h3 className="text-slate-900 mb-4">Add New Book Manually</h3>
              <div className="space-y-3">
                <input
                  type="text"
                  value={newBook.title}
                  onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
                  placeholder="Book Title"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <input
                  type="text"
                  value={newBook.author}
                  onChange={(e) => setNewBook({ ...newBook, author: e.target.value })}
                  placeholder="Author"
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
                <div className="flex gap-3">
                  <input
                    type="number"
                    value={newBook.totalPages}
                    onChange={(e) => setNewBook({ ...newBook, totalPages: e.target.value })}
                    placeholder="Total Pages"
                    className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                  <select
                    value={newBook.status}
                    onChange={(e) => setNewBook({ ...newBook, status: e.target.value as any })}
                    className="px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                  >
                    <option value="reading">Reading</option>
                    <option value="completed">Completed</option>
                    <option value="planned">Planned</option>
                  </select>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={addBook}
                    className="flex-1 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all"
                  >
                    Add Book
                  </button>
                  <button
                    onClick={() => setShowAddForm(false)}
                    className="px-6 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Books List */}
            <div className="lg:col-span-2 space-y-3">
              {books.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                  <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                  <p className="text-slate-500">No books yet. Add your first book or discover books in the library!</p>
                </div>
              ) : (
                books.map(book => {
                  const progress = (book.currentPage / book.totalPages) * 100;
                  return (
                    <div key={book.id} className="bg-white rounded-xl p-6 shadow-sm">
                      <div className="flex gap-4">
                        {book.coverUrl && (
                          <img
                            src={book.coverUrl}
                            alt={book.title}
                            className="w-20 h-28 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h3 className="text-slate-900 mb-1">{book.title}</h3>
                              <p className="text-slate-600">by {book.author}</p>
                              {book.description && (
                                <p className="text-sm text-slate-500 mt-2 line-clamp-2">
                                  {book.description.replace(/<[^>]*>/g, '')}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <span className={`text-xs px-3 py-1 rounded-full border ${statusColors[book.status]}`}>
                                {book.status}
                              </span>
                              {book.previewLink && (
                                <a
                                  href={book.previewLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                                  title="Preview on Google Books"
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </a>
                              )}
                              <button
                                onClick={() => deleteBook(book.id)}
                                className="p-2 text-slate-400 hover:text-red-600 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          {book.status !== 'planned' && (
                            <>
                              <div className="mb-3">
                                <div className="flex items-center justify-between text-sm text-slate-600 mb-1">
                                  <span>Progress</span>
                                  <span>{book.currentPage} / {book.totalPages} pages</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                              </div>

                              {book.status === 'reading' && (
                                <div className="flex gap-2">
                                  <input
                                    type="number"
                                    min="0"
                                    max={book.totalPages}
                                    value={book.currentPage}
                                    onChange={(e) => updateProgress(book.id, parseInt(e.target.value) || 0)}
                                    className="flex-1 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                                    placeholder="Current page"
                                  />
                                  <button
                                    onClick={() => updateProgress(book.id, book.totalPages)}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                  >
                                    Mark Complete
                                  </button>
                                </div>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Chart */}
            {statusData.length > 0 && (
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-slate-900 mb-4">Reading Status</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </>
      )}

      {/* Discover Books Tab */}
      {activeTab === 'discover' && (
        <div className="space-y-6">
          {/* Search Bar */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h3 className="text-slate-900 mb-4">Search for Books</h3>
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && searchBooks()}
                  placeholder="Search by title, author, or ISBN..."
                  className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-600"
                />
              </div>
              <button
                onClick={searchBooks}
                disabled={isSearching}
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all flex items-center gap-2 disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            <p className="text-sm text-slate-500 mt-2">
              Powered by Google Books API - Search millions of books worldwide
            </p>
          </div>

          {/* Search Results */}
          {isSearching && (
            <div className="text-center py-12">
              <div className="animate-spin w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full mx-auto mb-4" />
              <p className="text-slate-600">Searching for books...</p>
            </div>
          )}

          {!isSearching && hasSearched && searchResults.length === 0 && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500">No books found. Try a different search query.</p>
            </div>
          )}

          {!isSearching && searchResults.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {searchResults.map((googleBook) => {
                const volumeInfo = googleBook.volumeInfo;
                const isAlreadyAdded = books.some(
                  b => b.title === volumeInfo.title && b.author === volumeInfo.authors?.join(', ')
                );

                return (
                  <div key={googleBook.id} className="bg-white rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex gap-3 mb-3">
                      {volumeInfo.imageLinks?.thumbnail ? (
                        <img
                          src={volumeInfo.imageLinks.thumbnail.replace('http://', 'https://')}
                          alt={volumeInfo.title}
                          className="w-16 h-24 object-cover rounded"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-slate-200 rounded flex items-center justify-center">
                          <BookOpen className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h4 className="text-slate-900 line-clamp-2 mb-1">{volumeInfo.title}</h4>
                        <p className="text-sm text-slate-600 line-clamp-1">
                          {volumeInfo.authors?.join(', ') || 'Unknown Author'}
                        </p>
                        {volumeInfo.pageCount && (
                          <p className="text-xs text-slate-500">{volumeInfo.pageCount} pages</p>
                        )}
                        {volumeInfo.averageRating && (
                          <div className="flex items-center gap-1 mt-1">
                            <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                            <span className="text-xs text-slate-600">
                              {volumeInfo.averageRating} ({volumeInfo.ratingsCount})
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {volumeInfo.description && (
                      <p className="text-sm text-slate-600 line-clamp-3 mb-3">
                        {volumeInfo.description.replace(/<[^>]*>/g, '')}
                      </p>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={() => addBookFromSearch(googleBook)}
                        disabled={isAlreadyAdded}
                        className={`flex-1 py-2 rounded-lg transition-all text-sm ${
                          isAlreadyAdded
                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                            : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                        }`}
                      >
                        {isAlreadyAdded ? 'Already Added' : 'Add to Library'}
                      </button>
                      {volumeInfo.previewLink && (
                        <a
                          href={volumeInfo.previewLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-2 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
                          title="Preview on Google Books"
                        >
                          <ExternalLink className="w-4 h-4 text-slate-600" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!hasSearched && (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm">
              <Library className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-slate-900 mb-2">Discover Your Next Read</h3>
              <p className="text-slate-500 mb-4">
                Search for books by title, author, or ISBN to add them to your reading list
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                <button
                  onClick={() => {
                    setSearchQuery('productivity');
                    setTimeout(searchBooks, 100);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                >
                  Productivity
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('fiction bestsellers');
                    setTimeout(searchBooks, 100);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                >
                  Fiction Bestsellers
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('self improvement');
                    setTimeout(searchBooks, 100);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                >
                  Self Improvement
                </button>
                <button
                  onClick={() => {
                    setSearchQuery('technology');
                    setTimeout(searchBooks, 100);
                  }}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors text-sm"
                >
                  Technology
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
