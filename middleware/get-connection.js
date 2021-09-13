const getConnection = require('../utils/connector');

module.exports = async function(req, res, next) {
  try {
    const client = await getConnection();

    req.conn = client;
    req.db = client.db('hacker-news');

    next();
  } catch(error) {
    next(error);
  }
}
