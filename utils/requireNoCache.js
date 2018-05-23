const _invalidateRequireCacheForFile = filePath => {
  delete require.cache[require.resolve(filePath)];
};

const requireNoCache = filePath => {
  _invalidateRequireCacheForFile(filePath);
  return require(filePath); // eslint-disable-line global-require
};

module.exports = requireNoCache;
