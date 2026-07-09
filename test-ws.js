const WebSocket = require('ws');

const streams = 'btcusdt@miniTicker/ethusdt@miniTicker/solusdt@miniTicker';
const ws = new WebSocket(`wss://stream.binance.com:9443/stream?streams=${streams}`);

ws.on('open', () => {
  console.log('Connected to Binance WS');
});

ws.on('message', (data) => {
  console.log('Received:', JSON.parse(data));
  process.exit(0); // Exit after first message
});

ws.on('error', (err) => {
  console.error('WS Error:', err);
  process.exit(1);
});

setTimeout(() => {
  console.log('Timeout - no data received in 5s');
  process.exit(1);
}, 5000);
