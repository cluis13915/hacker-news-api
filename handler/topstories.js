const axios = require('axios');
const { MongoClient } = require('mongodb');
const fetchInterval = (process.env.FETCH_INTERVAL || 0.5) * 60 * 1000;
const fetchCount = process.env.FETCH_COUNT || 50;

(async () => {
  const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
  const API = 'https://hacker-news.firebaseio.com/v0';

  try {
    await client.connect();

    const collection = client.db('hacker-news').collection('stories');

    const fetchStories = async () => {
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
    };

    fetchStories();
    setInterval(fetchStories, fetchInterval);
  } catch(error) {
    console.log(error);
  }
})();