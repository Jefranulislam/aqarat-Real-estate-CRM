-- Create properties table
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

-- Enable RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

-- Policies for properties
CREATE POLICY "Users can view all properties" 
  ON public.properties FOR SELECT 
  USING (true);

CREATE POLICY "Users can insert properties" 
  ON public.properties FOR INSERT 
  WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update properties they created or listed" 
  ON public.properties FOR UPDATE 
  USING (auth.uid() = created_by OR auth.uid() = listed_by);

CREATE POLICY "Users can delete properties they created" 
  ON public.properties FOR DELETE 
  USING (auth.uid() = created_by);

-- Create indexes
CREATE INDEX idx_properties_status ON public.properties(status);
CREATE INDEX idx_properties_city ON public.properties(city);
CREATE INDEX idx_properties_price ON public.properties(price);
CREATE INDEX idx_properties_created_at ON public.properties(created_at DESC);
