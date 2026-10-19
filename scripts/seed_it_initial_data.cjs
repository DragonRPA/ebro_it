// scripts/seed_it_initial_data.cjs
// ebro_it IT 장비 및 소프트웨어 전용 ERP 기초 시드 데이터셋 적재 스크립트

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
  console.log('=== ebro_it IT 장비 & 소프트웨어 ERP 기초 데이터 적재 시작 ===');
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

    // 4. IT 10대 카테고리 제품 카탈로그 등록
    console.log('💻 4. IT 10대 카테고리 제품 카탈로그 등록...');
    const products = [
      // LAPTOP
      ['p-nb-tp-t14', 'LAPTOP', 'Lenovo', 'ThinkPad T14 Gen 4', 'T14 G4', 'i7-1360P / 16G 온보드 + 1슬롯 / 512GB NVMe / 14인치 WUXGA IPS / Win11 Pro', 'Intel Core i7-1360P', 16, 1, 48, '16GB DDR5', 1, 'M.2 2280 PCIe 4.0', '512GB NVMe', 'INTEGRATED', 'Intel Iris Xe', 0, 14.0, 'WUXGA (1920x1200)', '1.36kg', 'Windows 11 Pro', 'Lenovo NBD (3년)', '65W GaN 어댑터'],
      ['p-nb-mbp16', 'LAPTOP', 'Apple', 'MacBook Pro 16 M3 Pro', 'MBP 16 M3', 'M3 Pro 12C / 36GB 통합메모리 / 512GB SSD / Liquid Retina XDR', 'Apple M3 Pro', 36, 0, 36, '36GB Unified', 0, '온보드 SSD', '512GB SSD', 'INTEGRATED', 'Apple 18-Core GPU', 0, 16.2, 'Liquid Retina XDR (3456x2234)', '2.14kg', 'macOS Sonoma', 'AppleCare Enterprise (3년)', '140W 어댑터, MagSafe 케이블'],
      ['p-nb-gb4', 'LAPTOP', 'Samsung', 'Galaxy Book4 Pro 16', 'GB4 Pro 16', 'Core Ultra 7 / 32GB LPDDR5X / 1TB NVMe / 16인치 3K AMOLED / Win11 Pro', 'Intel Core Ultra 7 155H', 32, 0, 32, '32GB LPDDR5X', 2, 'M.2 NVMe 2슬롯', '1TB NVMe', 'INTEGRATED', 'Intel Arc Graphics', 0, 16.0, '3K AMOLED (2880x1800)', '1.56kg', 'Windows 11 Pro', '삼성 B2B (1년)', '65W 어댑터'],
      
      // DESKTOP
      ['p-dt-opt7010', 'DESKTOP', 'Dell', 'Dell OptiPlex 7010 Micro', 'OptiPlex 7010M', 'i7-13700T / 16GB DDR5 (2슬롯) / 512GB NVMe / 초소형 미니PC / Win11 Pro', 'Intel Core i7-13700T', 0, 2, 64, '16GB (16*1)', 1, 'M.2 NVMe', '512GB NVMe', 'INTEGRATED', 'Intel UHD 770', 0, null, null, '1.09kg', 'Windows 11 Pro', 'Dell ProSupport (3년)', '90W 어댑터, 무선 키마 세트'],
      ['p-ws-hpz2', 'DESKTOP', 'HP', 'HP Z2 Mini G9 Workstation', 'Z2 Mini G9', 'i9-13900K / 64GB DDR5 / 1TB NVMe / NVIDIA RTX A2000 12GB / 워크스테이션', 'Intel Core i9-13900K', 0, 2, 64, '64GB (32*2)', 2, 'M.2 NVMe 2슬롯', '1TB NVMe', 'DEDICATED', 'NVIDIA RTX A2000 12GB', 1, null, null, '2.40kg', 'Windows 11 Pro Workstation', 'HP CarePack (3년)', '280W 어댑터, 무선 키마'],
      
      // MONITOR
      ['p-mon-dell27', 'MONITOR', 'Dell', 'Dell UltraSharp U2723QE', 'U2723QE 4K', '27인치 4K UHD IPS Black / 90W PD USB-C Hub / RJ45 이더넷 / 피벗 스탠드', null, 0, 0, 0, null, 0, null, null, null, null, 0, 27.0, '4K UHD (3840x2160)', '6.64kg', null, 'Dell 패널교환보증 (3년)', 'Type-C to C 케이블, 전원코드, DP케이블'],
      ['p-mon-lg34', 'MONITOR', 'LG', 'LG 34WN80C-B UltraWide', '34WN80C 21:9', '34인치 21:9 WQHD 커브드 / sRGB 99% / 60W USB-C 연결 / 높낮이/틸트', null, 0, 0, 0, null, 0, null, null, null, null, 0, 34.0, 'UltraWide QHD (3440x1440)', '8.50kg', null, 'LG 서비스센터 (1년)', '전원 어댑터, HDMI, Type-C'],
      
      // TV
      ['p-tv-sam65', 'TV', 'Samsung', 'Samsung 65인치 4K UHD 사이니지 TV', '삼성 65인치 TV', '65인치 4K UHD / 상업용 16/7 연속운용 / 이동식 바퀴형 거치대 포함 / 스마트 기능', null, 0, 0, 0, null, 0, null, null, null, null, 0, 65.0, '4K UHD (3840x2160)', '21.3kg', 'Tizen OS', '삼성 B2B 출장 (2년)', '리모컨, 전원코드, 이동식 거치대, HDMI (5m)'],
      
      // SERVER
      ['p-srv-r750', 'SERVER', 'Dell', 'Dell PowerEdge R750', 'R750 2U', '2U Rack / Dual Xeon 4314 (32C) / 128GB ECC (32슬롯) / 8x 2.5인치 베이 / 800W Dual', 'Dual Intel Xeon 4314', 0, 32, 2048, '128GB (32*4) ECC', 8, '8x 2.5인치 핫스왑 베이', '2x 480GB SSD (RAID 1)', 'INTEGRATED', 'Matrox G200', 6, null, null, '28.6kg', 'No OS (Linux/WinServer 지원)', 'Dell ProSupport Mission Critical (3년)', 'ReadyRails 랙 레일킷, 전원코드 2개'],
      
      // NETWORK
      ['p-net-c9200', 'NETWORK', 'Cisco', 'Cisco Catalyst C9200L-48P-4X', 'C9200L 48P', '48-Port PoE+ (740W) / 4x 10G SFP+ Uplink / Layer 3 엔터프라이즈 스위치', null, 0, 0, 0, null, 0, null, null, null, null, 0, null, null, '4.80kg', null, 'Cisco SmartNet (1년)', '19인치 랙마운트 브라켓, 콘솔 케이블'],
      
      // TABLET
      ['p-tab-ipad12', 'TABLET', 'Apple', 'iPad Pro 12.9 6th Cellular', 'iPad Pro 12.9 셀룰러', 'Apple M2 / 256GB / Wi-Fi + 5G 셀룰러 (IMEI) / Liquid Retina XDR', 'Apple M2', 8, 0, 8, '8GB 통합메모리', 0, '온보드 플래시', '256GB', 'INTEGRATED', 'Apple 10-Core GPU', 0, 12.9, 'Liquid Retina XDR (2732x2048)', '685g', 'iPadOS 17', 'AppleCare Enterprise (2년)', '20W USB-C 충전기, C to C 케이블'],
      
      // PRINTER
      ['p-prt-c3060', 'PRINTER', 'FujiFilm', 'FujiFilm ApeosPort C3060 A3 복합기', '후지 C3060 복합기', 'A3 컬러 디지털 복합기 / 출력속도 30 PPM / 복사, 인쇄, 스캔, 팩스 / 양면 자동급지', null, 0, 0, 0, null, 0, null, null, null, null, 0, null, null, '75.0kg', null, '후지필름 정기점검 및 토너공급', '기본 토너 1세트, 전원코드, 랜선, 팩스선'],
      
      // SOFTWARE
      ['p-sw-m365', 'SOFTWARE', 'Microsoft', 'Microsoft 365 Business Standard', 'M365 Business Std', '1인당 PC 5대 + 모바일 5대 / Word, Excel, PowerPoint, Outlook, Teams, 1TB Cloud', null, 0, 0, 0, null, 0, null, null, null, null, 0, null, null, null, 'Win/Mac/모바일', 'MS 공식 기술지원', '전자 라이선스 인증키'],
      ['p-sw-win11', 'SOFTWARE', 'Microsoft', 'Windows 11 Pro 64-bit DSP 라이선스', 'Win11 Pro DSP', '기업용 Windows 11 Pro COA 스티커 및 제품키 1디바이스 영구귀속 라이선스', null, 0, 0, 0, null, 0, null, null, null, null, 0, null, null, null, 'Windows 11 Pro', '영구 라이선스', '정품 COA 스티커 및 제품키 카드'],
      
      // OTHER
      ['p-oth-ts4', 'OTHER', 'CalDigit', 'CalDigit TS4 썬더볼트4 18-in-1 도킹스테이션', 'CalDigit TS4', 'Thunderbolt 4 / 최대 98W 호스트 충전 / 2.5GbE LAN / 18개 확장 포트', null, 0, 0, 0, null, 0, null, null, null, null, 0, null, null, '640g', null, '공식 수입원 보증 (2년)', '230W 어댑터, 썬더볼트4 케이블']
    ];

    for (const p of products) {
      const [
        pId, cat, mfr, mName, sName, spec, cpu, obRam, ramSlots, maxRam, baseRam,
        stSlots, stForms, baseSt, gpuType, defGpu, gpuSlots, dispSize, resol, wt, defOs,
        wType, bItems
      ] = p;

      await client.query(`
        INSERT INTO products (
          id, category, manufacturer, "modelName", "shortName", spec,
          cpu, "onboardRam", "ramSlots", "maxRam", "baseRam",
          "storageSlots", "storageFormFactors", "baseStorage", "gpuType", "defaultGpu", "gpuSlots",
          "displaySize", resolution, weight, "defaultOs", "warrantyType", "bundledAccessories",
          "isActive", "createdAt", "updatedAt", tenant_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6,
          $7, $8, $9, $10, $11,
          $12, $13, $14, $15, $16, $17,
          $18, $19, $20, $21, $22, $23,
          true, $24, $24, $25
        ) ON CONFLICT (id) DO UPDATE SET
          category = EXCLUDED.category,
          "modelName" = EXCLUDED."modelName",
          spec = EXCLUDED.spec,
          cpu = EXCLUDED.cpu,
          "onboardRam" = EXCLUDED."onboardRam",
          "ramSlots" = EXCLUDED."ramSlots",
          "maxRam" = EXCLUDED."maxRam",
          "storageSlots" = EXCLUDED."storageSlots",
          "baseStorage" = EXCLUDED."baseStorage",
          "defaultGpu" = EXCLUDED."defaultGpu",
          "displaySize" = EXCLUDED."displaySize",
          weight = EXCLUDED.weight,
          "defaultOs" = EXCLUDED."defaultOs",
          "bundledAccessories" = EXCLUDED."bundledAccessories";
      `, [
        pId, cat, mfr, mName, sName, spec,
        cpu, obRam, ramSlots, maxRam, baseRam,
        stSlots, stForms, baseSt, gpuType, defGpu, gpuSlots,
        dispSize, resol, wt, defOs, wType, bItems,
        NOW, TENANT_ID
      ]);
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
        INSERT INTO vendors (id, name, type, "bizRegNo", representative, memo, address, "createdAt", "updatedAt", tenant_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $8, $9)
        ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, memo = EXCLUDED.memo;
      `, [vId, vName, vType, bNo, rep, `담당자: ${cName} (${tel})`, addr, NOW, TENANT_ID]);
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

    // 10. IT 실물 자산(Assets) 등록 (MAC주소, IMEI, RAM/Storage 커스텀 스펙, 라이선스키 포함 15대)
    console.log('💻 10. IT 실물 자산 등록 (15대: MAC, 커스텀 스펙, 라이선스 완비)...');
    const assets = [
      // 1~3: ThinkPad T14 (기본사양 vs RAM 증설 자산)
      ['ast-01', 'IT-NB-2026-001', 'ThinkPad T14 Gen 4', 'PF4X0001', '00:1A:2B:3C:4D:01', '00:1A:2B:3C:4D:02', null, 'Lenovo', '2024', '16GB (온보드 16GB)', 16, JSON.stringify([{ slot: 1, type: 'NVMe SSD', size: '512GB', model: 'Samsung PM9A1' }]), '512GB NVMe', 'Intel Iris Xe', 'Windows 11 Pro', '기본 표준 사양', null, null, null, 'AVAILABLE', 75000, 3500],
      ['ast-02', 'IT-NB-2026-002', 'ThinkPad T14 Gen 4', 'PF4X0002', '00:1A:2B:3C:4D:03', '00:1A:2B:3C:4D:04', null, 'Lenovo', '2024', '32GB (온보드 16GB + 슬롯1 16GB)', 32, JSON.stringify([{ slot: 1, type: 'NVMe SSD', size: '1TB', model: 'Samsung 990 PRO' }]), '1TB NVMe', 'Intel Iris Xe', 'Windows 11 Pro', 'RAM 16G 증설 + 1TB SSD 업그레이드', null, null, null, 'AVAILABLE', 90000, 4200],
      ['ast-03', 'IT-NB-2026-003', 'ThinkPad T14 Gen 4', 'PF4X0003', '00:1A:2B:3C:4D:05', '00:1A:2B:3C:4D:06', null, 'Lenovo', '2024', '16GB (온보드 16GB)', 16, JSON.stringify([{ slot: 1, type: 'NVMe SSD', size: '512GB', model: 'Samsung PM9A1' }]), '512GB NVMe', 'Intel Iris Xe', 'Windows 11 Pro', '기본 표준 사양', null, null, null, 'AVAILABLE', 75000, 3500],
      
      // 4~5: MacBook Pro 16 M3 Pro
      ['ast-04', 'IT-MB-2026-001', 'MacBook Pro 16 M3 Pro', 'C02G0001', null, 'F0:18:98:AA:BB:01', null, 'Apple', '2024', '36GB 통합메모리', 36, JSON.stringify([{ slot: 'Onboard', type: 'Apple SSD', size: '512GB' }]), '512GB 초고속 SSD', 'Apple 18-Core GPU', 'macOS Sonoma', '표준 36G 사양', null, null, null, 'AVAILABLE', 150000, 6500],
      ['ast-05', 'IT-MB-2026-002', 'MacBook Pro 16 M3 Pro', 'C02G0002', null, 'F0:18:98:AA:BB:02', null, 'Apple', '2024', '36GB 통합메모리', 36, JSON.stringify([{ slot: 'Onboard', type: 'Apple SSD', size: '512GB' }]), '512GB 초고속 SSD', 'Apple 18-Core GPU', 'macOS Sonoma', '표준 36G 사양', null, null, null, 'AVAILABLE', 150000, 6500],
      
      // 6~7: Galaxy Book4 Pro 16
      ['ast-06', 'IT-GB-2026-001', 'Galaxy Book4 Pro 16', 'NX010001', null, '9C:28:B3:11:22:01', null, 'Samsung', '2024', '32GB LPDDR5X', 32, JSON.stringify([{ slot: 1, type: 'NVMe SSD', size: '1TB' }]), '1TB NVMe', 'Intel Arc Graphics', 'Windows 11 Pro', '기본 1TB 사양', null, null, null, 'AVAILABLE', 85000, 4000],
      ['ast-07', 'IT-GB-2026-002', 'Galaxy Book4 Pro 16', 'NX010002', null, '9C:28:B3:11:22:02', null, 'Samsung', '2024', '32GB LPDDR5X', 32, JSON.stringify([{ slot: 1, type: 'NVMe SSD', size: '1TB' }, { slot: 2, type: 'NVMe SSD', size: '1TB' }]), '1TB + 1TB = 총 2TB NVMe', 'Intel Arc Graphics', 'Windows 11 Pro', 'SSD 1TB 추가 장착 (듀얼 2TB)', null, null, null, 'AVAILABLE', 95000, 4500],
      
      // 8~9: Dell OptiPlex 7010 Micro
      ['ast-08', 'IT-DT-2026-001', 'Dell OptiPlex 7010 Micro', 'DL010001', '18:66:DA:33:44:01', '18:66:DA:33:44:02', null, 'Dell', '2023', '16GB (16*1)', 16, JSON.stringify([{ slot: 1, type: 'NVMe SSD', size: '512GB' }]), '512GB NVMe', 'Intel UHD 770', 'Windows 11 Pro', '표준 사무용 세팅', null, null, null, 'AVAILABLE', 55000, 2500],
      ['ast-09', 'IT-DT-2026-002', 'Dell OptiPlex 7010 Micro', 'DL010002', '18:66:DA:33:44:03', '18:66:DA:33:44:04', null, 'Dell', '2023', '32GB (16GB*2 듀얼채널)', 32, JSON.stringify([{ slot: 1, type: 'NVMe SSD', size: '1TB' }]), '1TB NVMe', 'Intel UHD 770', 'Windows 11 Pro', 'RAM 16G 증설 (32G 듀얼)', null, null, null, 'AVAILABLE', 65000, 3000],
      
      // 10: HP Z2 Mini G9 Workstation
      ['ast-10', 'IT-WS-2026-001', 'HP Z2 Mini G9 Workstation', 'HP010001', '3C:52:82:55:66:01', '3C:52:82:55:66:02', null, 'HP', '2024', '64GB (32GB*2)', 64, JSON.stringify([{ slot: 1, type: 'NVMe SSD', size: '1TB' }, { slot: 2, type: 'NVMe SSD', size: '2TB' }]), '1TB OS + 2TB DATA = 3TB', 'NVIDIA RTX A2000 12GB', 'Windows 11 Pro Workstation', '3TB 듀얼 드라이브 그래픽 워크스테이션', null, null, null, 'AVAILABLE', 180000, 8000],
      
      // 11~12: Dell 4K 모니터
      ['ast-11', 'IT-MN-2026-001', 'Dell UltraSharp U2723QE', 'MN010001', '24:4B:FE:77:88:01', null, null, 'Dell', '2024', null, 0, null, null, null, null, '피벗 모니터 완품', null, null, null, 'AVAILABLE', 35000, 1500],
      ['ast-12', 'IT-MN-2026-002', 'Dell UltraSharp U2723QE', 'MN010002', '24:4B:FE:77:88:02', null, null, 'Dell', '2024', null, 0, null, null, null, null, '피벗 모니터 완품', null, null, null, 'AVAILABLE', 35000, 1500],
      
      // 13: TV 사이니지
      ['ast-13', 'IT-TV-2026-001', 'Samsung 65인치 4K UHD 사이니지 TV', 'TV650001', '80:5E:4F:99:00:01', '80:5E:4F:99:00:02', null, 'Samsung', '2023', null, 0, null, null, null, 'Tizen OS', '이동식 바퀴 스탠드 장착 완제품', null, null, null, 'AVAILABLE', 120000, 6000],
      
      // 14: 서버 (Dell R750 다중 드라이브)
      ['ast-14', 'IT-SV-2026-001', 'Dell PowerEdge R750', 'SV010001', 'D0:94:66:AA:01:01', null, null, 'Dell', '2023', '128GB (32GB*4 ECC RDIMM)', 128, JSON.stringify([
        { slot: 1, type: 'SATA SSD', size: '480GB', model: 'Dell BOSS RAID 1' },
        { slot: 2, type: 'SATA SSD', size: '480GB', model: 'Dell BOSS RAID 1' },
        { slot: 3, type: 'SAS SSD', size: '1.92TB', model: 'Kioxia Enterprise' },
        { slot: 4, type: 'SAS SSD', size: '1.92TB', model: 'Kioxia Enterprise' },
        { slot: 5, type: 'SAS SSD', size: '1.92TB', model: 'Kioxia Enterprise' },
        { slot: 6, type: 'SAS SSD', size: '1.92TB', model: 'Kioxia Enterprise' }
      ]), 'OS 480G 미러 + 4x 1.92TB SAS SSD RAID 5', 'Matrox G200', 'Ubuntu Server 22.04 LTS', '엔터프라이즈 DB 서버 구성', null, null, null, 'AVAILABLE', 450000, 20000],
      
      // 15: 소프트웨어 라이선스 자산 (Windows 11 Pro DSP)
      ['ast-15', 'IT-SW-2026-001', 'Windows 11 Pro 64-bit DSP 라이선스', 'COA-99881122', null, null, null, 'Microsoft', '2024', null, 0, null, null, null, 'Windows 11 Pro', '영구 귀속형 COA 라이선스', 'VK7JG-NPHTM-C97JM-9MPGT-3V66T', 'PERPETUAL', 'DSP', 'AVAILABLE', 25000, 1000]
    ];

    for (const a of assets) {
      const [
        aId, aNo, mName, sNo, wMac, wfMac, imei, mfr, mYear,
        ramCfg, tRamGb, stDrives, tStText, instGpu, instOs, custSpec,
        licKey, licExp, licType, status, mFee, dFee
      ] = a;

      await client.query(`
        INSERT INTO assets (
          id, "assetNo", "modelName", "serialNo", "wiredMac", "wifiMac", imei,
          manufacturer, "manufactureYear", "ownerType",
          "ramConfig", "totalRamGb", "storageDrives", "totalStorageText",
          "installedGpu", "installedOs", "customSpec",
          "licenseKey", "licenseExpiryDate", "licenseType",
          status, "monthlyRentalFee", "dailyRentalFee", "maintenanceScore",
          "createdAt", "updatedAt", tenant_id
        ) VALUES (
          $1, $2, $3, $4, $5, $6, $7,
          $8, $9, 'OWNED',
          $10, $11, $12::jsonb, $13,
          $14, $15, $16,
          $17, $18, $19,
          $20, $21, $22, 0,
          $23, $23, $24
        ) ON CONFLICT (id) DO UPDATE SET
          "assetNo" = EXCLUDED."assetNo",
          "modelName" = EXCLUDED."modelName",
          "serialNo" = EXCLUDED."serialNo",
          "wiredMac" = EXCLUDED."wiredMac",
          "wifiMac" = EXCLUDED."wifiMac",
          imei = EXCLUDED.imei,
          "ramConfig" = EXCLUDED."ramConfig",
          "totalRamGb" = EXCLUDED."totalRamGb",
          "storageDrives" = EXCLUDED."storageDrives",
          "totalStorageText" = EXCLUDED."totalStorageText",
          "installedGpu" = EXCLUDED."installedGpu",
          "installedOs" = EXCLUDED."installedOs",
          "customSpec" = EXCLUDED."customSpec",
          "licenseKey" = EXCLUDED."licenseKey",
          status = EXCLUDED.status;
      `, [
        aId, aNo, mName, sNo, wMac, wfMac, imei,
        mfr, mYear,
        ramCfg, tRamGb, stDrives || '[]', tStText,
        instGpu, instOs, custSpec,
        licKey, licExp, licType,
        status, mFee, dFee,
        NOW, TENANT_ID
      ]);
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
