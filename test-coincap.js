const WebSocket = require('ws');

const ws = new WebSocket('wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana');

ws.on('open', () => {
  console.log('Connected to CoinCap WS');
});

ws.on('message', (data) => {
  console.log('Received:', JSON.parse(data));
  process.exit(0);
});

ws.on('error', (err) => {
  console.error('WS Error:', err);
  process.exit(1);
});

setTimeout(() => {
  console.log('Timeout');
  process.exit(1);
}, 5000);
