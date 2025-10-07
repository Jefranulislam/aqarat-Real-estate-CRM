const bcrypt = require('bcryptjs');
const db = require('./src/config/database');
const { v4: uuidv4 } = require('uuid');

async function createAdminUser() {
  try {
    console.log('Creating admin user...');
    
    const email = 'admin@aqarat.com';
    const password = 'admin123';
    const fullName = 'System Administrator';
    const role = 'admin';
    
    // Check if admin already exists
    const existing = await db.query('SELECT id FROM profiles WHERE email = $1', [email]);
    
    if (existing.rows.length > 0) {
      console.log('Admin user already exists with email:', email);
      return;
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);
    const userId = uuidv4();
    
    // Create admin user
    await db.query(
      `INSERT INTO profiles (id, email, full_name, role, password_hash) 
       VALUES ($1, $2, $3, $4, $5)`,
      [userId, email, fullName, role, hashedPassword]
    );
    
    console.log('✅ Admin user created successfully!');
    console.log('Email:', email);
    console.log('Password:', password);
    console.log('Role:', role);
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    process.exit();
  }
}

createAdminUser();