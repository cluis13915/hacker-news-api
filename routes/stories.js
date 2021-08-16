var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
  const page = parseInt(req.query.page) || 0;
  const size = parseInt(req.query.size) || 10;
  const offset = page * size;

  const collection = req.db.collection('stories');
  const data = await collection.find({}).limit(size).skip(offset).toArray();

  const response = data.map(({ _id, by, time, title, url }) => ({ _id, by, time, title, url }))

  res.json(response);
});

module.exports = router;
