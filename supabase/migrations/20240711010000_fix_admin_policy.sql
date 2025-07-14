-- 기존 정책 삭제
DROP POLICY IF EXISTS "Enable all for admin users" ON public.main_page_content;
DROP POLICY IF EXISTS "Enable read access for all authenticated users" ON public.main_page_content;

-- 관리자용 정책 (CRUD 모두 허용)
CREATE POLICY "Enable all for admin users" 
ON public.main_page_content 
FOR ALL 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() 
    AND role = 'admin'
  )
);

-- 인증된 모든 사용자에게 읽기 권한 부여
CREATE POLICY "Enable read access for all authenticated users" 
ON public.main_page_content 
FOR SELECT 
TO authenticated 
USING (true);

-- 정책 설명 추가
COMMENT ON POLICY "Enable all for admin users" ON public.main_page_content 
IS '관리자(role=admin)에게 main_page_content 테이블에 대한 모든 권한 부여';

COMMENT ON POLICY "Enable read access for all authenticated users" ON public.main_page_content 
IS '인증된 모든 사용자에게 읽기 권한 부여';
