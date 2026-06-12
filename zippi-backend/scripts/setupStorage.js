/** Creates the public image bucket in Supabase Storage. Usage: npm run setup:storage */
require('dotenv').config();
const supabase = require('../src/config/supabase');
const env = require('../src/config/env');

(async () => {
  const { data } = await supabase.storage.getBucket(env.storageBucket);
  if (data) {
    console.log(`Bucket "${env.storageBucket}" already exists.`);
    process.exit(0);
  }
  const { error } = await supabase.storage.createBucket(env.storageBucket, { public: true, fileSizeLimit: '5MB' });
  if (error) {
    console.error('Failed to create bucket:', error.message);
    process.exit(1);
  }
  console.log(`✔ Created public bucket "${env.storageBucket}".`);
  process.exit(0);
})();
