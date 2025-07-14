// 스크립트를 통해 profiles 테이블 구조 확인
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL 또는 API 키가 설정되지 않았습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkProfilesTable() {
  try {
    console.log('profiles 테이블 구조를 확인 중...');
    
    // 테이블 컬럼 정보 조회
    const { data: columns, error } = await supabase
      .rpc('get_columns_info', { table_name: 'profiles' });
    
    if (error) {
      console.error('컬럼 정보 조회 중 오류 발생:', error);
      // RPC 함수가 없을 경우 직접 쿼리 시도
      const { data, error: queryError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
        
      if (queryError) {
        console.error('테이블 조회 중 오류:', queryError);
        return;
      }
      
      console.log('profiles 테이블 샘플 데이터:', data);
      return;
    }
    
    console.log('profiles 테이블 컬럼 정보:');
    console.table(columns);
    
  } catch (err) {
    console.error('오류 발생:', err);
  }
}

checkProfilesTable();
