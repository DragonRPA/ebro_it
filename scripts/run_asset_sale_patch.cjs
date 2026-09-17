const fs = require('fs');
const path = require('path');
const pg = require('pg');

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        let val = match[2] || '';
        if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
          val = val.slice(1, -1);
        }
        process.env[match[1]] = val.trim();
      }
    });
  }
}

loadEnv();

async function main() {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    console.log('⚠️ DATABASE_URL 환경변수가 없어 로컬 스키마 적용으로 진행합니다.');
    return;
  }

  const sqlPath = path.resolve(__dirname, 'patch_v1_4_0_asset_sale_domain.sql');
  const sql = fs.readFileSync(sqlPath, 'utf8');

  console.log('🔄 Supabase DB 연결 및 patch_v1_4_0_asset_sale_domain.sql 실행 중...');
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Supabase DB 연결 성공');
    await client.query(sql);
    console.log('🎉 [DDL 패치 성공] contracts.contractType, billings.billingType, contract_assets.salePrice 반영 완료!');
  } catch (err) {
    console.error('❌ DDL 패치 실행 경고/실패:', err.message);
  } finally {
    await client.end();
  }
}

main();
