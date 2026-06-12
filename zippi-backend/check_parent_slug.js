require('dotenv').config();
const supabase = require('./src/config/supabase');

(async () => {
  try {
    const { data, error } = await supabase.from('categories').select('parent_slug').limit(1);
    if (error) {
      console.error('Error querying parent_slug:', error);
    } else {
      console.log('parent_slug column exists, sample data:', data);
    }
  } catch (err) {
    console.error('Thrown error:', err);
  }
  process.exit(0);
})();
