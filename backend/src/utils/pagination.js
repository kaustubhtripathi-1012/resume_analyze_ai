function getPaginationParams(query, defaultLimit = 10, maxLimit = 100) {
  let page = parseInt(query.page, 10);
  let limit = parseInt(query.limit, 10);

  if (isNaN(page) || page < 1) page = 1;
  if (isNaN(limit) || limit < 1) limit = defaultLimit;
  if (limit > maxLimit) limit = maxLimit;

  const skip = (page - 1) * limit;

  return { page, limit, skip };
}

module.exports = { getPaginationParams };

