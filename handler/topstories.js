const axios = require('axios');
const { MongoClient } = require('mongodb');

const API = 'https://hacker-news.firebaseio.com/v0';
const fetchCount = process.env.FETCH_COUNT || 50;

async function fetchStories(conn) {
  if (!(conn instanceof MongoClient)) {
    throw Error('An instance of MongoClient required.');
  }

  const collection = conn.db('hacker-news').collection('stories');

  const ids = await axios.get(`${API}/topstories.json`);
  const idsToFetch = ids.data.slice(0, fetchCount);

  console.log(`Fetching ${fetchCount} top stories...`);
  const stories = await Promise.all(idsToFetch.map(id => axios.get(`${API}/item/${id}.json`)));

  collection.deleteMany({});

  collection.insertMany(stories.map(item => item.data));
  console.log('Stories db updated.');
}

module.exports = fetchStories;
