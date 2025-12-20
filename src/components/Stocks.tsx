import { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Plus, X, RefreshCw, DollarSign, PieChart, BarChart3, Search } from 'lucide-react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Stock {
  id: string;
  symbol: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  lastUpdated?: string;
}

interface StockData {
  price: number;
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume: number;
  previousClose: number;
  open: number;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

export function Stocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  
  // Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState<SearchResult | null>(null);
  const [selectedStockData, setSelectedStockData] = useState<StockData | null>(null);
  const [loadingStockData, setLoadingStockData] = useState(false);

  // Form states
  const [symbol, setSymbol] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const savedStocks = localStorage.getItem('stocks');
    const savedApiKey = localStorage.getItem('stockApiKey');
    if (savedStocks) {
      setStocks(JSON.parse(savedStocks));
    }
    if (savedApiKey) {
      setApiKey(savedApiKey);
    } else {
      setShowApiKeyInput(true);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('stocks', JSON.stringify(stocks));
  }, [stocks]);

  const saveApiKey = () => {
    localStorage.setItem('stockApiKey', apiKey);
    setShowApiKeyInput(false);
  };

  const fetchStockData = async (stockSymbol: string): Promise<StockData | null> => {
    try {
      // Using Alpha Vantage API - Free tier allows 25 requests per day
      const response = await fetch(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${stockSymbol}&apikey=${apiKey}`
      );
      const data = await response.json();
      
      // Check for API errors
      if (data['Error Message']) {
        console.error('API Error:', data['Error Message']);
        alert(`Invalid stock symbol: ${stockSymbol}`);
        return null;
      }

      if (data['Note']) {
        console.error('API Rate Limit:', data['Note']);
        alert('API rate limit reached. Please wait a minute and try again.');
        return null;
      }
      
      if (data['Global Quote'] && Object.keys(data['Global Quote']).length > 0) {
        const quote = data['Global Quote'];
        
        // Safely parse the values with fallbacks
        const price = parseFloat(quote['05. price']) || 0;
        const change = parseFloat(quote['09. change']) || 0;
        const changePercentStr = quote['10. change percent'] || '0%';
        const changePercent = parseFloat(changePercentStr.replace('%', '')) || 0;
        const high = parseFloat(quote['03. high']) || price;
        const low = parseFloat(quote['04. low']) || price;
        const volume = parseInt(quote['06. volume']) || 0;
        const previousClose = parseFloat(quote['08. previous close']) || price;
        const open = parseFloat(quote['02. open']) || price;

        return {
          price,
          change,
          changePercent,
          high,
          low,
          volume,
          previousClose,
          open
        };
      }
      
      console.error('No data returned for symbol:', stockSymbol);
      alert(`No data found for symbol: ${stockSymbol}. Please check the symbol and try again.`);
      return null;
    } catch (error) {
      console.error('Error fetching stock data:', error);
      alert('Error fetching stock data. Please check your internet connection and API key.');
      return null;
    }
  };

  const refreshAllStocks = async () => {
    if (!apiKey) {
      alert('Please set your Alpha Vantage API key first');
      setShowApiKeyInput(true);
      return;
    }

    setLoading(true);
    const updatedStocks = [...stocks];
    
    for (let i = 0; i < updatedStocks.length; i++) {
      const stockData = await fetchStockData(updatedStocks[i].symbol);
      if (stockData) {
        updatedStocks[i].currentPrice = stockData.price;
        updatedStocks[i].change = stockData.change;
        updatedStocks[i].changePercent = stockData.changePercent;
        updatedStocks[i].lastUpdated = new Date().toISOString();
      }
      // Add delay to respect API rate limits
      if (i < updatedStocks.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 15000)); // 15 second delay between requests
      }
    }
    
    setStocks(updatedStocks);
    setLoading(false);
  };

  const addStock = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!apiKey) {
      alert('Please set your Alpha Vantage API key first');
      setShowApiKeyInput(true);
      return;
    }

    setLoading(true);
    
    const stockData = await fetchStockData(symbol.toUpperCase());
    
    const newStock: Stock = {
      id: Date.now().toString(),
      symbol: symbol.toUpperCase(),
      quantity: parseFloat(quantity),
      purchasePrice: parseFloat(purchasePrice),
      purchaseDate,
      currentPrice: stockData?.price,
      change: stockData?.change,
      changePercent: stockData?.changePercent,
      lastUpdated: new Date().toISOString()
    };

    setStocks([...stocks, newStock]);
    setShowAddModal(false);
    setSymbol('');
    setQuantity('');
    setPurchasePrice('');
    setPurchaseDate(new Date().toISOString().split('T')[0]);
    setLoading(false);
  };

  const removeStock = (id: string) => {
    setStocks(stocks.filter(s => s.id !== id));
  };

  const calculatePortfolio = () => {
    let totalInvested = 0;
    let currentValue = 0;
    
    stocks.forEach(stock => {
      totalInvested += stock.quantity * stock.purchasePrice;
      currentValue += stock.quantity * (stock.currentPrice || stock.purchasePrice);
    });

    const totalProfit = currentValue - totalInvested;
    const totalProfitPercent = totalInvested > 0 ? (totalProfit / totalInvested) * 100 : 0;

    return {
      totalInvested,
      currentValue,
      totalProfit,
      totalProfitPercent
    };
  };

  const portfolio = calculatePortfolio();

  const searchStocks = async () => {
    if (!apiKey) {
      alert('Please set your Alpha Vantage API key first');
      setShowApiKeyInput(true);
      return;
    }

    setSearching(true);
    setSearchResults([]);
    
    try {
      // Using Alpha Vantage API - Free tier allows 25 requests per day
      const response = await fetch(
        `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${searchQuery}&apikey=${apiKey}`
      );
      const data = await response.json();
      
      // Check for API errors
      if (data['Error Message']) {
        console.error('API Error:', data['Error Message']);
        alert(`Invalid search query: ${searchQuery}`);
        setSearching(false);
        return;
      }

      if (data['Note']) {
        console.error('API Rate Limit:', data['Note']);
        alert('API rate limit reached. Please wait a minute and try again.');
        setSearching(false);
        return;
      }
      
      if (data['bestMatches'] && data['bestMatches'].length > 0) {
        const results: SearchResult[] = data['bestMatches'].map((match: any) => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region'],
          currency: match['8. currency']
        }));
        
        setSearchResults(results);
        setSearching(false);
      }
      
      console.error('No data returned for query:', searchQuery);
      alert(`No data found for query: ${searchQuery}. Please check the query and try again.`);
      setSearching(false);
    } catch (error) {
      console.error('Error fetching search results:', error);
      alert('Error fetching search results. Please check your internet connection and API key.');
      setSearching(false);
    }
  };

  const selectStock = async (stock: SearchResult) => {
    setSelectedStock(stock);
    setLoadingStockData(true);
    
    const stockData = await fetchStockData(stock.symbol);
    setSelectedStockData(stockData);
    setLoadingStockData(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-gray-900">Stock Portfolio</h1>
          <p className="text-sm text-gray-600 mt-1">Track your investments in real-time</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSearchModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm flex items-center gap-2"
          >
            <Search className="w-4 h-4" />
            Search Stocks
          </button>
          <button
            onClick={() => setShowApiKeyInput(true)}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
          >
            API Key
          </button>
          <button
            onClick={refreshAllStocks}
            disabled={loading}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Stock
          </button>
        </div>
      </div>

      {/* API Key Input Modal */}
      {showApiKeyInput && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900">Alpha Vantage API Key</h3>
              <button onClick={() => setShowApiKeyInput(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Get your free API key from{' '}
              <a href="https://www.alphavantage.co/support/#api-key" target="_blank" rel="noopener noreferrer" className="text-black underline">
                Alpha Vantage
              </a>
              {' '}(25 requests/day free tier)
            </p>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="Enter your API key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm mb-4"
            />
            <button
              onClick={saveApiKey}
              className="w-full py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm"
            >
              Save API Key
            </button>
          </div>
        </div>
      )}

      {/* Portfolio Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-sm text-gray-600">Total Invested</div>
          </div>
          <div className="text-2xl text-gray-900">${portfolio.totalInvested.toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-green-50 rounded-lg flex items-center justify-center">
              <PieChart className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-sm text-gray-600">Current Value</div>
          </div>
          <div className="text-2xl text-gray-900">${portfolio.currentValue.toFixed(2)}</div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              portfolio.totalProfit >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              {portfolio.totalProfit >= 0 ? (
                <TrendingUp className="w-5 h-5 text-green-600" />
              ) : (
                <TrendingDown className="w-5 h-5 text-red-600" />
              )}
            </div>
            <div className="text-sm text-gray-600">Total P&L</div>
          </div>
          <div className={`text-2xl ${portfolio.totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolio.totalProfit >= 0 ? '+' : ''}{portfolio.totalProfit.toFixed(2)}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              portfolio.totalProfitPercent >= 0 ? 'bg-green-50' : 'bg-red-50'
            }`}>
              <BarChart3 className={`w-5 h-5 ${portfolio.totalProfitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="text-sm text-gray-600">Returns</div>
          </div>
          <div className={`text-2xl ${portfolio.totalProfitPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {portfolio.totalProfitPercent >= 0 ? '+' : ''}{portfolio.totalProfitPercent.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Stocks List */}
      <div className="space-y-4">
        {stocks.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-gray-900 mb-2">No stocks yet</h3>
            <p className="text-sm text-gray-600 mb-6">Start building your portfolio by adding your first stock</p>
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm inline-flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Your First Stock
            </button>
          </div>
        ) : (
          stocks.map(stock => {
            const invested = stock.quantity * stock.purchasePrice;
            const current = stock.quantity * (stock.currentPrice || stock.purchasePrice);
            const profit = current - invested;
            const profitPercent = (profit / invested) * 100;

            return (
              <div key={stock.id} className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900">{stock.symbol}</h3>
                      {stock.currentPrice && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          (stock.changePercent || 0) >= 0 
                            ? 'bg-green-50 text-green-700' 
                            : 'bg-red-50 text-red-700'
                        }`}>
                          {(stock.changePercent || 0) >= 0 ? '+' : ''}{stock.changePercent?.toFixed(2)}%
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-gray-600">
                      {stock.quantity} shares • Bought at ${stock.purchasePrice.toFixed(2)} on {new Date(stock.purchaseDate).toLocaleDateString()}
                    </div>
                  </div>
                  <button
                    onClick={() => removeStock(stock.id)}
                    className="text-gray-400 hover:text-red-600 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Current Price</div>
                    <div className="text-gray-900">
                      ${(stock.currentPrice || stock.purchasePrice).toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Invested</div>
                    <div className="text-gray-900">${invested.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Current Value</div>
                    <div className="text-gray-900">${current.toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Profit/Loss</div>
                    <div className={profit >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {profit >= 0 ? '+' : ''}${profit.toFixed(2)}
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-gray-500 mb-1">Returns</div>
                    <div className={profitPercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                      {profitPercent >= 0 ? '+' : ''}{profitPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>

                {stock.lastUpdated && (
                  <div className="text-xs text-gray-500">
                    Last updated: {new Date(stock.lastUpdated).toLocaleString()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Add Stock Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Add New Stock</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={addStock} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Stock Symbol</label>
                <input
                  type="text"
                  value={symbol}
                  onChange={(e) => setSymbol(e.target.value)}
                  placeholder="e.g., AAPL, GOOGL, MSFT"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Quantity (Shares)</label>
                <input
                  type="number"
                  step="0.01"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="10"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Purchase Price (per share)</label>
                <input
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder="150.00"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Purchase Date</label>
                <input
                  type="date"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Stock'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Search Stock Modal */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-gray-900">Search for a Stock</h3>
              <button onClick={() => setShowSearchModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm text-gray-700 mb-1.5">Search Query</label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="e.g., Apple, Google, Microsoft"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowSearchModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={searchStocks}
                  disabled={searching}
                  className="flex-1 px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-sm disabled:opacity-50"
                >
                  {searching ? 'Searching...' : 'Search'}
                </button>
              </div>
            </div>

            {searchResults.length > 0 && (
              <div className="mt-4">
                <h4 className="text-gray-900 mb-2">Search Results</h4>
                <ul className="space-y-2">
                  {searchResults.map(result => (
                    <li key={result.symbol} className="bg-gray-50 p-2 rounded-md cursor-pointer hover:bg-gray-100" onClick={() => selectStock(result)}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-gray-900">{result.name}</h5>
                          <p className="text-sm text-gray-600">{result.symbol} • {result.region} • {result.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">{result.type}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {selectedStock && (
              <div className="mt-4">
                <h4 className="text-gray-900 mb-2">Selected Stock</h4>
                <div className="bg-gray-50 p-2 rounded-md">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-gray-900">{selectedStock.name}</h5>
                      <p className="text-sm text-gray-600">{selectedStock.symbol} • {selectedStock.region} • {selectedStock.currency}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">{selectedStock.type}</p>
                    </div>
                  </div>
                </div>

                {selectedStockData && (
                  <div className="mt-4">
                    <h4 className="text-gray-900 mb-2">Stock Data</h4>
                    <div className="bg-gray-50 p-2 rounded-md">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Current Price</div>
                          <div className="text-gray-900">
                            ${selectedStockData.price.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Open Price</div>
                          <div className="text-gray-900">
                            ${selectedStockData.open.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">High Price</div>
                          <div className="text-gray-900">
                            ${selectedStockData.high.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Low Price</div>
                          <div className="text-gray-900">
                            ${selectedStockData.low.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Previous Close</div>
                          <div className="text-gray-900">
                            ${selectedStockData.previousClose.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Volume</div>
                          <div className="text-gray-900">
                            {selectedStockData.volume.toLocaleString()}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Change</div>
                          <div className={selectedStockData.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {selectedStockData.change >= 0 ? '+' : ''}${selectedStockData.change.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 mb-1">Change Percent</div>
                          <div className={selectedStockData.changePercent >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {selectedStockData.changePercent >= 0 ? '+' : ''}{selectedStockData.changePercent.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}