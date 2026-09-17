/**
 * reset_db.cjs — Supabase DB 전체 초기화 스크립트 (FK 역순 삭제)
 * 실행: node scripts/reset_db.cjs
 * ⚠ 주의: 이 스크립트 실행 전 반드시 backup_db.cjs로 백업 완료 확인!
 */
const https = require('https');

const SUPABASE_URL  = 'https://wywgkikkjgbnlljkkmnz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d2draWtramdibmxsamtrbW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzgsImV4cCI6MjA5OTk0MzEzOH0.gSftxhQjFmWUQzikx-Q5UsdgNKSZISZqJvUGeLBOCqU';

// FK 역순 삭제 순서
const DELETE_ORDER = [
  'reconciliation_reports',
  'receivables',
  'purchase_billing_details',
  'purchase_billings',
  'billing_details',
  'billings',
  'asset_inout_logs',
  'outbound_inspections',
  'deliveries',
  'external_leases',
  'contract_assets',
  'contract_history',
  'contracts',
  'assets',
  'customer_contacts',
  'customer_sites',
  'customers',
  'products',
  'vendors'
  // users는 삭제하지 않음 (로그인 계정 유지)
];

function deleteTable(table) {
  return new Promise((resolve, reject) => {
    // gt=0 조건으로 모든 행 삭제 (id 컬럼이 없는 경우를 위해 created_at 기준)
    const path = `/rest/v1/${table}?id=not.is.null`;
    const options = {
      hostname: new URL(SUPABASE_URL).hostname,
      path: path,
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.statusCode);
        } else {
          // 두 번째 시도: created_at 기준
          resolve(res.statusCode);
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function countTable(table) {
  return new Promise((resolve, reject) => {
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
        const contentRange = res.headers['content-range'] || '';
        const match = contentRange.match(/\/(\d+)/);
        resolve(match ? parseInt(match[1], 10) : -1);
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function main() {
  console.log('🔴 기연리프트 ERP — DB 전체 초기화 시작');
  console.log('⚠ users 테이블은 보존합니다 (로그인 계정 유지)\n');

  for (const table of DELETE_ORDER) {
    process.stdout.write(`  🗑 ${table.padEnd(35)}`);
    try {
      const status = await deleteTable(table);
      const remaining = await countTable(table);
      if (remaining === 0) {
        console.log(`✅ 완전 삭제 (HTTP ${status})`);
      } else if (remaining > 0) {
        console.log(`⚠ 잔여 ${remaining}건 (HTTP ${status})`);
      } else {
        console.log(`확인불가 (HTTP ${status})`);
      }
    } catch (e) {
      console.log(`ERROR: ${e.message}`);
    }
  }

  console.log('\n✅ DB 초기화 완료. 이제 초기DB 업로드 페이지에서 엑셀을 업로드하세요.');
}

main().catch(e => { console.error('초기화 실패:', e); process.exit(1); });
