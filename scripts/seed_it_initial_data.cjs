// scripts/seed_it_initial_data.cjs
// ebro_it IT 장비 전용 ERP 초기 기초 시드 데이터셋 적재 스크립트

const { Client } = require('pg');

const DB_CONFIG = {
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.uvmhqwpkmzxrrlkeguul',
  password: 'BwYofacVm0ibBz67',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
};

const TENANT_ID = 'ebro_it';
const NOW = new Date().toISOString();

async function seed() {
  console.log('=== ebro_it IT 장비 ERP 기초 데이터 적재 시작 ===');
  const client = new Client(DB_CONFIG);
  await client.connect();
  console.log('✅ PostgreSQL 접속 성공!');

  try {
    // 1. 테넌트 등록
    console.log('🏢 1. IT 테넌트 등록...');
    await client.query(`
      INSERT INTO tenants (
        id, "tenantCode", "systemName", "displayName", "corporateName",
        "tradeName", "businessNumber", "representativeName", "openingDate",
        "businessAddress", "headOfficeAddress", "businessCategory", "businessItem",
        "taxEmail", tel, "createdAt", "updatedAt"
      ) VALUES (
        $1, 'EBRO_IT', 'e-Bro IT ERP', 'e-Bro IT', '주식회사 이브로아이티',
        '(주)이브로아이티', '123-86-56789', '이정용', '2024-01-01',
        '서울특별시 금천구 가산디지털1로 186', '서울특별시 금천구 가산디지털1로 186',
        '정보통신업 / 임대서비스업', '컴퓨터 및 주변장치 임대업',
        'tax@ebro-it.com', '02-1588-0000', $2, $2
      )
      ON CONFLICT (id) DO UPDATE SET
        "displayName" = EXCLUDED."displayName",
        "corporateName" = EXCLUDED."corporateName",
        "updatedAt" = EXCLUDED."updatedAt";
    `, [TENANT_ID, NOW]);

    // 2. 부서 등록
    console.log('👥 2. 부서 등록...');
    const depts = [
      ['dept-mgmt', '경영지원팀'],
      ['dept-sales', 'IT영업팀'],
      ['dept-logistics', '물류배송팀'],
      ['dept-tech', '기술지원/RMA팀']
    ];
    for (const [dId, dName] of depts) {
      await client.query(`
        INSERT INTO departments (id, name, "createdAt", "updatedAt", tenant_id)
        VALUES ($1, $2, $3, $3, $4)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
      `, [dId, dName, NOW, TENANT_ID]);
    }

    // 3. 임직원 사용자 계정 등록 (초기 비밀번호: 1111)
    console.log('👤 3. 임직원 사용자 계정 등록...');
    const users = [
      ['u-admin', 'admin', '1111', '이정용', 'dept-mgmt', '대표이사', 'ACTIVE', 'ADMIN', '010-3344-5566', 'ceo@ebro-it.com'],
      ['u-sales', 'sales', '1111', '김영업', 'dept-sales', '영업팀장', 'ACTIVE', 'USER', '010-1111-2222', 'sales@ebro-it.com'],
      ['u-dispatch', 'dispatch', '1111', '최배송', 'dept-logistics', '물류주임', 'ACTIVE', 'USER', '010-3333-4444', 'dispatch@ebro-it.com'],
      ['u-tech', 'tech', '1111', '박엔지니어', 'dept-tech', 'RMA팀장', 'ACTIVE', 'USER', '010-5555-6666', 'tech@ebro-it.com'],
      ['u-finance', 'finance', '1111', '정재무', 'dept-mgmt', '회계과장', 'ACTIVE', 'USER', '010-7777-8888', 'finance@ebro-it.com']
    ];
    for (const [uId, lId, pw, name, dId, pos, st, role, phone, email] of users) {
      await client.query(`
        INSERT INTO users (id, "loginId", "passwordHash", name, "departmentId", position, status, role, phone, email, "createdAt", "updatedAt", tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $11, $12)
        ON CONFLICT (id) DO UPDATE SET
          "loginId" = EXCLUDED."loginId",
          "passwordHash" = EXCLUDED."passwordHash",
          name = EXCLUDED.name,
          role = EXCLUDED.role;
      `, [uId, lId, pw, name, dId, pos, st, role, phone, email, NOW, TENANT_ID]);
    }

    // 4. IT 제품 카탈로그 등록
    console.log('💻 4. IT 하드웨어 제품 카탈로그 등록...');
    const products = [
      ['p-nb-tp-t14', 'ThinkPad T14 Gen 4', 14, 'Lenovo', 'i7-1360P / 32GB RAM / 1TB NVMe / 14인치 WUXGA / Win11 Pro', '1.36kg', '1670-0088 (레노버)'],
      ['p-nb-mbp16', 'MacBook Pro 16 M3 Pro', 16, 'Apple', 'M3 Pro 12C / 36GB Unified / 512GB SSD / Liquid Retina XDR', '2.14kg', '080-333-4000 (애플)'],
      ['p-nb-gb4', 'Galaxy Book4 Pro 16', 16, 'Samsung', 'Core Ultra 7 / 32GB LPDDR5X / 1TB NVMe / 16인치 3K AMOLED', '1.56kg', '1588-3366 (삼성)'],
      ['p-dt-opt7010', 'Dell OptiPlex 7010 Micro', 0, 'Dell', 'i7-13700T / 32GB DDR5 / 1TB NVMe / 초소형 미니PC / Win11 Pro', '1.09kg', '080-854-0066 (델)'],
      ['p-ws-hpz2', 'HP Z2 Mini G9 Workstation', 0, 'HP', 'i9-13900K / 64GB ECC / 2TB NVMe / RTX A2000 12GB / Win11 Pro', '2.40kg', '1588-3003 (HP)'],
      ['p-mon-dell27', 'Dell UltraSharp U2723QE', 27, 'Dell', '27인치 4K UHD IPS Black / 90W PD USB-C Hub / RJ45 이더넷', '6.64kg', '080-854-0066 (델)'],
      ['p-mon-lg34', 'LG 34WN80C-B UltraWide', 34, 'LG', '34인치 21:9 WQHD 커브드 / sRGB 99% / 60W USB-C 연결', '8.50kg', '1544-7777 (LG)'],
      ['p-srv-r750', 'Dell PowerEdge R750', 2, 'Dell', '2U Rack / Dual Xeon 4314 / 128GB ECC / 8x 1.92TB NVMe SAS', '28.6kg', '080-854-0066 (델)'],
      ['p-net-c9200', 'Cisco Catalyst C9200L-48P-4X', 1, 'Cisco', '48-Port PoE+ / 4x 10G SFP+ Uplink / Layer 3 스위치', '4.80kg', '080-008-8088 (시스코)'],
      ['p-tab-ipad12', 'iPad Pro 12.9 6th Cellular', 13, 'Apple', 'Apple M2 / 256GB / Wi-Fi + 5G 셀룰러 / Liquid Retina XDR', '685g', '080-333-4000 (애플)']
    ];
    for (const [pId, mName, feet, mfr, spec, wt, asTel] of products) {
      await client.query(`
        INSERT INTO products (id, "modelName", feet, manufacturer, spec, weight, "asContact", "isActive", "createdAt", "updatedAt", tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, true, $8, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          "modelName" = EXCLUDED."modelName",
          spec = EXCLUDED.spec,
          weight = EXCLUDED.weight;
      `, [pId, mName, feet, mfr, spec, wt, asTel, NOW, TENANT_ID]);
    }

    // 5. IT 표준 옵션 / 악세서리 등록
    console.log('🛡️ 5. IT 표준 부가옵션/악세서리 등록...');
    const options = [
      ['opt-1', 'PAID', '썬더볼트4 10-in-1 도킹 스테이션 (Dell/CalDigit)', 10000, '월'],
      ['opt-2', 'PAID', '프리미엄 듀얼 모니터 암 (에르고트론 가스스프링)', 8000, '월'],
      ['opt-3', 'PAID', '로지텍 무선 키보드 & 마우스 콤보 세트', 5000, '월'],
      ['opt-4', 'PROTECTION', '켄싱턴 노트북/데스크탑 도난방지 보안 와이어 락', 2000, '월'],
      ['opt-5', 'SPEC', '기업용 클린 OS & 보안 필수 소프트웨어 사전 세팅', 30000, '대'],
      ['opt-6', 'PROTECTION', '3M 모니터 정보보안 사생활보호 필름 (엿보기방지)', 25000, '대']
    ];
    for (const [oId, cat, oName, price, unit] of options) {
      await client.query(`
        INSERT INTO standard_options (id, category, name, "defaultPrice", unit, "createdAt", "updatedAt", tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $6, $7)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, "defaultPrice" = EXCLUDED."defaultPrice";
      `, [oId, cat, oName, price, unit, NOW, TENANT_ID]);
    }

    // 6. IT 부품 및 소모품 카탈로그 등록
    console.log('🔧 6. IT 부품/소모품 등록...');
    const consumables = [
      ['c-ram-16', '삼성전자 DDR5-5600 노트북용 SODIMM 16GB', 'EA', 65000, 40, '메모리'],
      ['c-ram-32', '삼성전자 DDR5-5600 노트북용 SODIMM 32GB', 'EA', 125000, 30, '메모리'],
      ['c-ssd-1t', '삼성전자 990 PRO M.2 NVMe SSD 1TB', 'EA', 145000, 35, '스토리지'],
      ['c-ssd-2t', '삼성전자 990 PRO M.2 NVMe SSD 2TB', 'EA', 240000, 20, '스토리지'],
      ['c-chg-100w', '100W 3포트 GaN 접지 초고속 충전기 (USB-C)', 'EA', 45000, 50, '전원/어댑터'],
      ['c-cb-tb4', '인증 썬더볼트4 40Gbps 고속 케이블 (2m)', 'EA', 35000, 40, '케이블류'],
      ['c-thermal', 'ARCTIC MX-6 고성능 서멀 컴파운드 (4g)', 'EA', 12000, 25, '정비용품'],
      ['c-utp-cat6', 'LS전선 CAT.6 기가비트 UTP 랜케이블 (3m)', 'EA', 5000, 100, '네트워크']
    ];
    for (const [cId, cName, unit, uPrice, stock, cat] of consumables) {
      await client.query(`
        INSERT INTO consumables (id, "modelName", unit, "unitPrice", "stockQty", category, "createdAt", "updatedAt", tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $7, $8)
        ON CONFLICT (id) DO UPDATE SET "modelName" = EXCLUDED."modelName", "stockQty" = EXCLUDED."stockQty";
      `, [cId, cName, unit, uPrice, stock, cat, NOW, TENANT_ID]);
    }

    // 7. 협력사 / 벤더 등록
    console.log('🏭 7. IT 협력사(총판/RMA) 등록...');
    const vendors = [
      ['vnd-1', '대원씨티에스(주)', 'PURCHASE', '105-81-22334', '정명석', '김부장', '02-2004-7700', '서울특별시 용산구 원효로 142'],
      ['vnd-2', '(주)인텍앤컴퍼니', 'PURCHASE', '106-81-33445', '서정욱', '박차장', '02-2129-7777', '서울특별시 용산구 청파로 109'],
      ['vnd-3', '(주)씨앤씨 데이터복구/RMA', 'REPAIR', '214-86-99001', '최창남', '이팀장', '02-716-1234', '서울특별시 금천구 디지털로9길 68'],
      ['vnd-4', 'CJ대한통운 IT안심배송', 'TRANSPORT', '110-81-00123', '강신호', '물류센터', '1588-1255', '서울특별시 중구 서소문로 100']
    ];
    for (const [vId, vName, vType, bNo, rep, cName, tel, addr] of vendors) {
      await client.query(`
        INSERT INTO vendors (id, name, type, "bizRegNo", representative, "contactName", contact, address, "createdAt", "updatedAt", tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
      `, [vId, vName, vType, bNo, rep, cName, tel, addr, NOW, TENANT_ID]);
    }

    // 8. 운송사 및 배송 기사 등록
    console.log('🚚 8. 운송사 및 배송 기사 등록...');
    await client.query(`
      INSERT INTO transport_companies (id, name, "businessNo", contact, memo, "createdAt", "updatedAt", tenant_id)
      VALUES
      ('tc-1', 'CJ대한통운 IT안심특송', '110-81-00123', '1588-1255', '기업 IT 장비 전담 배송', $1, $1, $2),
      ('tc-2', '로젠 IT 퀵서비스', '124-81-77889', '1588-9988', '수도권 당일 긴급 퀵/배송', $1, $1, $2)
      ON CONFLICT (id) DO NOTHING;
    `, [NOW, TENANT_ID]);

    await client.query(`
      INSERT INTO transport_drivers (id, "companyId", "driverName", "driverContact", "vehicleNo", "vehicleType", "createdAt", "updatedAt", tenant_id)
      VALUES
      ('drv-1', 'tc-1', '김철수 기사', '010-9111-2222', '서울80바1234', '1톤 탑차(무진동)', $1, $1, $2),
      ('drv-2', 'tc-1', '이영수 기사', '010-9222-3333', '경기80바5678', '1톤 냉온탑차', $1, $1, $2),
      ('drv-3', 'tc-2', '박민우 기사', '010-9333-4444', '서울82다9012', '오토바이/다마스 퀵', $1, $1, $2)
      ON CONFLICT (id) DO NOTHING;
    `, [NOW, TENANT_ID]);

    // 9. 가상 고객사(기업 고객) 등록
    console.log('🏢 9. 고객사(테크 기업) 등록...');
    const customers = [
      ['cust-1', '(주)넥스트엔터프라이즈', '120-81-12345', '홍길동', '010-2222-0001', 'it@next-ent.com', '서울시 강남구 테헤란로 152', 25],
      ['cust-2', '(주)에이아이랩스', '214-86-23456', '김인공', '010-2222-0002', 'admin@ailabs.kr', '경기도 성남시 분당구 판교역로 235', 30],
      ['cust-3', '(주)클라우드웨이브', '305-81-34567', '박구름', '010-2222-0003', 'ops@cloudwave.io', '서울시 서초구 강남대로 300', 25],
      ['cust-4', '(주)핀테크플러스', '138-81-45678', '이금융', '010-2222-0004', 'sec@finplus.co.kr', '서울시 영등포구 여의대로 108', 20]
    ];
    for (const [cId, cName, bNo, rep, phone, email, addr, bDay] of customers) {
      await client.query(`
        INSERT INTO customers (id, name, "bizRegNo", representative, "repContact", "repEmail", address, "defaultBillingDay", "createdAt", "updatedAt", tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $9, $10)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;
      `, [cId, cName, bNo, rep, phone, email, addr, bDay, NOW, TENANT_ID]);
    }

    // 10. IT 실물 자산(Assets) 등록 (초기 15대 AVAILABLE 상태)
    console.log('💻 10. IT 실물 자산 등록 (15대)...');
    const assets = [
      ['ast-01', 'IT-NB-2026-001', 'ThinkPad T14 Gen 4', 'PF4X0001', 'Lenovo', '2024', 'AVAILABLE', 75000, 3500],
      ['ast-02', 'IT-NB-2026-002', 'ThinkPad T14 Gen 4', 'PF4X0002', 'Lenovo', '2024', 'AVAILABLE', 75000, 3500],
      ['ast-03', 'IT-NB-2026-003', 'ThinkPad T14 Gen 4', 'PF4X0003', 'Lenovo', '2024', 'AVAILABLE', 75000, 3500],
      ['ast-04', 'IT-MB-2026-001', 'MacBook Pro 16 M3 Pro', 'C02G0001', 'Apple', '2024', 'AVAILABLE', 150000, 6500],
      ['ast-05', 'IT-MB-2026-002', 'MacBook Pro 16 M3 Pro', 'C02G0002', 'Apple', '2024', 'AVAILABLE', 150000, 6500],
      ['ast-06', 'IT-GB-2026-001', 'Galaxy Book4 Pro 16', 'NX010001', 'Samsung', '2024', 'AVAILABLE', 85000, 4000],
      ['ast-07', 'IT-GB-2026-002', 'Galaxy Book4 Pro 16', 'NX010002', 'Samsung', '2024', 'AVAILABLE', 85000, 4000],
      ['ast-08', 'IT-DT-2026-001', 'Dell OptiPlex 7010 Micro', 'DL010001', 'Dell', '2023', 'AVAILABLE', 55000, 2500],
      ['ast-09', 'IT-DT-2026-002', 'Dell OptiPlex 7010 Micro', 'DL010002', 'Dell', '2023', 'AVAILABLE', 55000, 2500],
      ['ast-10', 'IT-WS-2026-001', 'HP Z2 Mini G9 Workstation', 'HP010001', 'HP', '2024', 'AVAILABLE', 180000, 8000],
      ['ast-11', 'IT-MN-2026-001', 'Dell UltraSharp U2723QE', 'MN010001', 'Dell', '2024', 'AVAILABLE', 35000, 1500],
      ['ast-12', 'IT-MN-2026-002', 'Dell UltraSharp U2723QE', 'MN010002', 'Dell', '2024', 'AVAILABLE', 35000, 1500],
      ['ast-13', 'IT-MN-2026-003', 'LG 34WN80C-B UltraWide', 'MN020001', 'LG', '2023', 'AVAILABLE', 40000, 1800],
      ['ast-14', 'IT-SV-2026-001', 'Dell PowerEdge R750', 'SV010001', 'Dell', '2023', 'AVAILABLE', 450000, 20000],
      ['ast-15', 'IT-NT-2026-001', 'Cisco Catalyst C9200L-48P-4X', 'CS010001', 'Cisco', '2023', 'AVAILABLE', 120000, 5000]
    ];
    for (const [aId, aNo, mName, sNo, mfr, mYear, status, mFee, dFee] of assets) {
      await client.query(`
        INSERT INTO assets (
          id, "assetNo", "modelName", "serialNo", manufacturer, "manufactureYear",
          "ownerType", status, "monthlyRentalFee", "dailyRentalFee", "maintenanceScore",
          "createdAt", "updatedAt", tenant_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          'OWNED', $7, $8, $9, 0,
          $10, $10, $11
        )
        ON CONFLICT (id) DO UPDATE SET
          "assetNo" = EXCLUDED."assetNo",
          "modelName" = EXCLUDED."modelName",
          status = EXCLUDED.status;
      `, [aId, aNo, mName, sNo, mfr, mYear, status, mFee, dFee, NOW, TENANT_ID]);
    }

    console.log('🎉 ebro_it IT ERP 전체 시드 데이터 적재 완료!');
  } finally {
    await client.end();
  }
}

seed().catch(err => {
  console.error('❌ 시드 데이터 적재 실패:', err.message);
  process.exit(1);
});
