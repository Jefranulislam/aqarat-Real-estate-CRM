const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all activities with filters
router.get('/', [
  query('activity_type').optional().isIn(['call', 'email', 'sms', 'meeting', 'note', 'showing', 'other']),
  query('related_to_type').optional().isIn(['lead', 'contact', 'property', 'deal']),
  query('related_to_id').optional().isUUID(),
  query('contact_id').optional().isUUID(),
  query('start_date').optional().isISO8601(),
  query('end_date').optional().isISO8601()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      activity_type, related_to_type, related_to_id, contact_id, 
      start_date, end_date
    } = req.query;

    let whereClause = 'WHERE (a.created_by = $1)';
    let params = [req.user.id];
    let paramCount = 1;

    if (activity_type) {
      whereClause += ` AND activity_type = $${++paramCount}`;
      params.push(activity_type);
    }

    if (related_to_type) {
      whereClause += ` AND related_to_type = $${++paramCount}`;
      params.push(related_to_type);
    }

    if (related_to_id) {
      whereClause += ` AND related_to_id = $${++paramCount}`;
      params.push(related_to_id);
    }

    if (contact_id) {
      whereClause += ` AND contact_id = $${++paramCount}`;
      params.push(contact_id);
    }

    if (start_date) {
      whereClause += ` AND a.created_at >= $${++paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      whereClause += ` AND a.created_at <= $${++paramCount}`;
      params.push(end_date);
    }

    const query_text = `
      SELECT a.*, 
             p.full_name as created_by_name,
             c.first_name || ' ' || c.last_name as contact_name
      FROM activities a
      LEFT JOIN profiles p ON a.created_by = p.id
      LEFT JOIN contacts c ON a.contact_id = c.id
      ${whereClause}
      ORDER BY a.created_at DESC
    `;

    const result = await db.query(query_text, params);

    res.json({
      activities: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get activities error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single activity
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT a.*, 
              p.full_name as created_by_name,
              c.first_name || ' ' || c.last_name as contact_name,
              c.email as contact_email,
              c.phone as contact_phone
       FROM activities a
       LEFT JOIN profiles p ON a.created_by = p.id
       LEFT JOIN contacts c ON a.contact_id = c.id
       WHERE a.id = $1 AND a.created_by = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get activity error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new activity (temporarily disabled auth)
router.post('/', [
  body('activity_type').isIn(['call', 'email', 'sms', 'meeting', 'note', 'showing', 'other']),
  body('subject').notEmpty().trim(),
  body('description').optional().trim(),
  body('duration_minutes').optional().custom((value) => {
    if (value === null || value === undefined || value === '') return true;
    const num = parseInt(value);
    if (isNaN(num) || num < 0) {
      throw new Error('Duration must be a positive number');
    }
    return true;
  }),
  body('related_to_type').optional().isIn(['lead', 'contact', 'property', 'deal']),
  body('related_to_id').optional().custom((value) => {
    if (!value) return true;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('Invalid UUID format');
    }
    return true;
  }),
  body('contact_id').optional().custom((value) => {
    if (!value) return true;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(value)) {
      throw new Error('Invalid UUID format');
    }
    return true;
  })
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      activity_type, 
      subject, 
      description, 
      duration_minutes, 
      related_to_type, 
      related_to_id, 
      contact_id 
    } = req.body;
    
    const userId = req.user && req.user.id;

    const query = `
      INSERT INTO activities (
        activity_type, subject, description, duration_minutes, 
        related_to_type, related_to_id, contact_id, created_by
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;

    const values = [
      activity_type || 'other',
      subject,
      description || null,
      duration_minutes || null,
      related_to_type || null,
      related_to_id || null,
      contact_id || null,
      userId
    ];

    const result = await db.query(query, values);
    const activity = result.rows[0];

    res.status(201).json({
      message: 'Activity created successfully',
      activity: activity
    });
  } catch (error) {
    console.error('Activity creation error:', error);
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ 
        error: 'Internal server error',
        code: error.code,
        message: error.message,
        detail: error.detail,
        constraint: error.constraint
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Update activity (temporarily disabled auth)
router.put('/:id', [
  body('activity_type').optional().isIn(['call', 'email', 'sms', 'meeting', 'note', 'showing', 'other']),
  body('subject').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('duration_minutes').optional().isInt({ min: 0 }),
  body('related_to_type').optional().isIn(['lead', 'contact', 'property', 'deal']),
  body('related_to_id').optional().isUUID(),
  body('contact_id').optional().isUUID()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const activityId = req.params.id;
    const userId = req.user && req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    // Check if activity exists and user has permission
    let accessClause = 'AND created_by = $2';
    let checkParams = [activityId, userId];
    if (isAdmin) {
      accessClause = '';
      checkParams = [activityId];
    }

    const checkResult = await db.query(
      `SELECT id FROM activities WHERE id = $1 ${accessClause}`,
      checkParams
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found or access denied' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    const { 
      activity_type, 
      subject, 
      description, 
      duration_minutes, 
      related_to_type, 
      related_to_id, 
      contact_id 
    } = req.body;

    if (activity_type !== undefined) {
      updates.push(`activity_type = $${paramCounter++}`);
      values.push(activity_type);
    }
    if (subject !== undefined) {
      updates.push(`subject = $${paramCounter++}`);
      values.push(subject);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCounter++}`);
      values.push(description);
    }
    if (duration_minutes !== undefined) {
      updates.push(`duration_minutes = $${paramCounter++}`);
      values.push(duration_minutes);
    }
    if (related_to_type !== undefined) {
      updates.push(`related_to_type = $${paramCounter++}`);
      values.push(related_to_type);
    }
    if (related_to_id !== undefined) {
      updates.push(`related_to_id = $${paramCounter++}`);
      values.push(related_to_id);
    }
    if (contact_id !== undefined) {
      updates.push(`contact_id = $${paramCounter++}`);
      values.push(contact_id);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }


    values.push(activityId);

    const query = `
      UPDATE activities 
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await db.query(query, values);
    const activity = result.rows[0];

    res.json({
      message: 'Activity updated successfully',
      activity: activity
    });
  } catch (error) {
    console.error('Activity update error:', error);
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ 
        error: 'Internal server error',
        code: error.code,
        message: error.message,
        detail: error.detail,
        constraint: error.constraint
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }


    const result = await db.query(
      `UPDATE activities 
       SET activity_type = COALESCE($1, activity_type),
           subject = COALESCE($2, subject),
           description = COALESCE($3, description),
           duration_minutes = COALESCE($4, duration_minutes),
           related_to_type = COALESCE($5, related_to_type),
           related_to_id = COALESCE($6, related_to_id),
           contact_id = COALESCE($7, contact_id)
       WHERE id = $8 AND created_by = $9
       RETURNING *`,
      [activity_type, subject, description, duration_minutes, related_to_type, related_to_id, contact_id, req.params.id, req.user.id]
    );

});

// Delete activity (temporarily disabled auth)
router.delete('/:id', auth, async (req, res) => {
  try {
    const activityId = req.params.id;
    const userId = req.user && req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    // Check if activity exists and user has permission
    let accessClause = 'AND created_by = $2';
    let params = [activityId, userId];
    if (isAdmin) {
      accessClause = '';
      params = [activityId];
    }

    const result = await db.query(
      `DELETE FROM activities WHERE id = $1 ${accessClause} RETURNING id`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Activity not found or access denied' });
    }

    res.json({ 
      message: 'Activity deleted successfully',
      id: activityId
    });
  } catch (error) {
    console.error('Activity deletion error:', error);
    if (process.env.NODE_ENV === 'development') {
      res.status(500).json({ 
        error: 'Internal server error',
        code: error.code,
        message: error.message,
        detail: error.detail,
        constraint: error.constraint
      });
    } else {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
});

// Get activities by related entity - DISABLED
// router.get('/related/:type/:id', auth, async (req, res) => {
//   // Implementation temporarily disabled  
// });

// Get activity timeline for dashboard - DISABLED
// router.get('/timeline/recent', auth, async (req, res) => {
//   // Implementation temporarily disabled
// });

module.exports = router;