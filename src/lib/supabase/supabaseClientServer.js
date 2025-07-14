import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Supabase 환경 변수가 설정되지 않았습니다. .env.local 파일을 확인해주세요.');
}

let supabaseServerInstance = null;

const createSupabaseServerClient = () => {
  if (supabaseServerInstance) return supabaseServerInstance;

  supabaseServerInstance = createServerComponentClient({ cookies });
  return supabaseServerInstance;
};

export { createSupabaseServerClient };
