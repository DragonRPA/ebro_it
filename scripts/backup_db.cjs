/**
 * backup_db.cjs — Supabase 전체 DB 백업 스크립트
 * 실행: node backup_db.cjs
 * 출력: backup/초기DB_backup_ver1_YYYYMMDD_HHMMSS.json
 */
const https = require('https');
const fs   = require('fs');
const path = require('path');

const SUPABASE_URL  = 'https://wywgkikkjgbnlljkkmnz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d2draWtramdibmxsamtrbW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzgsImV4cCI6MjA5OTk0MzEzOH0.gSftxhQjFmWUQzikx-Q5UsdgNKSZISZqJvUGeLBOCqU';

const TABLES = [
  'users','vendors','products',
  'customers','customer_sites','customer_contacts',
  'assets',
  'contracts','contract_history','contract_assets',
  'external_leases',
  'deliveries','outbound_inspections','asset_inout_logs',
  'billings','billing_details',
  'purchase_billings','purchase_billing_details',
  'receivables','reconciliation_reports'
];

async function fetchTable(table) {
  const PAGE = 1000;
  let all = [];
  let from = 0;

  while (true) {
    const rows = await fetchPage(table, from, from + PAGE - 1);
    all = all.concat(rows);
    if (rows.length < PAGE) break;
    from += PAGE;
  }
  return all;
}

function fetchPage(table, from, to) {
  return new Promise((resolve, reject) => {
    const url = new URL(`/rest/v1/${table}?select=*`, SUPABASE_URL);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Accept': 'application/json',
        'Range': `${from}-${to}`,
        'Range-Unit': 'items',
        'Prefer': 'count=none'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const rows = JSON.parse(data);
          if (!Array.isArray(rows)) {
            console.warn(`  ⚠ ${table}[${from}-${to}]: ${data.slice(0,120)}`);
            resolve([]);
          } else {
            resolve(rows);
          }
        } catch (e) { reject(e); }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🔵 기연리프트 ERP — DB 전체 백업 시작');
  const backup = { version: 1, createdAt: new Date().toISOString(), tables: {} };

  for (const table of TABLES) {
    process.stdout.write(`  • ${table.padEnd(35)}`);
    try {
      const rows = await fetchTable(table);
      backup.tables[table] = rows;
      console.log(`${rows.length}건`);
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
      backup.tables[table] = [];
    }
  }

  const outDir = path.join(__dirname, 'backup');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const now = new Date();
  const ts = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}${String(now.getSeconds()).padStart(2,'0')}`;
  const outFile = path.join(outDir, `초기DB_backup_ver1_${ts}.json`);

  fs.writeFileSync(outFile, JSON.stringify(backup, null, 2), 'utf8');
  const sizeMB = (fs.statSync(outFile).size / 1024 / 1024).toFixed(2);
  console.log(`\n✅ 백업 완료: ${outFile} (${sizeMB} MB)`);
}

main().catch(e => { console.error('백업 실패:', e); process.exit(1); });
