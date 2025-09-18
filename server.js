const express = require('express');
const http = require('http');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const socketIo = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

const TEST_MODE = process.env.TEST_MODE === 'true';

let port;
if (!TEST_MODE) {
  port = new SerialPort({ path: 'COM3', baudRate: 115200 });
  const parser = port.pipe(new ReadlineParser());
  parser.on('data', line => io.emit('can-data', line));
} else {
  // テストモード：CAN信号を擬似生成
  setInterval(() => {
    const fakeLine = `ID: 0x123 Data: ${Math.floor(256*Math.random()).toString(16)} 00 00 00`;
    io.emit('can-data', fakeLine);
  }, 100);
}

app.use(express.static('public'));
server.listen(3000, () => console.log('Server running on http://localhost:3000'));
