const axios = require('axios');
const getConnection = require('../utils/connector');

const API = 'https://hacker-news.firebaseio.com/v0';
const fetchCount = process.env.FETCH_COUNT || 50;

async function fetchStories() {
  const client = await getConnection();
  const collection = client.db('hacker-news').collection('stories');

  console.log('Fetching top stories IDs...');
  const ids = await axios.get(`${API}/topstories.json`);
  const idsToFetch = ids.data.slice(0, fetchCount);

  console.log(`Fetching ${fetchCount} top stories data`);
  const stories = await Promise.all(idsToFetch.map(id => axios.get(`${API}/item/${id}.json`)));

  console.log('Clearing db collection...');
  collection.deleteMany({});

  console.log('Inserting new data...');
  collection.insertMany(stories.map(item => item.data));
  console.log('Done!');
}

module.exports = fetchStories;
