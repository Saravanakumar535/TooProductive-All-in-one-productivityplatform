const yahooFinance = require('yahoo-finance2').default;

async function test() {
    try {
        const quote = await yahooFinance.quote('AAPL');
        console.log(quote);
    } catch (error) {
        console.error('API Error:', error);
    }
}

test();
