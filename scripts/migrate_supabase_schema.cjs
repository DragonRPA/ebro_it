const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const DB_CONFIG = {
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.uvmhqwpkmzxrrlkeguul',
  password: 'BwYofacVm0ibBz67',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

async function migrate() {
  console.log('=== Supabase PostgreSQL DDL 마이그레이션 시작 ===');
  console.log('- Host: ' + DB_CONFIG.host + ':' + DB_CONFIG.port);
  console.log('- Target: postgres.uvmhqwpkmzxrrlkeguul');

  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('✅ Supabase PostgreSQL 직접 연결 성공!');

  const schemaPath = path.resolve(__dirname, '../schema.sql');
  if (!fs.existsSync(schemaPath)) {
    throw new Error('schema.sql 파일을 찾을 수 없습니다: ' + schemaPath);
  }

  const sql = fs.readFileSync(schemaPath, 'utf8');
  console.log('📖 schema.sql 로드 완료 (' + (sql.length / 1024).toFixed(1) + ' KB)');

  console.log('🚀 DDL 전체 스키마 실행 중 (테이블/제약조건/인덱스)...');
  console.time('DDL 실행 시간');
  await client.query(sql);
  console.timeEnd('DDL 실행 시간');
  console.log('🎉 전체 DDL 스키마 적용 완료!');

  console.log('🛡️ RLS 상태 점검 및 anon/authenticated 전면 접근 권한 부여 중...');
  const res = await client.query(`
    SELECT table_name 
    FROM information_schema.tables 
    WHERE table_schema = 'public' AND table_type = 'BASE TABLE';
  `);
  
  const tables = res.rows.map(r => r.table_name);
  console.log('총 ' + tables.length + '개 테이블 생성 확인:');
  
  for (const tbl of tables) {
    try {
      await client.query('ALTER TABLE "' + tbl + '" DISABLE ROW LEVEL SECURITY;');
      await client.query('GRANT ALL ON TABLE "' + tbl + '" TO anon, authenticated, service_role;');
    } catch (e) {
      console.warn('권한 부여 경고 (' + tbl + '):', e.message);
    }
  }
  console.log('✅ 전 테이블 RLS 비활성화 및 anon/authenticated 접근 권한 완비!');

  await client.query('GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;');

  await client.end();
  console.log('🏁 마이그레이션 정상 종료!');
}

migrate().catch(err => {
  console.error('❌ 마이그레이션 실패:', err.message);
  process.exit(1);
});
