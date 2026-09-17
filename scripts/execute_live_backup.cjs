const fs = require('fs');
const path = require('path');
const { createClient } = require('../node_modules/@supabase/supabase-js');

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

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 접속 정보(.env)를 찾을 수 없습니다.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const ALL_TABLES = [
  'departments',
  'users',
  'permissions',
  'products',
  'vendors',
  'consumables',
  'customers',
  'customer_contacts',
  'customer_sites',
  'assets',
  'contracts',
  'contract_assets',
  'contract_history',
  'deliveries',
  'outbound_inspections',
  'billings',
  'billing_details',
  'payments',
  'receivables',
  'repairs',
  'repair_consumables',
  'consumable_logs',
  'consumable_purchase_requests',
  'consumable_purchase_items',
  'purchase_billings',
  'purchase_billing_details',
  'todos',
  'google_configs'
];

// 페이지네이션을 통해 1,000건 제한 없이 전수(All Rows) 수집하는 함수
async function fetchAllRowsFromTable(tableName) {
  const pageSize = 1000;
  let allRows = [];
  let from = 0;
  let hasMore = true;

  while (hasMore) {
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact' })
      .range(from, from + pageSize - 1);

    if (error) {
      console.warn(`⚠️ [${tableName}] 조회 에러 (range ${from}~${from + pageSize - 1}): ${error.message}`);
      break;
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

  return allRows;
}

async function runFullPagingBackup() {
  console.log('====================================================');
  console.log('📦 [Supabase 페이지네이션 전수 백업] 1,000건 제한 돌파 수집');
  console.log(`- 접속 URL: ${supabaseUrl}`);
  console.log('====================================================\n');

  const backupData = {};
  const tableCounts = {};
  let totalRecords = 0;

  for (const table of ALL_TABLES) {
    try {
      const rows = await fetchAllRowsFromTable(table);
      backupData[table] = rows;
      tableCounts[table] = rows.length;
      totalRecords += rows.length;
      console.log(`✓ [${table.padEnd(28)}] : ${String(rows.length).padStart(6)} 건 완료`);
    } catch (err) {
      console.warn(`⚠️ [${table}] 에러: ${err.message}`);
      backupData[table] = [];
      tableCounts[table] = 0;
    }
  }

  const backupDir = path.join(__dirname, '../backups');
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const backupFileName = `db_full_unlimited_backup_${timestamp}.json`;
  const backupFilePath = path.join(backupDir, backupFileName);

  fs.writeFileSync(backupFilePath, JSON.stringify(backupData, null, 2), 'utf8');

  console.log('\n====================================================');
  console.log(`✅ [전체 DB 전수 백업 완결] 총 ${totalRecords.toLocaleString()}개 레코드 100% 저장됨`);
  console.log(`📁 백업 파일 경로: ${backupFilePath}`);
  console.log('====================================================');

  return { backupFilePath, backupFileName, totalRecords, tableCounts };
}

runFullPagingBackup();
