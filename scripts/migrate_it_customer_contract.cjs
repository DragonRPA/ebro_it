// scripts/migrate_it_customer_contract.cjs
// Supabase ebro-it-demo: customers, customer_sites, contracts 스키마 IT 도메인 개편 마이그레이션
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

  console.log('1. customers 테이블에 billingTargets JSONB 추가...');
  await client.query(`
    ALTER TABLE customers 
    ADD COLUMN IF NOT EXISTS "billingTargets" JSONB DEFAULT '[]'::jsonb;
  `);

  console.log('2. customer_sites (설치/납품처) 테이블 IT 거점 컬럼 확장...');
  await client.query(`
    ALTER TABLE customer_sites
    ADD COLUMN IF NOT EXISTS "addressDetail" TEXT,
    ADD COLUMN IF NOT EXISTS "department" TEXT,
    ADD COLUMN IF NOT EXISTS "contactPhone" TEXT,
    ADD COLUMN IF NOT EXISTS "deliveryMethod" TEXT DEFAULT 'COURIER',
    ADD COLUMN IF NOT EXISTS "hasFreightElevator" BOOLEAN DEFAULT TRUE,
    ADD COLUMN IF NOT EXISTS "requiresSecurityPass" BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS "accessNotes" TEXT,
    ADD COLUMN IF NOT EXISTS "presetOptions" JSONB DEFAULT '[]'::jsonb;
  `);

  console.log('3. contracts (계약) 테이블 IT 계약/청구지/운반설치비/배송수단 컬럼 확장...');
  await client.query(`
    ALTER TABLE contracts
    ADD COLUMN IF NOT EXISTS "billingTargetId" TEXT,
    ADD COLUMN IF NOT EXISTS "billingTargetName" TEXT,
    ADD COLUMN IF NOT EXISTS "contractPeriodType" TEXT DEFAULT 'LONG_TERM',
    ADD COLUMN IF NOT EXISTS "termMonths" INTEGER DEFAULT 12,
    ADD COLUMN IF NOT EXISTS "earlyTerminationFeeRate" DOUBLE PRECISION DEFAULT 10,
    ADD COLUMN IF NOT EXISTS "depositAmount" DOUBLE PRECISION DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "pureRentalFee" DOUBLE PRECISION DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "isDeliverySetupFeeBilled" BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS "deliverySetupFeeAmount" DOUBLE PRECISION DEFAULT 0,
    ADD COLUMN IF NOT EXISTS "deliveryMethod" TEXT DEFAULT 'COURIER',
    ADD COLUMN IF NOT EXISTS "courierCompany" TEXT,
    ADD COLUMN IF NOT EXISTS "trackingNo" TEXT,
    ADD COLUMN IF NOT EXISTS "installTechName" TEXT;
  `);

  console.log('4. PostgREST 스키마 캐시 리로드...');
  await client.query("NOTIFY pgrst, 'reload schema';");
  console.log('✅ PostgREST schema cache reloaded!');

  // 검증 조회
  const custCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customers' AND column_name = 'billingTargets';");
  const siteCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'customer_sites' AND column_name IN ('addressDetail', 'deliveryMethod', 'department');");
  const contCols = await client.query("SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'contracts' AND column_name IN ('billingTargetName', 'contractPeriodType', 'deliverySetupFeeAmount');");

  console.log('검증 customers:', custCols.rows);
  console.log('검증 customer_sites:', siteCols.rows);
  console.log('검증 contracts:', contCols.rows);

  await client.end();
  console.log('🎉 IT 고객, 설치/납품처, 계약 스키마 마이그레이션 완결!');
}

run().catch((err) => {
  console.error('Migration error:', err);
  process.exit(1);
});
