const fs = require('fs');
const path = require('path');
const { createClient } = require('../node_modules/@supabase/supabase-js');

// 1. schema.sql 파싱하여 49개 전체 테이블 목록 추출
const schemaPath = path.join(__dirname, '../schema.sql');
const schemaContent = fs.readFileSync(schemaPath, 'utf8');

const createTableRegex = /CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?([a-zA-Z0-9_]+)\s*\(/gi;
const all49Tables = [];
let match;
while ((match = createTableRegex.exec(schemaContent)) !== null) {
  const tbl = match[1].toLowerCase().trim();
  if (!all49Tables.includes(tbl)) {
    all49Tables.push(tbl);
  }
}

console.log(`📋 schema.sql에서 추출된 전체 테이블 수: ${all49Tables.length}개`);
console.log(all49Tables);

// 2. Supabase 클라이언트 접속
const envPath = path.join(__dirname, '../.env');
let supabaseUrl = '';
let supabaseAnonKey = '';

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    const [k, v] = line.split('=');
    if (k && v) {
      if (k.trim() === 'VITE_SUPABASE_URL') supabaseUrl = v.trim();
      if (k.trim() === 'VITE_SUPABASE_ANON_KEY') supabaseAnonKey = v.trim();
    }
  });
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fetchAllRowsFromTable(tableName) {
  const pageSize = 1000;
  let allRows = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error } = await supabase
      .from(tableName)
      .select('*')
      .range(from, from + pageSize - 1);

    if (error) {
      // 테이블이 아직 Supabase에 없을 수도 있음
      return { rows: [], error: error.message };
    }

    if (data && data.length > 0) {
      allRows = allRows.concat(data);
      from += pageSize;
      if (data.length < pageSize) {
        hasMore = false;
      }
    } else {
      hasMore = false;
    }
  }

  return { rows: allRows, error: null };
}

async function backupAll49Tables() {
  console.log('\n====================================================');
  console.log(`📦 [전체 ${all49Tables.length}개 테이블 전수 백업 시작]`);
  console.log('====================================================\n');

  const backupData = {};
  const tableCounts = {};
  let totalRecords = 0;
  let successTableCount = 0;
  let errorTableCount = 0;

  for (let i = 0; i < all49Tables.length; i++) {
    const table = all49Tables[i];
    const { rows, error } = await fetchAllRowsFromTable(table);
    
    if (error) {
      backupData[table] = [];
      tableCounts[table] = 0;
      errorTableCount++;
      console.log(`[${String(i + 1).padStart(2)}/${all49Tables.length}] ⚠️  [${table.padEnd(32)}] : 존재 안함 / 접근 오류 (${error})`);
    } else {
      backupData[table] = rows;
      tableCounts[table] = rows.length;
      totalRecords += rows.length;
      successTableCount++;
      console.log(`[${String(i + 1).padStart(2)}/${all49Tables.length}] ✓  [${table.padEnd(32)}] : ${String(rows.length).padStart(6)} 건 백업`);
    }
  }

  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `db_49_tables_full_backup_${timestamp}.json`;
  const backupFilePath = path.join(backupDir, backupFileName);

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log('\n====================================================');
  console.log(`✅ [49개 전체 테이블 전수 백업 완료]`);
  console.log(`- 전체 테이블 수: ${all49Tables.length}개 (정상 수집: ${successTableCount}개, 에러/미존재: ${errorTableCount}개)`);
  console.log(`- 총 레코드 수: ${totalRecords.toLocaleString()}개`);
  console.log(`- 백업 파일: ${backupFilePath}`);
  console.log('====================================================\n');

  return { backupFilePath, backupFileName, totalRecords, all49Tables, tableCounts };
}

backupAll49Tables();
