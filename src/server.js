// use env vars for easier configuration
const dotenv = require('dotenv');
dotenv.config();

// Multicast address should lie within multicast address space
// 224.0.0.0 through 239.255.255.255
const MULTICAST = process.env.MULTICAST;
const PORT = process.env.PORT;

const dgram = require("dgram");
// helper to find id of current process
const processInfo = require("process");

const socket = dgram.createSocket({
  type: "udp4", // allow discover on ipv4
  reuseAddr: true // if port is in use, use anyway
});

socket.bind(PORT);

// listen for connection
socket.on("listening", function () {
  // subscribe to multicast address
  socket.addMembership(MULTICAST);
  // send a messafe with our details
  setImmediate(sendMessage, process.env.MESSAGE_INTERVAL);
  const address = socket.address();
  console.log(
    `UDP socket listening on ${address.address}:${address.port} pid: ${
      process.pid
    }`
  );
});

function sendMessage() {
  // dgram requires a buffer rather than string
  const message = Buffer.from(`Message from process ${process.pid}`);
  socket.send(message, 0, message.length, PORT, MULTICAST, function () {
    console.info(`Sending message "${message}"`);
  });
}

// handle messages coming in and output to terminal
socket.on("message", function (message, rinfo) {
  console.info(`Message from: ${rinfo.address}:${rinfo.port} - ${message}`);
});