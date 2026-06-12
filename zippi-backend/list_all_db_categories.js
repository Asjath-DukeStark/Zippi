require('dotenv').config();
const supabase = require('./src/config/supabase');

(async () => {
  try {
    const { data, error } = await supabase.from('categories').select('*');
    if (error) {
      console.error('Error fetching categories:', error);
    } else {
      console.log('Categories count:', data.length);
      console.log('Categories data:', data);
    }
  } catch (err) {
    console.error('Thrown error:', err);
  }
  process.exit(0);
})();
