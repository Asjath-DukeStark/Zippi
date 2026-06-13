const supabase = require('../config/supabase');
const { ok, ApiError } = require('../utils/response');

const DEFAULTS = {
  store: { name: 'Zippi', currency: 'AED', supportPhone: '', supportEmail: '', isOpen: true },
  delivery: { 
    deliveryFee: 4.99, 
    freeDeliveryAbove: 99, 
    etaMinutes: 30, 
    serviceRadiusKm: 15,
    boundary: {
      swLat: 7.15,
      swLng: 81.75,
      neLat: 7.30,
      neLng: 81.95
    }
  },
  filters: {
    deals: ['Grand Lifestyle Sale', 'Mega Deal 📣', 'Eid Deal 🌙', 'Deal'],
    brands: ['Sebamed', 'Aveeno', 'Cool & Cool', 'HUGGIES', 'Pampers', 'BabyJoy', 'Mustela', 'Rubies', 'Generic', 'Sage Square', 'Kotmale', 'Pelwatte', 'Araliya', 'Dilmah', 'Harischandra']
  }
};

/** GET /api/settings — public store settings (web/mobile read store config) */
exports.getPublic = async (req, res, next) => {
  try {
    const { data, error } = await supabase.from('settings').select('key, value');
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    const stored = Object.fromEntries((data || []).map((r) => [r.key, r.value]));
    return ok(res, {
      store: { ...DEFAULTS.store, ...(stored.store || {}) },
      delivery: { ...DEFAULTS.delivery, ...(stored.delivery || {}) },
      filters: { ...DEFAULTS.filters, ...(stored.filters || {}) }
    });
  } catch (err) { next(err); }
};

/** PUT /api/admin/settings/:key — upsert a settings group (store | delivery) */
exports.update = async (req, res, next) => {
  try {
    const key = req.params.key;
    if (!Object.keys(DEFAULTS).includes(key)) throw new ApiError('Unknown settings key', 422, 'INVALID_KEY');
    const value = { ...DEFAULTS[key], ...req.body };

    const { data, error } = await supabase
      .from('settings').upsert({ key, value, updated_at: new Date().toISOString() }).select('*').single();
    if (error) throw new ApiError(error.message, 500, 'DB_ERROR');
    return ok(res, { key: data.key, value: data.value });
  } catch (err) { next(err); }
};
