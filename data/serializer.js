function serializeStory({ _id, by, time, title, url }) {
  return {
    _id,
    by,
    time,
    title,
    url,
  };
}

function serializeArrayOfStories(data) {
  if (!Array.isArray(data)) {
    throw Error('Expected array of items.');
  }

  return data.map(story => serializeStory(story));
}

module.exports = {
  serializeStory,
  serializeArrayOfStories,
};