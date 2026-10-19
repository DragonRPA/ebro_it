// scripts/migrate_it_deposit.cjs
// Supabase ebro-it-demo: contracts 및 payments 테이블 보증금 라이프사이클 컬럼 마이그레이션
const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.uvmhqwpkmzxrrlkeguul',
  password: 'BwYofacVm0ibBz67',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  console.log('✅ Supabase PostgreSQL 연결 성공!');
  await client.query('SET search_path TO public, extensions;');

  console.log('1. contracts 테이블에 보증금 라이프사이클 컬럼 추가...');
  await client.query(`
    ALTER TABLE contracts
    ADD COLUMN IF NOT EXISTS "depositBalance" DOUBLE PRECISION DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "depositStatus" TEXT DEFAULT 'UNPAID',
    ADD COLUMN IF NOT EXISTS "depositPaidDate" TEXT,
    ADD COLUMN IF NOT EXISTS "depositBankTransactionId" TEXT,
    ADD COLUMN IF NOT EXISTS "depositRefundedDate" TEXT,
    ADD COLUMN IF NOT EXISTS "depositRefundAmount" DOUBLE PRECISION DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "depositRefundBank" TEXT,
    ADD COLUMN IF NOT EXISTS "depositRefundAccount" TEXT,
    ADD COLUMN IF NOT EXISTS "depositRefundHolder" TEXT,
    ADD COLUMN IF NOT EXISTS "depositMemo" TEXT;
  `);

  console.log('2. payments 테이블에 보증금 상계 계약 외래키 컬럼 추가...');
  await client.query(`
    ALTER TABLE payments
    ADD COLUMN IF NOT EXISTS "depositOffsetContractId" TEXT;
  `);

  console.log('3. PostgREST 스키마 캐시 리로드...');
  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log('✅ PostgREST schema cache reloaded!');

  // 검증 조회
  const res = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'contracts' AND column_name LIKE 'deposit%'
    ORDER BY ordinal_position;
  `);
  console.log('🔍 contracts 보증금 컬럼 목록:', res.rows);

  const res2 = await client.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'payments' AND column_name LIKE 'deposit%'
    ORDER BY ordinal_position;
  `);
  console.log('🔍 payments 보증금 컬럼 목록:', res2.rows);

  await client.end();
}

run().catch(err => {
  console.error('❌ 마이그레이션 실패:', err);
  process.exit(1);
});
