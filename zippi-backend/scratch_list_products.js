require('dotenv').config();
const supabase = require('./src/config/supabase');

(async () => {
  try {
    const { data: products, error } = await supabase.from('products').select('id, name, category_slug, popular, is_flash_deal');
    if (error) {
      console.error('Error fetching products:', error);
      return;
    }

    console.log('Total products count:', products.length);
    
    // Category slug counts
    const categoryCounts = {};
    let popularCount = 0;
    let flashCount = 0;

    products.forEach(p => {
      categoryCounts[p.category_slug] = (categoryCounts[p.category_slug] || 0) + 1;
      if (p.popular) popularCount++;
      if (p.is_flash_deal) flashCount++;
    });

    console.log('Product Category distribution:', categoryCounts);
    console.log('Popular count (for Express):', popularCount);
    console.log('Flash Deal count:', flashCount);

  } catch (err) {
    console.error('Error:', err);
  }
  process.exit(0);
})();
