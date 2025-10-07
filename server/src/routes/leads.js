const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/database');
const { v4: uuidv4, validate: uuidValidate } = require('uuid');

const router = express.Router();

// Get all leads with filters
router.get('/', [
  query('status').optional().isIn(['new', 'contacted', 'qualified', 'unqualified', 'converted']),
  query('source').optional().isIn(['website', 'referral', 'social_media', 'cold_call', 'event', 'other']),
  query('assigned_to').optional().isUUID(),
  query('search').optional().trim()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { status, source, assigned_to, search } = req.query;

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

    if (status) {
      whereClause += ` AND status = $${++paramCount}`;
      params.push(status);
    }

    if (source) {
      whereClause += ` AND source = $${++paramCount}`;
      params.push(source);
    }

    if (assigned_to) {
      whereClause += ` AND assigned_to = $${++paramCount}`;
      params.push(assigned_to);
    }

    if (search) {
      whereClause += ` AND (first_name ILIKE $${++paramCount} OR last_name ILIKE $${++paramCount} OR email ILIKE $${++paramCount} OR phone ILIKE $${++paramCount})`;
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    const query_text = `
      SELECT l.*, 
             p1.full_name as assigned_to_name,
             p2.full_name as created_by_name
      FROM leads l
      LEFT JOIN profiles p1 ON l.assigned_to = p1.id
      LEFT JOIN profiles p2 ON l.created_by = p2.id
      ${whereClause}
      ORDER BY l.created_at DESC
    `;

    const result = await db.query(query_text, params);

    res.json({
      leads: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single contact
router.get('/:id', auth, async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    let accessClause = 'AND (c.assigned_to = $2 OR c.created_by = $2)';
    let params = [req.params.id, req.user.id];
    if (isAdmin) {
      accessClause = '';
      params = [req.params.id];
    }

    const result = await db.query(
      `SELECT c.*, 
              p1.full_name as assigned_to_name,
              p2.full_name as created_by_name
       FROM contacts c
       LEFT JOIN profiles p1 ON c.assigned_to = p1.id
       LEFT JOIN profiles p2 ON c.created_by = p2.id
       WHERE c.id = $1 ${accessClause}`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new contact
router.post('/', [
  body('first_name').notEmpty().trim(),
  body('last_name').notEmpty().trim(),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('source').optional().isIn(['website', 'referral', 'social_media', 'cold_call', 'event', 'other']),
  body('status').optional().isIn(['new', 'contacted', 'qualified', 'unqualified', 'converted']),
  body('score').optional().isInt({ min: 0, max: 100 }),
  body('notes').optional().trim(),
  body('assigned_to').optional().isUUID()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      first_name, last_name, email, phone, source, status, score, notes, assigned_to
    } = req.body;

    // Validate assigned_to and created_by UUIDs
    const createdById = req.user && uuidValidate(req.user.id) ? req.user.id : null;
    if (!createdById) {
      console.error('Create contact error: invalid created_by UUID', req.user && req.user.id);
      return res.status(401).json({ error: 'Invalid user context' });
    }

    const assignedToId = assigned_to && uuidValidate(assigned_to) ? assigned_to : createdById;

    const result = await db.query(
      `INSERT INTO leads (
        first_name, last_name, email, phone, source, status, score, notes, assigned_to, created_by, created_at, updated_at
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW()
      ) RETURNING *`,
      [
        first_name, last_name, email, phone, source || 'other', status || 'new', score || 0, notes, 
        assignedToId, createdById
      ]
    );

    res.status(201).json({
      message: 'Lead created successfully',
      lead: result.rows[0]
    });
  } catch (error) {
    console.error('Create contact error:', error);
      return res.status(500).json({ error: 'Internal server error', code: error.code, message: error.message, detail: error.detail, constraint: error.constraint });
  }
});

// Update contact
router.put('/:id', [
  body('first_name').optional().notEmpty().trim(),
  body('last_name').optional().notEmpty().trim(),
  body('email').optional({ checkFalsy: true }).isEmail().normalizeEmail(),
  body('phone').optional().trim(),
  body('company').optional().trim(),
  body('job_title').optional().trim(),
  body('address').optional().trim(),
  body('city').optional().trim(),
  body('state').optional().trim(),
  body('zip_code').optional().trim(),
  body('country').optional().trim(),
  body('contact_type').optional().isIn(['buyer', 'seller', 'both', 'investor', 'other']),
    body('tags').optional().isArray(),
    body('tags.*').optional().isString(),
  body('notes').optional().trim(),
  body('assigned_to').optional().isUUID()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      first_name, last_name, email, phone, company, job_title, address, city, state, 
      zip_code, country, contact_type, tags, notes, assigned_to
    } = req.body;

    // Ensure only valid UUID for assigned_to is passed (or null to keep)
    const assignedToParam = assigned_to && uuidValidate(assigned_to) ? assigned_to : null;

    const result = await db.query(
      `UPDATE contacts 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone = COALESCE($4, phone),
           company = COALESCE($5, company),
           job_title = COALESCE($6, job_title),
           address = COALESCE($7, address),
           city = COALESCE($8, city),
           state = COALESCE($9, state),
           zip_code = COALESCE($10, zip_code),
           country = COALESCE($11, country),
           contact_type = COALESCE($12, contact_type),
           tags = COALESCE($13::text[], tags),
           notes = COALESCE($14, notes),
           assigned_to = COALESCE($15, assigned_to),
           updated_at = NOW()
       WHERE id = $16 AND (created_by = $17 OR assigned_to = $17)
       RETURNING *`,
      [
        first_name, last_name, email, phone, company, job_title, address, city, state, 
        zip_code, country, contact_type, Array.isArray(tags) ? tags : null, notes, assignedToParam,
        req.params.id, req.user.id
      ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Contact not found or unauthorized' });
    }

    res.json({
      message: 'Contact updated successfully',
      contact: result.rows[0]
    });
  } catch (error) {
    console.error('Update contact error:', error);
      return res.status(500).json({ error: 'Internal server error', code: error.code, message: error.message, detail: error.detail, constraint: error.constraint });
  }
});

// Convert lead to contact
router.post('/:id/convert', auth, async (req, res) => {
  try {
    const leadId = req.params.id;
    const userId = req.user && req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    // Check if lead exists and user has permission
    let accessClause = 'AND (assigned_to = $2 OR created_by = $2)';
    let checkParams = [leadId, userId];
    if (isAdmin) {
      accessClause = '';
      checkParams = [leadId];
    }

    const leadResult = await db.query(
      `SELECT * FROM leads WHERE id = $1 ${accessClause}`,
      checkParams
    );

    if (leadResult.rows.length === 0) {
      return res.status(404).json({ error: 'Lead not found or access denied' });
    }

    const lead = leadResult.rows[0];

    // Start transaction
    await db.query('BEGIN');

    try {
      // Create contact from lead
      const contactResult = await db.query(
        `INSERT INTO contacts (
          first_name, last_name, email, phone, notes, 
          created_by, created_at, updated_at
        )
        VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *`,
        [
          lead.first_name,
          lead.last_name,
          lead.email,
          lead.phone,
          lead.notes,
          userId
        ]
      );

      // Update lead status to converted
      await db.query(
        'UPDATE leads SET status = $1, updated_at = NOW() WHERE id = $2',
        ['converted', leadId]
      );

      // Commit transaction
      await db.query('COMMIT');

      res.json({
        message: 'Lead converted to contact successfully',
        contact: contactResult.rows[0],
        lead_id: leadId
      });
    } catch (error) {
      // Rollback transaction
      await db.query('ROLLBACK');
      throw error;
    }
  } catch (error) {
    console.error('Convert lead error:', error);
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

module.exports = router;