var express = require('express');
var router = express.Router();

router.get('/', async function(req, res, next) {
  const page = parseInt(req.query.page) || 1;
  const size = parseInt(req.query.size) || 10;
  const offset = (page - 1) * size;

  const collection = req.db.collection('stories');
  const count = await collection.count({});
  let data = await collection.find({}).limit(size).skip(offset).toArray();

  data = data.map(({ _id, by, time, title, url }) => ({ _id, by, time, title, url }))

  res.json({ data, count, page, size});
});

module.exports = router;
