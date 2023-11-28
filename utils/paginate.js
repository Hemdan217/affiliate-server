const paginate = async (madal, page, size, query, filter) => {
  const searchQuery = query ? { $text: { $search: query } } : {};
  const filterQuery = filter ? JSON.parse(filter) : {};

  if (filterQuery.from && filterQuery.to) {
    filterQuery['created_at'] = {
      $gte: filterQuery.from,
      $lte: filterQuery.to
    }
  }

  const itemsCount = await madal.countDocuments({ ...searchQuery, ...filterQuery });
  const data = await madal.find({ ...searchQuery, ...filterQuery })
    .limit(size)
    .skip((page - 1) * size)
    .sort('-created_at')
    .lean()

  return {
    success: true,
    itemsCount,
    pages: Math.ceil(itemsCount / size),
    data
  };
}

module.exports = paginate