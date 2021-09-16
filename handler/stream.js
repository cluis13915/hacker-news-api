// References:
//  - https://hnstream.com/
//  - https://www.mongodb.com/developer/how-to/capturing-hacker-news-mentions-nodejs-mongodb/

const stream = require('stream');
const ndjson = require('ndjson');
const through2 = require('through2');
const request = require('request');
const util = require('util');
const pipeline = util.promisify(stream.pipeline);
const getConnection = require('../utils/connector');

(async () => {
  try {
    const client = await getConnection();
    const collection = client.db('hacker-news').collection('stories');

    await pipeline(
      request('http://api.hnstream.com/news/stream/'),

      ndjson.parse({ strict: false }),

      through2.obj((row, enc, next) => {
        collection.insertOne({ ...row });
        console.log('New document inserted!');

        next();
      })
    );
  } catch(error) {
    console.log(error);
  }
})();