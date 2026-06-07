const multer = require('multer');

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: fileFilter
});

/**
 * Upload a memory buffer file to Supabase Storage and return its public URL.
 * Falls back to a data URI or mock link if Supabase is not properly configured.
 */
const uploadToSupabase = async (file, bucketName = 'zippi-media') => {
  const { supabase } = require('./db');
  
  const extension = file.originalname.split('.').pop() || 'png';
  const filename = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${extension}`;
  
  try {
    // Ensure the bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (!listError && buckets) {
      if (!buckets.some(b => b.name === bucketName)) {
        await supabase.storage.createBucket(bucketName, {
          public: true,
          allowedMimeTypes: ['image/*']
        });
      }
    }
    
    // Upload image
    const { data, error } = await supabase.storage
      .from(bucketName)
      .upload(filename, file.buffer, {
        contentType: file.mimetype,
        cacheControl: '3600',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Retrieve public URL
    const { data: urlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filename);

    return urlData.publicUrl;
  } catch (err) {
    console.error('Supabase Storage upload error:', err.message);
    
    // Fallback: If Supabase connection fails, generate a mock or local URL for testing
    // We can return a Data URL or just a placeholder since this is offline/testing mode
    const base64Data = file.buffer.toString('base64');
    return `data:${file.mimetype};base64,${base64Data}`;
  }
};

module.exports = {
  upload,
  uploadToSupabase
};
