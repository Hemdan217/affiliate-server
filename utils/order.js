const checkDuplicatProducts = (items) => {
  const uniqueSet = new Set();
  for (let i = 0; i < items.length; i++) {
    const { product, property } = items[i];
    const key = `${product}${property}`;
    if (uniqueSet.has(key)) return true;
    uniqueSet.add(key);
  }
  return false;
};

module.exports = { checkDuplicatProducts };
