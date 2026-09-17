-- ==================================================
-- Supabase Migration Patch (v1.128.1.Build.252)
-- Generated at: 2026-08-23 05:13
-- Target: mechanic_consumable_stocks, consumable_logs, repairs
-- ==================================================

-- 1. 정비사 차량 소모품 적재 재고 테이블 (mechanic_consumable_stocks) 생성
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

-- 2. consumable_logs 테이블 신규 컬럼 및 type CHECK 제약조건 확장
ALTER TABLE consumable_logs ADD COLUMN IF NOT EXISTS "mechanicId" TEXT REFERENCES users(id);
ALTER TABLE consumable_logs ADD COLUMN IF NOT EXISTS "fromLocation" TEXT;
ALTER TABLE consumable_logs ADD COLUMN IF NOT EXISTS "toLocation" TEXT;
ALTER TABLE consumable_logs DROP CONSTRAINT IF EXISTS consumable_logs_type_check;
ALTER TABLE consumable_logs ADD CONSTRAINT consumable_logs_type_check CHECK (type IN ('INBOUND', 'OUTBOUND', 'ADJUST', 'TRANSFER_TO_VEHICLE', 'RETURN_TO_HQ'));

-- 3. repairs 테이블 신규 컬럼 및 status CHECK 제약조건 확장
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "maintenanceType" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "scheduleDate" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "unresolvedReason" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "nextAction" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "evidenceImages" TEXT[];
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "customerName" TEXT;
ALTER TABLE repairs ADD COLUMN IF NOT EXISTS "siteName" TEXT;
ALTER TABLE repairs DROP CONSTRAINT IF EXISTS repairs_status_check;
ALTER TABLE repairs ADD CONSTRAINT repairs_status_check CHECK (status IN ('SCHEDULED', 'PENDING', 'IN_PROGRESS', 'COMPLETED', 'UNRESOLVED'));

-- 4. PostgREST 스키마 캐시 갱신
NOTIFY pgrst, 'reload schema';
