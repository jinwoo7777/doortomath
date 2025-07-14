/**
 * @file Supabase 클라이언트 설정
 * @description Supabase 클라이언트 인스턴스를 생성하고 내보냅니다.
 */

// 중앙 Supabase 클라이언트(singleton) 재사용
import { supabase } from '@/lib/supabase/supabaseClientBrowser.js';


export { supabase };
export default supabase;
