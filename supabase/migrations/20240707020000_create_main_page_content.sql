-- Create main_page_content table
CREATE TABLE IF NOT EXISTS public.main_page_content (
  id BIGSERIAL PRIMARY KEY,
  section_name TEXT NOT NULL UNIQUE,
  content JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments
COMMENT ON TABLE public.main_page_content IS 'Stores main page content sections';
COMMENT ON COLUMN public.main_page_content.section_name IS 'Name of the section (e.g., hero, features, about)';
COMMENT ON COLUMN public.main_page_content.content IS 'JSON content of the section';

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_main_page_content_section_name ON public.main_page_content (section_name);

-- Add RLS (Row Level Security) policies
ALTER TABLE public.main_page_content ENABLE ROW LEVEL SECURITY;

-- Allow admin users to manage content
CREATE POLICY "Enable all for admin users" 
ON public.main_page_content 
FOR ALL 
TO authenticated 
USING (auth.role() = 'authenticated' AND 
       EXISTS (
         SELECT 1 FROM profiles 
         WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
       )
);

-- Allow read access to all authenticated users
CREATE POLICY "Enable read access for all authenticated users" 
ON public.main_page_content 
FOR SELECT 
TO authenticated 
USING (true);

-- Create update trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_main_page_content_updated_at
BEFORE UPDATE ON public.main_page_content
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
