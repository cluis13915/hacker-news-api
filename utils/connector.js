const { MongoClient } = require('mongodb');

module.exports = async function(req, res, next) {
  console.log('Connecting...')
  const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });

  try {
    await client.connect();
    console.log('Connected successfully!');

    req.conn = client;
    req.db = client.db('hacker-news');

    next();
  } catch(error) {
    next(error);
  }
}
