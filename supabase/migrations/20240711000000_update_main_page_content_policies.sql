-- Drop existing policies
DROP POLICY IF EXISTS "Enable all for admin users" ON public.main_page_content;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.main_page_content;

-- Create a more permissive policy for admin users
CREATE POLICY "Enable all for admin users" 
ON public.main_page_content 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

-- Create a separate read-only policy for non-admin users
CREATE POLICY "Enable read access for all authenticated users" 
ON public.main_page_content 
FOR SELECT 
TO authenticated 
USING (true);

-- Add a comment explaining the policies
COMMENT ON POLICY "Enable all for admin users" ON public.main_page_content 
IS 'Allows admin users to perform all operations on main_page_content';

COMMENT ON POLICY "Enable read access for all authenticated users" ON public.main_page_content 
IS 'Allows all authenticated users to read from main_page_content';
