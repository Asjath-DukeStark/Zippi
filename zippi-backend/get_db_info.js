require('dotenv').config();
const supabase = require('./src/config/supabase');

(async () => {
  try {
    const { data, error } = await supabase.from('pg_namespace').select('*');
    if (error) {
      console.error('Error fetching namespaces:', error);
    } else {
      console.log('Namespaces:', data);
    }
  } catch (err) {
    console.error('Thrown error:', err);
  }
  process.exit(0);
})();
