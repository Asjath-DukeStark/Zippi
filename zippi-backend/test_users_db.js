require('dotenv').config();
const supabase = require('./src/config/supabase');

(async () => {
  try {
    const { data, error } = await supabase.from('users').select('*').limit(1);
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      console.log('Sample user row keys:', data && data.length > 0 ? Object.keys(data[0]) : 'No rows found');
      console.log('Sample user row data:', data);
    }
  } catch (err) {
    console.error('Thrown error:', err);
  }
  process.exit(0);
})();
