import yf from 'yahoo-finance2';

async function test() {
    console.log('yf keys:', Object.keys(yf));
    if (yf && yf.quote) {
        const q = await yf.quote('AAPL');
        console.log('price:', q.regularMarketPrice);
    } else if (yf && (yf as any).default && (yf as any).default.quote) {
        const q = await (yf as any).default.quote('AAPL');
        console.log('price2:', q.regularMarketPrice);
    }
}
test();
