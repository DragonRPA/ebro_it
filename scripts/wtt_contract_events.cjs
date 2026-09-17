/**
 * WTT 4대 계약 이벤트 처리 스크립트
 * 실행일: 2026-08-23 (오늘)
 *
 * ① 자산교환 (EXCHANGE): C202603-0005 — ASSET-0000529 → 대차 신규 자산으로 교환
 * ② 계약단축 (SHORTEN):  C202604-0004 — 종료일 2026-09-09 → 2026-08-31로 단축
 * ③ 계약연장 (EXTEND):   C202604-0016 — 종료일 2026-09-08 → 2026-12-08로 3개월 연장
 * ④ 계약승계 (SUCCESSION): C202605-0003 — 기존 계약자산/청구 조건 승계 신규계약 생성
 */

const { createClient } = require('@supabase/supabase-js');
const url = 'https://wywgkikkjgbnlljkkmnz.supabase.co';
const key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d2draWtramdibmxsamtrbW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzgsImV4cCI6MjA5OTk0MzEzOH0.gSftxhQjFmWUQzikx-Q5UsdgNKSZISZqJvUGeLBOCqU';
const supabase = createClient(url, key);

const TODAY = '2026-08-23';
const NOW = '2026-08-23T02:10:00Z';

async function main() {
  const results = {};

  // ========================================================================
  // ① 자산교환 (EXCHANGE): C202603-0005
  //    ASSET-0000529 (CA-0000529, JCPT1012AC) → ASSET-0000850 (교환 신규 자산)
  //    절차: 전자산 CA endDate 확정 → 전자산 AVAILABLE 복귀 → 신규 CA 생성 → 신규자산 RENTED
  //          → EXCHANGE 배차 1건 → contract_history EXCHANGE 이력
  // ========================================================================
  console.log('\n📦 ① 자산교환(EXCHANGE) 처리 시작 — C202603-0005');

  const exchContractId = 'CONT-202603-0005';
  const exchContractNo = 'C202603-0005';
  const oldAssetId = 'ASSET-0000304';    // CA-0000529, JCPT1012AC 전자산
  const oldCaId   = 'CA-0000529';
  const newAssetId = 'ASSET-0000850';   // 교환 후장비 (JCPT1212AC — 동급 모델)
  const newCaId   = 'CA-EXCH-0001';

  // 전자산 CA 마감
  await supabase.from('contract_assets').update({
    endDate: TODAY,
    updatedAt: NOW
  }).eq('id', oldCaId);

  // 전자산 상태 AVAILABLE 복귀
  await supabase.from('assets').update({
    status: 'AVAILABLE',
    updatedAt: NOW
  }).eq('id', oldAssetId);

  // 신규 교환 CA 생성 (계약 속성 100% 상속)
  await supabase.from('contract_assets').upsert({
    id: newCaId,
    contractId: exchContractId,
    assetId: newAssetId,
    expectedModel: 'JCPT1212AC',
    monthlyRentalFee: 400000,
    dailyRentalFee: 13333,
    startDate: TODAY,
    endDate: '미정',
    createdAt: NOW,
    updatedAt: NOW
  });

  // 신규 자산 RENTED 전환
  await supabase.from('assets').update({
    status: 'RENTED',
    updatedAt: NOW
  }).eq('id', newAssetId);

  // EXCHANGE 배차 1건 (왕복)
  await supabase.from('deliveries').upsert({
    id: 'DELIV-EXCH-0001',
    contractId: exchContractId,
    type: 'OUTBOUND',
    status: 'COMPLETED',
    requestDate: TODAY,
    scheduledDate: TODAY,
    loadingDate: TODAY,
    unloadingDate: TODAY,
    transportCompany: '(주)대한물류',
    transportVendorId: null,
    driverName: '기사1_1호',
    driverContact: '010-7777-0001',
    vehicleType: '5톤 셀프로더',
    deliveryCost: 250000,
    deliveryCostConfirmed: 250000,
    reconciliationStatus: 'PENDING',
    isCostSettled: false,
    createdAt: NOW,
    updatedAt: NOW
  });

  // 계약이력: EXCHANGE 기록
  await supabase.from('contract_history').upsert({
    id: `CH-EXCH-${TODAY.replace(/-/g,'')}-001`,
    contractId: exchContractId,
    changeType: 'EXCHANGE',
    changeDate: TODAY,
    description: `[대차교환] 전자산 ASSET-0000304(JCPT1012AC) → 후장비 ASSET-0000850(JCPT1212AC) 교환 처리. 전자산 매출기여 ${TODAY} 마감, 후장비 ${TODAY}부터 승계.`,
    createdAt: NOW,
    updatedAt: NOW
  });

  console.log(`  ✅ 자산교환 완료: ${exchContractNo}`);
  console.log(`     전자산: ASSET-0000304 → AVAILABLE 복귀`);
  console.log(`     후장비: ASSET-0000850 → RENTED 전환`);
  console.log(`     배차: DELIV-EXCH-0001 (EXCHANGE 왕복)`);
  results.exchange = exchContractNo;

  // ========================================================================
  // ② 계약단축 (SHORTEN): C202604-0004
  //    기존 종료일 2026-09-09 → 조기 마감 2026-08-31 로 단축
  //    절차: 계약 endDate 갱신 → contract_history SHORTEN 이력
  // ========================================================================
  console.log('\n✂️  ② 계약단축(SHORTEN) 처리 시작 — C202604-0004');

  const shortenContractId = 'CONT-202604-0004';
  const shortenContractNo = 'C202604-0004';
  const originalEnd = '2026-09-09';
  const newEnd      = '2026-08-31';

  await supabase.from('contracts').update({
    endDate: newEnd,
    updatedAt: NOW
  }).eq('id', shortenContractId);

  await supabase.from('contract_history').upsert({
    id: `CH-SHORTEN-${TODAY.replace(/-/g,'')}-001`,
    contractId: shortenContractId,
    changeType: 'SHORTEN',
    changeDate: TODAY,
    description: `[계약단축] 종료일 ${originalEnd} → ${newEnd} (9일 단축). 현장 공정 완료 조기 반납 요청.`,
    createdAt: NOW,
    updatedAt: NOW
  });

  console.log(`  ✅ 계약단축 완료: ${shortenContractNo}`);
  console.log(`     종료일: ${originalEnd} → ${newEnd} (9일 단축)`);
  results.shorten = shortenContractNo;

  // ========================================================================
  // ③ 계약연장 (EXTEND): C202604-0016
  //    기존 종료일 2026-09-08 → 3개월 연장 2026-12-08
  //    절차: 계약 endDate 갱신 → contract_history EXTEND 이력
  // ========================================================================
  console.log('\n📅 ③ 계약연장(EXTEND) 처리 시작 — C202604-0016');

  const extendContractId = 'CONT-202604-0016';
  const extendContractNo = 'C202604-0016';
  const origEnd = '2026-09-08';
  const extEnd  = '2026-12-08';

  await supabase.from('contracts').update({
    endDate: extEnd,
    updatedAt: NOW
  }).eq('id', extendContractId);

  await supabase.from('contract_history').upsert({
    id: `CH-EXTEND-${TODAY.replace(/-/g,'')}-001`,
    contractId: extendContractId,
    changeType: 'EXTEND',
    changeDate: TODAY,
    description: `[계약연장] 종료일 ${origEnd} → ${extEnd} (3개월 연장). 현장 공기 연장으로 추가 임차 확정.`,
    createdAt: NOW,
    updatedAt: NOW
  });

  console.log(`  ✅ 계약연장 완료: ${extendContractNo}`);
  console.log(`     종료일: ${origEnd} → ${extEnd} (3개월 연장)`);
  results.extend = extendContractNo;

  // ========================================================================
  // ④ 계약승계 (SUCCESSION): C202605-0003 → 신규계약 C202608-SUCC-0001
  //    기존 계약의 자산/청구조건/현장 속성 100% 승계
  //    절차: 기존 계약 ACTIVE 상태 유지 (승계 계약은 신규 고객 또는 신규 계약으로 권리 이전)
  //          → 기존 계약 SUCCESSION 마감 처리 → 신규계약 생성 → contract_history SUCCESSION 이력
  // ========================================================================
  console.log('\n🔄 ④ 계약승계(SUCCESSION) 처리 시작 — C202605-0003');

  const succOldId  = 'CONT-202605-0003';
  const succOldNo  = 'C202605-0003';
  const succNewId  = 'CONT-SUCC-20260823';
  const succNewNo  = 'C202608-SUCC-0001';

  // 기존 계약 상태 유지 (승계 이력만 기록 — 기존 계약은 종료일까지 유지)
  // 원 계약 승계 이력
  await supabase.from('contract_history').upsert({
    id: `CH-SUCC-OLD-${TODAY.replace(/-/g,'')}-001`,
    contractId: succOldId,
    changeType: 'SUCCESSION',
    changeDate: TODAY,
    description: `[계약승계 발신] 계약권리를 신규계약 ${succNewNo}(${succNewId})로 이전. 기존 현장/자산/청구조건 100% 승계.`,
    createdAt: NOW,
    updatedAt: NOW
  });

  // 신규 승계 계약 생성 (기존 속성 100% 상속)
  const { data: oldContract } = await supabase
    .from('contracts')
    .select('*')
    .eq('id', succOldId)
    .single();

  if (oldContract) {
    await supabase.from('contracts').upsert({
      id: succNewId,
      contractNo: succNewNo,
      customerId: oldContract.customerId,    // 동일 고객사 승계
      contactId: oldContract.contactId,
      siteId: oldContract.siteId,           // 동일 현장 승계
      salespersonId: oldContract.salespersonId,
      startDate: TODAY,                      // 승계 시작일 = 오늘
      endDate: '2027-02-28',                // 6개월 신규 기간
      billingDay: oldContract.billingDay,   // 동일 청구일 승계
      status: 'ACTIVE',
      createdAt: NOW,
      updatedAt: NOW
    });

    // 신규 승계 계약 이력 기록
    await supabase.from('contract_history').upsert({
      id: `CH-SUCC-NEW-${TODAY.replace(/-/g,'')}-001`,
      contractId: succNewId,
      changeType: 'SUCCESSION',
      changeDate: TODAY,
      description: `[계약승계 수신] 기존계약 ${succOldNo}(${succOldId})로부터 권리 승계. 현장/청구조건 동일 속성 적용. 신규 계약기간 ${TODAY} ~ 2027-02-28.`,
      createdAt: NOW,
      updatedAt: NOW
    });
  }

  console.log(`  ✅ 계약승계 완료: ${succOldNo} → ${succNewNo}`);
  console.log(`     승계 시작: ${TODAY}`);
  console.log(`     신규 계약기간: ${TODAY} ~ 2027-02-28`);
  results.succession = { from: succOldNo, to: succNewNo };

  // ========================================================================
  // 결과 요약
  // ========================================================================
  console.log('\n');
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║       WTT 4대 계약 이벤트 처리 완료 요약 (2026-08-23)        ║');
  console.log('╠══════════════════════════════════════════════════════════════╣');
  console.log(`║ ① 자산교환(EXCHANGE)  : ${results.exchange.padEnd(36)}║`);
  console.log(`║ ② 계약단축(SHORTEN)   : ${results.shorten.padEnd(36)}║`);
  console.log(`║ ③ 계약연장(EXTEND)    : ${results.extend.padEnd(36)}║`);
  console.log(`║ ④ 계약승계(SUCCESSION): ${results.succession.from} → ${results.succession.to}    ║`);
  console.log('╚══════════════════════════════════════════════════════════════╝');
}

main().catch(err => console.error('오류:', err));
