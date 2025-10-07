const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

async function runMigration() {
  const client = await pool.connect();
  
  try {
    console.log('Starting database migration...');
    
    // Start transaction
    await client.query('BEGIN');

    // Create profiles table (standalone, without Supabase auth)
    console.log('Creating profiles table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.profiles (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email TEXT NOT NULL UNIQUE,
        full_name TEXT,
        phone TEXT,
        role TEXT NOT NULL CHECK (role IN ('admin', 'broker', 'agent')),
        avatar_url TEXT,
        password_hash TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
    `);

    // Create leads table
    console.log('Creating leads table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.leads (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        source TEXT CHECK (source IN ('website', 'referral', 'social_media', 'cold_call', 'event', 'other')),
        status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'unqualified', 'converted')),
        score INTEGER DEFAULT 0 CHECK (score >= 0 AND score <= 100),
        notes TEXT,
        assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_leads_assigned_to ON public.leads(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
      CREATE INDEX IF NOT EXISTS idx_leads_created_at ON public.leads(created_at DESC);
    `);

    // Create contacts table
    console.log('Creating contacts table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.contacts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        email TEXT,
        phone TEXT,
        company TEXT,
        job_title TEXT,
        address TEXT,
        city TEXT,
        state TEXT,
        zip_code TEXT,
        country TEXT DEFAULT 'USA',
        contact_type TEXT CHECK (contact_type IN ('buyer', 'seller', 'both', 'investor', 'other')),
        tags TEXT[],
        notes TEXT,
        assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_contacts_assigned_to ON public.contacts(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_contacts_email ON public.contacts(email);
      CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON public.contacts(created_at DESC);
    `);

    // Create properties table
    console.log('Creating properties table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.properties (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        property_type TEXT CHECK (property_type IN ('residential', 'commercial', 'land', 'multi_family', 'condo', 'townhouse')),
        status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'sold', 'off_market')),
        price DECIMAL(12, 2),
        address TEXT NOT NULL,
        city TEXT NOT NULL,
        state TEXT NOT NULL,
        zip_code TEXT NOT NULL,
        country TEXT DEFAULT 'USA',
        bedrooms INTEGER,
        bathrooms DECIMAL(3, 1),
        square_feet INTEGER,
        lot_size DECIMAL(10, 2),
        year_built INTEGER,
        features TEXT[],
        images TEXT[],
        virtual_tour_url TEXT,
        mls_number TEXT,
        listed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        owner_contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
        created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_properties_status ON public.properties(status);
      CREATE INDEX IF NOT EXISTS idx_properties_city ON public.properties(city);
      CREATE INDEX IF NOT EXISTS idx_properties_price ON public.properties(price);
      CREATE INDEX IF NOT EXISTS idx_properties_created_at ON public.properties(created_at DESC);
    `);

    // Create deals table
    console.log('Creating deals table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.deals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        deal_type TEXT CHECK (deal_type IN ('purchase', 'sale', 'lease', 'rental')),
        stage TEXT NOT NULL DEFAULT 'lead' CHECK (stage IN ('lead', 'qualified', 'proposal', 'negotiation', 'contract', 'closing', 'closed_won', 'closed_lost')),
        value DECIMAL(12, 2),
        probability INTEGER DEFAULT 50 CHECK (probability >= 0 AND probability <= 100),
        expected_close_date DATE,
        actual_close_date DATE,
        property_id UUID REFERENCES public.properties(id) ON DELETE SET NULL,
        contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
        assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        notes TEXT,
        created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_deals_stage ON public.deals(stage);
      CREATE INDEX IF NOT EXISTS idx_deals_assigned_to ON public.deals(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_deals_expected_close_date ON public.deals(expected_close_date);
      CREATE INDEX IF NOT EXISTS idx_deals_created_at ON public.deals(created_at DESC);
    `);

    // Create tasks table
    console.log('Creating tasks table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.tasks (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        description TEXT,
        task_type TEXT CHECK (task_type IN ('call', 'email', 'meeting', 'follow_up', 'showing', 'other')),
        priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
        status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed', 'cancelled')),
        due_date TIMESTAMPTZ,
        completed_at TIMESTAMPTZ,
        related_to_type TEXT CHECK (related_to_type IN ('lead', 'contact', 'property', 'deal')),
        related_to_id UUID,
        assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
        created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_tasks_assigned_to ON public.tasks(assigned_to);
      CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
      CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);
      CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at DESC);
    `);

    // Create activities table
    console.log('Creating activities table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.activities (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        activity_type TEXT NOT NULL CHECK (activity_type IN ('call', 'email', 'sms', 'meeting', 'note', 'showing', 'other')),
        subject TEXT NOT NULL,
        description TEXT,
        duration_minutes INTEGER,
        related_to_type TEXT CHECK (related_to_type IN ('lead', 'contact', 'property', 'deal')),
        related_to_id UUID,
        contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
        created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_activities_related_to ON public.activities(related_to_type, related_to_id);
      CREATE INDEX IF NOT EXISTS idx_activities_contact_id ON public.activities(contact_id);
      CREATE INDEX IF NOT EXISTS idx_activities_created_at ON public.activities(created_at DESC);
    `);

    // Create documents table
    console.log('Creating documents table...');
    await client.query(`
      CREATE TABLE IF NOT EXISTS public.documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        file_name TEXT NOT NULL,
        file_url TEXT NOT NULL,
        file_type TEXT,
        file_size INTEGER,
        document_type TEXT CHECK (document_type IN ('contract', 'agreement', 'disclosure', 'inspection', 'appraisal', 'other')),
        related_to_type TEXT CHECK (related_to_type IN ('lead', 'contact', 'property', 'deal')),
        related_to_id UUID,
        uploaded_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_documents_related_to ON public.documents(related_to_type, related_to_id);
      CREATE INDEX IF NOT EXISTS idx_documents_created_at ON public.documents(created_at DESC);
    `);

    // Commit transaction
    await client.query('COMMIT');
    console.log('Database migration completed successfully!');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Migration failed:', error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

runMigration()
  .then(() => {
    console.log('All done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Fatal error:', error);
    process.exit(1);
  });