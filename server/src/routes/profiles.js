const express = require('express');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/database');

const router = express.Router();

// Get current user profile
router.get('/me', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, full_name, phone, role, avatar_url, created_at, updated_at FROM profiles WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update current user profile
router.put('/me', auth, [
  body('full_name').optional().notEmpty().trim(),
  body('phone').optional().trim(),
  body('avatar_url').optional().isURL()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { full_name, phone, avatar_url } = req.body;

    const result = await db.query(
      `UPDATE profiles 
       SET full_name = COALESCE($1, full_name),
           phone = COALESCE($2, phone),
           avatar_url = COALESCE($3, avatar_url),
           updated_at = NOW()
       WHERE id = $4
       RETURNING id, email, full_name, phone, role, avatar_url, updated_at`,
      [full_name, phone, avatar_url, req.user.id]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all profiles (for admin/broker to assign users)
router.get('/', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT id, email, full_name, phone, role, avatar_url, created_at FROM profiles ORDER BY full_name'
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get profiles error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;