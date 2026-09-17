/**
 * force_delete.cjs — 잔여 테이블 강제 삭제
 */
const https = require('https');

const SUPABASE_URL  = 'https://wywgkikkjgbnlljkkmnz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d2draWtramdibmxsamtrbW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzgsImV4cCI6MjA5OTk0MzEzOH0.gSftxhQjFmWUQzikx-Q5UsdgNKSZISZqJvUGeLBOCqU';

// 다양한 삭제 조건 시도
const TARGETS = [
  { table: 'outbound_inspections', conditions: ['id=not.is.null', 'created_at=gte.2000-01-01'] },
  { table: 'external_leases',      conditions: ['id=not.is.null', 'created_at=gte.2000-01-01'] },
];

function tryDelete(table, condition) {
  return new Promise((resolve) => {
    const options = {
      hostname: new URL(SUPABASE_URL).hostname,
      path: `/rest/v1/${table}?${condition}`,
      method: 'DELETE',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Prefer': 'return=minimal'
      }
    };
    const req = https.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, body: data }));
    });
    req.on('error', e => resolve({ status: 0, body: e.message }));
    req.end();
  });
}

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
  for (const { table, conditions } of TARGETS) {
    const before = await countTable(table);
    console.log(`\n📋 ${table}: 현재 ${before}건`);
    
    for (const cond of conditions) {
      const r = await tryDelete(table, cond);
      console.log(`  DELETE ${cond}: HTTP ${r.status} ${r.body.slice(0,80)}`);
    }
    
    const after = await countTable(table);
    console.log(`  → 삭제 후 잔여: ${after}건 ${after === 0 ? '✅' : '⚠'}`);
  }
}

main().catch(console.error);
