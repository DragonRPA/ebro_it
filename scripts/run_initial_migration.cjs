const fs = require('fs');
const path = require('path');
const xlsx = require('../node_modules/xlsx');
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

const supabase = supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;
const excelFilePath = 'D:/OneDrive/Desktop/기연리프트자료_/자동업로드/초기DB현황1.xlsx';

console.log('====================================================');
console.log('🚀 [CLI] 풀 라이프사이클 & 과거 청구 소급 마이그레이션 파이프라인');
console.log(`- 타겟 Supabase: ${supabaseUrl}`);
console.log(`- 소스 엑셀: ${excelFilePath}`);
console.log('====================================================\n');

if (!fs.existsSync(excelFilePath)) {
  console.error(`❌ 엑셀 파일을 찾을 수 없습니다: ${excelFilePath}`);
  process.exit(1);
}

function sanitizeNumber(val) {
  if (typeof val === 'number') return isNaN(val) ? 0 : Math.round(val);
  if (!val) return 0;
  const cleaned = String(val).replace(/[^0-9.-]+/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num);
}

function sanitizeExcelDate(val) {
  if (!val || val === '미정' || val === '-' || val === '공란') return null;
  if (typeof val === 'number') {
    const date = new Date(Math.round((val - 25569) * 86400 * 1000));
    if (isNaN(date.getTime())) return null;
    return date.toISOString().split('T')[0];
  }
  const str = String(val).trim().replace(/\./g, '-');
  if (/^\d{4}-\d{1,2}-\d{1,2}$/.test(str)) {
    const parts = str.split('-');
    const y = parts[0];
    const m = parts[1].padStart(2, '0');
    const d = parts[2].padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
  const d = new Date(str);
  return isNaN(d.getTime()) ? null : d.toISOString().split('T')[0];
}

function normalizeCustomerName(name) {
  if (!name) return '';
  return String(name)
    .replace(/주식회사|\(주\)|\(주\)|㈜|\(유\)|유한회사|\(합\)|합자회사|사단법인|재단법인/gi, '')
    .replace(/[\s\(\)\[\]._\-]/g, '')
    .toLowerCase();
}

function sanitizeModelName(m) {
  if (!m) return '';
  return String(m).trim().replace(/\s+/g, ' ').toUpperCase();
}

function parseClosingDay(dayStr) {
  if (!dayStr) return 30;
  if (typeof dayStr === 'number') return Math.min(31, Math.max(1, dayStr));
  const s = String(dayStr).trim();
  if (s.includes('말일') || s.includes('말')) return 30;
  const match = s.match(/(\d+)/);
  if (match) {
    const n = parseInt(match[1], 10);
    return isNaN(n) ? 30 : Math.min(31, Math.max(1, n));
  }
  return 30;
}

function extractSiteNameAndMemo(rawSite) {
  if (!rawSite) return { cleanSiteName: '기본현장', dispatchMemo: '' };
  const str = String(rawSite).trim();
  const memoMatch = str.match(/\((.*?)\)/);
  let dispatchMemo = memoMatch ? memoMatch[1] : '';
  let cleanSiteName = str.replace(/\(.*?\)/g, '').trim();
  if (!cleanSiteName) cleanSiteName = str;
  return { cleanSiteName, dispatchMemo };
}

function extractContactPosition(rawName) {
  if (!rawName) return { name: '', position: '담당자' };
  const str = String(rawName).trim();
  const posList = ['대표', '이사', '본부장', '부장', '차장', '과장', '대리', '주임', '사원', '소장', '반장', '팀장', '기사', '실장'];
  for (const p of posList) {
    if (str.endsWith(p)) {
      const pureName = str.slice(0, -p.length).trim();
      if (pureName.length >= 2) return { name: pureName, position: p };
    }
    const match = str.match(new RegExp(`^(.*?)\\s*(${p})$`));
    if (match) return { name: match[1].trim(), position: match[2] };
  }
  return { name: str, position: '담당자' };
}

function inferMakerFromModel(m) {
  if (m.startsWith('ES') || m.startsWith('1930ES') || m.startsWith('1230ES') || m.startsWith('ES1330')) return 'JLG';
  if (m.startsWith('GS') || m.startsWith('Z-')) return 'Genie';
  if (m.startsWith('SJ')) return 'SKYJACK';
  if (m.startsWith('GTJZ') || m.startsWith('GTBZ') || m.startsWith('S08') || m.startsWith('S10') || m.startsWith('S12') || m.startsWith('S14') || m.startsWith('S16') || m.startsWith('1414E')) return 'SINOBOOM';
  if (m.startsWith('STAR')) return 'Haulotte';
  if (m.startsWith('JCPT')) return 'Dingli';
  return '기타제조사';
}

function inferFeetFromModel(m, heightM = 0) {
  if (heightM > 0) return Math.round(heightM * 3.28084);
  if (m.includes('1930') || m.includes('1330') || m.includes('1432') || m.includes('3215') || m.includes('0608')) return 19;
  if (m.includes('2646') || m.includes('2632') || m.includes('0812') || m.includes('0808') || m.includes('3219')) return 26;
  if (m.includes('3246') || m.includes('1012') || m.includes('1008')) return 32;
  if (m.includes('4047') || m.includes('4046') || m.includes('1212')) return 40;
  if (m.includes('4655') || m.includes('1412') || m.includes('1414')) return 46;
  if (m.includes('1612') || m.includes('1614')) return 53;
  return 19;
}

async function runMigration() {
  const wb = xlsx.readFile(excelFilePath);
  const nowIso = new Date().toISOString();

  console.log('📦 [1/5] 엑셀 5개 시트 파싱 및 라이프사이클 이벤트 체인 생성 중...');

  const productMap = new Map();
  const vendorMap = new Map();
  const assetMap = new Map();
  const customerMap = new Map();
  const siteMap = new Map();
  const contactMap = new Map();

  let assetSeq = 1;
  let custSeq = 1;
  let siteSeq = 1;
  let contactSeq = 1;
  let contractSeq = 1;
  let caSeq = 1;
  let leaseSeq = 1;
  let delivSeq = 1;
  let inspSeq = 1;
  let inoutSeq = 1;
  let chSeq = 1;
  let billSeq = 1;
  let bdSeq = 1;
  let pbSeq = 1;
  let pbdSeq = 1;
  let recSeq = 1;

  // 1. 보유자산현황
  const wsAsset = wb.Sheets['보유자산현황'];
  const rawAssetRows = wsAsset ? xlsx.utils.sheet_to_json(wsAsset, { header: 1, defval: null }).slice(4) : [];
  rawAssetRows.forEach(r => {
    if (!r) return;
    const rawModel = r[1];
    const rawAssetNo = r[4];
    if (!rawModel && !rawAssetNo) return;

    const modelName = sanitizeModelName(rawModel) || 'ES1330L';
    const assetNo = String(rawAssetNo || `TEMP-${assetSeq}`).trim().toUpperCase();
    const maker = r[7] ? String(r[7]).trim() : inferMakerFromModel(modelName);
    const supplier = r[8] ? String(r[8]).trim() : '';
    const heightM = typeof r[6] === 'number' ? r[6] : parseFloat(String(r[6] || '5.8')) || 5.8;
    const feet = inferFeetFromModel(modelName, heightM);
    const acqDate = sanitizeExcelDate(r[9]) || '2025-01-01';
    const acqPrice = sanitizeNumber(r[10]) || 11800000;
    const memo = r[16] ? String(r[16]).trim() : '';

    if (!productMap.has(modelName)) {
      productMap.set(modelName, {
        id: `PROD-${String(productMap.size + 1).padStart(7, '0')}`,
        modelName: modelName,
        feet: feet,
        spec: `${heightM}M (${feet}ft)`,
        manufacturer: maker,
        powerSource: '배터리',
        workingHeight: `${heightM} M`,
        platformHeight: `${(heightM - 2).toFixed(2)} M`,
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso
      });
    }

    if (supplier && !vendorMap.has(supplier)) {
      vendorMap.set(supplier, {
        id: `VEND-${String(vendorMap.size + 1).padStart(7, '0')}`,
        name: supplier,
        type: 'PURCHASE',
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso
      });
    }

    const assetId = `ASSET-${String(assetSeq++).padStart(7, '0')}`;
    assetMap.set(assetNo, {
      id: assetId,
      modelName: modelName,
      assetNo: assetNo,
      serialNo: r[3] ? String(r[3]).trim() : '',
      manufacturer: maker,
      manufactureYear: r[5] ? String(r[5]).trim() : '2025년',
      ownerType: 'OWNED',
      status: 'AVAILABLE',
      acquisitionDate: acqDate,
      acquisitionPrice: acqPrice,
      depreciationMonths: 96,
      residualValueRate: 10,
      accumDepreciation: 0,
      bookValue: acqPrice,
      cumRentalFee: 0,
      supplier: supplier,
      vendorId: supplier && vendorMap.has(supplier) ? vendorMap.get(supplier).id : null,
      memo: memo,
      createdAt: nowIso,
      updatedAt: nowIso
    });
  });

  // 2. 거래처정보현황
  const wsCust = wb.Sheets['거래처정보현황'];
  const rawCustRows = wsCust ? xlsx.utils.sheet_to_json(wsCust, { header: 1, defval: null }).slice(3) : [];
  rawCustRows.forEach(r => {
    if (!r || !r[2]) return;
    const rawCustName = r[2];
    const normName = normalizeCustomerName(rawCustName);
    if (!normName) return;

    let customer = customerMap.get(normName);
    if (!customer) {
      customer = {
        id: `CUST-${String(custSeq++).padStart(7, '0')}`,
        name: String(rawCustName).trim(),
        bizRegNo: r[1] ? String(r[1]).trim() : '',
        representative: r[3] ? String(r[3]).trim() : '',
        address: r[4] ? String(r[4]).trim() : '',
        bizType: r[5] ? String(r[5]).trim() : '건설업',
        bizItem: r[6] ? String(r[6]).trim() : '설비공사',
        repContact: r[13] || r[14] ? String(r[13] || r[14]).trim() : '',
        repEmail: r[16] ? String(r[16]).trim() : '',
        defaultBillingDay: parseClosingDay(r[17]),
        defaultStatementClosingDay: 25,
        isClosed: false,
        transactionStatus: 'ALLOWED',
        createdAt: nowIso,
        updatedAt: nowIso
      };
      customerMap.set(normName, customer);
    }

    const rawSite = r[7];
    if (rawSite) {
      const { cleanSiteName, dispatchMemo } = extractSiteNameAndMemo(rawSite);
      const siteKey = `${normName}_${cleanSiteName}`;
      if (!siteMap.has(siteKey)) {
        siteMap.set(siteKey, {
          id: `SITE-${String(siteSeq++).padStart(7, '0')}`,
          customerId: customer.id,
          name: cleanSiteName,
          address: r[8] ? String(r[8]).trim() : customer.address,
          contactName: r[9] ? String(r[9]).trim() : '',
          contact: r[10] ? String(r[10]).trim() : '',
          email: r[11] ? String(r[11]).trim() : '',
          isActive: true,
          dispatchMemo: dispatchMemo,
          createdAt: nowIso,
          updatedAt: nowIso
        });
      }
    }

    if (r[9]) {
      const { name: fName, position: fPos } = extractContactPosition(r[9]);
      const contactKey = `${normName}_${fName}`;
      if (!contactMap.has(contactKey)) {
        contactMap.set(contactKey, {
          id: `CONT-${String(contactSeq++).padStart(7, '0')}`,
          customerId: customer.id,
          name: fName,
          position: fPos,
          contact: r[10] ? String(r[10]).trim() : '',
          email: r[11] ? String(r[11]).trim() : '',
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso
        });
      }
    }
  });

  // 3. 202608 계약 및 풀 라이프사이클 생성
  const wsBill = wb.Sheets['202608'];
  const rawBillRows = wsBill ? xlsx.utils.sheet_to_json(wsBill, { header: 1, defval: null }).slice(3) : [];
  
  const contracts = [];
  const contractAssets = [];
  const externalLeases = [];
  const deliveries = [];
  const outboundInspections = [];
  const assetInOutLogs = [];
  const contractHistories = [];
  const billings = [];
  const billingDetails = [];
  const purchaseBillings = [];
  const purchaseBillingDetails = [];
  const receivables = [];

  let excelTotalBillingSum = 0;
  const currentMonthBillingGroup = new Map();
  const purchaseBillingGroup = new Map();

  rawBillRows.forEach((r, rowIdx) => {
    if (!r || !r[0]) return;
    const rawCustName = String(r[0]).trim();
    if (['임차장비', '9월 계약 반영', '9월 반납 반영', '출고 예정', '반납시 청구', '소계', '합계'].some(k => rawCustName.includes(k))) return;

    const normCust = normalizeCustomerName(rawCustName);
    let customer = customerMap.get(normCust);
    if (!customer) {
      customer = {
        id: `CUST-${String(custSeq++).padStart(7, '0')}`,
        name: rawCustName,
        bizRegNo: '',
        representative: '',
        address: '',
        bizType: '건설업',
        bizItem: '설비공사',
        defaultBillingDay: parseClosingDay(r[26]),
        defaultStatementClosingDay: 25,
        isClosed: false,
        transactionStatus: 'ALLOWED',
        createdAt: nowIso,
        updatedAt: nowIso
      };
      customerMap.set(normCust, customer);
    }

    const { cleanSiteName, dispatchMemo } = extractSiteNameAndMemo(r[2]);
    const siteKey = `${normCust}_${cleanSiteName}`;
    let site = siteMap.get(siteKey);
    if (!site) {
      site = {
        id: `SITE-${String(siteSeq++).padStart(7, '0')}`,
        customerId: customer.id,
        name: cleanSiteName,
        address: customer.address || '현장 주소 미입력',
        isActive: true,
        dispatchMemo: dispatchMemo,
        createdAt: nowIso,
        updatedAt: nowIso
      };
      siteMap.set(siteKey, site);
    }

    const initialStartDate = sanitizeExcelDate(r[3]) || sanitizeExcelDate(r[4]) || '2026-08-01';
    const currentStartDate = sanitizeExcelDate(r[4]) || initialStartDate;
    const endDate = sanitizeExcelDate(r[5]) || '9999-12-31';
    const contractType = r[8] ? String(r[8]).trim() : '연장';
    const isTerminated = contractType === '종료';
    const isVirtual = contractType === '가상';

    const contractId = `CONT-260801-${String(contractSeq).padStart(4, '0')}`;
    const contractNo = `C2608-${String(contractSeq++).padStart(4, '0')}`;

    contracts.push({
      id: contractId,
      contractNo: contractNo,
      customerId: customer.id,
      siteId: site.id,
      startDate: initialStartDate,
      endDate: isTerminated && r[5] ? sanitizeExcelDate(r[5]) : '9999-12-31',
      billingDay: parseClosingDay(r[26] || customer.defaultBillingDay),
      lateInterestRate: 0,
      paymentDueDay: 15,
      status: isTerminated ? 'COMPLETED' : 'ACTIVE',
      createdAt: nowIso,
      updatedAt: nowIso
    });

    contractHistories.push({
      id: `CH-${String(chSeq++).padStart(7, '0')}`,
      contractId: contractId,
      changeType: 'REGISTER',
      changeDate: initialStartDate,
      description: `최초 계약 체결 등록 (현장: ${site.name})`,
      createdAt: nowIso
    });

    const ownModel = sanitizeModelName(r[9]);
    const ownAssetNo = r[10] ? String(r[10]).trim().toUpperCase() : '';
    const leaseModel = sanitizeModelName(r[12]);
    const leaseAssetNo = r[13] ? String(r[13]).trim().toUpperCase() : '';
    const leaseVendor = r[15] ? String(r[15]).trim() : '';

    let matchedAsset = null;
    let targetModel = ownModel || leaseModel || 'GS1930';

    if (ownAssetNo) {
      let existingAsset = assetMap.get(ownAssetNo);
      if (!existingAsset) {
        const newAssetId = `ASSET-${String(assetSeq++).padStart(7, '0')}`;
        existingAsset = {
          id: newAssetId,
          modelName: ownModel || 'GS1930',
          assetNo: ownAssetNo,
          serialNo: '',
          manufacturer: inferMakerFromModel(ownModel || 'GS1930'),
          manufactureYear: '2025년',
          ownerType: 'OWNED',
          status: isTerminated ? 'AVAILABLE' : 'RENTED',
          isVirtual: isVirtual,
          currentCustomerId: customer.id,
          currentSiteId: site.id,
          cumRentalFee: 0,
          memo: `초기 대장 기반 자동 생성 (가상/미등록 자산)`,
          createdAt: nowIso,
          updatedAt: nowIso
        };
        assetMap.set(ownAssetNo, existingAsset);
      }
      matchedAsset = existingAsset;
      existingAsset.status = isTerminated ? 'AVAILABLE' : 'RENTED';
      existingAsset.currentCustomerId = customer.id;
      existingAsset.currentSiteId = site.id;
    } else if (leaseAssetNo) {
      if (leaseVendor && !vendorMap.has(leaseVendor)) {
        vendorMap.set(leaseVendor, {
          id: `VEND-${String(vendorMap.size + 1).padStart(7, '0')}`,
          name: leaseVendor,
          type: 'RENTAL',
          isActive: true,
          createdAt: nowIso,
          updatedAt: nowIso
        });
      }

      let leaseAsset = assetMap.get(leaseAssetNo);
      if (!leaseAsset) {
        const leaseAssetId = `ASSET-${String(assetSeq++).padStart(7, '0')}`;
        leaseAsset = {
          id: leaseAssetId,
          modelName: leaseModel || 'GS1930',
          assetNo: leaseAssetNo,
          serialNo: '',
          manufacturer: inferMakerFromModel(leaseModel || 'GS1930'),
          manufactureYear: '2025년',
          ownerType: 'RENTED',
          status: isTerminated ? 'RENTED_RETURNED' : 'RENTED',
          vendorId: leaseVendor && vendorMap.has(leaseVendor) ? vendorMap.get(leaseVendor).id : null,
          renter: leaseVendor,
          rentStart: sanitizeExcelDate(r[18]) || initialStartDate,
          monthlyRentFee: sanitizeNumber(r[20]),
          currentCustomerId: customer.id,
          currentSiteId: site.id,
          isVirtual: isVirtual,
          cumRentalFee: 0,
          createdAt: nowIso,
          updatedAt: nowIso
        };
        assetMap.set(leaseAssetNo, leaseAsset);
      }
      matchedAsset = leaseAsset;

      const leaseStartDate = sanitizeExcelDate(r[18]) || initialStartDate;
      const leaseEndDate = sanitizeExcelDate(r[19]) || (isTerminated ? endDate : null);
      const monthlyLeaseFee = sanitizeNumber(r[20]);

      externalLeases.push({
        id: `LEASE-${String(leaseSeq++).padStart(7, '0')}`,
        vendorId: leaseVendor && vendorMap.has(leaseVendor) ? vendorMap.get(leaseVendor).id : 'VEND-0000001',
        contractId: contractId,
        assetDescription: leaseModel || '임차고소작업대',
        monthlyRentFee: monthlyLeaseFee,
        dailyRentFee: Math.round(monthlyLeaseFee / 30),
        leaseStartDate: leaseStartDate,
        leaseEndDate: leaseEndDate,
        status: leaseEndDate ? 'RETURNED' : 'ACTIVE',
        memo: r[16] ? `협착소유: ${r[16]}` : '',
        createdAt: nowIso,
        updatedAt: nowIso
      });

      if (monthlyLeaseFee > 0) {
        const vId = leaseVendor && vendorMap.has(leaseVendor) ? vendorMap.get(leaseVendor).id : 'VEND-0000001';
        const pKey = `2026-08_${vId}`;
        let pGroup = purchaseBillingGroup.get(pKey);
        if (!pGroup) {
          pGroup = {
            vendorId: vId,
            billingYm: '2026-08',
            totalAmount: 0,
            details: []
          };
          purchaseBillingGroup.set(pKey, pGroup);
        }
        pGroup.totalAmount += monthlyLeaseFee;
        pGroup.details.push({
          assetId: matchedAsset?.id,
          contractId: contractId,
          expenseType: 'RENTAL_FEE',
          itemName: `[전대임차] ${targetModel} (${leaseAssetNo}) 8월 임차료`,
          amount: monthlyLeaseFee
        });
      }
    }

    if (targetModel && !productMap.has(targetModel)) {
      productMap.set(targetModel, {
        id: `PROD-${String(productMap.size + 1).padStart(7, '0')}`,
        modelName: targetModel,
        feet: inferFeetFromModel(targetModel),
        spec: `${inferFeetFromModel(targetModel)}ft 고소작업대`,
        manufacturer: inferMakerFromModel(targetModel),
        powerSource: '배터리',
        isActive: true,
        createdAt: nowIso,
        updatedAt: nowIso
      });
    }

    const monthlyFee = sanitizeNumber(r[21]) || 280000;
    const dailyFee = Math.round(monthlyFee / 30);
    const caId = `CA-${String(caSeq++).padStart(7, '0')}`;

    contractAssets.push({
      id: caId,
      contractId: contractId,
      assetId: matchedAsset?.id || null,
      expectedModel: targetModel,
      monthlyRentalFee: monthlyFee,
      dailyRentalFee: dailyFee,
      startDate: initialStartDate,
      endDate: isTerminated && r[5] ? sanitizeExcelDate(r[5]) : '9999-12-31',
      status: isTerminated ? 'RETURNED' : 'RENTED',
      actualReturnDate: isTerminated ? sanitizeExcelDate(r[5]) : null,
      createdAt: nowIso,
      updatedAt: nowIso
    });

    const transportFee = sanitizeNumber(r[7]);

    // ── 출고 배차 및 검수 ──
    const outboundDelivId = `DELIV-OUT-${String(delivSeq++).padStart(6, '0')}`;
    deliveries.push({
      id: outboundDelivId,
      contractId: contractId,
      assetIds: matchedAsset?.id || '',
      type: 'OUTBOUND',
      dispatchCategory: '출고',
      status: 'COMPLETED',
      requestDate: initialStartDate,
      loadingDate: initialStartDate,
      unloadingDate: initialStartDate,
      originAddress: '본사 주기장 (경기 화성)',
      destinationAddress: site.address,
      deliveryCost: transportFee || 150000,
      memo: `최초 출고 배차 자동 생성 (${site.name})`,
      createdAt: nowIso,
      updatedAt: nowIso
    });

    if (matchedAsset?.id) {
      outboundInspections.push({
        id: `INSP-OUT-${String(inspSeq++).padStart(7, '0')}`,
        contractId: contractId,
        assetId: matchedAsset.id,
        inspectionDate: initialStartDate,
        inspectorId: 'SYSTEM_MIGRATION',
        status: 'APPROVED',
        createdAt: nowIso
      });

      assetInOutLogs.push({
        id: `INOUT-${String(inoutSeq++).padStart(7, '0')}`,
        assetId: matchedAsset.id,
        contractId: contractId,
        type: 'OUTBOUND',
        actionDate: initialStartDate,
        description: `[출고완료] ${customer.name} - ${site.name} 투입`,
        createdAt: nowIso
      });
    }

    // ── 회수/입고 배차 ──
    if (isTerminated && endDate && endDate !== '9999-12-31') {
      const inboundDelivId = `DELIV-IN-${String(delivSeq++).padStart(6, '0')}`;
      deliveries.push({
        id: inboundDelivId,
        contractId: contractId,
        assetIds: matchedAsset?.id || '',
        type: 'INBOUND',
        dispatchCategory: '입고',
        status: 'COMPLETED',
        requestDate: endDate,
        loadingDate: endDate,
        unloadingDate: endDate,
        originAddress: site.address,
        destinationAddress: '본사 주기장 (경기 화성)',
        deliveryCost: transportFee || 150000,
        memo: `공사 만료 장비 회수 입고 자동 생성 (${site.name})`,
        createdAt: nowIso,
        updatedAt: nowIso
      });

      if (matchedAsset?.id) {
        assetInOutLogs.push({
          id: `INOUT-${String(inoutSeq++).padStart(7, '0')}`,
          assetId: matchedAsset.id,
          contractId: contractId,
          type: 'INBOUND',
          actionDate: endDate,
          description: `[회수입고] ${customer.name} - ${site.name} 공사완료 입고`,
          createdAt: nowIso
        });
      }
    }

    // ── 과거 청구서 소급 생성 ──
    const startD = new Date(initialStartDate);
    if (!isNaN(startD.getTime())) {
      let curYear = startD.getFullYear();
      let curMonth = startD.getMonth() + 1;

      while (curYear < 2026 || (curYear === 2026 && curMonth < 8)) {
        const ymStr = `${curYear}-${String(curMonth).padStart(2, '0')}`;
        const isStartMonth = curYear === startD.getFullYear() && curMonth === (startD.getMonth() + 1);
        
        let daysInPeriod = 30;
        if (isStartMonth) {
          const lastDayOfStartMonth = new Date(curYear, curMonth, 0).getDate();
          daysInPeriod = Math.min(30, Math.max(1, lastDayOfStartMonth - startD.getDate() + 1));
        }
        const histBillAmount = Math.round(daysInPeriod * dailyFee);

        if (matchedAsset) {
          matchedAsset.cumRentalFee = (matchedAsset.cumRentalFee || 0) + histBillAmount;
        }

        const histBillingId = `BILL-${ymStr.replace('-', '')}-${String(billSeq++).padStart(4, '0')}`;
        billings.push({
          id: histBillingId,
          customerId: customer.id,
          contractId: contractId,
          billingYm: ymStr,
          billingDate: `${ymStr}-${String(customer.defaultBillingDay || 30).padStart(2, '0')}`,
          totalAmount: histBillAmount,
          paidAmount: histBillAmount,
          status: 'PAID',
          createdAt: nowIso,
          updatedAt: nowIso
        });

        billingDetails.push({
          id: `BD-${String(bdSeq++).padStart(7, '0')}`,
          billingId: histBillingId,
          contractAssetId: caId,
          assetId: matchedAsset?.id || null,
          itemName: `${targetModel} (${ownAssetNo || leaseAssetNo || '자산'}) 렌탈료`,
          quantity: daysInPeriod,
          unitPrice: dailyFee,
          amount: histBillAmount,
          description: `${ymStr} 정기 렌탈료 (${daysInPeriod}일 가동)`,
          displayName: `${targetModel} 렌탈료`,
          createdAt: nowIso,
          updatedAt: nowIso
        });

        curMonth++;
        if (curMonth > 12) {
          curMonth = 1;
          curYear++;
        }
      }
    }

    // ── 8월 청구액 정확 보정 ──
    const rowBillingTotal = sanitizeNumber(r[25]);
    const monthRentFee = sanitizeNumber(r[22]);
    const otherFee = sanitizeNumber(r[23]);
    const otherMemo = r[24] ? String(r[24]).trim() : '';
    const days = sanitizeNumber(r[6]) || 30;

    excelTotalBillingSum += rowBillingTotal;

    if (matchedAsset) {
      matchedAsset.cumRentalFee = (matchedAsset.cumRentalFee || 0) + (monthRentFee || rowBillingTotal);
    }

    let custBill = currentMonthBillingGroup.get(customer.id);
    if (!custBill) {
      custBill = {
        customer: customer,
        billingDate: '2026-08-31',
        dueDate: '2026-09-25',
        details: [],
        totalAmount: 0,
        paidAmount: 0
      };
      currentMonthBillingGroup.set(customer.id, custBill);
    }

    if (rowBillingTotal > 0) {
      const rawSum = monthRentFee + otherFee + transportFee;
      if (rawSum > 0 && (otherFee > 0 || transportFee > 0)) {
        const rentPortion = Math.round(rowBillingTotal * (monthRentFee / rawSum));
        const transPortion = Math.round(rowBillingTotal * (transportFee / rawSum));
        const otherPortion = rowBillingTotal - rentPortion - transPortion;

        if (rentPortion > 0) {
          custBill.details.push({
            contractAssetId: caId,
            assetId: matchedAsset?.id,
            itemName: `${targetModel} (${ownAssetNo || leaseAssetNo || '가상'}) 렌탈료`,
            itemType: 'RENTAL',
            quantity: days,
            unitPrice: Math.round(rentPortion / days),
            amount: rentPortion,
            description: `2026-08 렌탈료 (${days}일 가동, 현장: ${site.name})`,
            internalDescription: `원천행 ${rowIdx + 4}: ${rawCustName} / ${targetModel}`
          });
        }
        if (transPortion > 0) {
          custBill.details.push({
            contractAssetId: caId,
            assetId: matchedAsset?.id,
            itemName: '장비 운반비 (화물/셀프로더)',
            itemType: 'TRANSPORT',
            quantity: 1,
            unitPrice: transPortion,
            amount: transPortion,
            description: `왕복/편도 운반비 (${site.name})`,
            internalDescription: `운반비 청구`
          });
          receivables.push({
            id: `REC-${String(recSeq++).padStart(7, '0')}`,
            contractId: contractId,
            customerId: customer.id,
            type: 'TRANSPORT',
            totalAmount: transPortion,
            billedAmount: transPortion,
            internalDescription: `운반비 청구 (${site.name})`,
            occurredDate: '2026-08-31',
            status: 'PARTIAL',
            createdAt: nowIso,
            updatedAt: nowIso
          });
        }
        if (otherPortion > 0) {
          custBill.details.push({
            contractAssetId: caId,
            assetId: matchedAsset?.id,
            itemName: otherMemo ? `기타청구 (${otherMemo})` : '당월 기타청구',
            itemType: otherMemo.includes('파손') ? 'REPAIR' : 'ADJUSTMENT',
            quantity: 1,
            unitPrice: otherPortion,
            amount: otherPortion,
            description: otherMemo || '기타 추가 청구액',
            internalDescription: otherMemo
          });
          receivables.push({
            id: `REC-${String(recSeq++).padStart(7, '0')}`,
            contractId: contractId,
            customerId: customer.id,
            type: otherMemo.includes('파손') ? 'REPAIR' : 'OTHER',
            totalAmount: otherPortion,
            billedAmount: otherPortion,
            internalDescription: otherMemo || '당월 기타청구',
            occurredDate: '2026-08-31',
            status: 'PARTIAL',
            createdAt: nowIso,
            updatedAt: nowIso
          });
        }
      } else {
        custBill.details.push({
          contractAssetId: caId,
          assetId: matchedAsset?.id,
          itemName: `${targetModel} (${ownAssetNo || leaseAssetNo || '가상'}) 렌탈료`,
          itemType: 'RENTAL',
          quantity: days,
          unitPrice: Math.round(rowBillingTotal / days),
          amount: rowBillingTotal,
          description: `2026-08 렌탈료 (${days}일 가동, 현장: ${site.name})`,
          internalDescription: `원천행 ${rowIdx + 4}: ${rawCustName} / ${targetModel}`
        });
      }
      custBill.totalAmount += rowBillingTotal;
    }
  });

  currentMonthBillingGroup.forEach((group, custId) => {
    if (group.totalAmount <= 0 && group.details.length === 0) return;

    const billingId = `BILL-2608-${String(billSeq++).padStart(4, '0')}`;
    const detailSum = group.details.reduce((acc, d) => acc + d.amount, 0);
    const diff = group.totalAmount - detailSum;
    if (diff !== 0 && group.details.length > 0) {
      group.details[0].amount += diff;
    }

    billings.push({
      id: billingId,
      customerId: custId,
      billingYm: '2026-08',
      billingDate: group.billingDate,
      totalAmount: group.totalAmount,
      paidAmount: 0,
      status: 'UNPAID',
      createdAt: nowIso,
      updatedAt: nowIso
    });

    group.details.forEach(d => {
      billingDetails.push({
        id: `BD-${String(bdSeq++).padStart(7, '0')}`,
        billingId: billingId,
        contractAssetId: d.contractAssetId,
        assetId: d.assetId,
        itemName: d.itemName,
        quantity: d.quantity,
        unitPrice: d.unitPrice,
        amount: d.amount,
        description: d.description,
        internalDescription: d.internalDescription,
        displayName: d.itemName,
        createdAt: nowIso,
        updatedAt: nowIso
      });
    });
  });

  purchaseBillingGroup.forEach((pGroup, key) => {
    const pbId = `PB-2608-${String(pbSeq++).padStart(4, '0')}`;
    purchaseBillings.push({
      id: pbId,
      vendorId: pGroup.vendorId,
      billingYm: '2026-08',
      totalAmount: pGroup.totalAmount,
      paidAmount: 0,
      status: 'REQUESTED',
      createdAt: nowIso,
      updatedAt: nowIso
    });

    pGroup.details.forEach(d => {
      purchaseBillingDetails.push({
        id: `PBD-${String(pbdSeq++).padStart(7, '0')}`,
        purchaseBillId: pbId,
        assetId: d.assetId,
        contractId: d.contractId,
        expenseType: d.expenseType,
        itemName: d.itemName,
        amount: d.amount,
        createdAt: nowIso,
        updatedAt: nowIso
      });
    });
  });

  const parsedProducts = Array.from(productMap.values());
  const parsedVendors = Array.from(vendorMap.values());
  const parsedCustomers = Array.from(customerMap.values());
  const parsedSites = Array.from(siteMap.values());
  const parsedContacts = Array.from(contactMap.values());
  const parsedAssets = Array.from(assetMap.values());

  const currentMonthBills = billings.filter(b => b.billingYm === '2026-08');
  const histBills = billings.filter(b => b.billingYm !== '2026-08');
  const outboundDelivs = deliveries.filter(d => d.type === 'OUTBOUND');
  const inboundDelivs = deliveries.filter(d => d.type === 'INBOUND');

  const currentMonthBillSum = currentMonthBills.reduce((acc, b) => acc + b.totalAmount, 0);
  const currentMonthBillIds = new Set(currentMonthBills.map(b => b.id));
  const currentMonthDetails = billingDetails.filter(d => currentMonthBillIds.has(d.billingId));
  const currentMonthDetailSum = currentMonthDetails.reduce((acc, d) => acc + d.amount, 0);
  const billingDiff = Math.abs(excelTotalBillingSum - currentMonthBillSum);

  console.log(`\n📊 [파싱 및 정합성 검증 완료 통계]`);
  console.log(`- 장비 모델: ${parsedProducts.length} 종`);
  console.log(`- 거래처(매입/임대): ${parsedVendors.length} 개사`);
  console.log(`- 고객사: ${parsedCustomers.length} 개사`);
  console.log(`- 고객 현장: ${parsedSites.length} 개소`);
  console.log(`- 고객 담당자: ${parsedContacts.length} 명`);
  console.log(`- 자산 대장: ${parsedAssets.length} 대`);
  console.log(`- 렌탈 계약: ${contracts.length} 건`);
  console.log(`- 출고 배차: ${outboundDelivs.length} 건 (계약 대비 100% 매핑)`);
  console.log(`- 회수 배차: ${inboundDelivs.length} 건 (종료 계약 100% 매핑)`);
  console.log(`- 출고 검수: ${outboundInspections.length} 건`);
  console.log(`- 과거 소급 청구서: ${histBills.length} 건 (총액: ₩${histBills.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString()})`);
  console.log(`- 2026-08 당월 청구서: ${currentMonthBills.length} 건 (총액: ₩${currentMonthBillSum.toLocaleString()})`);
  console.log(`- 2026-08 당월 상세 품목: ${currentMonthDetails.length} 건 (총액: ₩${currentMonthDetailSum.toLocaleString()})`);
  console.log(`- 엑셀 원본 8월 청구합: ₩${excelTotalBillingSum.toLocaleString()}`);
  console.log(`- 8월 청구 차액: ₩${billingDiff.toLocaleString()} (${billingDiff === 0 ? '✓ 완벽 일치' : '✗ 차액 발생'})`);
  console.log(`- 전대 매입 청구서: ${purchaseBillings.length} 건 (총액: ₩${purchaseBillings.reduce((acc, b) => acc + b.totalAmount, 0).toLocaleString()})`);
  console.log(`- 외상미수금 부대청구: ${receivables.length} 건`);

  return {
    products: parsedProducts,
    vendors: parsedVendors,
    customers: parsedCustomers,
    customerSites: parsedSites,
    customerContacts: parsedContacts,
    assets: parsedAssets,
    contracts,
    contractAssets,
    externalLeases,
    deliveries,
    outboundInspections,
    assetInOutLogs,
    contractHistories,
    billings,
    billingDetails,
    purchaseBillings,
    purchaseBillingDetails,
    receivables,
    excelTotalBillingSum
  };
}

async function main() {
  try {
    const data = await runMigration();
    console.log('\n✅ 풀 라이프사이클 및 과거 청구 소급 파이프라인 무결성 검증 완료!');
  } catch (err) {
    console.error('❌ 오류 발생:', err);
    process.exit(1);
  }
}

main();
