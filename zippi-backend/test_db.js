require('dotenv').config();
const supabase = require('./src/config/supabase');

(async () => {
  const { data, error } = await supabase.from('categories').select('*').limit(1);
  if (error) {
    console.error('Error fetching categories schema:', error);
  } else {
    console.log('Sample category row keys:', data.length > 0 ? Object.keys(data[0]) : 'No rows found');
    console.log('Sample data row:', data[0]);
  }
  process.exit(0);
})();
