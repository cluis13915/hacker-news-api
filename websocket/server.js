const WebSocketServer = require('websocket').server;
const http = require('http');
const getConnection = require('../utils/connector');
const fetchStories = require('../handler/topstories');
const store = require('../data/stories');

const fetchInterval = (process.env.FETCH_INTERVAL || 0.25) * 60 * 1000;

(async () => {
  const dbConnection = await getConnection();
  let liveConnections = [];

  const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
  });

  server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
  });

  const wsServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
  });

  function originIsAllowed(origin) {
    // Put logic here to detect whether the specified origin is allowed.
    return true;
  }

  async function sendLatestData(conn) {
    const data = await store.getAllStories(dbConnection);

    if (conn) {
      return conn.sendUTF(JSON.stringify(data));
    }

    liveConnections
      .filter(conn => conn.connected)
      .forEach(conn => conn.sendUTF(JSON.stringify(data)));
  }

  async function fetchAndSendLatestData(conn) {
    await fetchStories(dbConnection);
    await sendLatestData(conn);
  }

  // Fetch data at startup.
  await fetchStories(dbConnection);

  // Fetch stories each certain interval and send to connected clients.
  setInterval(fetchAndSendLatestData, fetchInterval);

  wsServer.on('request', async function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin.
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    const connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        console.log('Received Message: ' + message.utf8Data);
        connection.sendUTF('Data received');
      }
      else if (message.type === 'binary') {
        console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        connection.sendBytes('Invalid data received');
      }
    });

    connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');

      const index = liveConnections.findIndex((conn) => conn === connection);

      if (index !== -1) {
        liveConnections.splice(index);
      }
    });

    liveConnections.push(connection);

    // Send current data to the connected client.
    await sendLatestData(connection);
  });
})();
