const { MongoClient } = require('mongodb');
const serializer = require('../data/serializer');

async function getAllStories(conn) {
  if (!(conn instanceof MongoClient)) {
    throw Error('An instance of MongoClient required.');
  }

  const collection = conn.db('hacker-news').collection('stories');
  const count = await collection.count({});
  const data = await collection.find({}).toArray();

  return serializer.serializeArrayOfStories(data);
}

module.exports = {
  getAllStories,
};
