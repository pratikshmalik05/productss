const TTL_MS = 60 * 1000;

const store = new Map();

const isExpired = (entry) => Date.now() - entry.createdAt > TTL_MS;

function cacheMiddleware(req, res, next) {
  const key = req.originalUrl;
  const entry = store.get(key);

  if (entry && !isExpired(entry)) {
    res.set("X-Cache", "HIT");
    res.set("X-Cache-Age", String(Math.floor((Date.now() - entry.createdAt) / 1000)));
    return res.status(entry.statusCode).json(entry.data);
  }

  if (entry) store.delete(key);

  res.set("X-Cache", "MISS");

  const originalJson = res.json.bind(res);
  res.json = (body) => {
    if (res.statusCode === 200) {
      store.set(key, { data: body, statusCode: res.statusCode, createdAt: Date.now() });
    }
    return originalJson(body);
  };

  next();
}

function invalidateCacheMiddleware(req, res, next) {
  res.on("finish", () => {
    if (res.statusCode >= 200 && res.statusCode < 300) {
      store.clear();
    }
  });
  next();
}

module.exports = { cacheMiddleware, invalidateCacheMiddleware, TTL_MS };
