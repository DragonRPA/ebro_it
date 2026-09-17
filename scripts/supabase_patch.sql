-- ==================================================
-- Supabase Consolidated Database Migration Patch
-- Generated at: 2026. 7. 21. 오후 2:14:39
-- ==================================================

-- [보완] products 테이블 누락 컬럼 추가 DDL
ALTER TABLE products ADD COLUMN IF NOT EXISTS "safetyCertUrl" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "specSheetUrl" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "emergencyGuideUrl" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT TRUE;

-- [생성] cash_flow_snapshots 테이블 추가
CREATE TABLE cash_flow_snapshots (
    id TEXT PRIMARY KEY,
    "snapshotDate" TEXT NOT NULL,
    "startingBalance" BIGINT NOT NULL,
    "projectedInflow" BIGINT NOT NULL,
    "projectedOpex" BIGINT NOT NULL,
    "projectedCapex" BIGINT NOT NULL,
    "projectedFinalBalance" BIGINT NOT NULL,
    notes TEXT,
    "createdAt" TEXT NOT NULL
);

-- [보완 2026-07-29] deliveries 테이블 CHECK 제약 조건 업데이트 ('교환' 추가)
ALTER TABLE deliveries DROP CONSTRAINT IF EXISTS deliveries_dispatchCategory_check;
ALTER TABLE deliveries ADD CONSTRAINT deliveries_dispatchCategory_check CHECK ("dispatchCategory" IN ('출고', '입고', '반납', '정비', '이동', '교환'));

-- [보완 2026-07-30] contract_history 테이블 컬럼 및 제약조건 보강
ALTER TABLE contract_history ADD COLUMN IF NOT EXISTS "prevEndDate" TEXT;
ALTER TABLE contract_history ADD COLUMN IF NOT EXISTS "newEndDate" TEXT;
ALTER TABLE contract_history DROP CONSTRAINT IF EXISTS contract_history_changeType_check;
ALTER TABLE contract_history ADD CONSTRAINT contract_history_changeType_check CHECK ("changeType" IN ('REGISTER', 'EXTEND', 'SHORTEN', 'SUCCEED', 'TERMINATE', 'EXCHANGE'));

-- [보완 2026-07-30] contracts 테이블 승계 전(predecessor) 이력 추적 컬럼 추가
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS "successorContractId" TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS "predecessorContractId" TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS "predecessorContractNo" TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS "predecessorCustomerId" TEXT;
ALTER TABLE contracts ADD COLUMN IF NOT EXISTS "predecessorCustomerName" TEXT;

-- [보완 2026-07-30] customers 테이블 청구서(세금계산서) 및 거래명세서 마감일 컬럼 추가
ALTER TABLE customers ADD COLUMN IF NOT EXISTS "defaultBillingDay" INTEGER DEFAULT 30;
ALTER TABLE customers ADD COLUMN IF NOT EXISTS "defaultStatementClosingDay" INTEGER DEFAULT 25;

-- [보완 2026-07-30] google_configs 테이블 거래명세서 양식 경로 컬럼 추가
ALTER TABLE google_configs ADD COLUMN IF NOT EXISTS "transactionStatementTemplateUrl" TEXT;

-- [보완 2026-08-18] google_configs 테이블 Cloudflare R2 설정 컬럼 5종 추가
ALTER TABLE google_configs ADD COLUMN IF NOT EXISTS "r2AccountId" TEXT;
ALTER TABLE google_configs ADD COLUMN IF NOT EXISTS "r2BucketName" TEXT;
ALTER TABLE google_configs ADD COLUMN IF NOT EXISTS "r2AccessKeyId" TEXT;
ALTER TABLE google_configs ADD COLUMN IF NOT EXISTS "r2SecretAccessKey" TEXT;
ALTER TABLE google_configs ADD COLUMN IF NOT EXISTS "r2PublicDomain" TEXT;

-- [보완 2026-07-30] billings 테이블 contractId 컬럼 및 status CHECK 제약 조건 업데이트 ('REQUESTED', 'REJECTED' 추가)
ALTER TABLE billings ADD COLUMN IF NOT EXISTS "contractId" TEXT;
ALTER TABLE billings DROP CONSTRAINT IF EXISTS billings_status_check;
ALTER TABLE billings ADD CONSTRAINT billings_status_check CHECK (status IN ('UNPAID', 'PARTIAL', 'PAID', 'REQUESTED', 'REJECTED'));

-- [보완 2026-07-30] contract_history 테이블 changeType CHECK 제약 조건 업데이트 ('FEE_CHANGE' 추가)
ALTER TABLE contract_history DROP CONSTRAINT IF EXISTS contract_history_changeType_check;
ALTER TABLE contract_history ADD CONSTRAINT contract_history_changeType_check CHECK ("changeType" IN ('REGISTER', 'EXTEND', 'SHORTEN', 'SUCCEED', 'TERMINATE', 'EXCHANGE', 'FEE_CHANGE'));

-- [보완 2026-08-10] asset_inout_logs 및 repairs 테이블 신규 입고 검수 컬럼 및 CHECK 제약조건 보강
ALTER TABLE asset_inout_logs ADD COLUMN IF NOT EXISTS "inboundNo" TEXT;
ALTER TABLE asset_inout_logs ADD COLUMN IF NOT EXISTS "maintenanceScore" INTEGER DEFAULT 0;
ALTER TABLE asset_inout_logs ADD COLUMN IF NOT EXISTS "defectsJson" TEXT;
ALTER TABLE asset_inout_logs DROP CONSTRAINT IF EXISTS asset_inout_logs_type_check;

ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "inboundNo" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "defectsJson" TEXT;

-- [보완 2026-08-23 v1.128] mechanic_consumable_stocks 신설 및 consumable_logs, repairs 컬럼/CHECK 확장
CREATE TABLE IF NOT EXISTS mechanic_consumable_stocks (
    id TEXT PRIMARY KEY,
    "mechanicId" TEXT REFERENCES users(id) ON DELETE CASCADE,
    "consumableId" TEXT REFERENCES consumables(id) ON DELETE CASCADE,
    "stockQty" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TEXT NOT NULL
);

ALTER TABLE mechanic_consumable_stocks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_anon_select" ON mechanic_consumable_stocks;
DROP POLICY IF EXISTS "allow_anon_insert" ON mechanic_consumable_stocks;
DROP POLICY IF EXISTS "allow_anon_update" ON mechanic_consumable_stocks;
DROP POLICY IF EXISTS "allow_anon_delete" ON mechanic_consumable_stocks;
DROP POLICY IF EXISTS "allow_authenticated_select" ON mechanic_consumable_stocks;
DROP POLICY IF EXISTS "allow_authenticated_insert" ON mechanic_consumable_stocks;
DROP POLICY IF EXISTS "allow_authenticated_update" ON mechanic_consumable_stocks;
DROP POLICY IF EXISTS "allow_authenticated_delete" ON mechanic_consumable_stocks;
CREATE POLICY "allow_anon_select" ON mechanic_consumable_stocks FOR SELECT TO anon USING (true);
CREATE POLICY "allow_anon_insert" ON mechanic_consumable_stocks FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "allow_anon_update" ON mechanic_consumable_stocks FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "allow_anon_delete" ON mechanic_consumable_stocks FOR DELETE TO anon USING (true);
CREATE POLICY "allow_authenticated_select" ON mechanic_consumable_stocks FOR SELECT TO authenticated USING (true);
CREATE POLICY "allow_authenticated_insert" ON mechanic_consumable_stocks FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "allow_authenticated_update" ON mechanic_consumable_stocks FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "allow_authenticated_delete" ON mechanic_consumable_stocks FOR DELETE TO authenticated USING (true);

ALTER TABLE consumable_logs ADD COLUMN IF NOT EXISTS "mechanicId" TEXT REFERENCES users(id);
ALTER TABLE consumable_logs ADD COLUMN IF NOT EXISTS "fromLocation" TEXT;
ALTER TABLE consumable_logs ADD COLUMN IF NOT EXISTS "toLocation" TEXT;
ALTER TABLE consumable_logs DROP CONSTRAINT IF EXISTS consumable_logs_type_check;
ALTER TABLE consumable_logs ADD CONSTRAINT consumable_logs_type_check CHECK (type IN ('INBOUND', 'OUTBOUND', 'ADJUST', 'TRANSFER_TO_VEHICLE', 'RETURN_TO_HQ'));

ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "maintenanceType" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "scheduleDate" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "unresolvedReason" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "nextAction" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "evidenceImages" TEXT[];
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "siteName" TEXT;
ALTER TABLE repairs DROP CONSTRAINT IF EXISTS repairs_status_check;
ALTER TABLE repairs ADD CONSTRAINT repairs_status_check CHECK (status IN ('SCHEDULED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'UNRESOLVED'));

-- [보완 2026-08-27 v1.129] products 테이블 장비 제원표 13대 상세 규격 컬럼 신설
ALTER TABLE products ADD COLUMN IF NOT EXISTS "powerSource" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "workingHeight" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "platformHeight" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "machineDimensions" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "platformDimensions" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "gradeability" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "asContact" TEXT DEFAULT '031-334-5296';
ALTER TABLE products ADD COLUMN IF NOT EXISTS "capacityPreExt" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "capacityPostExtMain" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "capacityPostExtDeck" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "maxWindSpeed" TEXT DEFAULT '12.5 m/s 이내';

NOTIFY pgrst, 'reload schema';




