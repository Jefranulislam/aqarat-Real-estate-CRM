const jwt = require('jsonwebtoken');
const db = require('../config/database');

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    console.log('Auth middleware - Authorization header:', authHeader);
    
    const token = authHeader?.replace('Bearer ', '');
    console.log('Auth middleware - Extracted token:', token ? token.substring(0, 20) + '...' : 'No token');

    if (!token) {
      console.log('Auth middleware - No token provided');
      return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    console.log('Auth middleware - JWT_SECRET exists:', !!process.env.JWT_SECRET);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded successfully:', { userId: decoded.userId, email: decoded.email });
    
    // Handle temporary admin user
    if (decoded.userId === '12345' && decoded.email === 'admin@aqarat.com') {
      console.log('Auth middleware - Temporary admin token detected');
      try {
        const adminResult = await db.query(
          'SELECT id, email, full_name, role FROM profiles WHERE email = ANY($1::text[]) LIMIT 1',
          [[ 'admin@aqarat.com', 'admin@aqarat.com' ]]
        );
        if (adminResult.rows.length > 0) {
          req.user = { ...adminResult.rows[0], role: 'admin' };
          console.log('Auth middleware - Mapped temporary admin to real profile ID:', req.user.id);
        } else {
          // Fallback: no DB profile exists, continue as admin without a DB-backed ID
          req.user = {
            id: 'admin',
            email: 'admin@aqarat.com',
            full_name: 'System Administrator',
            role: 'admin'
          };
          console.log('Auth middleware - No admin profile in DB, using fallback admin identity');
        }
        return next();
      } catch (adminMapErr) {
        console.error('Auth middleware - Error mapping admin user:', adminMapErr);
        // Still allow as admin to avoid blocking dev flows
        req.user = {
          id: 'admin',
          email: 'admin@aqarat.com',
          full_name: 'System Administrator',
          role: 'admin'
        };
        return next();
      }
    }

    // Get regular user from database
    try {
      const result = await db.query(
        'SELECT id, email, full_name, role FROM profiles WHERE id = $1',
        [decoded.userId]
      );

      if (result.rows.length === 0) {
        console.log('Auth middleware - User not found in database for ID:', decoded.userId);
        return res.status(401).json({ error: 'Invalid token.' });
      }

      req.user = result.rows[0];
      console.log('Auth middleware - User found in database:', req.user.email);
      next();
    } catch (dbError) {
      console.error('Auth middleware - Database error:', dbError);
      return res.status(500).json({ error: 'Database error during authentication.' });
    }

  } catch (error) {
    console.error('Auth middleware - JWT verification error:', error);
    res.status(401).json({ error: 'Invalid token.' });
  }
};

module.exports = auth;