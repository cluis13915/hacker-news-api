function serializeArrayOfStories(data) {
  if (!Array.isArray(data)) {
    throw Error('Expected array of items.');
  }

  return data.map(({ _id, by, time, title, url }) => ({
    _id,
    by,
    time,
    title,
    url,
  }));
}

module.exports = {
  serializeArrayOfStories,
};