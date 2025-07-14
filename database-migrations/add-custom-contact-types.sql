-- Add custom contact types table
-- This allows users to create custom contact types beyond the predefined ones

CREATE TABLE IF NOT EXISTS custom_contact_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value VARCHAR(100) NOT NULL UNIQUE, -- The programmatic value (e.g., 'startup_founder')
  label VARCHAR(200) NOT NULL, -- The display label (e.g., 'Startup Founder')
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL, -- Optional: track who created it
  is_active BOOLEAN DEFAULT TRUE NOT NULL -- For soft deletion
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_contact_types_active ON custom_contact_types(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_contact_types_value ON custom_contact_types(value) WHERE is_active = TRUE;

-- Add RLS (Row Level Security) policies
ALTER TABLE custom_contact_types ENABLE ROW LEVEL SECURITY;

-- Allow all authenticated users to read active custom types
CREATE POLICY "Allow authenticated users to read active custom contact types"
ON custom_contact_types
FOR SELECT
TO authenticated
USING (is_active = TRUE);

-- Allow all authenticated users to create custom types
CREATE POLICY "Allow authenticated users to create custom contact types"
ON custom_contact_types
FOR INSERT
TO authenticated
WITH CHECK (TRUE);

-- Allow users to update their own custom types (when we add user tracking)
CREATE POLICY "Allow users to update custom contact types"
ON custom_contact_types
FOR UPDATE
TO authenticated
USING (TRUE)
WITH CHECK (TRUE);

-- Allow users to soft delete custom types (set is_active = FALSE)
CREATE POLICY "Allow users to soft delete custom contact types"
ON custom_contact_types
FOR UPDATE
TO authenticated
USING (TRUE)
WITH CHECK (is_active IN (TRUE, FALSE));

-- Add some example custom types to get started
INSERT INTO custom_contact_types (value, label) VALUES
  ('tech_executive', 'Tech Executive'),
  ('startup_founder', 'Startup Founder'),
  ('venture_capitalist', 'Venture Capitalist'),
  ('consultant', 'Consultant'),
  ('freelancer', 'Freelancer')
ON CONFLICT (value) DO NOTHING;

-- Grant permissions to the service role
GRANT ALL ON custom_contact_types TO service_role;
GRANT ALL ON custom_contact_types TO authenticated; 