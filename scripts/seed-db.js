import fs from 'fs';
import path from 'path';
import pg from 'pg';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to parse .env file
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
  const dbUrl = process.argv[2] || process.env.DATABASE_URL;
  if (!dbUrl) {
    console.error('\n❌ 에러: 데이터베이스 접속 URL(DATABASE_URL)이 지정되지 않았습니다.');
    console.error('------------------------------------------------------------');
    console.error('방법 1: .env 파일에 다음 라인을 추가하십시오:');
    console.error('   DATABASE_URL=postgresql://postgres:[암호]@aws-0-ap-northeast-2.pooler.supabase.com:5432/postgres');
    console.error('방법 2: 명령 행 인자로 전달하십시오:');
    console.error('   node scripts/seed-db.js "postgresql://postgres:암호@접속주소:5432/postgres"\n');
    process.exit(1);
  }

  const sqlFile = path.resolve(__dirname, 'import.sql');
  if (!fs.existsSync(sqlFile)) {
    console.error(`\n❌ 에러: 실행할 SQL 스크립트 파일을 찾을 수 없습니다: ${sqlFile}`);
    console.error('개발자 도구에서 다운로드한 SQL 파일을 scripts/import.sql 경로에 저장해 주십시오.\n');
    process.exit(1);
  }

  console.log('🔄 Supabase Database 직접 TCP 연결 수립 중...');
  const client = new pg.Client({
    connectionString: dbUrl,
    ssl: {
      rejectUnauthorized: false
    }
  });

  try {
    await client.connect();
    console.log('✅ 데이터베이스 접속 성공!');
    console.log('📖 scripts/import.sql 파일을 읽어오는 중...');
    const sql = fs.readFileSync(sqlFile, 'utf8');
    
    console.log(`🚀 SQL 쿼리 실행 시작 (크기: ${(sql.length / 1024 / 1024).toFixed(2)} MB)...`);
    console.time('소요 시간');
    
    await client.query(sql);
    
    console.log('🎉 데이터베이스 적재가 완벽히 완료되었습니다!');
    console.timeEnd('소요 시간');
  } catch (err) {
    console.error('\n❌ 데이터베이스 적재 중 오류 발생:');
    console.error(err.message || err);
    process.exit(1);
  } finally {
    await client.end();
  }
}

main();
