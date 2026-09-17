-- ==================================================
-- Supabase Migration Patch (v1.129.0.Build.254)
-- Generated at: 2026-08-27 15:55
-- Target: products (장비 제원표 13대 상세 규격 컬럼 신설)
-- ==================================================

-- 1. products 테이블에 장비 제원표 상세 규격 컬럼 추가
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

-- 2. PostgREST 스키마 캐시 리로드
NOTIFY pgrst, 'reload schema';
