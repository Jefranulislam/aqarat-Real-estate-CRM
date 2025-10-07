-- Create admin user manually
-- Password hash for 'admin123' with bcrypt rounds 12
INSERT INTO profiles (id, email, full_name, role, password_hash, created_at, updated_at) 
VALUES (
  gen_random_uuid(),
  'admin@aqarat.com',
  'System Administrator', 
  'admin',
  '$2a$12$LQv3c1yqBwEHXO4.2Z8A8O.ZiF5BUNXwdO8i8hF5BUNXwdO8i8hF5e',
  NOW(),
  NOW()
) ON CONFLICT (email) DO NOTHING;

-- Check if user was created
SELECT id, email, full_name, role FROM profiles WHERE email = 'admin@aqarat.com';