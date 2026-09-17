-- ==============================================================================
-- [기연리프트 ERP] 자산 매각 계약 및 매각 청구서 전사 스키마 DDL 패치
-- 버전: v1.4.0.Build.176 (2026-09-05)
-- 설계 원칙: 전사 시스템 개발 표준 헌장 5.3 (완전한 멱등성 및 제약조건 안전 보장)
-- ==============================================================================

-- 1. contracts 테이블: contractType 컬럼 추가 및 기존 데이터 안전 마이그레이션
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS "contractType" TEXT DEFAULT 'RENTAL';
UPDATE contracts SET "contractType" = 'RENTAL' WHERE "contractType" IS NULL;
ALTER TABLE contracts DROP CONSTRAINT IF EXISTS contracts_contractType_check;
ALTER TABLE contracts ADD CONSTRAINT contracts_contractType_check CHECK ("contractType" IN ('RENTAL', 'SALE'));
ALTER TABLE contracts ALTER COLUMN "contractType" SET NOT NULL;

-- 2. billings 테이블: billingType 컬럼 추가 및 기존 데이터 안전 마이그레이션
ALTER TABLE billings ADD COLUMN IF NOT EXISTS "billingType" TEXT DEFAULT 'RENTAL';
UPDATE billings SET "billingType" = 'RENTAL' WHERE "billingType" IS NULL;
ALTER TABLE billings DROP CONSTRAINT IF EXISTS billings_billingType_check;
ALTER TABLE billings ADD CONSTRAINT billings_billingType_check CHECK ("billingType" IN ('RENTAL', 'REPAIR', 'TRANSPORT', 'ASSET_SALE'));
ALTER TABLE billings ALTER COLUMN "billingType" SET NOT NULL;

-- 3. contract_assets 테이블: salePrice 컬럼 추가
ALTER TABLE contract_assets ADD COLUMN IF NOT EXISTS "salePrice" DOUBLE PRECISION DEFAULT 0;

-- 4. contract_history 테이블: changeType 제약조건 확장 ('ASSET_SOLD' 추가)
ALTER TABLE contract_history DROP CONSTRAINT IF EXISTS contract_history_changeType_check;
ALTER TABLE contract_history ADD CONSTRAINT contract_history_changeType_check 
CHECK ("changeType" IN (
    'REGISTER', 'EXTEND', 'SHORTEN', 'SUCCEED', 'TERMINATE', 
    'EXCHANGE', 'FEE_CHANGE', 'AS_SERVICE', 'BILLING_CREATED', 
    'BILLING_SENT', 'BILLING_CANCELLED', 'BILLING_REGENERATED', 
    'PAYMENT_RECEIVED', 'PAYMENT_CANCELLED', 'DOCUMENT_SENT', 'ASSET_SOLD'
));

-- 5. 인덱스 최적화 (조회 성능 극대화)
CREATE INDEX IF NOT EXISTS idx_contracts_type ON contracts("contractType");
CREATE INDEX IF NOT EXISTS idx_billings_type ON billings("billingType");
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);

-- 6. RLS 무제한 정책 동기화 (헌장 5.3 준수)
ALTER TABLE contracts DISABLE ROW LEVEL SECURITY;
ALTER TABLE billings DISABLE ROW LEVEL SECURITY;
ALTER TABLE contract_assets DISABLE ROW LEVEL SECURITY;
ALTER TABLE contract_history DISABLE ROW LEVEL SECURITY;
