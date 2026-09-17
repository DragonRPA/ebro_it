const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
let u = '', k = '';
env.split('\n').forEach(l => {
  const [a, ...rest] = l.split('=');
  const b = rest.join('=');
  if (a === 'VITE_SUPABASE_URL') u = b.trim();
  if (a === 'VITE_SUPABASE_ANON_KEY') k = b.trim();
});

const sb = createClient(u, k);

async function check() {
  console.log('=== Supabase URL:', u);

  // 1. Select * from contract_assets
  const { data: ca, error: e1 } = await sb.from('contract_assets').select('*').range(0, 2);
  console.log('\n1. contract_assets (raw select *):', JSON.stringify(ca, null, 2));
  console.log('   error:', e1);

  // 2. Check actual DB column name (snake_case vs camelCase)
  // Try snake_case column names
  const { data: ca2, error: e2 } = await sb.from('contract_assets').select('id, contract_id').range(0, 2);
  console.log('\n2. contract_assets (select contract_id snake):', JSON.stringify(ca2, null, 2));
  console.log('   error:', e2);

  // 3. Check the contracts table to see actual id format
  const { data: c, error: e3 } = await sb.from('contracts').select('id, contractNo').limit(3);
  console.log('\n3. contracts (id + contractNo):', JSON.stringify(c, null, 2));
  console.log('   error:', e3);

  // 4. Check schema -- are there any CA rows where contractId field exists?
  const { data: ca3, error: e4 } = await sb.from('contract_assets').select('*').eq('contractId', 'CONT-260801-0001');
  console.log('\n4. CA filter by contractId=CONT-260801-0001:', JSON.stringify(ca3, null, 2));
  console.log('   error:', e4);

  // 5. Try snake_case filter
  const { data: ca4, error: e5 } = await sb.from('contract_assets').select('*').eq('contract_id', 'CONT-260801-0001');
  console.log('\n5. CA filter by contract_id (snake)=CONT-260801-0001:', JSON.stringify(ca4, null, 2));
  console.log('   error:', e5);
}

check();
