const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all deals with filters
router.get('/', [
  query('deal_type').optional().isIn(['purchase', 'sale', 'lease', 'rental']),
  query('stage').optional().isIn(['lead', 'qualified', 'proposal', 'negotiation', 'contract', 'closing', 'closed_won', 'closed_lost']),
  query('assigned_to').optional().isUUID()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { deal_type, stage, assigned_to } = req.query;

    const isAdmin = req.user && req.user.role === 'admin';
    let whereClause = '';
    let params = [];
    let paramCount = 0;

    if (isAdmin) {
      whereClause = 'WHERE 1=1';
    } else {
      whereClause = 'WHERE (assigned_to = $1 OR created_by = $1)';
      params.push(req.user.id);
      paramCount = 1;
    }

    if (deal_type) {
      whereClause += ` AND deal_type = $${++paramCount}`;
      params.push(deal_type);
    }

    if (stage) {
      whereClause += ` AND stage = $${++paramCount}`;
      params.push(stage);
    }

    if (assigned_to) {
      whereClause += ` AND assigned_to = $${++paramCount}`;
      params.push(assigned_to);
    }

    const query_text = `
      SELECT d.*, 
             p1.full_name as assigned_to_name,
             p2.full_name as created_by_name,
             c.first_name || ' ' || c.last_name as contact_name,
             pr.title as property_title
      FROM deals d
      LEFT JOIN profiles p1 ON d.assigned_to = p1.id
      LEFT JOIN profiles p2 ON d.created_by = p2.id
      LEFT JOIN contacts c ON d.contact_id = c.id
      LEFT JOIN properties pr ON d.property_id = pr.id
      ${whereClause}
      ORDER BY d.created_at DESC
    `;

    const result = await db.query(query_text, params);

    res.json({
      deals: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get deals error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single deal
router.get('/:id', auth, async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    let accessClause = 'AND (d.assigned_to = $2 OR d.created_by = $2)';
    let paramsSingle = [req.params.id, req.user.id];
    if (isAdmin) {
      accessClause = '';
      paramsSingle = [req.params.id];
    }

    const result = await db.query(
      `SELECT d.*, 
              p1.full_name as assigned_to_name,
              p2.full_name as created_by_name,
              c.first_name || ' ' || c.last_name as contact_name,
              c.email as contact_email,
              c.phone as contact_phone,
              pr.title as property_title,
              pr.address as property_address,
              pr.price as property_price
       FROM deals d
       LEFT JOIN profiles p1 ON d.assigned_to = p1.id
       LEFT JOIN profiles p2 ON d.created_by = p2.id
       LEFT JOIN contacts c ON d.contact_id = c.id
       LEFT JOIN properties pr ON d.property_id = pr.id
       WHERE d.id = $1 ${accessClause}`,
      paramsSingle
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get deal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new deal (temporarily disabled auth)
router.post('/', [
  body('title').notEmpty().trim(),
  body('deal_type').isIn(['purchase', 'sale', 'lease', 'rental']),
  body('stage').optional().isIn(['lead', 'qualified', 'proposal', 'negotiation', 'contract', 'closing', 'closed_won', 'closed_lost']),
  body('value').optional().isFloat({ min: 0 }),
  body('probability').optional().isInt({ min: 0, max: 100 }),
  body('expected_close_date').optional().isISO8601().toDate(),
  body('actual_close_date').optional().isISO8601().toDate(),
  body('property_id').optional().isUUID(),
  body('contact_id').optional().isUUID(),
  body('assigned_to').optional().isUUID(),
  body('notes').optional().trim()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      deal_type, 
      stage, 
      value, 
      currency, 
      probability, 
      expected_close_date, 
      actual_close_date, 
      property_id, 
      contact_id, 
      assigned_to, 
      notes 
    } = req.body;
    
    const userId = req.user && req.user.id;

    const query = `
      INSERT INTO deals (
        title, deal_type, stage, value, currency, probability, 
        expected_close_date, actual_close_date, property_id, contact_id, 
        assigned_to, notes, created_by, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      title,
      deal_type,
      stage || 'lead',
      value || null,
      currency || 'USD',
      probability || null,
      expected_close_date || null,
      actual_close_date || null,
      property_id || null,
      contact_id || null,
      assigned_to || null,
      notes || null,
      userId
    ];

    const result = await db.query(query, values);
    const deal = result.rows[0];

    res.status(201).json({
      message: 'Deal created successfully',
      deal: deal
    });
  } catch (error) {
    console.error('Deal creation error:', error);
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

// Update deal (temporarily disabled auth)
router.put('/:id', [
  body('title').optional().notEmpty().trim(),
  body('deal_type').optional().isIn(['purchase', 'sale', 'lease', 'rental']),
  body('stage').optional().isIn(['lead', 'qualified', 'proposal', 'negotiation', 'contract', 'closing', 'closed_won', 'closed_lost']),
  body('value').optional().isFloat({ min: 0 }),
  body('probability').optional().isInt({ min: 0, max: 100 }),
  body('expected_close_date').optional().isISO8601().toDate(),
  body('actual_close_date').optional().isISO8601().toDate(),
  body('property_id').optional().isUUID(),
  body('contact_id').optional().isUUID(),
  body('assigned_to').optional().isUUID(),
  body('notes').optional().trim()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const dealId = req.params.id;
    const userId = req.user && req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    // Check if deal exists and user has permission
    let accessClause = 'AND (assigned_to = $2 OR created_by = $2)';
    let checkParams = [dealId, userId];
    if (isAdmin) {
      accessClause = '';
      checkParams = [dealId];
    }

    const checkResult = await db.query(
      `SELECT id FROM deals WHERE id = $1 ${accessClause}`,
      checkParams
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found or access denied' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    const { 
      title, 
      deal_type, 
      stage, 
      value, 
      currency, 
      probability, 
      expected_close_date, 
      actual_close_date, 
      property_id, 
      contact_id, 
      assigned_to, 
      notes 
    } = req.body;

    if (title !== undefined) {
      updates.push(`title = $${paramCounter++}`);
      values.push(title);
    }
    if (deal_type !== undefined) {
      updates.push(`deal_type = $${paramCounter++}`);
      values.push(deal_type);
    }
    if (stage !== undefined) {
      updates.push(`stage = $${paramCounter++}`);
      values.push(stage);
    }
    if (value !== undefined) {
      updates.push(`value = $${paramCounter++}`);
      values.push(value);
    }
    if (currency !== undefined) {
      updates.push(`currency = $${paramCounter++}`);
      values.push(currency);
    }
    if (probability !== undefined) {
      updates.push(`probability = $${paramCounter++}`);
      values.push(probability);
    }
    if (expected_close_date !== undefined) {
      updates.push(`expected_close_date = $${paramCounter++}`);
      values.push(expected_close_date);
    }
    if (actual_close_date !== undefined) {
      updates.push(`actual_close_date = $${paramCounter++}`);
      values.push(actual_close_date);
    }
    if (property_id !== undefined) {
      updates.push(`property_id = $${paramCounter++}`);
      values.push(property_id);
    }
    if (contact_id !== undefined) {
      updates.push(`contact_id = $${paramCounter++}`);
      values.push(contact_id);
    }
    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramCounter++}`);
      values.push(assigned_to);
    }
    if (notes !== undefined) {
      updates.push(`notes = $${paramCounter++}`);
      values.push(notes);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(dealId);

    const query = `
      UPDATE deals 
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await db.query(query, values);
    const deal = result.rows[0];

    res.json({
      message: 'Deal updated successfully',
      deal: deal
    });
  } catch (error) {
    console.error('Deal update error:', error);
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

    const {
      title,
      deal_type,
      stage,
      value,
      probability,
      expected_close_date,
      actual_close_date,
      property_id,
      contact_id,
      assigned_to,
      notes
    } = req.body;

    const result = await db.query(
      `UPDATE deals 
       SET title = COALESCE($1, title),
           deal_type = COALESCE($2, deal_type),
           stage = COALESCE($3, stage),
           value = COALESCE($4, value),
           probability = COALESCE($5, probability),
           expected_close_date = COALESCE($6, expected_close_date),
           actual_close_date = COALESCE($7, actual_close_date),
           property_id = COALESCE($8, property_id),
           contact_id = COALESCE($9, contact_id),
           assigned_to = COALESCE($10, assigned_to),
           notes = COALESCE($11, notes),
           updated_at = NOW()
       WHERE id = $12 AND (assigned_to = $13 OR created_by = $13)
       RETURNING *`,
      [title, deal_type, stage, value, probability, expected_close_date, actual_close_date, property_id, contact_id, assigned_to, notes, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found or access denied' });
    }

});

// Delete deal
router.delete('/:id', auth, async (req, res) => {
  try {
    const dealId = req.params.id;
    const userId = req.user && req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    // Check if deal exists and user has permission
    let accessClause = 'AND (assigned_to = $2 OR created_by = $2)';
    let checkParams = [dealId, userId];
    if (isAdmin) {
      accessClause = '';
      checkParams = [dealId];
    }

    const result = await db.query(
      `DELETE FROM deals WHERE id = $1 ${accessClause} RETURNING id`,
      checkParams
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Deal not found or access denied' });
    }

    res.json({ 
      message: 'Deal deleted successfully',
      id: dealId
    });
  } catch (error) {
    console.error('Deal deletion error:', error);
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

// Get deals pipeline data
router.get('/analytics/pipeline', auth, async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    let whereUser = '(assigned_to = $1 OR created_by = $1)';
    let params = [req.user.id];
    if (isAdmin) {
      whereUser = '1=1';
      params = [];
    }

    const result = await db.query(
      `SELECT 
         stage,
         COUNT(*) as count,
         COALESCE(SUM(value), 0) as total_value
       FROM deals 
       WHERE ${whereUser}
         AND stage NOT IN ('closed_won', 'closed_lost')
       GROUP BY stage
       ORDER BY 
         CASE stage 
           WHEN 'lead' THEN 1
           WHEN 'qualified' THEN 2
           WHEN 'proposal' THEN 3
           WHEN 'negotiation' THEN 4
           WHEN 'contract' THEN 5
           WHEN 'closing' THEN 6
         END`,
      params
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get pipeline error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;