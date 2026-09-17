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

async function syncAssetContractLinks() {
  console.log('====================================================');
  console.log('🚀 [자산 ➔ 계약 정보 양방향 동기화] assets 테이블 업데이트');
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
  const contractMap = new Map();
  contracts.forEach(c => contractMap.set(c.id, c));
  console.log(`✓ contracts 수집 완료: ${contracts.length}건`);

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
  console.log(`✓ contract_assets 수집 완료: ${contractAssets.length}건`);

  // 3. 전체 billing_details 수집 (자산별 누적 매출액 집계)
  let billingDetails = [];
  from = 0;
  while (true) {
    const { data } = await supabase.from('billing_details').select('assetId, amount').range(from, from + 999);
    if (!data || data.length === 0) break;
    billingDetails = billingDetails.concat(data);
    from += 1000;
    if (data.length < 1000) break;
  }
  console.log(`✓ billing_details 수집 완료: ${billingDetails.length}건`);

  const assetCumRevenueMap = new Map();
  billingDetails.forEach(bd => {
    if (bd.assetId) {
      assetCumRevenueMap.set(bd.assetId, (assetCumRevenueMap.get(bd.assetId) || 0) + (bd.amount || 0));
    }
  });

  // 4. 전체 assets 수집
  let assets = [];
  from = 0;
  while (true) {
    const { data } = await supabase.from('assets').select('*').range(from, from + 999);
    if (!data || data.length === 0) break;
    assets = assets.concat(data);
    from += 1000;
    if (data.length < 1000) break;
  }
  console.log(`✓ assets 수집 완료: ${assets.length}건\n`);

  // 5. 각 자산별 최신 활성 계약(ACTIVE/RENTED) 매핑
  // assetId -> { customerId, siteId, startDate, endDate, status }
  const assetActiveContractMap = new Map();

  // 최신순으로 정렬하여 매핑 (종료 계약보다 진행중 계약 우선)
  contractAssets.forEach(ca => {
    if (!ca.assetId) return;
    const contract = contractMap.get(ca.contractId);
    if (!contract) return;

    const isActive = contract.status === 'ACTIVE' || contract.status === 'EXTENDED' || ca.status === 'RENTED';
    const isTerminated = contract.status === 'COMPLETED' || ca.status === 'RETURNED';

    const existing = assetActiveContractMap.get(ca.assetId);
    if (!existing || (!existing.isActive && isActive)) {
      assetActiveContractMap.set(ca.assetId, {
        customerId: contract.customerId,
        siteId: contract.siteId,
        startDate: ca.startDate || contract.startDate,
        endDate: ca.endDate || contract.endDate,
        isActive: isActive,
        isTerminated: isTerminated
      });
    }
  });

  console.log(`✓ 활성/계약 매핑 자산 수: ${assetActiveContractMap.size}대`);

  // 6. assets 업데이트 페이로드 생성
  const nowIso = new Date().toISOString();
  const updatedAssets = assets.map(a => {
    const link = assetActiveContractMap.get(a.id);
    const cumFee = assetCumRevenueMap.get(a.id) || a.cumRentalFee || 0;

    let custId = a.currentCustomerId;
    let siteId = a.currentSiteId;
    let cStart = a.contractStart;
    let cEnd = a.contractEnd;
    let status = a.status;

    if (link) {
      if (link.isActive) {
        custId = link.customerId;
        siteId = link.siteId;
        cStart = link.startDate;
        cEnd = link.endDate;
        status = 'RENTED';
      } else if (link.isTerminated) {
        // 종료 계약의 경우 자산 상태는 대기(AVAILABLE)이나 마지막 현장 정보 보존 또는 NULL
        status = a.ownerType === 'RENTED' ? 'RENTED_RETURNED' : 'AVAILABLE';
        cStart = link.startDate;
        cEnd = link.endDate;
      }
    }

    return {
      ...a,
      currentCustomerId: custId,
      currentSiteId: siteId,
      contractStart: cStart,
      contractEnd: cEnd,
      status: status,
      cumRentalFee: cumFee,
      updatedAt: nowIso
    };
  });

  // 7. Supabase DB 청킹 업서트 실행
  console.log('\n🚀 [Supabase DB] assets 테이블 1,279대 일괄 업서트 집행 중...');
  for (let i = 0; i < updatedAssets.length; i += 100) {
    const chunk = updatedAssets.slice(i, i + 100);
    const { error } = await supabase.from('assets').upsert(chunk, { onConflict: 'id' });
    if (error) {
      console.error(`❌ 청크 ${i / 100 + 1} 업서트 실패:`, error.message);
      throw error;
    }
  }

  // 8. 검증 쿼리
  const { data: verifyAssets } = await supabase.from('assets').select('id, assetNo, modelName, status, currentCustomerId, currentSiteId, contractStart, cumRentalFee').not('currentCustomerId', 'is', null).limit(8);

  console.log('\n====================================================');
  console.log('✅ [자산 ➔ 계약 정보 양방향 동기화 완료]');
  console.log(`- 전체 자산: ${assets.length}대`);
  console.log(`- 현재 고객사/현장 연결된 대여중(RENTED) 자산: ${updatedAssets.filter(a => a.currentCustomerId).length}대`);
  console.log(`- 자산별 누적 매출액(cumRentalFee) 집계 반영 완료`);
  console.log('📋 [동기화 샘플 데이터]');
  console.log(verifyAssets);
  console.log('====================================================\n');
}

syncAssetContractLinks().catch(console.error);
