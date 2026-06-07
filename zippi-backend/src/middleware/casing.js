const snakeToCamel = (str) => {
  if (str === 'category_slug') return 'category';
  if (str === 'image_url') return 'image';
  if (str === 'original_price') return 'originalPrice';
  if (str === 'discount_percent') return 'discountPercent';
  if (str === 'reviews_count') return 'reviewsCount';
  if (str === 'is_flash_deal') return 'isFlashDeal';
  return str.replace(/([-_][a-z])/g, (group) =>
    group.toUpperCase().replace('-', '').replace('_', '')
  );
};

const camelToSnake = (str) => {
  if (str === 'category') return 'category_slug';
  if (str === 'image') return 'image_url';
  if (str === 'originalPrice') return 'original_price';
  if (str === 'comparePrice') return 'original_price';
  if (str === 'discountPercent') return 'discount_percent';
  if (str === 'discountPercentage') return 'discount_percent';
  if (str === 'reviewsCount') return 'reviews_count';
  if (str === 'isFlashDeal') return 'is_flash_deal';
  return str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
};

const transformKeys = (obj, transformer) => {
  if (Array.isArray(obj)) {
    return obj.map((v) => transformKeys(v, transformer));
  } else if (obj !== null && obj !== undefined && obj.constructor === Object) {
    return Object.keys(obj).reduce((result, key) => {
      const transformedKey = transformer(key);
      result[transformedKey] = transformKeys(obj[key], transformer);
      return result;
    }, {});
  }
  return obj;
};

const casingMiddleware = (req, res, next) => {
  // 1. Transform incoming Request Query and Body to snake_case
  if (req.body) {
    req.body = transformKeys(req.body, camelToSnake);
  }
  if (req.query) {
    req.query = transformKeys(req.query, camelToSnake);
  }

  // 2. Transform outgoing Response JSON to camelCase
  const originalJson = res.json;
  res.json = function (body) {
    if (body) {
      const transformed = transformKeys(body, snakeToCamel);
      return originalJson.call(this, transformed);
    }
    return originalJson.call(this, body);
  };

  next();
};

module.exports = casingMiddleware;
