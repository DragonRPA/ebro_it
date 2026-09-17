-- ==============================================================================
-- [기연리프트 ERP] Supabase PostgreSQL DDL 마이그레이션 패치 스크립트
-- 버전: v1.2.1.Build.54 (2026-09-02)
-- 내용: 
--   1. 전대(임차) 자산 타사 원래 관리번호 (vendorAssetNo) 추가
--   2. 타사 청구 부대비용 외상미수금 구상채권 (VENDOR_CLAIM) 제약조건 및 컬럼 확장
--   3. 단일 경유 혼적 회수 및 타사 직출고 배차 컬럼 확장
--   4. 현장 AS 내비 및 타임라인 로깅 컬럼 및 RLS 권한 무결성 보장
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. assets (자산 마스터) - 타사(원사) 원래 관리번호 추가
-- ------------------------------------------------------------------------------
ALTER TABLE assets 
ADD COLUMN IF NOT EXISTS "vendorAssetNo" TEXT;

COMMENT ON COLUMN assets."vendorAssetNo" IS '타사(원사) 실물 명찰 원래 관리번호 (예: 대한-101, AJ-502)';


-- ------------------------------------------------------------------------------
-- 2. receivables (외상미수금 대장) - VENDOR_CLAIM (구상채권) 확장
-- ------------------------------------------------------------------------------
-- 2-1. 기존 type CHECK 제약조건 안전하게 갱신 (VENDOR_CLAIM 추가)
DO $$
BEGIN
    ALTER TABLE receivables DROP CONSTRAINT IF EXISTS receivables_type_check;
    
    ALTER TABLE receivables 
    ADD CONSTRAINT receivables_type_check 
    CHECK (type IN ('TRANSPORT', 'REPAIR', 'CLEANING', 'OTHER', 'VENDOR_CLAIM'));
EXCEPTION
    WHEN OTHERS THEN 
        RAISE NOTICE 'receivables_type_check 제약조건 갱신 중 예외 발생(무시): %', SQLERRM;
END $$;

-- 2-2. 구상 원사명 및 대상 장비번호 컬럼 추가
ALTER TABLE receivables 
ADD COLUMN IF NOT EXISTS "vendorName" TEXT,
ADD COLUMN IF NOT EXISTS "assetNo" TEXT;

COMMENT ON COLUMN receivables."vendorName" IS '타사 청구 부대비용 발생 원사 거래처명';
COMMENT ON COLUMN receivables."assetNo" IS '구상 원인이 된 대상 장비번호';


-- ------------------------------------------------------------------------------
-- 3. deliveries (배차 및 화물 운송 대장) - 타사 직출고 & 단일 경유 배차 확장
-- ------------------------------------------------------------------------------
ALTER TABLE deliveries 
ADD COLUMN IF NOT EXISTS "pickupType" TEXT DEFAULT 'YARD',
ADD COLUMN IF NOT EXISTS "pickupVendorName" TEXT,
ADD COLUMN IF NOT EXISTS "dropoffType" TEXT DEFAULT 'SINGLE',
ADD COLUMN IF NOT EXISTS "viaDropoffAddress" TEXT,
ADD COLUMN IF NOT EXISTS "viaDropoffName" TEXT,
ADD COLUMN IF NOT EXISTS "originAddress" TEXT,
ADD COLUMN IF NOT EXISTS "destinationAddress" TEXT,
ADD COLUMN IF NOT EXISTS "transportCompany" TEXT,
ADD COLUMN IF NOT EXISTS "vehicleNo" TEXT,
ADD COLUMN IF NOT EXISTS "expectedCost" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "finalCost" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "deliveryCostConfirmed" DOUBLE PRECISION DEFAULT 0,
ADD COLUMN IF NOT EXISTS "assignedVehicles" JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN deliveries."pickupType" IS '상차지 유형 (YARD: 당사보관소, VENDOR: 타사주기장 직출고)';
COMMENT ON COLUMN deliveries."pickupVendorName" IS '타사 직출고 시 원사 상차지명';
COMMENT ON COLUMN deliveries."dropoffType" IS '하차지 유형 (SINGLE: 단일하차, MULTI_STOP: 다중경유)';
COMMENT ON COLUMN deliveries."viaDropoffName" IS '1차 경유 하차지명 (예: 기연 본사 주기장)';
COMMENT ON COLUMN deliveries."viaDropoffAddress" IS '1차 경유 하차지 주소';


-- ------------------------------------------------------------------------------
-- 4. repairs (정비 및 현장 AS 대장) - 모바일 내비 & 타임라인 확장
-- ------------------------------------------------------------------------------
ALTER TABLE repairs 
ADD COLUMN IF NOT EXISTS "preferredNavApp" TEXT DEFAULT 'TMAP',
ADD COLUMN IF NOT EXISTS "timelineLogs" JSONB DEFAULT '[]'::jsonb;

COMMENT ON COLUMN repairs."preferredNavApp" IS '기사별 선호 내비게이션 앱 (TMAP, KAKAO, NAVER, ASK)';
COMMENT ON COLUMN repairs."timelineLogs" IS '현장 출동 및 정비 실시간 이벤트 타임라인 로그 배열';


-- ------------------------------------------------------------------------------
-- 5. RLS (Row Level Security) 및 접근 권한 정책 멱등성 보장
-- ------------------------------------------------------------------------------
-- receivables RLS
ALTER TABLE receivables ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_anon_all_receivables" ON receivables;
DROP POLICY IF EXISTS "allow_auth_all_receivables" ON receivables;
CREATE POLICY "allow_anon_all_receivables" ON receivables FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_auth_all_receivables" ON receivables FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- deliveries RLS
ALTER TABLE deliveries ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_anon_all_deliveries" ON deliveries;
DROP POLICY IF EXISTS "allow_auth_all_deliveries" ON deliveries;
CREATE POLICY "allow_anon_all_deliveries" ON deliveries FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_auth_all_deliveries" ON deliveries FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- repairs RLS
ALTER TABLE repairs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_anon_all_repairs" ON repairs;
DROP POLICY IF EXISTS "allow_auth_all_repairs" ON repairs;
CREATE POLICY "allow_anon_all_repairs" ON repairs FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_auth_all_repairs" ON repairs FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- assets RLS
ALTER TABLE assets ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_anon_all_assets" ON assets;
DROP POLICY IF EXISTS "allow_auth_all_assets" ON assets;
CREATE POLICY "allow_anon_all_assets" ON assets FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_auth_all_assets" ON assets FOR ALL TO authenticated USING (true) WITH CHECK (true);
