/**
 * Seed default admin + demo rider accounts.
 * Usage: npm run seed
 * Override credentials via env: ADMIN_PHONE, ADMIN_PASSWORD, RIDER_PHONE, RIDER_PASSWORD
 */
require('dotenv').config();
const bcrypt = require('bcryptjs');
const supabase = require('../src/config/supabase');

const upsertUser = async ({ phone, name, email, role, password }) => {
  const { data: existing } = await supabase.from('users').select('id, role').eq('phone', phone).maybeSingle();
  if (existing) {
    console.log(`• ${role} already exists (${phone}) — skipping`);
    return existing.id;
  }
  const { data, error } = await supabase
    .from('users')
    .insert({ phone, name, email, role, password_hash: await bcrypt.hash(password, 10) })
    .select('id')
    .single();
  if (error) throw error;
  console.log(`✔ Created ${role}: ${phone} / ${password}`);
  return data.id;
};

(async () => {
  try {
    await upsertUser({
      phone: process.env.ADMIN_PHONE || '0500000001',
      name: 'Zippi Admin',
      email: 'admin@zippi.app',
      role: 'admin',
      password: process.env.ADMIN_PASSWORD || 'admin123'
    });

    const riderId = await upsertUser({
      phone: process.env.RIDER_PHONE || '0500000002',
      name: 'Demo Rider',
      email: 'rider@zippi.app',
      role: 'rider',
      password: process.env.RIDER_PASSWORD || 'rider123'
    });
    await supabase.from('rider_profiles').upsert({ user_id: riderId, is_online: false, vehicle_type: 'bike' });

    console.log('\nSeed complete.');
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message || err);
    process.exit(1);
  }
})();
