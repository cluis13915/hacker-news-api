const WebSocketClient = require('websocket').client;

const client = new WebSocketClient();

client.on('connectFailed', function(error) {
  console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
  console.log('WebSocket Client Connected');

  connection.on('error', function(error) {
    console.log('Connection Error: ' + error.toString());
  });

  connection.on('close', function() {
    console.log('echo-protocol Connection Closed');
  });

  connection.on('message', function(message) {
    if (message.type === 'utf8') {
      try {
        const data = JSON.parse(message.utf8Data);
        console.log('Data received:');
        console.log(data);
      } catch (error) {
        console.log('Not JSON data received:', message.utf8Data);
      }
    }
  });

  function sendNumber() {
    if (connection.connected) {
      const number = Math.round(Math.random() * 0xFFFFFF);

      connection.sendUTF(number.toString());

      setTimeout(sendNumber, 1000);
    }
  }
});

client.connect('ws://localhost:8080/', 'echo-protocol');
