import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnv() {
  const envPath = path.resolve(__dirname, '../.env');
  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf8');
    content.split('\n').forEach(line => {
      const match = line.match(/^\s*([\w.\-]+)\s*=\s*(.*)?\s*$/);
      if (match) {
        const key = match[1];
        let value = match[2] || '';
        if (value.length > 0 && value.charAt(0) === '"' && value.charAt(value.length - 1) === '"') {
          value = value.substring(1, value.length - 1);
        } else if (value.length > 0 && value.charAt(0) === "'" && value.charAt(value.length - 1) === "'") {
          value = value.substring(1, value.length - 1);
        }
        process.env[key] = value;
      }
    });
  }
}

loadEnv();

async function main() {
  let dbUrl = process.argv[2] || process.env.DATABASE_URL;
  
  if (!dbUrl) {
    console.log('⚠️ DATABASE_URL 환경변수가 지정되지 않았습니다.');
    process.exit(1);
  }

  console.log('🔄 Supabase DB 직접 연결 및 DDL 패치 실행 중...');
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log('✅ Supabase DB 연결 성공!');

    const patchSql = `
      ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS deliveries_dispatchCategory_check;
      ALTER TABLE deliveries ADD CONSTRAINT deliveries_dispatchCategory_check CHECK ("dispatchCategory" IN ('출고', '입고', '반납', '정비', '이동', '교환'));
    `;

    await client.query(patchSql);
    console.log('🎉 [DDL 패치 성공] deliveries.dispatchCategory 제약조건에 "교환" 추가 완료!');
  } catch (err) {
    console.error('❌ DDL 패치 실행 실패:', err.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
