const { MongoClient } = require('mongodb');

async function getConnection() {
  console.log('Connecting to db...')
  const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });

  await client.connect();
  console.log('Connected successfully!');

  return client;
}

module.exports = getConnection;
