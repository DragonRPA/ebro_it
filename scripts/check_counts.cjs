/**
 * check_counts.cjs — 현재 DB 테이블별 건수 확인
 */
const https = require('https');

const SUPABASE_URL  = 'https://wywgkikkjgbnlljkkmnz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d2draWtramdibmxsamtrbW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzgsImV4cCI6MjA5OTk0MzEzOH0.gSftxhQjFmWUQzikx-Q5UsdgNKSZISZqJvUGeLBOCqU';

const TABLES = [
  'users','vendors','products','customers','customer_sites','customer_contacts',
  'assets','contracts','contract_history','contract_assets',
  'external_leases','deliveries','outbound_inspections','asset_inout_logs',
  'billings','billing_details','purchase_billings','purchase_billing_details',
  'receivables','reconciliation_reports'
];

function countTable(table) {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(SUPABASE_URL).hostname,
      path: `/rest/v1/${table}?select=id&limit=1`,
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Accept': 'application/json',
        'Prefer': 'count=exact',
        'Range': '0-0'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const cr = res.headers['content-range'] || '';
        const m = cr.match(/\/(\d+)/);
        resolve(m ? parseInt(m[1]) : -1);
      });
    });
    req.on('error', () => resolve(-1));
    req.end();
  });
}

async function main() {
  console.log('=== 현재 DB 현황 ===');
  let total = 0;
  for (const t of TABLES) {
    const c = await countTable(t);
    const mark = c === 0 ? '✅' : (c > 0 ? '⚠' : '?');
    console.log(`  ${mark} ${t.padEnd(35)} ${c >= 0 ? c + '건' : 'ERROR'}`);
    if (c > 0) total += c;
  }
  console.log(`\n총 잔여 데이터: ${total}건`);
}
main().catch(console.error);
