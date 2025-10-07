const db = require('./src/config/database');

async function testDatabase() {
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    const result = await db.query('SELECT NOW()');
    console.log('✅ Database connected:', result.rows[0]);
    
    // Test deals table
    console.log('\n--- Testing deals table ---');
    const dealsResult = await db.query('SELECT COUNT(*) FROM deals');
    console.log('✅ Deals table exists, count:', dealsResult.rows[0].count);
    
    const dealsSchema = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'deals' 
      ORDER BY ordinal_position
    `);
    console.log('Deals schema:', dealsSchema.rows);
    
    // Test activities table  
    console.log('\n--- Testing activities table ---');
    const activitiesResult = await db.query('SELECT COUNT(*) FROM activities');
    console.log('✅ Activities table exists, count:', activitiesResult.rows[0].count);
    
    const activitiesSchema = await db.query(`
      SELECT column_name, data_type, is_nullable 
      FROM information_schema.columns 
      WHERE table_name = 'activities' 
      ORDER BY ordinal_position
    `);
    console.log('Activities schema:', activitiesSchema.rows);
    
    // Test simple deals query
    console.log('\n--- Testing simple deals query ---');
    const simpleDeals = await db.query('SELECT * FROM deals LIMIT 5');
    console.log('Simple deals query result:', simpleDeals.rows);
    
  } catch (error) {
    console.error('❌ Database test failed:', error.message);
    console.error('Full error:', error);
  } finally {
    process.exit();
  }
}

testDatabase();