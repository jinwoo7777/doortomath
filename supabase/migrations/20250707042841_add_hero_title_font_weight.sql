-- supabase/migrations/20250707042841_add_hero_title_font_weight.sql
UPDATE public.main_page_content
SET content = jsonb_set(
  content,
  '{hero,titleFontWeight}',
  '"font-bold"',
  true
)
WHERE section_name = 'hero'
AND content->'hero' IS NOT NULL
AND content->'hero'->'titleFontWeight' IS NULL;