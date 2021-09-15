const WebSocketServer = require('websocket').server;
const http = require('http');
const getConnection = require('../utils/connector');
const fetchStories = require('../handler/topstories');
const store = require('../data/stories');
const serializer = require('../data/serializer');

const fetchInterval = (process.env.FETCH_INTERVAL || 0.25) * 60 * 1000;

(async () => {
  const dbConnection = await getConnection();
  let dataUpdated = false;

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
    // put logic here to detect whether the specified origin is allowed.
    return true;
  }

  // Fetch stories each certain interval
  fetchStories(dbConnection);
  setInterval(async () => {
    await fetchStories(dbConnection);

    dataUpdated = true;
  }, fetchInterval);


  wsServer.on('request', async function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }

    const connection = request.accept('echo-protocol', request.origin);
    console.log((new Date()) + ' Connection accepted.');

    setInterval(async () => {
      if (dataUpdated) {
        const data = await store.getAllStories(dbConnection);

        connection.sendUTF(JSON.stringify(data));

        dataUpdated = false;
      }
    }, 1000)

    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        console.log('Received Message: ' + message.utf8Data);
        connection.sendUTF('Data received');
      }
      else if (message.type === 'binary') {
        console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        connection.sendBytes('Invaqlid data received');
      }
    });

    connection.on('close', function(reasonCode, description) {
      console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
  });

})();