// profiles 테이블 구조 확인을 위한 스크립트
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

async function checkTable() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // 관리자 키 필요
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('환경 변수가 설정되지 않았습니다.');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, supabaseKey);
  
  try {
    // 1. profiles 테이블이 있는지 확인
    const { data: tables, error: tablesError } = await supabase
      .from('pg_tables')
      .select('tablename')
      .eq('schemaname', 'public');
      
    if (tablesError) throw tablesError;
    
    console.log('사용 가능한 테이블 목록:');
    console.table(tables);
    
    // 2. profiles 테이블의 컬럼 정보 조회
    const { data: columns, error: columnsError } = await supabase
      .from('information_schema.columns')
      .select('column_name, data_type, is_nullable, column_default')
      .eq('table_schema', 'public')
      .eq('table_name', 'profiles');
      
    if (columnsError) throw columnsError;
    
    if (columns && columns.length > 0) {
      console.log('\nprofiles 테이블 컬럼 정보:');
      console.table(columns);
      
      // 3. 샘플 데이터 조회 (최대 1개 행만)
      const { data: sample, error: sampleError } = await supabase
        .from('profiles')
        .select('*')
        .limit(1);
        
      if (sampleError) throw sampleError;
      
      console.log('\nprofiles 테이블 샘플 데이터:');
      console.log(sample);
    } else {
      console.log('profiles 테이블을 찾을 수 없거나 컬럼이 없습니다.');
    }
    
  } catch (error) {
    console.error('오류 발생:', error);
  }
}

checkTable();
