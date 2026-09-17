const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function inspectContractAssetLinks() {
  console.log('====================================================');
  console.log('🔍 [계약 ➔ 자산 / 자산 ➔ 계약 연결 정합성 정밀 진단]');
  console.log('====================================================\n');

  // 1. 전체 contracts 수집
  let contracts = [];
  let from = 0;
  while (true) {
    const { data } = await supabase.from('contracts').select('*').range(from, from + 999);
    if (!data || data.length === 0) break;
    contracts = contracts.concat(data);
    from += 1000;
    if (data.length < 1000) break;
  }
  console.log(`✓ contracts 총 건수: ${contracts.length}건`);

  // 2. 전체 contract_assets 수집
  let contractAssets = [];
  from = 0;
  while (true) {
    const { data } = await supabase.from('contract_assets').select('*').range(from, from + 999);
    if (!data || data.length === 0) break;
    contractAssets = contractAssets.concat(data);
    from += 1000;
    if (data.length < 1000) break;
  }
  console.log(`✓ contract_assets 총 건수: ${contractAssets.length}건`);

  // 3. 전체 assets 수집
  let assets = [];
  from = 0;
  while (true) {
    const { data } = await supabase.from('assets').select('*').range(from, from + 999);
    if (!data || data.length === 0) break;
    assets = assets.concat(data);
    from += 1000;
    if (data.length < 1000) break;
  }
  console.log(`✓ assets 총 건수: ${assets.length}건\n`);

  const assetMap = new Map();
  assets.forEach(a => assetMap.set(a.id, a));

  const contractMap = new Map();
  contracts.forEach(c => contractMap.set(c.id, c));

  // 계약당 contract_assets 매핑 확인
  const contractToCaMap = new Map();
  contractAssets.forEach(ca => {
    if (!contractToCaMap.has(ca.contractId)) {
      contractToCaMap.set(ca.contractId, []);
    }
    contractToCaMap.get(ca.contractId).push(ca);
  });

  let contractsWithoutCa = 0;
  let caWithValidAsset = 0;
  let caWithNullAsset = 0;
  let caWithMissingAsset = 0;

  contracts.forEach(c => {
    const cas = contractToCaMap.get(c.id) || [];
    if (cas.length === 0) {
      contractsWithoutCa++;
    } else {
      cas.forEach(ca => {
        if (!ca.assetId) {
          caWithNullAsset++;
        } else if (assetMap.has(ca.assetId)) {
          caWithValidAsset++;
        } else {
          caWithMissingAsset++;
        }
      });
    }
  });

  console.log('📊 [1. 계약 ➔ 자산 매핑 현황]');
  console.log(`- 자산이 연결된 contract_assets: ${caWithValidAsset}건`);
  console.log(`- assetId가 NULL인 contract_assets: ${caWithNullAsset}건`);
  console.log(`- 존재하지 않는 assetId를 가리키는 건: ${caWithMissingAsset}건`);
  console.log(`- contract_assets가 0건인 계약: ${contractsWithoutCa}건\n`);

  // 자산당 계약정보 (currentCustomerId, currentSiteId, contractStart, contractEnd) 확인
  let assetsWithNullCust = 0;
  let assetsWithCust = 0;
  assets.forEach(a => {
    if (a.currentCustomerId) assetsWithCust++;
    else assetsWithNullCust++;
  });

  console.log('📊 [2. 자산(assets) ➔ 계약정보 필드 현황]');
  console.log(`- currentCustomerId 설정된 자산: ${assetsWithCust}대`);
  console.log(`- currentCustomerId 가 NULL인 자산: ${assetsWithNullCust}대\n`);

  // 샘플 출력
  console.log('📋 [3. 샘플 5개 계약의 자산 연결 상태]');
  contracts.slice(0, 5).forEach(c => {
    const cas = contractToCaMap.get(c.id) || [];
    console.log(`- 계약 [${c.contractNo}] (${c.id}) ➔ 연결 CA 수: ${cas.length}개`);
    cas.forEach(ca => {
      const ast = assetMap.get(ca.assetId);
      console.log(`    CA [${ca.id}] assetId: ${ca.assetId} ➔ 장비번호: [${ast ? ast.assetNo : '없음'}], 모델: [${ast ? ast.modelName : ca.expectedModel}], 상태: [${ast ? ast.status : 'N/A'}]`);
    });
  });
}

inspectContractAssetLinks().catch(console.error);
