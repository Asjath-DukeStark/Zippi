const crypto = require('crypto');
const supabase = require('../config/supabase');
const env = require('../config/env');
const { ok, ApiError } = require('../utils/response');

const EXT = {
  'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp',
  'image/gif': 'gif', 'image/svg+xml': 'svg'
};

let bucketReady = false;
const ensureBucket = async () => {
  if (bucketReady) return;
  const { data } = await supabase.storage.getBucket(env.storageBucket);
  if (!data) {
    const { error } = await supabase.storage.createBucket(env.storageBucket, {
      public: true,
      fileSizeLimit: '5MB'
    });
    if (error && !/already exists/i.test(error.message)) {
      throw new ApiError(`Storage bucket error: ${error.message}`, 500, 'STORAGE_ERROR');
    }
  }
  bucketReady = true;
};

/**
 * POST /api/admin/uploads?folder=products|banners|categories|misc
 * multipart/form-data with field "image". Stores in Supabase Storage, returns public URL.
 */
exports.uploadImage = async (req, res, next) => {
  try {
    if (!req.file) throw new ApiError('No image file provided (field name: "image")', 422, 'NO_FILE');
    await ensureBucket();

    const folder = ['products', 'banners', 'categories', 'misc'].includes(req.query.folder)
      ? req.query.folder : 'misc';
    const filename = `${folder}/${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${EXT[req.file.mimetype] || 'bin'}`;

    const { error } = await supabase.storage
      .from(env.storageBucket)
      .upload(filename, req.file.buffer, { contentType: req.file.mimetype, upsert: false });
    if (error) throw new ApiError(`Upload failed: ${error.message}`, 500, 'STORAGE_ERROR');

    const { data: pub } = supabase.storage.from(env.storageBucket).getPublicUrl(filename);
    return ok(res, { url: pub.publicUrl, path: filename }, 201);
  } catch (err) { next(err); }
};

/** DELETE /api/admin/uploads — body: { path } */
exports.deleteImage = async (req, res, next) => {
  try {
    const { path } = req.body;
    if (!path) throw new ApiError('path is required', 422, 'NO_PATH');
    const { error } = await supabase.storage.from(env.storageBucket).remove([path]);
    if (error) throw new ApiError(error.message, 500, 'STORAGE_ERROR');
    return ok(res, { deleted: true });
  } catch (err) { next(err); }
};
