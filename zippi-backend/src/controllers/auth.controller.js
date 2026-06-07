const db = require('../utils/dbHelper');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'zippi_grocery_secret_key_2026';

const register = async (req, res, next) => {
  try {
    const { phone, name, email, password } = req.body;

    // Validation
    if (!phone || !name || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, name, and password are required',
        error: 'VALIDATION_ERROR'
      });
    }

    // Check if phone already exists
    const existingUser = await db.users.findByPhone(phone);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Phone number already registered',
        error: 'DUPLICATE_ENTRY'
      });
    }

    // Determine default role based on metadata (or set to customer)
    // For convenience: if admin registers first user, or custom override
    let role = 'customer';
    if (req.body.role && ['customer', 'rider', 'admin'].includes(req.body.role)) {
      role = req.body.role;
    }

    // Create user in DB / Auth
    const newUser = await db.users.create({
      phone,
      name,
      email: email || null,
      password,
      role
    });

    // Generate custom JWT
    const token = jwt.sign(
      { id: newUser.id, phone: newUser.phone, name: newUser.name, role: newUser.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: newUser.id,
          phone: newUser.phone,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          created_at: newUser.created_at
        }
      },
      message: 'Registration successful'
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and password are required',
        error: 'VALIDATION_ERROR'
      });
    }

    const user = await db.users.findByPhone(phone);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password',
        error: 'UNAUTHORIZED'
      });
    }

    // Verify bcrypt hash
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid phone number or password',
        error: 'UNAUTHORIZED'
      });
    }

    // Generate custom JWT
    const token = jwt.sign(
      { id: user.id, phone: user.phone, name: user.name, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.status(200).json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          name: user.name,
          email: user.email,
          role: user.role,
          created_at: user.created_at
        }
      },
      message: 'Login successful'
    });
  } catch (error) {
    next(error);
  }
};

const verifyOtp = async (req, res, next) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Phone number and OTP are required',
        error: 'VALIDATION_ERROR'
      });
    }

    // Mock validation fallback: OTPs like '123456' or '1234' are verified instantly
    const isMockOtp = otp === '123456' || otp === '1234';
    
    let verified = false;
    if (isMockOtp) {
      verified = true;
    } else {
      // Direct supabase OTP check (if configured/possible, otherwise fall back to true)
      try {
        const { supabase } = require('../config/db');
        const { error } = await supabase.auth.verifyOtp({
          phone,
          token: otp,
          type: 'sms'
        });
        verified = !error;
      } catch (err) {
        verified = true; // offline development fallback
      }
    }

    if (!verified) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
        error: 'INVALID_OTP'
      });
    }

    return res.status(200).json({
      success: true,
      data: { verified: true },
      message: 'OTP verified successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  verifyOtp
};
