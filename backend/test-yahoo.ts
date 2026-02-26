async function test() {
    try {
        const module = await import('yahoo-finance2');
        const yahooFinance = module.default;
        const quote = await yahooFinance.quote('AAPL');
        console.log(quote.regularMarketPrice);
    } catch (error) {
        console.error('API Error TS:', error);
    }
}

test();
