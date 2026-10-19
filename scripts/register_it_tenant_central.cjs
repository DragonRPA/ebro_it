// scripts/register_it_tenant_central.cjs
// 중앙 플랫폼 DB (nyfashwbdcepncpdwpdb.supabase.co)에 eBro IT 데모 테넌트 등록 스크립트

const { createClient } = require('@supabase/supabase-js');

const CENTRAL_SUPABASE_URL = 'https://nyfashwbdcepncpdwpdb.supabase.co';
const CENTRAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im55ZmFzaHdiZGNlcG5jcGR3cGRiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTExOTUwMjgsImV4cCI6MjEwNjc3MTAyOH0.xw2XKKzjPj_HjQzPJDMKkkbaO7htojYioIMGt4l8VLM';

const client = createClient(CENTRAL_SUPABASE_URL, CENTRAL_SUPABASE_ANON_KEY);

const itTenantRecord = {
  id: 'tenant-ebro-it',
  tenantCode: 'EBRO_IT',
  subdomain: 'it-demo',
  displayName: 'eBroIT 렌탈',
  corporateName: '주식회사 이브로아이티',
  tradeName: '(주)이브로아이티',
  businessNumber: '123-86-56789',
  corporateRegistrationNumber: '110111-8888888',
  representativeName: '이정용',
  openingDate: '2026-01-01',
  businessAddress: '서울특별시 금천구 가산디지털1로 186 (eBro IT 데모 센터)',
  headOfficeAddress: '서울특별시 금천구 가산디지털1로 186',
  businessCategory: '정보통신업 / 임대서비스업',
  businessItem: '컴퓨터 및 주변장치 임대업',
  tel: '02-1588-0000',
  fax: '02-1588-0001',
  salesPhone: '010-3344-5566',
  taxEmail: 'tax@ebro-it.com',
  taxOffice: '금천세무서장',
  websiteUrl: 'https://it-demo.ebro.run',
  ciUrl: '/favicon.svg',
  logoUrl: '/favicon.svg',
  stampImageUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAadJREFUaEPtmWFOwzAMhW/uA+4/90HACUgIEoc0ad26/lhq1STN19hOqN9SJfFjO/4e3pI3S5F3fFw8bFp97dZz8/G2abfB2wZ7D6/J+69bWJ6L52P7mHy+Xz8+Lx+fr6v6Xv5m9fP69Vrfy//2Wl/L217ra/s5t4/J91+vybE9bHl9TNu3vVbeXsszW/k59pq2r3up1+TYHk2Ove61/e01ObaHLa+PyWvbq63PseW5eE2OpvXl1XNl9dxyZe7/7M9V33t7eW/sPbfvjXXeW8u5+PzcXq7P5er293v7b8u5+O/rZ/bZ+97bf1vXz+yzz/f+3FauXN6eKz/n8q51/cw+++zzvT+3lSuXt+fKz7m8a10/s88++3zvz23lyuXtufJzLu9a18/ss88++3zvz23lyuXtufJzLu9a18/ss88++3zvz23lyuXtufJzLu9a18/ss88++3zvz23lyuXtufJzLu9a18/ss88++3zvz23lyuXtufJzLu9a/wdzK+i+0EagAAAAABJRU5ErkJggg==',
  stampBase64: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAAAXNSR0IArs4c6QAAAAlwSFlzAAALEwAACxMBAJqcGAAAAadJREFUaEPtmWFOwzAMhW/uA+4/90HACUgIEoc0ad26/lhq1STN19hOqN9SJfFjO/4e3pI3S5F3fFw8bFp97dZz8/G2abfB2wZ7D6/J+69bWJ6L52P7mHy+Xz8+Lx+fr6v6Xv5m9fP69Vrfy//2Wl/L217ra/s5t4/J91+vybE9bHl9TNu3vVbeXsszW/k59pq2r3up1+TYHk2Ove61/e01ObaHLa+PyWvbq63PseW5eE2OpvXl1XNl9dxyZe7/7M9V33t7eW/sPbfvjXXeW8u5+PzcXq7P5er293v7b8u5+O/rZ/bZ+97bf1vXz+yzz/f+3FauXN6eKz/n8q51/cw+++zzvT+3lSuXt+fKz7m8a10/s88++3zvz23lyuXtufJzLu9a18/ss88++3zvz23lyuXtufJzLu9a18/ss88++3zvz23lyuXtufJzLu9a/wdzK+i+0EagAAAAABJRU5ErkJggg==',
  status: 'ACTIVE',
  isDefault: false,
  allowCustomBillingStatement: false,
  solutionType: 'IT',
  targetRepo: 'DragonRPA/ebro_it',
  subscription: {
    memo: '공식 IT 렌탈 데모 시연 및 테스트 전용 테넌트',
    plan: 'ENTERPRISE',
    status: 'ACTIVE',
    startDate: '2026-01-01',
    endDate: '2029-12-31',
    maxUsers: 0,
    maxAssets: 0,
    autoRenew: true,
    billingCycle: 'YEARLY',
    monthlyFee: 0,
    gracePeriodDays: 30,
    licenseKey: 'EBR-DEMO-IT-20291231-LIVE'
  },
  features: {
    r2Config: {
      updatedAt: '2026-10-19T08:00:00.000Z',
      r2AccountId: '35014a2514680107d74e1e68d96e6c32',
      r2BucketName: 'ebro-it-demo',
      r2AccessKeyId: '109db3cb8cf82f919041be9fa3d41250',
      r2PublicDomain: 'https://pub-a2468b66c450440dab37e0c02d516ca6.r2.dev',
      r2SecretAccessKey: 'f80aed8584d0735c7350feb780e2e6665ca0cdf53895d80042fea758b6045c88'
    },
    telegramBot: false,
    customDomain: 'it-demo.ebro.run',
    kakaoContract: true,
    agentAiEnabled: true,
    autoTaxInvoice: true,
    voiceAssistance: true,
    callRecordingStt: true,
    specialFeatures: [
      'tab:truck_dispatch:audit_settle',
      'btn:truck_dispatch:bulk_approve',
      'btn:courier_dispatch:direct_dispatch'
    ],
    officialMailConfig: {
      smtpHost: 'smtp.naver.com',
      smtpPort: 465,
      isDevMode: true,
      updatedAt: '2026-10-19T08:00:00.000Z',
      googleEmail: 'demo@ebro.run',
      smtpProvider: 'NAVER',
      googlePassword: '',
      gmailAppPassword: ''
    },
    privacyOfficer: {
      name: '이정용',
      email: 'demo@ebro.run',
      phone: '010-3344-5566',
      position: '대표이사 / 개인정보보호책임자',
      department: '경영지원본부'
    },
    developerAuthorizedDevices: [
      {
        id: 'DEV-PC-PRIMARY-01',
        deviceId: 'DEV-PC-PRIMARY-01',
        developerId: 'sys-admin',
        developerName: '대표 개발자',
        machineName: '개발자 워크스테이션',
        macAddress: 'D4-AB-61-46-47-82',
        hardwareFingerprint: 'HW-47A4-E661-24C32G',
        platform: 'Win32/x86_64',
        status: 'ACTIVE',
        isPrimary: true,
        registeredAt: '2026-10-19T00:00:00.000Z',
        lastVerifiedAt: '2026-10-19T00:00:00.000Z'
      }
    ]
  },
  bankAccounts: [
    {
      bankName: '우리은행',
      isDefault: true,
      accountHolder: '주식회사 이브로아이티',
      accountNumber: '1002-123-456789'
    }
  ],
  yards: [
    {
      id: 'yard-it-01',
      yardCode: 'YARD-IT-01',
      name: '가산 IT 물류센터',
      isDefault: true,
      address: '서울특별시 금천구 가산디지털1로 186',
      addressDetail: '지하 1층 물류센터',
      operatingCapacity: 1000,
      managerName: '물류운영팀',
      managerPhone: '02-1588-0000',
      tel: '02-1588-0000',
      operatingHours: '09:00 ~ 18:00',
      memo: 'IT 하드웨어 보관/검수/클리닝 센터',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  workplaces: [
    {
      id: 'wp-it-01',
      workplaceCode: 'HQ-IT',
      name: '가산 본점 (IT)',
      isHeadquarter: true,
      businessNumber: '123-86-56789',
      subBizNumber: '0000',
      address: '서울특별시 금천구 가산디지털1로 186',
      addressDetail: '본관 5층',
      tel: '02-1588-0000',
      fax: '02-1588-0001',
      managerName: '이정용',
      managerPhone: '010-3344-5566',
      managerEmail: 'tax@ebro-it.com',
      memo: 'eBro IT 렌탈 본사 및 관제센터',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  allowedPages: [
    'customer',
    'contract',
    'billing',
    'receivable',
    'smart_dispatch4',
    'smart_return',
    'smart_as_request',
    'delinquency',
    'product',
    'asset',
    'acquisition_disposal',
    'rent_asset',
    'delivery',
    'transport_master',
    'asset_inout_history',
    'dispatch_assign',
    'outbound_inspections',
    'consumable_purchase',
    'consumable_inout',
    'consumable_stock',
    'repair',
    'inspection_checklist_manage',
    'organization',
    'permission',
    'initial_db_upload',
    'dev_uploader',
    'tenant_management'
  ],
  hiddenPages: [],
  tenantSupabaseUrl: 'https://uvmhqwpkmzxrrlkeguul.supabase.co',
  tenantSupabaseAnonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2bWhxd3BrbXp4cnJsa2VndXVsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODk2MzIyNjgsImV4cCI6MjEwNTIwODI2OH0.vqPtbWpsMEVDnZqzVqzB1onKd-pL5T53qsRB3-IIjZU',
  systemName: 'e-Bro IT ERP',
  businessTypes: [
    {
      bizType: '정보통신업',
      bizItem: '컴퓨터 프로그래밍 및 시스템 통합'
    },
    {
      bizType: '사업지원 및 임대서비스업',
      bizItem: '컴퓨터 및 사무용 기계장비 임대'
    }
  ],
  isUnitTaxation: false,
  certificateIssueDate: '2026-01-01',
  email: 'tax@ebro-it.com',
  mainYardAddress: '서울특별시 금천구 가산디지털1로 186 (가산 IT 물류센터)',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: new Date().toISOString()
};

async function main() {
  console.log('Inserting/Upserting it-demo tenant into centralSupabase (nyfashwbdcepncpdwpdb)...');
  const { data, error } = await client
    .from('tenants')
    .upsert(itTenantRecord, { onConflict: 'id' })
    .select('id, tenantCode, displayName, subdomain, solutionType');

  if (error) {
    console.error('❌ Failed to insert tenant:', error);
    process.exit(1);
  }

  console.log('✅ Successfully registered IT demo tenant in central platform DB:');
  console.log(data);
}

main();
