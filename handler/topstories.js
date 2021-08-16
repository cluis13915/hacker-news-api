const axios = require('axios');
const { MongoClient } = require('mongodb');

(async () => {
  const client = new MongoClient('mongodb://localhost:27017', { useUnifiedTopology: true });
  const API = 'https://hacker-news.firebaseio.com/v0';

  try {
    await client.connect();

    const collection = client.db('hacker-news').collection('stories');

    const ids = await axios.get(`${API}/topstories.json`);
    const stories = await Promise.all(ids.data.map(id => axios.get(`${API}/item/${id}.json`)));

    console.log('Clearing collection...');
    collection.deleteMany({});

    console.log('Inserting new data...');
    collection.insertMany(stories.map(item => item.data));
    console.log('Done!');
  } catch(error) {
    console.log(error);
  }
})();