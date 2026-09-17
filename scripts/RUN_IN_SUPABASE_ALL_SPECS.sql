-- =====================================================================
-- [기연리프트 전사 시스템] 장비 제원표 13대 규격 컬럼 신설 및 53종 모델 무결점 업서트
-- 대상: Supabase (PostgreSQL) products 테이블
-- =====================================================================

-- 1단계: products 테이블에 13대 제원표 상세 규격 컬럼 신설
ALTER TABLE products ADD COLUMN IF NOT EXISTS "powerSource" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "workingHeight" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "platformHeight" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "weight" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "capacityPreExt" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "machineDimensions" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "platformDimensions" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "gradeability" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "speed" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "asContact" TEXT DEFAULT '031-334-5296';
ALTER TABLE products ADD COLUMN IF NOT EXISTS "capacityPostExtMain" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "capacityPostExtDeck" TEXT;
ALTER TABLE products ADD COLUMN IF NOT EXISTS "maxWindSpeed" TEXT DEFAULT '12.5 m/s 이내';

-- 2단계: PL/pgSQL 블록으로 기존 레코드 보존하며 53종 제원 데이터 정밀 업서트 (PK 충돌 완전 방지)
DO $$
DECLARE
    v_count INT;
    v_next_id TEXT;
BEGIN

    -- Model [JCPT0607DCS]
    UPDATE products SET
        feet = 20,
        spec = '배터리, 5.6 M, 적재 240 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '5.6 M',
        "platformHeight" = '3.6 M',
        weight = '880 Kg',
        "capacityPreExt" = '240 kg',
        "machineDimensions" = '1.44x 0.76 x 1.90 M',
        "platformDimensions" = '1.29x 0.70 M',
        gradeability = '15 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '140 kg',
        "capacityPostExtDeck" = '100 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'JCPT0607DCS' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'JCPT0607DCS';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'JCPT0607DCS', 20, '배터리, 5.6 M, 적재 240 kg', 'DINGLI', '배터리', '5.6 M', '3.6 M',
            '880 Kg', '240 kg', '1.44x 0.76 x 1.90 M', '1.29x 0.70 M', '15 %', '4 Km/h',
            '031-334-5296', '140 kg', '100 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [JCPT0807AC]
    UPDATE products SET
        feet = 20,
        spec = '배터리, 7.8 M, 적재 230 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '7.8 M',
        "platformHeight" = '6 M',
        weight = '1,630 Kg',
        "capacityPreExt" = '230 kg',
        "machineDimensions" = '1.86 x 0.76 x 2.02 M',
        "platformDimensions" = '1.67 x 0.74 M',
        gradeability = '25 %',
        speed = '4.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '117 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'JCPT0807AC' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'JCPT0807AC';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'JCPT0807AC', 20, '배터리, 7.8 M, 적재 230 kg', 'DINGLI', '배터리', '7.8 M', '6 M',
            '1,630 Kg', '230 kg', '1.86 x 0.76 x 2.02 M', '1.67 x 0.74 M', '25 %', '4.5 Km/h',
            '031-334-5296', '117 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [JCPT1008AC]
    UPDATE products SET
        feet = 32,
        spec = '배터리, 10 M, 적재 230 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '10 M',
        "platformHeight" = '8 M',
        weight = '2,230 Kg',
        "capacityPreExt" = '230 kg',
        "machineDimensions" = '2.48 x 0.83 x 2.36 M',
        "platformDimensions" = '2.27 x 0.81 M',
        gradeability = '% 25 %',
        speed = '5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '117 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'JCPT1008AC' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'JCPT1008AC';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'JCPT1008AC', 32, '배터리, 10 M, 적재 230 kg', 'DINGLI', '배터리', '10 M', '8 M',
            '2,230 Kg', '230 kg', '2.48 x 0.83 x 2.36 M', '2.27 x 0.81 M', '% 25 %', '5 Km/h',
            '031-334-5296', '117 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [JCPT1012AC]
    UPDATE products SET
        feet = 32,
        spec = '배터리, 10.0 M, 적재 450 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '10.0 M',
        "platformHeight" = '8.0 M',
        weight = '2,710 Kg',
        "capacityPreExt" = '450 kg',
        "machineDimensions" = '2.48 x 1.15 x 2.36 M',
        "platformDimensions" = '1.15 x 2.27 M',
        gradeability = '% 25 %',
        speed = '5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '337 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'JCPT1012AC' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'JCPT1012AC';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'JCPT1012AC', 32, '배터리, 10.0 M, 적재 450 kg', 'DINGLI', '배터리', '10.0 M', '8.0 M',
            '2,710 Kg', '450 kg', '2.48 x 1.15 x 2.36 M', '1.15 x 2.27 M', '% 25 %', '5 Km/h',
            '031-334-5296', '337 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S1008AC+]
    UPDATE products SET
        feet = 32,
        spec = '배터리, 10 M, 적재 272 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '10 M',
        "platformHeight" = '8 M',
        weight = '2,230 Kg',
        "capacityPreExt" = '272 kg',
        "machineDimensions" = '2.48 x 0.83 x 2.36 M',
        "platformDimensions" = '2.27 x 0.81 M',
        gradeability = '% 25 %',
        speed = '6 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '159 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S1008AC+' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S1008AC+';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S1008AC+', 32, '배터리, 10 M, 적재 272 kg', 'DINGLI', '배터리', '10 M', '8 M',
            '2,230 Kg', '272 kg', '2.48 x 0.83 x 2.36 M', '2.27 x 0.81 M', '% 25 %', '6 Km/h',
            '031-334-5296', '159 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S1012AC+]
    UPDATE products SET
        feet = 32,
        spec = '배터리, 10 M, 적재 450 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '10 M',
        "platformHeight" = '8 M',
        weight = '2,750 Kg',
        "capacityPreExt" = '450 kg',
        "machineDimensions" = '2.48 x 1.15 x 2.36 M',
        "platformDimensions" = '2.27 x 1.12 M',
        gradeability = '% 25 %',
        speed = '3 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '337 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S1012AC+' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S1012AC+';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S1012AC+', 32, '배터리, 10 M, 적재 450 kg', 'DINGLI', '배터리', '10 M', '8 M',
            '2,750 Kg', '450 kg', '2.48 x 1.15 x 2.36 M', '2.27 x 1.12 M', '% 25 %', '3 Km/h',
            '031-334-5296', '337 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [JCPT1212AC]
    UPDATE products SET
        feet = 39,
        spec = '배터리, 12.0 M, 적재 320 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '12.0 M',
        "platformHeight" = '10.0 M',
        weight = '3,060 Kg',
        "capacityPreExt" = '320 kg',
        "machineDimensions" = '2.48 x 1.15 x 2.49 M',
        "platformDimensions" = '2.27 x 1.12 M',
        gradeability = '% 25 %',
        speed = '3.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '207 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'JCPT1212AC' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'JCPT1212AC';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'JCPT1212AC', 39, '배터리, 12.0 M, 적재 320 kg', 'DINGLI', '배터리', '12.0 M', '10.0 M',
            '3,060 Kg', '320 kg', '2.48 x 1.15 x 2.49 M', '2.27 x 1.12 M', '% 25 %', '3.5 Km/h',
            '031-334-5296', '207 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S1212AC+]
    UPDATE products SET
        feet = 39,
        spec = '배터리, 12 M, 적재 408 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '12 M',
        "platformHeight" = '10 M',
        weight = '3,060 Kg',
        "capacityPreExt" = '408 kg',
        "machineDimensions" = '2.48 x 1.15 x 2.49 M',
        "platformDimensions" = '2.27 x 1.12 M',
        gradeability = '% 25 %',
        speed = '3 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '295 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S1212AC+' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S1212AC+';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S1212AC+', 39, '배터리, 12 M, 적재 408 kg', 'DINGLI', '배터리', '12 M', '10 M',
            '3,060 Kg', '408 kg', '2.48 x 1.15 x 2.49 M', '2.27 x 1.12 M', '% 25 %', '3 Km/h',
            '031-334-5296', '295 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [JCPT1412AC]
    UPDATE products SET
        feet = 45,
        spec = '배터리, 13.8 M, 적재 320 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '13.8 M',
        "platformHeight" = '11.8 M',
        weight = '2,990 Kg',
        "capacityPreExt" = '320 kg',
        "machineDimensions" = '2.84 x 1.19 x 2.62 M',
        "platformDimensions" = '2.48 x 2.62 M',
        gradeability = '% 25 %',
        speed = '3.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '207 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'JCPT1412AC' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'JCPT1412AC';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'JCPT1412AC', 45, '배터리, 13.8 M, 적재 320 kg', 'DINGLI', '배터리', '13.8 M', '11.8 M',
            '2,990 Kg', '320 kg', '2.84 x 1.19 x 2.62 M', '2.48 x 2.62 M', '% 25 %', '3.5 Km/h',
            '031-334-5296', '207 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S1412AC+]
    UPDATE products SET
        feet = 45,
        spec = '배터리, 13.8 M, 적재 408 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '13.8 M',
        "platformHeight" = '11.8 M',
        weight = '3,250 Kg',
        "capacityPreExt" = '408 kg',
        "machineDimensions" = 'M',
        "platformDimensions" = '2.27 x 1.12 M',
        gradeability = '25 %',
        speed = '6.0 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '295 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S1412AC+' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S1412AC+';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S1412AC+', 45, '배터리, 13.8 M, 적재 408 kg', 'DINGLI', '배터리', '13.8 M', '11.8 M',
            '3,250 Kg', '408 kg', 'M', '2.27 x 1.12 M', '25 %', '6.0 Km/h',
            '031-334-5296', '295 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [JCPT1614ACZ]
    UPDATE products SET
        feet = 53,
        spec = '배터리, 15.7 M, 적재 350 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '15.7 M',
        "platformHeight" = '13.7 M',
        weight = '3,470 Kg',
        "capacityPreExt" = '350 kg',
        "machineDimensions" = '2.84 x 1.39 x 2.62 M',
        "platformDimensions" = '2.64 x 1.12 M',
        gradeability = '% 25 %',
        speed = '3 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '237 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '16.0 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'JCPT1614ACZ' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'JCPT1614ACZ';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'JCPT1614ACZ', 53, '배터리, 15.7 M, 적재 350 kg', 'DINGLI', '배터리', '15.7 M', '13.7 M',
            '3,470 Kg', '350 kg', '2.84 x 1.39 x 2.62 M', '2.64 x 1.12 M', '% 25 %', '3 Km/h',
            '031-334-5296', '237 kg', '113 kg', '16.0 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S1612AC+]
    UPDATE products SET
        feet = 53,
        spec = '배터리, 15.7 M, 적재 363 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '15.7 M',
        "platformHeight" = '13.7 M',
        weight = '3,520 Kg',
        "capacityPreExt" = '363 kg',
        "machineDimensions" = '2.84 x 1.25 x 2.62 M',
        "platformDimensions" = '2.64 x 1.12 M',
        gradeability = '% 25 %',
        speed = '6 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '227 kg',
        "capacityPostExtDeck" = '136 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S1612AC+' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S1612AC+';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S1612AC+', 53, '배터리, 15.7 M, 적재 363 kg', 'DINGLI', '배터리', '15.7 M', '13.7 M',
            '3,520 Kg', '363 kg', '2.84 x 1.25 x 2.62 M', '2.64 x 1.12 M', '% 25 %', '6 Km/h',
            '031-334-5296', '227 kg', '136 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S1614AC+]
    UPDATE products SET
        feet = 53,
        spec = '배터리, 15.7 M, 적재 363 kg',
        manufacturer = 'DINGLI',
        "powerSource" = '배터리',
        "workingHeight" = '15.7 M',
        "platformHeight" = '13.7 M',
        weight = '3,500 Kg',
        "capacityPreExt" = '363 kg',
        "machineDimensions" = '2.84 x 1.39 x 2.62 M',
        "platformDimensions" = '2.64 x 1.12 M',
        gradeability = '% 25 %',
        speed = '5.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '250 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S1614AC+' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S1614AC+';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S1614AC+', 53, '배터리, 15.7 M, 적재 363 kg', 'DINGLI', '배터리', '15.7 M', '13.7 M',
            '3,500 Kg', '363 kg', '2.84 x 1.39 x 2.62 M', '2.64 x 1.12 M', '% 25 %', '5.5 Km/h',
            '031-334-5296', '250 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-1330m]
    UPDATE products SET
        feet = 13,
        spec = '배터리, 5.7 M, 적재 227 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '5.7 M',
        "platformHeight" = '3.9 M',
        weight = '902 Kg',
        "capacityPreExt" = '227 kg',
        "machineDimensions" = '1.41 x 0.78 x 1.83 M',
        "platformDimensions" = '1.26 x 0.67 M',
        gradeability = '25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '136 kg',
        "capacityPostExtDeck" = '91 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-1330m' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS1330m';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-1330m', 13, '배터리, 5.7 M, 적재 227 kg', 'GENIE', '배터리', '5.7 M', '3.9 M',
            '902 Kg', '227 kg', '1.41 x 0.78 x 1.83 M', '1.26 x 0.67 M', '25 %', '4 Km/h',
            '031-334-5296', '136 kg', '91 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-1432]
    UPDATE products SET
        feet = 14,
        spec = '배터리, 6.3 M, 적재 227 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '6.3 M',
        "platformHeight" = '4.3 M',
        weight = '900 Kg',
        "capacityPreExt" = '227 kg',
        "machineDimensions" = '1.40 x 0.81 x 1.88 M',
        "platformDimensions" = '1.40 x 0.78 M',
        gradeability = '25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '114 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-1432' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS1432';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-1432', 14, '배터리, 6.3 M, 적재 227 kg', 'GENIE', '배터리', '6.3 M', '4.3 M',
            '900 Kg', '227 kg', '1.40 x 0.81 x 1.88 M', '1.40 x 0.78 M', '25 %', '4 Km/h',
            '031-334-5296', '114 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-1930]
    UPDATE products SET
        feet = 19,
        spec = '배터리, 7.8 M, 적재 227 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '7.8 M',
        "platformHeight" = '5.8 M',
        weight = '1226 Kg',
        "capacityPreExt" = '227 kg',
        "machineDimensions" = '1.83 x 0.77 x 2.16 M',
        "platformDimensions" = '1.64 x 0.76 M',
        gradeability = '25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '114 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-1930' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS1930';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-1930', 19, '배터리, 7.8 M, 적재 227 kg', 'GENIE', '배터리', '7.8 M', '5.8 M',
            '1226 Kg', '227 kg', '1.83 x 0.77 x 2.16 M', '1.64 x 0.76 M', '25 %', '4 Km/h',
            '031-334-5296', '114 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-1930 E]
    UPDATE products SET
        feet = 19,
        spec = '배터리, 7.8 M, 적재 227 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '7.8 M',
        "platformHeight" = '5.8 M',
        weight = '1,498 Kg',
        "capacityPreExt" = '227 kg',
        "machineDimensions" = '1.83 x 0.76 x 2.10 M',
        "platformDimensions" = '1.63 x 0.76 M',
        gradeability = '% 25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '114 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-1930 E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS1930E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-1930 E', 19, '배터리, 7.8 M, 적재 227 kg', 'GENIE', '배터리', '7.8 M', '5.8 M',
            '1,498 Kg', '227 kg', '1.83 x 0.76 x 2.10 M', '1.63 x 0.76 M', '% 25 %', '4 Km/h',
            '031-334-5296', '114 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-2632]
    UPDATE products SET
        feet = 26,
        spec = '배터리, 9.9 M, 적재 227 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '9.9 M',
        "platformHeight" = '7.9 M',
        weight = '2,003 Kg',
        "capacityPreExt" = '227 kg',
        "machineDimensions" = '2.44 x 0.81 x 2.26 M',
        "platformDimensions" = '2.26 x 0.84 M',
        gradeability = '25 %',
        speed = '3.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '114 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-2632' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS2632';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-2632', 26, '배터리, 9.9 M, 적재 227 kg', 'GENIE', '배터리', '9.9 M', '7.9 M',
            '2,003 Kg', '227 kg', '2.44 x 0.81 x 2.26 M', '2.26 x 0.84 M', '25 %', '3.5 Km/h',
            '031-334-5296', '114 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-2632 E]
    UPDATE products SET
        feet = 26,
        spec = '배터리, 10 M, 적재 227 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '10 M',
        "platformHeight" = '8 M',
        weight = '2,145 Kg',
        "capacityPreExt" = '227 kg',
        "machineDimensions" = '2.44 x 0.82 x 2.31 M',
        "platformDimensions" = '2.26 x 0.84 M',
        gradeability = '% 25 %',
        speed = '3.2 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '114 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-2632 E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS2632E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-2632 E', 26, '배터리, 10 M, 적재 227 kg', 'GENIE', '배터리', '10 M', '8 M',
            '2,145 Kg', '227 kg', '2.44 x 0.82 x 2.31 M', '2.26 x 0.84 M', '% 25 %', '3.2 Km/h',
            '031-334-5296', '114 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-2646]
    UPDATE products SET
        feet = 26,
        spec = '배터리, 9.92 M, 적재 454 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '9.92 M',
        "platformHeight" = '7.92 M',
        weight = '1,956 Kg',
        "capacityPreExt" = '454 kg',
        "machineDimensions" = '2.44 x 1.18 x 2.31 M',
        "platformDimensions" = '2.26 x 1.18 M',
        gradeability = '25 %',
        speed = '3.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '341 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-2646' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS2646';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-2646', 26, '배터리, 9.92 M, 적재 454 kg', 'GENIE', '배터리', '9.92 M', '7.92 M',
            '1,956 Kg', '454 kg', '2.44 x 1.18 x 2.31 M', '2.26 x 1.18 M', '25 %', '3.5 Km/h',
            '031-334-5296', '341 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-2646 E]
    UPDATE products SET
        feet = 26,
        spec = '배터리, 10 M, 적재 454 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '10 M',
        "platformHeight" = '8 M',
        weight = '1,997 Kg',
        "capacityPreExt" = '454 kg',
        "machineDimensions" = '2.44 x 1.17 x 2.26 M',
        "platformDimensions" = '2.26 x 1.15 M',
        gradeability = '% 25 %',
        speed = '3.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '341 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-2646 E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS2646E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-2646 E', 26, '배터리, 10 M, 적재 454 kg', 'GENIE', '배터리', '10 M', '8 M',
            '1,997 Kg', '454 kg', '2.44 x 1.17 x 2.26 M', '2.26 x 1.15 M', '% 25 %', '3.5 Km/h',
            '031-334-5296', '341 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-3246]
    UPDATE products SET
        feet = 32,
        spec = '배터리, 11.8 M, 적재 205 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '11.8 M',
        "platformHeight" = '9.8 M',
        weight = '2367 Kg',
        "capacityPreExt" = '205 kg',
        "machineDimensions" = '2.44 x 1.18 x 2.44 M',
        "platformDimensions" = '2.26 x 1.18 M',
        gradeability = '25 %',
        speed = '3.2 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '113 kg',
        "capacityPostExtDeck" = '',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-3246' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS3246';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-3246', 32, '배터리, 11.8 M, 적재 205 kg', 'GENIE', '배터리', '11.8 M', '9.8 M',
            '2367 Kg', '205 kg', '2.44 x 1.18 x 2.44 M', '2.26 x 1.18 M', '25 %', '3.2 Km/h',
            '031-334-5296', '113 kg', '', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-3246 E]
    UPDATE products SET
        feet = 32,
        spec = '배터리, 11.7 M, 적재 318 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '11.7 M',
        "platformHeight" = '9.7 M',
        weight = '2,374 Kg',
        "capacityPreExt" = '318 kg',
        "machineDimensions" = '2.44 x 1.17 x 2.39 M',
        "platformDimensions" = '2.26 x 1.16 M',
        gradeability = '% 25 %',
        speed = '3.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '205 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-3246 E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS3246E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-3246 E', 32, '배터리, 11.7 M, 적재 318 kg', 'GENIE', '배터리', '11.7 M', '9.7 M',
            '2,374 Kg', '318 kg', '2.44 x 1.17 x 2.39 M', '2.26 x 1.16 M', '% 25 %', '3.5 Km/h',
            '031-334-5296', '205 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-4046]
    UPDATE products SET
        feet = 40,
        spec = '배터리, 13.7 M, 적재 350 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '13.7 M',
        "platformHeight" = '11.9 M',
        weight = '3,184 Kg',
        "capacityPreExt" = '350 kg',
        "machineDimensions" = '2.48 x 1.17 x 2.57 M',
        "platformDimensions" = '2.26 x 1.16 M',
        gradeability = '25 %',
        speed = '3.2 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '237 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-4046' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS4046';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-4046', 40, '배터리, 13.7 M, 적재 350 kg', 'GENIE', '배터리', '13.7 M', '11.9 M',
            '3,184 Kg', '350 kg', '2.48 x 1.17 x 2.57 M', '2.26 x 1.16 M', '25 %', '3.2 Km/h',
            '031-334-5296', '237 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-4047]
    UPDATE products SET
        feet = 40,
        spec = '배터리, 13.7 M, 적재 350 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '13.7 M',
        "platformHeight" = '11.7 M',
        weight = '3,260 Kg',
        "capacityPreExt" = '350 kg',
        "machineDimensions" = '2.48 x 1.19 x 2.54 M',
        "platformDimensions" = '2.26 x 1.16 M',
        gradeability = '% 25 %',
        speed = '3.2 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '237 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-4047' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS4047';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-4047', 40, '배터리, 13.7 M, 적재 350 kg', 'GENIE', '배터리', '13.7 M', '11.7 M',
            '3,260 Kg', '350 kg', '2.48 x 1.19 x 2.54 M', '2.26 x 1.16 M', '% 25 %', '3.2 Km/h',
            '031-334-5296', '237 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-4069DC]
    UPDATE products SET
        feet = 40,
        spec = '배터리, 14.3 M, 적재 363 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '14.3 M',
        "platformHeight" = '12.3 M',
        weight = '4,933 Kg',
        "capacityPreExt" = '363 kg',
        "machineDimensions" = '3.12 x 1.6 x 2.74 M',
        "platformDimensions" = '2.79 x 1.6 M',
        gradeability = '19 %',
        speed = '7.2 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '250 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-4069DC' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS4069DC';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-4069DC', 40, '배터리, 14.3 M, 적재 363 kg', 'GENIE', '배터리', '14.3 M', '12.3 M',
            '4,933 Kg', '363 kg', '3.12 x 1.6 x 2.74 M', '2.79 x 1.6 M', '19 %', '7.2 Km/h',
            '031-334-5296', '250 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [Z-45/25J]
    UPDATE products SET
        feet = 45,
        spec = '배터리, 15.9 M, 적재 227 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '15.9 M',
        "platformHeight" = '13.9 M',
        weight = '7,400 Kg',
        "capacityPreExt" = '227 kg',
        "machineDimensions" = '6.83 x 1.79 x 2.0 M',
        "platformDimensions" = '1.83 x 0.76 M',
        gradeability = '30 %',
        speed = '4.8 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '227 kg',
        "capacityPostExtDeck" = '-',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'Z-45/25J' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'Z45/25J';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'Z-45/25J', 45, '배터리, 15.9 M, 적재 227 kg', 'GENIE', '배터리', '15.9 M', '13.9 M',
            '7,400 Kg', '227 kg', '6.83 x 1.79 x 2.0 M', '1.83 x 0.76 M', '30 %', '4.8 Km/h',
            '031-334-5296', '227 kg', '-', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-4655]
    UPDATE products SET
        feet = 46,
        spec = '배터리, 15.95 M, 적재 349 kg',
        manufacturer = 'GENIE',
        "powerSource" = '배터리',
        "workingHeight" = '15.95 M',
        "platformHeight" = '13.95 M',
        weight = '3,701 Kg',
        "capacityPreExt" = '349 kg',
        "machineDimensions" = '3.11 x 1.41 x 2.77 M',
        "platformDimensions" = '2.84 x 1.35 M',
        gradeability = '% 25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '213 kg',
        "capacityPostExtDeck" = '136 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-4655' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS4655';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-4655', 46, '배터리, 15.95 M, 적재 349 kg', 'GENIE', '배터리', '15.95 M', '13.95 M',
            '3,701 Kg', '349 kg', '3.11 x 1.41 x 2.77 M', '2.84 x 1.35 M', '% 25 %', '4 Km/h',
            '031-334-5296', '213 kg', '136 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GS-5390RT]
    UPDATE products SET
        feet = 53,
        spec = '디젤, 18 M, 적재 680 kg',
        manufacturer = 'GENIE',
        "powerSource" = '디젤',
        "workingHeight" = '18 M',
        "platformHeight" = '16.15 M',
        weight = '7,537 Kg',
        "capacityPreExt" = '680 kg',
        "machineDimensions" = '4.88 x 2.29 x 3.15 M',
        "platformDimensions" = '3.98 x 1.83 M',
        gradeability = '12 %',
        speed = '8 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '460 kg',
        "capacityPostExtDeck" = '110 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GS-5390RT' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GS5390RT';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GS-5390RT', 53, '디젤, 18 M, 적재 680 kg', 'GENIE', '디젤', '18 M', '16.15 M',
            '7,537 Kg', '680 kg', '4.88 x 2.29 x 3.15 M', '3.98 x 1.83 M', '12 %', '8 Km/h',
            '031-334-5296', '460 kg', '110 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [STAR-6]
    UPDATE products SET
        feet = 15,
        spec = '배터리, 5.8 M, 적재 230 kg',
        manufacturer = 'HAULOTTE',
        "powerSource" = '배터리',
        "workingHeight" = '5.8 M',
        "platformHeight" = '3.8 M',
        weight = '880 Kg',
        "capacityPreExt" = '230 kg',
        "machineDimensions" = '1.4 x 0.79 x 1.75 M',
        "platformDimensions" = '1.38 x 0.77 M',
        gradeability = '% 25 %',
        speed = '4.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '110 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'STAR-6' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'STAR6';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'STAR-6', 15, '배터리, 5.8 M, 적재 230 kg', 'HAULOTTE', '배터리', '5.8 M', '3.8 M',
            '880 Kg', '230 kg', '1.4 x 0.79 x 1.75 M', '1.38 x 0.77 M', '% 25 %', '4.5 Km/h',
            '031-334-5296', '110 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [OPTIMUM 8]
    UPDATE products SET
        feet = 20,
        spec = '배터리, 7.77 M, 적재 230 kg',
        manufacturer = 'HAULOTTE',
        "powerSource" = '배터리',
        "workingHeight" = '7.77 M',
        "platformHeight" = '5.77 M',
        weight = '1,590 Kg',
        "capacityPreExt" = '230 kg',
        "machineDimensions" = '1.9 x 0.79 x 1.88 M',
        "platformDimensions" = '2.59 x 0.74 M',
        gradeability = '25 %',
        speed = '4.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '120 kg',
        "capacityPostExtDeck" = '110 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'OPTIMUM 8' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'OPTIMUM8';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'OPTIMUM 8', 20, '배터리, 7.77 M, 적재 230 kg', 'HAULOTTE', '배터리', '7.77 M', '5.77 M',
            '1,590 Kg', '230 kg', '1.9 x 0.79 x 1.88 M', '2.59 x 0.74 M', '25 %', '4.5 Km/h',
            '031-334-5296', '120 kg', '110 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [1230ES]
    UPDATE products SET
        feet = 12,
        spec = '배터리, 5.7 M, 적재 230 kg',
        manufacturer = 'JLG',
        "powerSource" = '배터리',
        "workingHeight" = '5.7 M',
        "platformHeight" = '3.7 M',
        weight = '790 Kg',
        "capacityPreExt" = '230 kg',
        "machineDimensions" = '1.37 x 0.76 x 1.65 M',
        "platformDimensions" = '1.25 x 0.68 M',
        gradeability = '25 %',
        speed = '3.2 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '230 kg',
        "capacityPostExtDeck" = '-',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = '1230ES' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = '1230ES';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, '1230ES', 12, '배터리, 5.7 M, 적재 230 kg', 'JLG', '배터리', '5.7 M', '3.7 M',
            '790 Kg', '230 kg', '1.37 x 0.76 x 1.65 M', '1.25 x 0.68 M', '25 %', '3.2 Km/h',
            '031-334-5296', '230 kg', '-', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [ES1330L]
    UPDATE products SET
        feet = 13,
        spec = '배터리, 5.8 M, 적재 227 kg',
        manufacturer = 'JLG',
        "powerSource" = '배터리',
        "workingHeight" = '5.8 M',
        "platformHeight" = '3.8 M',
        weight = '900 Kg',
        "capacityPreExt" = '227 kg',
        "machineDimensions" = '1.8 x 0.6 x 1.4 M',
        "platformDimensions" = '1.3 x 0.6 M',
        gradeability = '25 %',
        speed = '3.8 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '112 kg',
        "capacityPostExtDeck" = '115 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'ES1330L' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'ES1330L';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'ES1330L', 13, '배터리, 5.8 M, 적재 227 kg', 'JLG', '배터리', '5.8 M', '3.8 M',
            '900 Kg', '227 kg', '1.8 x 0.6 x 1.4 M', '1.3 x 0.6 M', '25 %', '3.8 Km/h',
            '031-334-5296', '112 kg', '115 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [1532R]
    UPDATE products SET
        feet = 15,
        spec = '배터리, 6.6 M, 적재 270 kg',
        manufacturer = 'JLG',
        "powerSource" = '배터리',
        "workingHeight" = '6.6 M',
        "platformHeight" = '4.6 M',
        weight = '1,079 Kg',
        "capacityPreExt" = '270 kg',
        "machineDimensions" = '1.74 x 0.81 x 1.90 M',
        "platformDimensions" = '1.74x 0.81 M',
        gradeability = '14 %',
        speed = '3 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '150 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = '1532R' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = '1532R';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, '1532R', 15, '배터리, 6.6 M, 적재 270 kg', 'JLG', '배터리', '6.6 M', '4.6 M',
            '1,079 Kg', '270 kg', '1.74 x 0.81 x 1.90 M', '1.74x 0.81 M', '14 %', '3 Km/h',
            '031-334-5296', '150 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [R1532i]
    UPDATE products SET
        feet = 15,
        spec = '배터리, 6.6 M, 적재 275 kg',
        manufacturer = 'JLG',
        "powerSource" = '배터리',
        "workingHeight" = '6.6 M',
        "platformHeight" = '4.6 M',
        weight = '1,085 Kg',
        "capacityPreExt" = '275 kg',
        "machineDimensions" = '1.74 x 0.81 x 1.90 M',
        "platformDimensions" = '1.74x 0.81 M',
        gradeability = '14 %',
        speed = '3 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '155 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'R1532i' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'R1532i';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'R1532i', 15, '배터리, 6.6 M, 적재 275 kg', 'JLG', '배터리', '6.6 M', '4.6 M',
            '1,085 Kg', '275 kg', '1.74 x 0.81 x 1.90 M', '1.74x 0.81 M', '14 %', '3 Km/h',
            '031-334-5296', '155 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [1930ES]
    UPDATE products SET
        feet = 19,
        spec = '배터리, 7.7 M, 적재 230 kg',
        manufacturer = 'JLG',
        "powerSource" = '배터리',
        "workingHeight" = '7.7 M',
        "platformHeight" = '5.7 M',
        weight = '1,230 Kg',
        "capacityPreExt" = '230 kg',
        "machineDimensions" = '1.87 x 0.76 x 1.99 M',
        "platformDimensions" = '1.87x 0.76 M',
        gradeability = '14 %',
        speed = '4.8 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '117 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = '1930ES' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = '1930ES';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, '1930ES', 19, '배터리, 7.7 M, 적재 230 kg', 'JLG', '배터리', '7.7 M', '5.7 M',
            '1,230 Kg', '230 kg', '1.87 x 0.76 x 1.99 M', '1.87x 0.76 M', '14 %', '4.8 Km/h',
            '031-334-5296', '117 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [ES2646]
    UPDATE products SET
        feet = 26,
        spec = '배터리, 9.92 M, 적재 545 kg',
        manufacturer = 'JLG',
        "powerSource" = '배터리',
        "workingHeight" = '9.92 M',
        "platformHeight" = '7.92 M',
        weight = '2,401 Kg',
        "capacityPreExt" = '545 kg',
        "machineDimensions" = '2.28 x 1.17 x 2.4 M',
        "platformDimensions" = '1.1 x 2.1 M',
        gradeability = '% 30 %',
        speed = '3.2 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '425 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'ES2646' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'ES2646';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'ES2646', 26, '배터리, 9.92 M, 적재 545 kg', 'JLG', '배터리', '9.92 M', '7.92 M',
            '2,401 Kg', '545 kg', '2.28 x 1.17 x 2.4 M', '1.1 x 2.1 M', '% 30 %', '3.2 Km/h',
            '031-334-5296', '425 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [4069LE]
    UPDATE products SET
        feet = 40,
        spec = '배터리, 14 M, 적재 360 kg',
        manufacturer = 'JLG',
        "powerSource" = '배터리',
        "workingHeight" = '14 M',
        "platformHeight" = '12 M',
        weight = '4,790 Kg',
        "capacityPreExt" = '360 kg',
        "machineDimensions" = '3.15 x 1.75 x 2.84 M',
        "platformDimensions" = '2.92x 1.65 M',
        gradeability = '19 %',
        speed = '4.8 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '247 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = '4069LE' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = '4069LE';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, '4069LE', 40, '배터리, 14 M, 적재 360 kg', 'JLG', '배터리', '14 M', '12 M',
            '4,790 Kg', '360 kg', '3.15 x 1.75 x 2.84 M', '2.92x 1.65 M', '19 %', '4.8 Km/h',
            '031-334-5296', '247 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [JLG-E600JP]
    UPDATE products SET
        feet = 60,
        spec = '배터리, 20.1 M, 적재 227 kg',
        manufacturer = 'JLG',
        "powerSource" = '배터리',
        "workingHeight" = '20.1 M',
        "platformHeight" = '18.3 M',
        weight = '7,663 Kg',
        "capacityPreExt" = '227 kg',
        "machineDimensions" = '10.16 x 2.41 x 2.54 M',
        "platformDimensions" = '1.83 x 0.76 M',
        gradeability = '30 %',
        speed = '3 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '227 kg',
        "capacityPostExtDeck" = '-',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'JLG-E600JP' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'JLGE600JP';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'JLG-E600JP', 60, '배터리, 20.1 M, 적재 227 kg', 'JLG', '배터리', '20.1 M', '18.3 M',
            '7,663 Kg', '227 kg', '10.16 x 2.41 x 2.54 M', '1.83 x 0.76 M', '30 %', '3 Km/h',
            '031-334-5296', '227 kg', '-', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S0808E]
    UPDATE products SET
        feet = 26,
        spec = '배터리, 10 M, 적재 230 kg',
        manufacturer = 'LGMG',
        "powerSource" = '배터리',
        "workingHeight" = '10 M',
        "platformHeight" = '8 M',
        weight = '2,200 Kg',
        "capacityPreExt" = '230 kg',
        "machineDimensions" = '2.45 x 0.83 x 2.32 M',
        "platformDimensions" = '2.26 x 0.81 M',
        gradeability = '% 25 %',
        speed = '변동 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '113 kg',
        "capacityPostExtDeck" = '117 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S0808E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S0808E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S0808E', 26, '배터리, 10 M, 적재 230 kg', 'LGMG', '배터리', '10 M', '8 M',
            '2,200 Kg', '230 kg', '2.45 x 0.83 x 2.32 M', '2.26 x 0.81 M', '% 25 %', '변동 Km/h',
            '031-334-5296', '113 kg', '117 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S0812E]
    UPDATE products SET
        feet = 26,
        spec = '배터리, 10 M, 적재 450 kg',
        manufacturer = 'LGMG',
        "powerSource" = '배터리',
        "workingHeight" = '10 M',
        "platformHeight" = '8 M',
        weight = '2,300 Kg',
        "capacityPreExt" = '450 kg',
        "machineDimensions" = '2.49 x 1.18 x 2.36 M',
        "platformDimensions" = '2.26 x 1.12 M',
        gradeability = '% 25 %',
        speed = '3 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '340 kg',
        "capacityPostExtDeck" = '110 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S0812E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S0812E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S0812E', 26, '배터리, 10 M, 적재 450 kg', 'LGMG', '배터리', '10 M', '8 M',
            '2,300 Kg', '450 kg', '2.49 x 1.18 x 2.36 M', '2.26 x 1.12 M', '% 25 %', '3 Km/h',
            '031-334-5296', '340 kg', '110 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S1012E]
    UPDATE products SET
        feet = 32,
        spec = '배터리, 12.0 M, 적재 320 kg',
        manufacturer = 'LGMG',
        "powerSource" = '배터리',
        "workingHeight" = '12.0 M',
        "platformHeight" = '10.0 M',
        weight = '2,600 Kg',
        "capacityPreExt" = '320 kg',
        "machineDimensions" = 'x 1.18 x 2.49 M',
        "platformDimensions" = '1.18 x 2.26 M',
        gradeability = '% 25 %',
        speed = '3.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '200 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S1012E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S1012E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S1012E', 32, '배터리, 12.0 M, 적재 320 kg', 'LGMG', '배터리', '12.0 M', '10.0 M',
            '2,600 Kg', '320 kg', 'x 1.18 x 2.49 M', '1.18 x 2.26 M', '% 25 %', '3.5 Km/h',
            '031-334-5296', '200 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S1212E]
    UPDATE products SET
        feet = 39,
        spec = '배터리, 14.0 M, 적재 320 kg',
        manufacturer = 'LGMG',
        "powerSource" = '배터리',
        "workingHeight" = '14.0 M',
        "platformHeight" = '12.0 M',
        weight = '3,000 Kg',
        "capacityPreExt" = '320 kg',
        "machineDimensions" = '2.49 x 1.18 x 2.63 M',
        "platformDimensions" = '1.18 x 2.26 M',
        gradeability = '25 %',
        speed = '3.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '200 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S1212E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S1212E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S1212E', 39, '배터리, 14.0 M, 적재 320 kg', 'LGMG', '배터리', '14.0 M', '12.0 M',
            '3,000 Kg', '320 kg', '2.49 x 1.18 x 2.63 M', '1.18 x 2.26 M', '25 %', '3.5 Km/h',
            '031-334-5296', '200 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [S1413E]
    UPDATE products SET
        feet = 45,
        spec = '배터리, 15.8 M, 적재 320 kg',
        manufacturer = 'LGMG',
        "powerSource" = '배터리',
        "workingHeight" = '15.8 M',
        "platformHeight" = '13.8 M',
        weight = '3,500 Kg',
        "capacityPreExt" = '320 kg',
        "machineDimensions" = '2.8 x 1.3 x 2.74 M',
        "platformDimensions" = '2.64 x 1.12 M',
        gradeability = '25 %',
        speed = '4.5 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '200 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'S1413E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'S1413E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'S1413E', 45, '배터리, 15.8 M, 적재 320 kg', 'LGMG', '배터리', '15.8 M', '13.8 M',
            '3,500 Kg', '320 kg', '2.8 x 1.3 x 2.74 M', '2.64 x 1.12 M', '25 %', '4.5 Km/h',
            '031-334-5296', '200 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [SR1623E]
    UPDATE products SET
        feet = 53,
        spec = '배터리, 17.9 M, 적재 680 kg',
        manufacturer = 'LGMG',
        "powerSource" = '배터리',
        "workingHeight" = '17.9 M',
        "platformHeight" = '15.9 M',
        weight = '8,200 Kg',
        "capacityPreExt" = '680 kg',
        "machineDimensions" = '4.9 x 2.3 x 3.23 M',
        "platformDimensions" = '3.98 x 1.83 M',
        gradeability = '% 40 %',
        speed = '변동 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '450 kg',
        "capacityPostExtDeck" = '230 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'SR1623E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'SR1623E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'SR1623E', 53, '배터리, 17.9 M, 적재 680 kg', 'LGMG', '배터리', '17.9 M', '15.9 M',
            '8,200 Kg', '680 kg', '4.9 x 2.3 x 3.23 M', '3.98 x 1.83 M', '% 40 %', '변동 Km/h',
            '031-334-5296', '450 kg', '230 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [MS10.4]
    UPDATE products SET
        feet = 34,
        spec = 'AC 110~220V, 11.9 M, 적재 159 kg',
        manufacturer = 'MANLIFT',
        "powerSource" = 'AC 110~220V',
        "workingHeight" = '11.9 M',
        "platformHeight" = '10.06 M',
        weight = '389 Kg',
        "capacityPreExt" = '159 kg',
        "machineDimensions" = '1.46 x 0.74 x 1.97 M',
        "platformDimensions" = '0.68 x 0.66 M',
        gradeability = '-',
        speed = '-',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '159 kg',
        "capacityPostExtDeck" = '-',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'MS10.4' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'MS10.4';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'MS10.4', 34, 'AC 110~220V, 11.9 M, 적재 159 kg', 'MANLIFT', 'AC 110~220V', '11.9 M', '10.06 M',
            '389 Kg', '159 kg', '1.46 x 0.74 x 1.97 M', '0.68 x 0.66 M', '-', '-',
            '031-334-5296', '159 kg', '-', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [MS11.8]
    UPDATE products SET
        feet = 38,
        spec = 'AC 110~220V, 13.8 M, 적재 136 kg',
        manufacturer = 'MANLIFT',
        "powerSource" = 'AC 110~220V',
        "workingHeight" = '13.8 M',
        "platformHeight" = '11.8 M',
        weight = '458 Kg',
        "capacityPreExt" = '136 kg',
        "machineDimensions" = '1.53 x 0.74 x 1.97 M',
        "platformDimensions" = '0.68 x 0.66 M',
        gradeability = '-',
        speed = '-',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '136 kg',
        "capacityPostExtDeck" = '-',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'MS11.8' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'MS11.8';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'MS11.8', 38, 'AC 110~220V, 13.8 M, 적재 136 kg', 'MANLIFT', 'AC 110~220V', '13.8 M', '11.8 M',
            '458 Kg', '136 kg', '1.53 x 0.74 x 1.97 M', '0.68 x 0.66 M', '-', '-',
            '031-334-5296', '136 kg', '-', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GTJZ0608ME]
    UPDATE products SET
        feet = 20,
        spec = '배터리, 7.8 M, 적재 230 kg',
        manufacturer = 'Sinoboom',
        "powerSource" = '배터리',
        "workingHeight" = '7.8 M',
        "platformHeight" = '5.8 M',
        weight = '1,575 Kg',
        "capacityPreExt" = '230 kg',
        "machineDimensions" = '1.80 x 0.81 x 2.04 M',
        "platformDimensions" = '1.64 x 0.76 M',
        gradeability = '25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '110 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GTJZ0608ME' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GTJZ0608ME';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GTJZ0608ME', 20, '배터리, 7.8 M, 적재 230 kg', 'Sinoboom', '배터리', '7.8 M', '5.8 M',
            '1,575 Kg', '230 kg', '1.80 x 0.81 x 2.04 M', '1.64 x 0.76 M', '25 %', '4 Km/h',
            '031-334-5296', '110 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GTJZ1012E]
    UPDATE products SET
        feet = 32,
        spec = '배터리, 12 M, 적재 320 kg',
        manufacturer = 'Sinoboom',
        "powerSource" = '배터리',
        "workingHeight" = '12 M',
        "platformHeight" = '10 M',
        weight = '2,815 Kg',
        "capacityPreExt" = '320 kg',
        "machineDimensions" = '2.45 x 1.17 x 2.48 M',
        "platformDimensions" = '2.30 x 1.15 M',
        gradeability = '25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '200 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GTJZ1012E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GTJZ1012E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GTJZ1012E', 32, '배터리, 12 M, 적재 320 kg', 'Sinoboom', '배터리', '12 M', '10 M',
            '2,815 Kg', '320 kg', '2.45 x 1.17 x 2.48 M', '2.30 x 1.15 M', '25 %', '4 Km/h',
            '031-334-5296', '200 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GTJZ0808E]
    UPDATE products SET
        feet = 26,
        spec = '배터리, 10.1 M, 적재 250 kg',
        manufacturer = '기연리프트',
        "powerSource" = '배터리',
        "workingHeight" = '10.1 M',
        "platformHeight" = '8.1 M',
        weight = '2,265 Kg',
        "capacityPreExt" = '250 kg',
        "machineDimensions" = '2.46 x 0.83 x 2.36 M',
        "platformDimensions" = '2.30x 0.80 M',
        gradeability = '% 25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '137 kg',
        "capacityPostExtDeck" = '113 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GTJZ0808E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GTJZ0808E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GTJZ0808E', 26, '배터리, 10.1 M, 적재 250 kg', '기연리프트', '배터리', '10.1 M', '8.1 M',
            '2,265 Kg', '250 kg', '2.46 x 0.83 x 2.36 M', '2.30x 0.80 M', '% 25 %', '4 Km/h',
            '031-334-5296', '137 kg', '113 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GTJZ0812E]
    UPDATE products SET
        feet = 26,
        spec = '배터리, 10.1 M, 적재 450 kg',
        manufacturer = '기연리프트',
        "powerSource" = '배터리',
        "workingHeight" = '10.1 M',
        "platformHeight" = '8.1 M',
        weight = '2,715 Kg',
        "capacityPreExt" = '450 kg',
        "machineDimensions" = '2.45 x 1.17 x 2.36 M',
        "platformDimensions" = '2.30x 1.15 M',
        gradeability = '% 25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '330 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GTJZ0812E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GTJZ0812E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GTJZ0812E', 26, '배터리, 10.1 M, 적재 450 kg', '기연리프트', '배터리', '10.1 M', '8.1 M',
            '2,715 Kg', '450 kg', '2.45 x 1.17 x 2.36 M', '2.30x 1.15 M', '% 25 %', '4 Km/h',
            '031-334-5296', '330 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [GTJZ1212E]
    UPDATE products SET
        feet = 39,
        spec = '배터리, 13.9 M, 적재 320 kg',
        manufacturer = '기연리프트',
        "powerSource" = '배터리',
        "workingHeight" = '13.9 M',
        "platformHeight" = '11.9 M',
        weight = '3,210 Kg',
        "capacityPreExt" = '320 kg',
        "machineDimensions" = '2.45 x 1.17 x 2.60 M',
        "platformDimensions" = '2.30 x 1.15 M',
        gradeability = '% 25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '200 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = 'GTJZ1212E' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = 'GTJZ1212E';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, 'GTJZ1212E', 39, '배터리, 13.9 M, 적재 320 kg', '기연리프트', '배터리', '13.9 M', '11.9 M',
            '3,210 Kg', '320 kg', '2.45 x 1.17 x 2.60 M', '2.30 x 1.15 M', '% 25 %', '4 Km/h',
            '031-334-5296', '200 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

    -- Model [1414E Plus]
    UPDATE products SET
        feet = 45,
        spec = '배터리, 15.8 M, 적재 350 kg',
        manufacturer = '기연리프트',
        "powerSource" = '배터리',
        "workingHeight" = '15.8 M',
        "platformHeight" = '13.8 M',
        weight = '3,660 Kg',
        "capacityPreExt" = '350 kg',
        "machineDimensions" = '2.78 x 1.41 x 2.6 M',
        "platformDimensions" = '2.64 x 1.3 M',
        gradeability = '% 25 %',
        speed = '4 Km/h',
        "asContact" = '031-334-5296',
        "capacityPostExtMain" = '230 kg',
        "capacityPostExtDeck" = '120 kg',
        "maxWindSpeed" = '12.5 m/s 이내',
        "updatedAt" = NOW()::text
    WHERE "modelName" = '1414E Plus' 
       OR REPLACE(REPLACE("modelName", '-', ''), ' ', '') = '1414EPlus';

    GET DIAGNOSTICS v_count = ROW_COUNT;
    IF v_count = 0 THEN
        v_next_id := 'PROD-AUTO-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8);
        INSERT INTO products (
            id, "modelName", feet, spec, manufacturer, "powerSource", "workingHeight", "platformHeight",
            weight, "capacityPreExt", "machineDimensions", "platformDimensions", gradeability, speed,
            "asContact", "capacityPostExtMain", "capacityPostExtDeck", "maxWindSpeed", "isActive", "createdAt", "updatedAt"
        ) VALUES (
            v_next_id, '1414E Plus', 45, '배터리, 15.8 M, 적재 350 kg', '기연리프트', '배터리', '15.8 M', '13.8 M',
            '3,660 Kg', '350 kg', '2.78 x 1.41 x 2.6 M', '2.64 x 1.3 M', '% 25 %', '4 Km/h',
            '031-334-5296', '230 kg', '120 kg', '12.5 m/s 이내', true, NOW()::text, NOW()::text
        );
    END IF;

END $$;

-- 3단계: PostgREST API 스키마 캐시 즉시 갱신
NOTIFY pgrst, 'reload schema';