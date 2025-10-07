const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all properties with filters
router.get('/', [
  query('property_type').optional().isIn(['residential', 'commercial', 'land', 'multi_family', 'condo', 'townhouse']),
  query('status').optional().isIn(['active', 'pending', 'sold', 'off_market']),
  query('min_price').optional().isFloat({ min: 0 }),
  query('max_price').optional().isFloat({ min: 0 }),
  query('city').optional().trim(),
  query('state').optional().trim(),
  query('bedrooms').optional().isInt({ min: 0 }),
  query('bathrooms').optional().isFloat({ min: 0 })
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      property_type, status, min_price, max_price, 
      city, state, bedrooms, bathrooms
    } = req.query;

    const isAdmin = req.user && req.user.role === 'admin';
    let whereClause = '';
    let params = [];
    let paramCount = 0;

    if (isAdmin) {
      whereClause = 'WHERE 1=1';
    } else {
      whereClause = 'WHERE (listed_by = $1 OR created_by = $1)';
      params.push(req.user.id);
      paramCount = 1;
    }

    if (property_type) {
      whereClause += ` AND property_type = $${++paramCount}`;
      params.push(property_type);
    }

    if (status) {
      whereClause += ` AND status = $${++paramCount}`;
      params.push(status);
    }

    if (min_price) {
      whereClause += ` AND price >= $${++paramCount}`;
      params.push(min_price);
    }

    if (max_price) {
      whereClause += ` AND price <= $${++paramCount}`;
      params.push(max_price);
    }

    if (city) {
      whereClause += ` AND city ILIKE $${++paramCount}`;
      params.push(`%${city}%`);
    }

    if (state) {
      whereClause += ` AND state ILIKE $${++paramCount}`;
      params.push(`%${state}%`);
    }

    if (bedrooms) {
      whereClause += ` AND bedrooms = $${++paramCount}`;
      params.push(bedrooms);
    }

    if (bathrooms) {
      whereClause += ` AND bathrooms = $${++paramCount}`;
      params.push(bathrooms);
    }

    const query_text = `
      SELECT p.*, 
             p1.full_name as listed_by_name,
             p2.full_name as created_by_name,
             c.first_name || ' ' || c.last_name as owner_name
      FROM properties p
      LEFT JOIN profiles p1 ON p.listed_by = p1.id
      LEFT JOIN profiles p2 ON p.created_by = p2.id
      LEFT JOIN contacts c ON p.owner_contact_id = c.id
      ${whereClause}
      ORDER BY p.created_at DESC
    `;

    const result = await db.query(query_text, params);

    res.json({
      properties: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get properties error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single property
router.get('/:id', auth, async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    let accessClause = 'AND (p.listed_by = $2 OR p.created_by = $2)';
    let params = [req.params.id, req.user.id];
    if (isAdmin) {
      accessClause = '';
      params = [req.params.id];
    }

    const result = await db.query(
      `SELECT p.*, 
              p1.full_name as listed_by_name,
              p2.full_name as created_by_name,
              c.first_name || ' ' || c.last_name as owner_name,
              c.email as owner_email,
              c.phone as owner_phone
       FROM properties p
       LEFT JOIN profiles p1 ON p.listed_by = p1.id
       LEFT JOIN profiles p2 ON p.created_by = p2.id
       LEFT JOIN contacts c ON p.owner_contact_id = c.id
       WHERE p.id = $1 ${accessClause}`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new property
router.post('/', [
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
  body('property_type').isIn(['residential', 'commercial', 'land', 'multi_family', 'condo', 'townhouse']),
  body('status').optional().isIn(['active', 'pending', 'sold', 'off_market']),
  body('price').optional().isFloat({ min: 0 }),
  body('address').notEmpty().trim(),
  body('city').notEmpty().trim(),
  body('state').notEmpty().trim(),
  body('zip_code').notEmpty().trim(),
  body('country').optional().trim(),
  body('bedrooms').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isFloat({ min: 0 }),
  body('square_feet').optional().isInt({ min: 0 }),
  body('lot_size').optional().isFloat({ min: 0 }),
  body('year_built').optional().isInt({ min: 1800, max: new Date().getFullYear() + 1 }),
  body('features').optional().isArray(),
  body('images').optional().isArray(),
  body('virtual_tour_url').optional().isURL(),
  body('mls_number').optional().trim(),
  body('listed_by').optional().isUUID(),
  body('owner_contact_id').optional().isUUID()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      description, 
      property_type, 
      status, 
      price, 
      address, 
      city, 
      state, 
      zip_code, 
      country, 
      bedrooms, 
      bathrooms, 
      square_feet, 
      lot_size, 
      year_built, 
      features, 
      images, 
      virtual_tour_url, 
      mls_number, 
      listed_by, 
      owner_contact_id 
    } = req.body;
    
    const userId = req.user && req.user.id;

    const query = `
      INSERT INTO properties (
        title, description, property_type, status, price, address, city, state, 
        zip_code, country, bedrooms, bathrooms, square_feet, lot_size, year_built, 
        features, images, virtual_tour_url, mls_number, listed_by, owner_contact_id, 
        created_by, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      title,
      description || null,
      property_type,
      status || 'active',
      price || null,
      address,
      city,
      state,
      zip_code || null,
      country || 'USA',
      bedrooms || null,
      bathrooms || null,
      square_feet || null,
      lot_size || null,
      year_built || null,
      features ? JSON.stringify(features) : null,
      images ? JSON.stringify(images) : null,
      virtual_tour_url || null,
      mls_number || null,
      listed_by || userId,
      owner_contact_id || null,
      userId
    ];

    const result = await db.query(query, values);
    const property = result.rows[0];

    // Parse JSON fields back for response
    if (property.features) {
      property.features = JSON.parse(property.features);
    }
    if (property.images) {
      property.images = JSON.parse(property.images);
    }

    res.status(201).json({
      message: 'Property created successfully',
      property: property
    });
  } catch (error) {
    console.error('Property creation error:', error);
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

// Update property
router.put('/:id', [
  body('title').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('property_type').optional().isIn(['residential', 'commercial', 'land', 'multi_family', 'condo', 'townhouse']),
  body('status').optional().isIn(['active', 'pending', 'sold', 'off_market']),
  body('price').optional().isFloat({ min: 0 }),
  body('address').optional().notEmpty().trim(),
  body('city').optional().notEmpty().trim(),
  body('state').optional().notEmpty().trim(),
  body('zip_code').optional().notEmpty().trim(),
  body('country').optional().trim(),
  body('bedrooms').optional().isInt({ min: 0 }),
  body('bathrooms').optional().isFloat({ min: 0 }),
  body('square_feet').optional().isInt({ min: 0 }),
  body('lot_size').optional().isFloat({ min: 0 }),
  body('year_built').optional().isInt({ min: 1800, max: new Date().getFullYear() + 1 }),
  body('features').optional().isArray(),
  body('images').optional().isArray(),
  body('virtual_tour_url').optional().isURL(),
  body('mls_number').optional().trim(),
  body('listed_by').optional().isUUID(),
  body('owner_contact_id').optional().isUUID()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title, description, property_type, status, price, address, city, state, 
      zip_code, country, bedrooms, bathrooms, square_feet, lot_size, year_built, 
      features, images, virtual_tour_url, mls_number, listed_by, owner_contact_id
    } = req.body;

    const result = await db.query(
      `UPDATE properties 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           property_type = COALESCE($3, property_type),
           status = COALESCE($4, status),
           price = COALESCE($5, price),
           address = COALESCE($6, address),
           city = COALESCE($7, city),
           state = COALESCE($8, state),
           zip_code = COALESCE($9, zip_code),
           country = COALESCE($10, country),
           bedrooms = COALESCE($11, bedrooms),
           bathrooms = COALESCE($12, bathrooms),
           square_feet = COALESCE($13, square_feet),
           lot_size = COALESCE($14, lot_size),
           year_built = COALESCE($15, year_built),
           features = COALESCE($16, features),
           images = COALESCE($17, images),
           virtual_tour_url = COALESCE($18, virtual_tour_url),
           mls_number = COALESCE($19, mls_number),
           listed_by = COALESCE($20, listed_by),
           owner_contact_id = COALESCE($21, owner_contact_id),
           updated_at = NOW()
       WHERE id = $22 ${req.user && req.user.role === 'admin' ? '' : 'AND (created_by = $23 OR listed_by = $23)'}
       RETURNING *`,
      req.user && req.user.role === 'admin' 
        ? [
            title, description, property_type, status, price, address, city, state, 
            zip_code, country, bedrooms, bathrooms, square_feet, lot_size, year_built, 
            features ? JSON.stringify(features) : null, 
            images ? JSON.stringify(images) : null, 
            virtual_tour_url, mls_number, listed_by, owner_contact_id, 
            req.params.id
          ]
        : [
            title, description, property_type, status, price, address, city, state, 
            zip_code, country, bedrooms, bathrooms, square_feet, lot_size, year_built, 
            features ? JSON.stringify(features) : null, 
            images ? JSON.stringify(images) : null, 
            virtual_tour_url, mls_number, listed_by, owner_contact_id, 
            req.params.id, req.user.id
          ]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found or access denied' });
    }

    res.json({
      message: 'Property updated successfully',
      property: result.rows[0]
    });
  } catch (error) {
    console.error('Update property error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete property
router.delete('/:id', auth, async (req, res) => {
  try {
    const propertyId = req.params.id;
    const userId = req.user && req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    // Build access clause based on user role
    let accessClause = 'AND (created_by = $2 OR listed_by = $2)';
    let params = [propertyId, userId];
    if (isAdmin) {
      accessClause = '';
      params = [propertyId];
    }

    const result = await db.query(
      `DELETE FROM properties WHERE id = $1 ${accessClause} RETURNING id`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Property not found or access denied' });
    }

    res.json({
      message: 'Property deleted successfully',
      id: result.rows[0].id
    });
  } catch (error) {
    console.error('Property deletion error:', error);
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