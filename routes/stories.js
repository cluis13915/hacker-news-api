const express = require('express');
const router = express.Router();
const serializer = require('../data/serializer');

router.get('/', async function(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  const offset = (page - 1) * size;

  const collection = req.db.collection('stories');
  const count = await collection.count({});
  let data = await collection.find({}).limit(size).skip(offset).toArray();

  data = serializer.serializeArrayOfStories(data);

  res.json({ data, count, page, size });
});

module.exports = router;
