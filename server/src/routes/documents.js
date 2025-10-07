const express = require('express');
const multer = require('multer');
const path = require('path');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, process.env.UPLOAD_PATH || './uploads');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024 // 5MB default
  },
  fileFilter: (req, file, cb) => {
    // Allow common document types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|ppt|pptx|txt/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only documents and images are allowed.'));
    }
  }
});

// Get all documents with filters
router.get('/', auth, [
  query('document_type').optional().isIn(['contract', 'agreement', 'disclosure', 'inspection', 'appraisal', 'other']),
  query('related_to_type').optional().isIn(['lead', 'contact', 'property', 'deal']),
  query('related_to_id').optional().isUUID(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      document_type, 
      related_to_type, 
      related_to_id, 
      page = 1, 
      limit = 20 
    } = req.query;
    
    const offset = (page - 1) * limit;

    let whereClause = 'WHERE uploaded_by = $1';
    let params = [req.user.id];
    let paramCount = 1;

    if (document_type) {
      whereClause += ` AND document_type = $${++paramCount}`;
      params.push(document_type);
    }

    if (related_to_type) {
      whereClause += ` AND related_to_type = $${++paramCount}`;
      params.push(related_to_type);
    }

    if (related_to_id) {
      whereClause += ` AND related_to_id = $${++paramCount}`;
      params.push(related_to_id);
    }

    const query_text = `
      SELECT d.*, 
             p.full_name as uploaded_by_name
      FROM documents d
      LEFT JOIN profiles p ON d.uploaded_by = p.id
      ${whereClause}
      ORDER BY d.created_at DESC
      LIMIT $${++paramCount} OFFSET $${++paramCount}
    `;
    
    params.push(limit, offset);

    const result = await db.query(query_text, params);

    // Get total count
    const countQuery = `SELECT COUNT(*) FROM documents ${whereClause}`;
    const countResult = await db.query(countQuery, params.slice(0, -2));

    res.json({
      documents: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: parseInt(countResult.rows[0].count),
        pages: Math.ceil(countResult.rows[0].count / limit)
      }
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single document
router.get('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      `SELECT d.*, 
              p.full_name as uploaded_by_name
       FROM documents d
       LEFT JOIN profiles p ON d.uploaded_by = p.id
       WHERE d.id = $1 AND d.uploaded_by = $2`,
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Upload new document
router.post('/', auth, upload.single('document'), [
  body('title').notEmpty().trim(),
  body('document_type').optional().isIn(['contract', 'agreement', 'disclosure', 'inspection', 'appraisal', 'other']),
  body('related_to_type').optional().isIn(['lead', 'contact', 'property', 'deal']),
  body('related_to_id').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const {
      title,
      document_type,
      related_to_type,
      related_to_id
    } = req.body;

    const documentId = uuidv4();
    
    // In a real application, you would upload to cloud storage (AWS S3, etc.)
    // For now, we'll use local file path
    const file_url = `/uploads/${req.file.filename}`;

    const result = await db.query(
      `INSERT INTO documents (
        id, title, file_name, file_url, file_type, file_size, 
        document_type, related_to_type, related_to_id, uploaded_by
      )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        documentId, title, req.file.originalname, file_url, req.file.mimetype, 
        req.file.size, document_type, related_to_type, related_to_id, req.user.id
      ]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Upload document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update document metadata
router.put('/:id', auth, [
  body('title').optional().notEmpty().trim(),
  body('document_type').optional().isIn(['contract', 'agreement', 'disclosure', 'inspection', 'appraisal', 'other']),
  body('related_to_type').optional().isIn(['lead', 'contact', 'property', 'deal']),
  body('related_to_id').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      title,
      document_type,
      related_to_type,
      related_to_id
    } = req.body;

    const result = await db.query(
      `UPDATE documents 
       SET title = COALESCE($1, title),
           document_type = COALESCE($2, document_type),
           related_to_type = COALESCE($3, related_to_type),
           related_to_id = COALESCE($4, related_to_id)
       WHERE id = $5 AND uploaded_by = $6
       RETURNING *`,
      [title, document_type, related_to_type, related_to_id, req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete document
router.delete('/:id', auth, async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM documents WHERE id = $1 AND uploaded_by = $2 RETURNING file_url',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found or access denied' });
    }

    // In a real application, you would also delete the file from storage
    // For local files, you could use fs.unlink() here

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get documents by related entity
router.get('/related/:type/:id', auth, async (req, res) => {
  try {
    const { type, id } = req.params;

    if (!['lead', 'contact', 'property', 'deal'].includes(type)) {
      return res.status(400).json({ error: 'Invalid related type' });
    }

    const result = await db.query(
      `SELECT d.*, 
              p.full_name as uploaded_by_name
       FROM documents d
       LEFT JOIN profiles p ON d.uploaded_by = p.id
       WHERE d.related_to_type = $1 AND d.related_to_id = $2 AND d.uploaded_by = $3
       ORDER BY d.created_at DESC`,
      [type, id, req.user.id]
    );

    res.json(result.rows);
  } catch (error) {
    console.error('Get related documents error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download document
router.get('/:id/download', auth, async (req, res) => {
  try {
    const result = await db.query(
      'SELECT file_url, file_name FROM documents WHERE id = $1 AND uploaded_by = $2',
      [req.params.id, req.user.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Document not found' });
    }

    const { file_url, file_name } = result.rows[0];
    const filePath = path.join(__dirname, '../../..', file_url);

    res.download(filePath, file_name, (err) => {
      if (err) {
        console.error('Download error:', err);
        res.status(404).json({ error: 'File not found' });
      }
    });
  } catch (error) {
    console.error('Download document error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;