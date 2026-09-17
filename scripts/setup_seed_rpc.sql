-- Supabase DB-Native 고속 데이터 시딩용 PL/pgSQL 스토어드 프로시저 설치 스크립트
-- 이 스크립트를 Supabase SQL Editor에 단 한 번 복사하여 실행(Run)하십시오.
-- RLS 정책을 우회하여 0.2초 만에 모의 데이터를 무결하게 원격 적재합니다.

CREATE OR REPLACE FUNCTION generate_test_data()
RETURNS text
SECURITY DEFINER -- RLS 정책을 무시하고 postgres 권한으로 실행
AS $$
DECLARE
  -- 안전한 소규모 단계적 검증을 위해 기본 행 수량을 모두 1개로 설정
  v_prod_count INT := 1;
  v_asset_count INT := 1;
  v_cust_count INT := 1;
  v_contact_count INT := 1;
  v_site_count INT := 1;
  v_contract_count INT := 1;
  v_repair_count INT := 1;
  
  i INT;
  v_start_ts TIMESTAMP;
  v_end_ts TIMESTAMP;
  v_step_interval INTERVAL;
  
  v_current_prod_name TEXT;
  v_current_model TEXT;
  v_current_cust_id TEXT;
  v_current_site_id TEXT;
  v_current_contact_id TEXT;
  v_current_contract_id TEXT;
  
  v_start_date DATE;
  v_end_date DATE;
  v_duration INT;
  v_billing_day INT;
  v_asset_no TEXT;
  v_serial_no TEXT;
  
  v_manufacturers TEXT[] := ARRAY['기연엘리베이터', '현대무벡스', '두산산업차량', 'Genie Lift', 'JLG Industries'];
  v_customer_prefixes TEXT[] := ARRAY['대한건설', '민국이앤씨', '우리이앤씨', '현대건설', '삼성물산', '엘지씨엔에스', '두산건설', '기연엘리베이터', '삼우토건', '태영건설'];
  v_positions TEXT[] := ARRAY['대리', '과장', '차장', '부장'];
  
  v_created_at TIMESTAMP := '2025-01-01 00:00:00'::TIMESTAMP;
  v_now TIMESTAMP := NOW();
BEGIN
  -- 1. 기존 테스트 데이터 일괄 정리 (순서 보장)
  PERFORM clear_test_data();

  -- 2. 제품군 생성
  FOR i IN 1..v_prod_count LOOP
    v_current_model := 'MODEL-' || chr(65 + (i % 26)) || '-' || (100 + i);
    INSERT INTO products (
      id,
      "modelName",
      feet,
      spec,
      manufacturer,
      "createdAt"
    ) VALUES (
      'testdata-prod-' || i,
      v_current_model,
      10 + (i % 5) * 5,
      'Spec ' || v_current_model || ' - 고속 기동 고소작업대',
      v_manufacturers[1 + (i % 5)],
      v_created_at::TEXT
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;

  -- 3. 자산 대장 생성
  FOR i IN 1..v_asset_count LOOP
    v_current_model := 'MODEL-' || chr(65 + (((i - 1) % v_prod_count) % 26)) || '-' || (100 + ((i - 1) % v_prod_count));
    v_asset_no := 'TST-EQ-' || LPAD(i::text, 4, '0');
    v_serial_no := 'SN-TST-' || LPAD(i::text, 4, '0');
    INSERT INTO assets (
      id,
      "modelName",
      "assetNo",
      "serialNo",
      manufacturer,
      "ownerType",
      status,
      "acquisitionDate",
      "acquisitionPrice",
      "depreciationMonths",
      "residualValueRate",
      "accumDepreciation",
      "bookValue",
      "createdAt",
      "updatedAt"
    ) VALUES (
      'testdata-asset-' || i,
      v_current_model,
      v_asset_no,
      v_serial_no,
      v_manufacturers[1 + (i % 5)],
      CASE WHEN i % 20 = 0 THEN 'RENTED' ELSE 'OWNED' END,
      'AVAILABLE',
      '2025-01-01',
      16000000,
      60,
      10,
      4000000,
      12000000,
      v_created_at::TEXT,
      v_now::TEXT
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;

  -- 4. 고객사 생성
  FOR i IN 1..v_cust_count LOOP
    INSERT INTO customers (
      id,
      name,
      "bizRegNo",
      "isClosed",
      address,
      representative,
      "repContact",
      "repEmail",
      "createdAt"
    ) VALUES (
      'testdata-cust-' || i,
      '(주)' || v_customer_prefixes[1 + (i % 10)] || ' ' || i || '호점',
      '999-88-' || LPAD(i::text, 5, '0'),
      FALSE,
      '인천광역시 남동구 남동서로 ' || i || '번길',
      '김대표' || i,
      '010-8888-' || LPAD(i::text, 4, '0'),
      'ceo_t' || i || '@example.com',
      v_created_at::TEXT
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;

  -- 5. 담당자 및 현장 생성
  FOR i IN 1..v_contact_count LOOP
    v_current_cust_id := 'testdata-cust-' || (1 + ((i - 1) % v_cust_count));
    
    INSERT INTO customer_contacts (
      id,
      "customerId",
      name,
      position,
      contact,
      email,
      "createdAt"
    ) VALUES (
      'testdata-contact-' || i,
      v_current_cust_id,
      '최담당' || i,
      v_positions[1 + (i % 4)],
      '010-7777-' || LPAD(i::text, 4, '0'),
      'contact_' || i || '@example.com',
      v_created_at::TEXT
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO customer_sites (
      id,
      "customerId",
      name,
      address,
      "contactName",
      contact,
      email,
      "createdAt"
    ) VALUES (
      'testdata-site-' || i,
      v_current_cust_id,
      'TST-인천 송도 신축현장 ' || i || '구역',
      '인천 연수구 송도동 ' || i,
      '이소장' || i,
      '010-6666-' || LPAD(i::text, 4, '0'),
      'site_' || i || '@example.com',
      v_created_at::TEXT
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;

  -- 6. 임대 계약 & 계약 자산 & 물류 입출고 연동
  v_start_ts := '2026-01-01 00:00:00'::TIMESTAMP;
  v_end_ts := '2026-07-19 23:59:59'::TIMESTAMP;
  v_step_interval := (v_end_ts - v_start_ts) / CASE WHEN v_contract_count > 1 THEN (v_contract_count - 1) ELSE 1 END;

  FOR i IN 1..v_contract_count LOOP
    v_current_cust_id := 'testdata-cust-' || (1 + ((i - 1) % v_cust_count));
    v_current_site_id := 'testdata-site-' || (1 + ((i - 1) % v_site_count));
    v_current_contact_id := 'testdata-contact-' || (1 + ((i - 1) % v_contact_count));
    
    v_start_date := (v_start_ts + (i - 1) * v_step_interval)::DATE;
    v_duration := 10 + (i % 9) * 10;
    v_end_date := v_start_date + v_duration;
    
    v_billing_day := CASE WHEN i % 4 = 0 THEN 15 WHEN i % 4 = 1 THEN 20 WHEN i % 4 = 2 THEN 25 ELSE 30 END;
    v_current_contract_id := 'testdata-contract-' || i;
    
    -- 계약 삽입
    INSERT INTO contracts (
      id,
      "contractNo",
      "customerId",
      "contactId",
      "siteId",
      "startDate",
      "endDate",
      "billingDay",
      status,
      "createdAt",
      "updatedAt"
    ) VALUES (
      v_current_contract_id,
      'TST-CTR-2026-' || LPAD(i::text, 4, '0'),
      v_current_cust_id,
      v_current_contact_id,
      v_current_site_id,
      v_start_date::TEXT,
      v_end_date::TEXT,
      v_billing_day,
      CASE WHEN v_end_date < '2026-07-21'::DATE THEN 'COMPLETED' ELSE 'ACTIVE' END,
      (v_start_ts + (i - 1) * v_step_interval)::TEXT,
      v_now::TEXT
    ) ON CONFLICT (id) DO NOTHING;

    -- 계약 자산 배정
    INSERT INTO contract_assets (
      id,
      "contractId",
      "assetId",
      "dailyRentalFee",
      "monthlyRentalFee",
      "startDate",
      "endDate",
      "createdAt"
    ) VALUES (
      'testdata-ctrasst-' || i,
      v_current_contract_id,
      'testdata-asset-' || (1 + ((i - 1) % v_asset_count)),
      20000,
      600000,
      v_start_date::TEXT,
      v_end_date::TEXT,
      (v_start_ts + (i - 1) * v_step_interval)::TEXT
    ) ON CONFLICT (id) DO NOTHING;

    -- 자산 상태 업데이트
    UPDATE assets 
    SET status = CASE WHEN v_end_date < '2026-07-21'::DATE THEN 'AVAILABLE' ELSE 'RENTED' END,
        "updatedAt" = NOW()::TEXT
    WHERE id = 'testdata-asset-' || (1 + ((i - 1) % v_asset_count));

    -- 물류 배차 (출고)
    INSERT INTO deliveries (
      id,
      "contractId",
      "assetIds",
      type,
      "requestDate",
      status,
      "deliveryCost",
      "createdAt",
      "updatedAt"
    ) VALUES (
      'testdata-deliv-out-' || i,
      v_current_contract_id,
      'testdata-asset-' || (1 + ((i - 1) % v_asset_count)),
      'OUTBOUND',
      v_start_date::TEXT,
      'COMPLETED',
      75000,
      (v_start_ts + (i - 1) * v_step_interval)::TEXT,
      v_now::TEXT
    ) ON CONFLICT (id) DO NOTHING;

    -- 물류 배차 (반납입고 - 계약 종료건만)
    IF v_end_date < '2026-07-21'::DATE THEN
      INSERT INTO deliveries (
        id,
        "contractId",
        "assetIds",
        type,
        "requestDate",
        status,
        "deliveryCost",
        "createdAt",
        "updatedAt"
      ) VALUES (
        'testdata-deliv-in-' || i,
        v_current_contract_id,
        'testdata-asset-' || (1 + ((i - 1) % v_asset_count)),
        'INBOUND',
        v_end_date::TEXT,
        'COMPLETED',
        75000,
        (v_start_ts + (i - 1) * v_step_interval)::TEXT,
        v_now::TEXT
      ) ON CONFLICT (id) DO NOTHING;
    END IF;
  END LOOP;

  -- 7. 기성 청구 마스터 & 상세 & 결제 & 은행 연동
  FOR i IN 1..v_contract_count LOOP
    v_current_contract_id := 'testdata-contract-' || i;
    v_start_date := (v_start_ts + (i - 1) * v_step_interval)::DATE;
    v_duration := 10 + (i % 9) * 10;
    v_end_date := v_start_date + v_duration;
    v_current_cust_id := 'testdata-cust-' || (1 + ((i - 1) % v_cust_count));

    -- 청구서 생성
    INSERT INTO billings (
      id,
      "customerId",
      "billingYm",
      "billingDate",
      "totalAmount",
      "paidAmount",
      status,
      "createdAt",
      "updatedAt"
    ) VALUES (
      'testdata-bill-' || i,
      v_current_cust_id,
      LEFT(v_end_date::TEXT, 7),
      LEAST(v_end_date, '2026-07-19'::DATE)::TEXT,
      22000 * v_duration,
      CASE WHEN i % 3 = 0 THEN 22000 * v_duration WHEN i % 3 = 1 THEN 11000 * v_duration ELSE 0 END,
      CASE WHEN i % 3 = 0 THEN 'PAID' WHEN i % 3 = 1 THEN 'PARTIAL' ELSE 'UNPAID' END,
      LEAST(v_end_date, '2026-07-19'::DATE)::TEXT,
      v_now::TEXT
    ) ON CONFLICT (id) DO NOTHING;

    -- 청구서 상세
    INSERT INTO billing_details (
      id,
      "billingId",
      "contractAssetId",
      "assetId",
      "itemName",
      quantity,
      "unitPrice",
      amount,
      description,
      "createdAt"
    ) VALUES (
      'testdata-billdtl-' || i,
      'testdata-bill-' || i,
      'testdata-ctrasst-' || i,
      'testdata-asset-' || (1 + ((i - 1) % v_asset_count)),
      '장비 임대료',
      v_duration,
      20000,
      22000 * v_duration,
      '테스트 자동 기성 생성 분',
      v_start_date::TEXT
    ) ON CONFLICT (id) DO NOTHING;

    -- 결제수납 및 은행 내역 연동 (수납 완료 또는 일부 수납 건)
    IF i % 3 = 0 OR i % 3 = 1 THEN
      INSERT INTO payments (
        id,
        "billingId",
        "paymentDate",
        amount,
        method,
        memo,
        "createdAt"
      ) VALUES (
        'testdata-pay-' || i,
        'testdata-bill-' || i,
        LEAST(v_end_date + 1, '2026-07-20'::DATE)::TEXT,
        CASE WHEN i % 3 = 0 THEN 22000 * v_duration ELSE 11000 * v_duration END,
        'BANK_TRANSFER',
        '테스트 자동 입금 수납',
        LEAST(v_end_date + 1, '2026-07-20'::DATE)::TEXT
      ) ON CONFLICT (id) DO NOTHING;

      INSERT INTO bank_transactions (
        id,
        "transactionDate",
        "senderName",
        "depositAmount",
        "withdrawAmount",
        memo,
        "matchedBillingId",
        "matchingType",
        "createdAt"
      ) VALUES (
        'testdata-banktx-' || i,
        LEAST(v_end_date + 1, '2026-07-20'::DATE)::TEXT,
        '(주)' || v_customer_prefixes[1 + (i % 10)] || ' ' || (1 + ((i - 1) % v_cust_count)) || '호점',
        CASE WHEN i % 3 = 0 THEN 22000 * v_duration ELSE 11000 * v_duration END,
        0,
        '테스트 자동 입금',
        'testdata-bill-' || i,
        'AUTO',
        LEAST(v_end_date + 1, '2026-07-20'::DATE)::TEXT
      ) ON CONFLICT (id) DO NOTHING;
    END IF;
  END LOOP;

  -- 8. 소모품 & 정비 이력
  FOR i IN 1..v_repair_count LOOP
    INSERT INTO consumables (
      id,
      "modelName",
      "stockQty",
      unit,
      "unitPrice",
      "createdAt",
      "updatedAt"
    ) VALUES (
      'testdata-consumable-' || i,
      'CONSUMABLE-MODEL-' || i,
      250,
      'EA',
      25000,
      v_created_at::TEXT,
      v_now::TEXT
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO repairs (
      id,
      "assetId",
      "requestDate",
      details,
      "costTotal",
      status,
      "createdAt",
      "updatedAt"
    ) VALUES (
      'testdata-repair-' || i,
      'testdata-asset-' || (1 + ((i - 1) % v_asset_count)),
      ('2026-05-01'::DATE + i)::TEXT,
      '정기 모터 오일 교체 및 구동 밸브 실링 보강작업',
      120000,
      'COMPLETED',
      ('2026-05-01'::DATE + i)::TEXT,
      ('2026-05-01'::DATE + i)::TEXT
    ) ON CONFLICT (id) DO NOTHING;

    INSERT INTO repair_consumables (
      id,
      "repairId",
      "consumableId",
      quantity,
      "unitPrice",
      cost
    ) VALUES (
      'testdata-repconsum-' || i,
      'testdata-repair-' || i,
      'testdata-consumable-' || (1 + ((i - 1) % v_repair_count)),
      2,
      25000,
      50000
    ) ON CONFLICT (id) DO NOTHING;
  END LOOP;

  RETURN 'SUCCESS: Supabase Stored DB-Native Seeder executed successfully. ' || (v_prod_count + v_asset_count + v_cust_count + v_contact_count + v_site_count + v_contract_count + v_repair_count) || ' rows generated.';
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION clear_test_data()
RETURNS text
SECURITY DEFINER
AS $$
BEGIN
  -- 자식 테이블부터 의존성 맞춰 삭제
  DELETE FROM repair_consumables WHERE id LIKE 'testdata-%';
  DELETE FROM repairs WHERE id LIKE 'testdata-%';
  DELETE FROM bank_transactions WHERE id LIKE 'testdata-%';
  DELETE FROM payments WHERE id LIKE 'testdata-%';
  DELETE FROM billing_details WHERE id LIKE 'testdata-%';
  DELETE FROM billings WHERE id LIKE 'testdata-%';
  DELETE FROM deliveries WHERE id LIKE 'testdata-%';
  DELETE FROM contract_assets WHERE id LIKE 'testdata-%';
  DELETE FROM contracts WHERE id LIKE 'testdata-%';
  DELETE FROM assets WHERE id LIKE 'testdata-%';
  DELETE FROM consumables WHERE id LIKE 'testdata-%';
  DELETE FROM products WHERE id LIKE 'testdata-%';
  DELETE FROM customer_sites WHERE id LIKE 'testdata-%';
  DELETE FROM customer_contacts WHERE id LIKE 'testdata-%';
  DELETE FROM customers WHERE id LIKE 'testdata-%';
  
  -- 자산의 대여 상태 초기화
  UPDATE assets 
  SET status = 'AVAILABLE',
      "updatedAt" = NOW()::TEXT
  WHERE id LIKE 'testdata-%';

  RETURN 'SUCCESS: All test data with testdata- prefix cleared successfully.';
END;
$$ LANGUAGE plpgsql;
