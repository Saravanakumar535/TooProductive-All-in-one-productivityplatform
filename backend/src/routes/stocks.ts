import express from 'express';

const router = express.Router();

router.get('/quote/:symbol', async (req, res) => {
    try {
        const symbol = req.params.symbol;

        // Direct fetch to Yahoo Finance API to bypass NPM package interop issues
        const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        if (!response.ok) {
            throw new Error(`Failed to fetch from Yahoo: ${response.status}`);
        }

        const data = await response.json();

        if (!data.chart || !data.chart.result || data.chart.result.length === 0) {
            return res.status(404).json({ error: 'Stock not found' });
        }

        const meta = data.chart.result[0].meta;

        const formattedData = {
            price: meta.regularMarketPrice || 0,
            change: (meta.regularMarketPrice || 0) - (meta.chartPreviousClose || 0),
            changePercent: (((meta.regularMarketPrice || 0) - (meta.chartPreviousClose || 0)) / (meta.chartPreviousClose || 1)) * 100,
            high: meta.regularMarketDayHigh || meta.regularMarketPrice,
            low: meta.regularMarketDayLow || meta.regularMarketPrice,
            volume: meta.regularMarketVolume || 0,
            previousClose: meta.chartPreviousClose || meta.previousClose || meta.regularMarketPrice,
            open: meta.regularMarketPrice,
            currency: meta.currency || 'USD',
            exchangeName: meta.exchangeName || '',
        };

        res.json(formattedData);
    } catch (error: any) {
        console.error('Yahoo Finance Direct API Error:', error);
        res.status(500).json({ error: 'Failed to fetch stock data', details: error?.message || String(error) });
    }
});

router.get('/search/:query', async (req, res) => {
    try {
        const query = req.params.query;
        const response = await fetch(`https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=5&newsCount=0`, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
            }
        });

        if (!response.ok) throw new Error(`Search failed: ${response.status}`);

        const data = await response.json();
        const results = (data.quotes || [])
            .filter((q: any) => q.quoteType === 'EQUITY' || q.quoteType === 'ETF')
            .map((q: any) => ({
                symbol: q.symbol,
                name: q.shortname || q.longname || q.symbol,
                type: q.quoteType,
                region: q.exchDisp || q.exchange
            }));

        res.json(results);
    } catch (error: any) {
        console.error('Yahoo Finance Search API Error:', error);
        res.status(500).json({ error: 'Failed to search stocks' });
    }
});

router.get('/rate/usd-inr', async (req, res) => {
    try {
        const response = await fetch('https://query1.finance.yahoo.com/v8/finance/chart/USDINR=X', {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
        });
        const data = await response.json();
        const rate = data?.chart?.result?.[0]?.meta?.regularMarketPrice || 84;
        res.json({ rate });
    } catch {
        res.json({ rate: 84 }); // fallback rate
    }
});

export default router;
