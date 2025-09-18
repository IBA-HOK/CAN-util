// server.js
const express = require('express');
const http = require('http');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const TEST_MODE = process.env.TEST_MODE === 'true';
console.log(TEST_MODE ? "[TEST MODE] Using fake CAN data" : "[LIVE MODE] Using SerialPort");

if (!TEST_MODE) {
  const port = new SerialPort({ path: 'COM5', baudRate: 115200 }); // ← COMポートを適宜変更
  const parser = port.pipe(new ReadlineParser());
  parser.on('data', line => io.emit('can-data', line));
} else {
  setInterval(() => {
    const ids = ['0x123', '0x456', '0x789', '0xABC'];
    ids.forEach(id => {
      const b1 = Math.floor(Math.random() * 256);
      const b2 = Math.floor(Math.random() * 256);
      const fakeLine = `ID: ${id} Data: ${b1.toString(16).padStart(2, '0')} ${b2.toString(16).padStart(2, '0')}`;
      io.emit('can-data', fakeLine);
    });
  }, 200);
}

app.use(express.static('public'));
server.listen(3000, () => console.log('Server running on http://localhost:3000'));
