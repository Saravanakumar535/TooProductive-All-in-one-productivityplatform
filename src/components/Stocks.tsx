import { useState, useEffect, useCallback } from 'react';
import {
  TrendingUp, TrendingDown, Plus, X, RefreshCw,
  PieChart, BarChart3, Bot, Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MotionSection } from './ui/MotionSection';
import { AnimatedCard } from './ui/AnimatedCard';
import { GradientButton } from './ui/GradientButton';
import { cn } from '../lib/utils';
import axios from 'axios';

const BASE = '/api/stocks';

interface Stock {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  purchasePrice: number;
  purchaseDate: string;
  nativeCurrency: string;
  currentPrice?: number;
  change?: number;
  changePercent?: number;
  lastUpdated?: string;
}

interface SearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
}

const rupee = (n: number) =>
  '₹' + n.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export function Stocks() {
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [usdInr, setUsdInr] = useState(84);
  const [loading, setLoading] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // search
  const [sq, setSq] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [picked, setPicked] = useState<SearchResult | null>(null);

  // live quote preview when stock is picked
  const [liveQuote, setLiveQuote] = useState<{ price: number; change: number; changePercent: number; high: number; low: number; volume: number; currency: string } | null>(null);
  const [fetchingQuote, setFetchingQuote] = useState(false);

  // form
  const [qty, setQty] = useState('');
  const [buyPrice, setBuyPrice] = useState('');
  const [buyDate, setBuyDate] = useState(new Date().toISOString().split('T')[0]);

  // ai
  const [aiLoading, setAiLoading] = useState<string | null>(null);
  const [aiResult, setAiResult] = useState<{ symbol: string; text: string } | null>(null);

  useEffect(() => {
    const s = localStorage.getItem('stocks_inr');
    if (s) setStocks(JSON.parse(s));
  }, []);

  useEffect(() => {
    axios.get(`${BASE}/rate/usd-inr`).then(r => setUsdInr(r.data.rate)).catch(() => { });
  }, []);

  useEffect(() => {
    localStorage.setItem('stocks_inr', JSON.stringify(stocks));
  }, [stocks]);

  useEffect(() => {
    if (sq.length < 1) { setResults([]); return; }
    const t = setTimeout(async () => {
      setSearching(true);
      try {
        const r = await axios.get(`${BASE}/search/${encodeURIComponent(sq)}`);
        setResults(r.data);
      } catch { /* */ }
      setSearching(false);
    }, 350);
    return () => clearTimeout(t);
  }, [sq]);

  const toInr = useCallback((price: number, cur: string) => cur === 'INR' ? price : price * usdInr, [usdInr]);

  const refreshAll = async () => {
    if (!stocks.length) return;
    setLoading(true);
    const updated = [...stocks];
    for (let i = 0; i < updated.length; i++) {
      try {
        const { data } = await axios.get(`${BASE}/quote/${updated[i].symbol}`);
        updated[i] = {
          ...updated[i],
          currentPrice: toInr(data.price, data.currency || updated[i].nativeCurrency),
          change: toInr(data.change, data.currency || updated[i].nativeCurrency),
          changePercent: data.changePercent,
          nativeCurrency: data.currency || updated[i].nativeCurrency,
          lastUpdated: new Date().toISOString(),
        };
      } catch { /* skip */ }
      if (i < updated.length - 1) await new Promise(r => setTimeout(r, 500));
    }
    setStocks(updated);
    setLastSynced(new Date());
    setLoading(false);
  };

  const addStock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!picked) return;
    setLoading(true);
    let curPrice = parseFloat(buyPrice);
    let chg = 0, chgPct = 0, cur = 'INR';
    try {
      const { data } = await axios.get(`${BASE}/quote/${picked.symbol}`);
      cur = data.currency || 'INR';
      curPrice = toInr(data.price, cur);
      chg = toInr(data.change, cur);
      chgPct = data.changePercent;
    } catch { /* use buy price */ }

    setStocks(prev => [{
      id: Date.now().toString(),
      symbol: picked.symbol,
      name: picked.name,
      quantity: parseFloat(qty),
      purchasePrice: parseFloat(buyPrice),
      purchaseDate: buyDate,
      nativeCurrency: cur,
      currentPrice: curPrice,
      change: chg,
      changePercent: chgPct,
      lastUpdated: new Date().toISOString(),
    }, ...prev]);
    setLastSynced(new Date());
    closeForm();
    setLoading(false);
  };

  // fetch live quote when a stock is picked
  const pickStock = async (r: SearchResult) => {
    setPicked(r);
    setSq(r.symbol);
    setResults([]);
    setLiveQuote(null);
    setFetchingQuote(true);
    try {
      const { data } = await axios.get(`${BASE}/quote/${r.symbol}`);
      const cur = data.currency || 'INR';
      setLiveQuote({
        price: toInr(data.price, cur),
        change: toInr(data.change, cur),
        changePercent: data.changePercent,
        high: toInr(data.high, cur),
        low: toInr(data.low, cur),
        volume: data.volume,
        currency: cur,
      });
    } catch { /* skip */ }
    setFetchingQuote(false);
  };

  const closeForm = () => {
    setShowAdd(false); setPicked(null); setSq(''); setResults([]);
    setQty(''); setBuyPrice(''); setBuyDate(new Date().toISOString().split('T')[0]);
    setLiveQuote(null); setFetchingQuote(false);
  };

  const removeStock = (id: string) => setStocks(prev => prev.filter(s => s.id !== id));

  // portfolio stats
  let totalInvested = 0, totalCurrent = 0;
  stocks.forEach(s => {
    totalInvested += s.quantity * s.purchasePrice;
    totalCurrent += s.quantity * (s.currentPrice ?? s.purchasePrice);
  });
  const totalPnl = totalCurrent - totalInvested;
  const totalPnlPct = totalInvested > 0 ? (totalPnl / totalInvested) * 100 : 0;

  const doAI = (s: Stock) => {
    setAiLoading(s.symbol);
    setTimeout(() => {
      const p = s.currentPrice ?? s.purchasePrice;
      const c = s.changePercent ?? 0;
      const trend = c > 2 ? 'bullish momentum' : c < -2 ? 'selling pressure' : 'consolidation';
      const rating = c > 5 ? 'OVEREXTENDED' : c < -5 ? 'OVERSOLD — BUY' : c > 0 ? 'ACCUMULATE' : 'HOLD';
      setAiResult({ symbol: s.symbol, text: `AI Analysis for **${s.symbol}**:\n\nAsset at ${rupee(p)} showing ${trend}.\n\nRating: **${rating}**\n\n(Simulation only)` });
      setAiLoading(null);
    }, 1200);
  };

  return (
    <div className="space-y-8 pb-12 w-full max-w-6xl mx-auto">
      {/* Header */}
      <MotionSection delay={0.1}>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-bold tracking-tight text-text-primary">
              Market <span className="text-gradient-brand">Terminal</span>
            </h1>
            <p className="text-text-muted text-lg">
              Portfolio tracker in ₹ Indian Rupees
              <span className="ml-2 text-xs text-text-secondary bg-bg-tertiary border border-border-subtle px-2 py-0.5 rounded-full">
                USD/INR ≈ ₹{usdInr.toFixed(2)}
              </span>
            </p>
          </div>
          <div className="flex flex-wrap gap-3 items-center">
            {lastSynced && (
              <span className="flex items-center gap-1 text-xs text-text-secondary">
                <Clock size={12} /> {lastSynced.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            )}
            <button onClick={refreshAll} disabled={loading || !stocks.length}
              className="px-4 py-2 glass-panel text-text-primary rounded-xl hover:bg-bg-elevated text-sm font-medium flex items-center gap-2 border border-border-subtle disabled:opacity-40 transition-colors">
              <RefreshCw className={cn('w-4 h-4', loading && 'animate-spin text-brand-cyan')} /> Sync
            </button>
            <GradientButton onClick={() => setShowAdd(true)} className="py-2.5 px-5">
              <Plus className="w-4 h-4" /> Add Stock
            </GradientButton>
          </div>
        </div>
      </MotionSection>

      {/* Add Modal */}
      <AnimatePresence>
        {showAdd && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 20 }}
              className="glass-panel p-8 rounded-2xl border border-border-subtle w-full max-w-md relative overflow-hidden"
            >
              <button onClick={closeForm} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><X size={18} /></button>
              <h3 className="text-2xl font-bold text-text-primary mb-6 flex items-center gap-3">
                <TrendingUp className="w-6 h-6 text-brand-cyan" /> Add Position
              </h3>
              <form onSubmit={addStock} className="space-y-4">
                {/* Ticker search */}
                <div>
                  <label className="block text-sm text-text-muted mb-1.5 font-medium">STOCK / TICKER</label>
                  <div className="relative">
                    <input
                      value={picked ? picked.name : sq}
                      onChange={e => { setSq(e.target.value.toUpperCase()); setPicked(null); }}
                      placeholder="Search (e.g. RELIANCE.NS, TCS.NS)"
                      className="w-full px-4 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50"
                      required
                    />
                    {picked && (
                      <button type="button" onClick={() => { setPicked(null); setSq(''); }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"><X size={14} /></button>
                    )}
                    {results.length > 0 && !picked && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 backdrop-blur-md border border-border-subtle rounded-xl shadow-2xl z-50 max-h-56 overflow-y-auto">
                        {results.map(r => (
                          <div key={r.symbol} onClick={() => pickStock(r)}
                            className="px-4 py-3 hover:bg-bg-elevated cursor-pointer flex justify-between items-center border-b border-border-subtle last:border-0">
                            <div>
                              <div className="font-bold text-text-primary">{r.symbol}</div>
                              <div className="text-xs text-text-muted truncate max-w-[200px]">{r.name}</div>
                            </div>
                            <span className="text-[10px] font-bold bg-brand-cyan/20 text-brand-cyan px-2 py-0.5 rounded">{r.region}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Live quote preview */}
                  {fetchingQuote && (
                    <div className="mt-3 p-4 rounded-xl border border-brand-cyan/20 bg-brand-cyan/5 flex items-center gap-3">
                      <div className="w-5 h-5 border-2 border-brand-cyan/30 border-t-brand-cyan rounded-full animate-spin" />
                      <span className="text-sm text-text-muted">Fetching live price...</span>
                    </div>
                  )}
                  {liveQuote && !fetchingQuote && picked && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-4 rounded-xl border border-brand-cyan/30 bg-gradient-to-r from-brand-cyan/5 to-brand-purple/5 space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-text-muted tracking-widest">LIVE MARKET PRICE</span>
                        <span className={cn(
                          'text-xs font-bold px-2 py-0.5 rounded-full border',
                          liveQuote.changePercent >= 0
                            ? 'bg-green-500/10 text-green-400 border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border-red-500/20'
                        )}>
                          {liveQuote.changePercent >= 0 ? '▲' : '▼'} {Math.abs(liveQuote.changePercent).toFixed(2)}%
                        </span>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-3xl font-extrabold text-text-primary">{rupee(liveQuote.price)}</span>
                        <span className={cn('text-sm font-semibold', liveQuote.change >= 0 ? 'text-green-400' : 'text-red-400')}>
                          {liveQuote.change >= 0 ? '+' : ''}{rupee(liveQuote.change)}
                        </span>
                      </div>
                      <div className="flex gap-4 text-xs text-text-muted">
                        <span>High: <span className="text-text-primary font-medium">{rupee(liveQuote.high)}</span></span>
                        <span>Low: <span className="text-text-primary font-medium">{rupee(liveQuote.low)}</span></span>
                        <span>Vol: <span className="text-text-primary font-medium">{(liveQuote.volume / 1000).toFixed(0)}K</span></span>
                      </div>
                    </motion.div>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1.5 font-medium">QUANTITY</label>
                  <input type="number" step="0.01" value={qty} onChange={e => setQty(e.target.value)}
                    placeholder="No. of shares" required
                    className="w-full px-4 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1.5 font-medium">BUY PRICE (₹)</label>
                  <input type="number" step="0.01" value={buyPrice} onChange={e => setBuyPrice(e.target.value)}
                    placeholder="₹0.00" required
                    className="w-full px-4 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50" />
                </div>
                <div>
                  <label className="block text-sm text-text-muted mb-1.5 font-medium">PURCHASE DATE</label>
                  <input type="date" value={buyDate} onChange={e => setBuyDate(e.target.value)}
                    className="w-full px-4 py-3 bg-bg-tertiary border border-border-subtle text-text-primary rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-cyan/50" />
                </div>
                <GradientButton type="submit" disabled={loading} className="w-full py-4 text-base mt-2">
                  {loading ? 'Fetching...' : 'Add to Portfolio'}
                </GradientButton>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* AI Modal */}
      <AnimatePresence>
        {aiResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/40 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}
              className="glass-panel border-border-subtle shadow-xl rounded-2xl w-full max-w-lg p-8 relative overflow-hidden"
            >
              <button onClick={() => setAiResult(null)} className="absolute top-4 right-4 text-text-muted hover:text-text-primary"><X size={18} /></button>
              <h3 className="text-2xl font-bold text-text-primary mb-4 flex items-center gap-2">
                <Bot className="w-6 h-6 text-brand-purple" /> AI: {aiResult.symbol}
              </h3>
              <div className="whitespace-pre-wrap text-text-muted leading-relaxed p-4 bg-bg-tertiary border border-border-subtle rounded-xl">
                {aiResult.text.split('**').map((c, i) =>
                  i % 2 === 1 ? <span key={i} className="text-brand-cyan font-bold">{c}</span> : c
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Portfolio Summary */}
      <MotionSection delay={0.2}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <span className="text-text-muted text-xs font-bold tracking-widest">INVESTED VALUE</span>
            <div className="text-2xl font-bold text-text-primary mt-2">{rupee(totalInvested)}</div>
            <div className="text-xs text-text-muted mt-1">Your cost basis</div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <span className="text-text-muted text-xs font-bold tracking-widest">MARKET VALUE</span>
            <div className="text-2xl font-bold text-text-primary mt-2">{rupee(totalCurrent)}</div>
            <div className="text-xs text-text-muted mt-1">Live valuation</div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <span className="text-text-muted text-xs font-bold tracking-widest">PROFIT / LOSS</span>
            <div className={cn('text-2xl font-bold mt-2', totalPnl >= 0 ? 'text-green-400' : 'text-red-400')}>
              {totalPnl >= 0 ? '+' : ''}{rupee(totalPnl)}
            </div>
            <div className="text-xs text-text-muted mt-1">Overall P&L</div>
          </AnimatedCard>

          <AnimatedCard className="border border-border-subtle bg-bg-tertiary">
            <span className="text-text-muted text-xs font-bold tracking-widest">RETURNS %</span>
            <div className={cn('text-2xl font-bold mt-2 flex items-center gap-1', totalPnlPct >= 0 ? 'text-green-400' : 'text-red-400')}>
              {totalPnlPct >= 0 ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              {totalPnlPct >= 0 ? '+' : ''}{totalPnlPct.toFixed(2)}%
            </div>
            <div className="text-xs text-text-muted mt-1">Portfolio yield</div>
          </AnimatedCard>
        </div>
      </MotionSection>

      {/* Stock List */}
      <MotionSection delay={0.3} className="space-y-4">
        <h3 className="text-xl font-bold text-text-primary mb-4 border-b border-border-subtle pb-3">Your Holdings</h3>

        {stocks.length === 0 ? (
          <div className="glass-panel rounded-2xl p-16 text-center border border-border-subtle">
            <TrendingUp className="w-16 h-16 text-text-secondary mx-auto mb-4" />
            <h3 className="text-xl font-bold text-text-primary mb-2">No holdings yet</h3>
            <p className="text-text-muted mb-6">Add Indian or global stocks — all values shown in ₹</p>
            <GradientButton onClick={() => setShowAdd(true)}><Plus size={16} /> Add Stock</GradientButton>
          </div>
        ) : (
          <div className="space-y-4">
            {stocks.map((s, i) => {
              const invested = s.quantity * s.purchasePrice;
              const mktVal = s.quantity * (s.currentPrice ?? s.purchasePrice);
              const pnl = mktVal - invested;
              const pnlPct = invested > 0 ? (pnl / invested) * 100 : 0;
              const isUp = pnl >= 0;

              return (
                <motion.div key={s.id}
                  initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="glass-panel rounded-2xl p-5 border border-border-subtle hover:border-border-subtle transition-all group relative overflow-hidden"
                >
                  <div className={cn(
                    'absolute right-0 top-0 bottom-0 w-48 bg-gradient-to-l pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity',
                    isUp ? 'from-green-500/5 to-transparent' : 'from-red-500/5 to-transparent'
                  )} />

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
                    {/* Left: Symbol & Meta */}
                    <div className="md:w-1/4 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-2xl font-extrabold text-text-primary tracking-tight">{s.symbol}</h3>
                        <span className={cn(
                          'px-2 py-0.5 rounded-full text-[10px] font-bold border',
                          isUp ? 'bg-green-500/10 text-green-400 border-green-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'
                        )}>
                          {(s.changePercent ?? 0) >= 0 ? '+' : ''}{(s.changePercent ?? 0).toFixed(2)}%
                        </span>
                      </div>
                      <div className="text-xs text-text-muted truncate">{s.name}</div>
                      <div className="text-xs text-text-secondary mt-1">{s.quantity} shares · Avg {rupee(s.purchasePrice)}</div>
                      <button onClick={() => doAI(s)} disabled={aiLoading !== null}
                        className="mt-2 flex items-center gap-1 px-2 py-1 bg-brand-purple/10 text-brand-purple border border-brand-purple/20 rounded text-xs font-bold hover:bg-brand-purple/20 transition-colors disabled:opacity-50">
                        {aiLoading === s.symbol ? <RefreshCw size={12} className="animate-spin" /> : <Bot size={12} />} AI Analyze
                      </button>
                    </div>

                    {/* Right: Financials Grid */}
                    <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <div className="text-[10px] text-text-muted font-bold tracking-widest mb-1">MKT PRICE</div>
                        <div className="text-lg font-bold text-text-primary">{rupee(s.currentPrice ?? s.purchasePrice)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted font-bold tracking-widest mb-1">BOUGHT VALUE</div>
                        <div className="text-lg font-bold text-text-primary">{rupee(invested)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted font-bold tracking-widest mb-1">MARKET VALUE</div>
                        <div className="text-lg font-bold text-text-primary">{rupee(mktVal)}</div>
                      </div>
                      <div>
                        <div className="text-[10px] text-text-muted font-bold tracking-widest mb-1">P&L</div>
                        <div className={cn('text-lg font-bold', isUp ? 'text-green-400' : 'text-red-400')}>
                          {isUp ? '+' : ''}{rupee(pnl)}
                        </div>
                        <div className={cn('text-xs font-semibold', isUp ? 'text-green-500' : 'text-red-500')}>
                          {isUp ? '↑' : '↓'} {Math.abs(pnlPct).toFixed(2)}%
                        </div>
                      </div>
                    </div>

                    <button onClick={() => removeStock(s.id)}
                      className="absolute top-3 right-3 md:relative md:top-auto md:right-auto p-2 text-text-secondary hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all">
                      <X size={16} />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </MotionSection>
    </div>
  );
}
