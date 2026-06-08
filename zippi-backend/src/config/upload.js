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
    fileSize: 50 * 1024 * 1024 // 50MB limit
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
    console.error('Supabase Storage upload error:', err.message, '- falling back to local disk storage');
    try {
      const fs = require('fs');
      const path = require('path');
      const uploadsDir = path.join(__dirname, '../../public/uploads');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      fs.writeFileSync(path.join(uploadsDir, filename), file.buffer);
      return `http://localhost:3001/uploads/${filename}`;
    } catch (localErr) {
      console.error('Local file write error, falling back to base64:', localErr.message);
      const base64Data = file.buffer.toString('base64');
      return `data:${file.mimetype};base64,${base64Data}`;
    }
  }
};

module.exports = {
  upload,
  uploadToSupabase
};
