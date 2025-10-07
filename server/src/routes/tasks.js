const express = require('express');
const { body, validationResult, query } = require('express-validator');
const auth = require('../middleware/auth');
const db = require('../config/database');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// Get all tasks with filters
router.get('/', [
  query('task_type').optional().isIn(['call', 'email', 'meeting', 'follow_up', 'showing', 'other']),
  query('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  query('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']),
  query('assigned_to').optional().isUUID(),
  query('due_date').optional().isISO8601()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { task_type, priority, status, assigned_to, due_date } = req.query;

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

    if (task_type) {
      whereClause += ` AND task_type = $${++paramCount}`;
      params.push(task_type);
    }

    if (priority) {
      whereClause += ` AND priority = $${++paramCount}`;
      params.push(priority);
    }

    if (status) {
      whereClause += ` AND status = $${++paramCount}`;
      params.push(status);
    }

    if (assigned_to) {
      whereClause += ` AND assigned_to = $${++paramCount}`;
      params.push(assigned_to);
    }

    if (due_date) {
      whereClause += ` AND due_date::date = $${++paramCount}::date`;
      params.push(due_date);
    }

    const query_text = `
      SELECT t.*, 
             p1.full_name as assigned_to_name,
             p2.full_name as created_by_name,
             CASE 
               WHEN t.related_to_type = 'contact' THEN c.first_name || ' ' || c.last_name
               ELSE NULL 
             END as contact_name,
             CASE 
               WHEN t.related_to_type = 'property' THEN pr.title
               ELSE NULL 
             END as property_title
      FROM tasks t
      LEFT JOIN profiles p1 ON t.assigned_to = p1.id
      LEFT JOIN profiles p2 ON t.created_by = p2.id
      LEFT JOIN contacts c ON t.related_to_type = 'contact' AND t.related_to_id = c.id
      LEFT JOIN properties pr ON t.related_to_type = 'property' AND t.related_to_id = pr.id
      ${whereClause}
      ORDER BY t.due_date ASC, t.priority DESC, t.created_at DESC
    `;

    const result = await db.query(query_text, params);

    res.json({
      tasks: result.rows,
      total: result.rows.length
    });
  } catch (error) {
    console.error('Get tasks error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single task
router.get('/:id', auth, async (req, res) => {
  try {
    const isAdmin = req.user && req.user.role === 'admin';
    let accessClause = 'AND (t.assigned_to = $2 OR t.created_by = $2)';
    let params = [req.params.id, req.user.id];
    if (isAdmin) {
      accessClause = '';
      params = [req.params.id];
    }

    const result = await db.query(
      `SELECT t.*, 
              p1.full_name as assigned_to_name,
              p2.full_name as created_by_name
       FROM tasks t
       LEFT JOIN profiles p1 ON t.assigned_to = p1.id
       LEFT JOIN profiles p2 ON t.created_by = p2.id
       WHERE t.id = $1 ${accessClause}`,
      params
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get task error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new task (temporarily disabled auth)
router.post('/', [
  body('title').notEmpty().trim(),
  body('description').optional().trim(),
  body('task_type').optional().isIn(['call', 'email', 'meeting', 'follow_up', 'showing', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']),
  body('due_date').optional().custom((value) => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return true;
  }),
  body('related_to_type').optional().isIn(['lead', 'contact', 'property', 'deal']),
  body('related_to_id').optional().isUUID(),
  body('assigned_to').optional().isUUID()
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { 
      title, 
      description, 
      task_type, 
      priority, 
      status, 
      due_date, 
      related_to_type, 
      related_to_id, 
      assigned_to 
    } = req.body;
    
    const userId = req.user && req.user.id;

    const query = `
      INSERT INTO tasks (
        title, description, task_type, priority, status, due_date, 
        related_to_type, related_to_id, assigned_to, 
        created_by, created_at, updated_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
      RETURNING *
    `;

    const values = [
      title,
      description || null,
      task_type || 'other',
      priority || 'medium',
      status || 'pending',
      due_date || null,
      related_to_type || null,
      related_to_id || null,
      assigned_to || null,
      userId
    ];

    const result = await db.query(query, values);
    const task = result.rows[0];

    res.status(201).json({
      message: 'Task created successfully',
      task: task
    });
  } catch (error) {
    console.error('Task creation error:', error);
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

// Update task (temporarily disabled auth)
router.put('/:id', [
  body('title').optional().notEmpty().trim(),
  body('description').optional().trim(),
  body('task_type').optional().isIn(['call', 'email', 'meeting', 'follow_up', 'showing', 'other']),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']),
  body('status').optional().isIn(['pending', 'in_progress', 'completed', 'cancelled']),
  body('due_date').optional().custom((value) => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return true;
  }),
  body('completed_at').optional().custom((value) => {
    if (!value) return true;
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      throw new Error('Invalid date format');
    }
    return true;
  }),
  body('related_to_type').optional().isIn(['lead', 'contact', 'property', 'deal']),
  body('related_to_id').optional().isUUID(),
  body('assigned_to').optional().isUUID()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const taskId = req.params.id;
    const userId = req.user && req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    // Check if task exists and user has permission
    let accessClause = 'AND (assigned_to = $2 OR created_by = $2)';
    let checkParams = [taskId, userId];
    if (isAdmin) {
      accessClause = '';
      checkParams = [taskId];
    }

    const checkResult = await db.query(
      `SELECT id FROM tasks WHERE id = $1 ${accessClause}`,
      checkParams
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // Build dynamic update query
    const updates = [];
    const values = [];
    let paramCounter = 1;

    const { 
      title, 
      description, 
      task_type, 
      priority, 
      status, 
      due_date, 
      completed_at,
      related_to_type, 
      related_to_id, 
      assigned_to 
    } = req.body;

    if (title !== undefined) {
      updates.push(`title = $${paramCounter++}`);
      values.push(title);
    }
    if (description !== undefined) {
      updates.push(`description = $${paramCounter++}`);
      values.push(description);
    }
    if (task_type !== undefined) {
      updates.push(`task_type = $${paramCounter++}`);
      values.push(task_type);
    }
    if (priority !== undefined) {
      updates.push(`priority = $${paramCounter++}`);
      values.push(priority);
    }
    if (status !== undefined) {
      updates.push(`status = $${paramCounter++}`);
      values.push(status);
    }
    if (due_date !== undefined) {
      updates.push(`due_date = $${paramCounter++}`);
      values.push(due_date);
    }

    if (completed_at !== undefined) {
      updates.push(`completed_at = $${paramCounter++}`);
      values.push(completed_at);
    }
    if (related_to_type !== undefined) {
      updates.push(`related_to_type = $${paramCounter++}`);
      values.push(related_to_type);
    }
    if (related_to_id !== undefined) {
      updates.push(`related_to_id = $${paramCounter++}`);
      values.push(related_to_id);
    }
    if (assigned_to !== undefined) {
      updates.push(`assigned_to = $${paramCounter++}`);
      values.push(assigned_to);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No valid fields to update' });
    }

    updates.push(`updated_at = NOW()`);
    values.push(taskId);

    const query = `
      UPDATE tasks 
      SET ${updates.join(', ')}
      WHERE id = $${paramCounter}
      RETURNING *
    `;

    const result = await db.query(query, values);
    const task = result.rows[0];

    res.json({
      message: 'Task updated successfully',
      task: task
    });
  } catch (error) {
    console.error('Task update error:', error);
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

// Delete task
router.delete('/:id', auth, async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user && req.user.id;
    const isAdmin = req.user && req.user.role === 'admin';

    // Check if task exists and user has permission
    let accessClause = 'AND (assigned_to = $2 OR created_by = $2)';
    let checkParams = [taskId, userId];
    if (isAdmin) {
      accessClause = '';
      checkParams = [taskId];
    }

    const checkResult = await db.query(
      `SELECT id FROM tasks WHERE id = $1 ${accessClause}`,
      checkParams
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ error: 'Task not found or access denied' });
    }

    // Delete the task
    await db.query('DELETE FROM tasks WHERE id = $1', [taskId]);

    res.json({
      message: 'Task deleted successfully',
      id: taskId
    });
  } catch (error) {
    console.error('Task deletion error:', error);
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

// Get tasks by related entity - DISABLED
// router.get('/related/:type/:id', auth, async (req, res) => {
//   // Implementation temporarily disabled
// });

module.exports = router;