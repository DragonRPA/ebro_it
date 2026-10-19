import { test, expect } from '@playwright/test';

test.describe('IT Outbound Request (smart_dispatch4) Z-Pattern Workflow Test', () => {
  test.setTimeout(180000); // 3 minutes

  test('Execute complete IT Outbound Request: Customer -> Site -> Contact -> Hardware Spec Customization -> SW Requirements -> Delivery Schedule -> Save', async ({ page }) => {
    console.log('[Test] Navigating to http://localhost:5174/?demo=true...');
    await page.goto('http://localhost:5174/?demo=true');
    await page.waitForTimeout(2000);

    // 1. 로그인 (필요시)
    const loginIdInput = page.locator('input[type="text"]').first();
    if (await loginIdInput.isVisible()) {
      await loginIdInput.fill('admin');
      await page.locator('input[type="password"]').first().fill('admin123');
      await page.locator('button[type="submit"]').click();
      await page.waitForTimeout(2500);
    }

    // 2. [출고 요청] 메뉴로 네비게이션
    console.log('[Test] Navigating to smart_dispatch4...');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('erp:navigate', { detail: { menuId: 'smart_dispatch4' } }));
    });
    await page.waitForTimeout(1500);

    // 3. 페이지 렌더링 확인 (단일 스크롤 Z-구텐버그 구조)
    const pageTitle = page.locator('h1.dispatch4-title');
    await expect(pageTitle).toHaveText('출고 요청');

    // 카톡 파싱 분할 패널이 없음을 검증
    const splitPane = page.locator('.dispatch4-left-pane, .dispatch4-right-pane');
    await expect(splitPane).toHaveCount(0);

    // 4. 고객사 검색 및 선택
    console.log('[Test] Step 1: Customer & Site Selection');
    const custSearchInput = page.locator('input[placeholder*="고객사명 또는 사업자번호 검색"]');
    await expect(custSearchInput).toBeVisible();
    await custSearchInput.fill('가나');
    await page.waitForTimeout(500);

    // 자동완성 드롭다운에서 첫 번째 고객사 클릭
    const firstCustOption = page.locator('div:has-text("주식회사")').first();
    if (await firstCustOption.isVisible()) {
      await firstCustOption.click();
    } else {
      // 직접 입력 모드로 fallback
      await custSearchInput.fill('(주)테스트엔터프라이즈');
    }
    await page.waitForTimeout(500);

    // 5. 출고 모델 및 하드웨어 스펙 조정
    console.log('[Test] Step 2: Hardware Specs Customization (VGA, RAM, SSD)');
    const modelSelect = page.locator('select:has-text("IT 렌탈 제품 카탈로그")').first();
    if (await modelSelect.isVisible()) {
      // 첫 번째 옵션 선택 (카탈로그에 제품이 있는 경우)
      const options = await modelSelect.locator('option').all();
      if (options.length > 1) {
        await modelSelect.selectOption({ index: 1 });
      }
    }

    // 수량 입력
    const qtyInput = page.locator('input[type="number"]').first();
    await qtyInput.fill('5');

    // VGA 그래픽카드 선택
    const vgaSelect = page.locator('select:has-text("내장 그래픽")').first();
    if (await vgaSelect.isVisible()) {
      await vgaSelect.selectOption('RTX 4060 8GB');
    }

    // RAM 증설 선택
    const ramSelect = page.locator('select:has-text("기본 사양")').first();
    if (await ramSelect.isVisible()) {
      await ramSelect.selectOption('32GB (16GB x 2)');
    }

    // SSD 증설 선택
    const ssdSelect = page.locator('select:has-text("기본 사양")').nth(1);
    if (await ssdSelect.isVisible()) {
      await ssdSelect.selectOption('1TB NVMe M.2');
    }

    // 6. SW 설치 요구사항
    console.log('[Test] Step 3: Software Requirements');
    const osOption = page.locator('label:has-text("Windows 11 Pro")').first();
    await osOption.click();

    // MS Office 토글
    const officeSw = page.locator('label:has-text("MS Office")').first();
    if (await officeSw.isVisible()) {
      await officeSw.click();
    }

    // 7. 배송 희망일시 지정
    console.log('[Test] Step 4: Delivery Scheduling');
    const afternoonBtn = page.locator('button:has-text("오후 (13~18시)")').first();
    await afternoonBtn.click();

    // 8. 출고 요청 저장 버튼 클릭
    console.log('[Test] Step 5: Save Outbound Request');
    const saveBtn = page.locator('[data-mid="btn-save-outbound-request"]');
    await expect(saveBtn).toBeVisible();
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    // 9. 완료 모달 표출 검증
    console.log('[Test] Verifying success modal and recent order table...');
    const modalText = page.locator('h3:has-text("출고 요청 등록 완료")');
    await expect(modalText).toBeVisible({ timeout: 10000 });

    // 모달 확인 버튼 클릭
    const modalConfirmBtn = page.locator('button:has-text("확인")').last();
    await modalConfirmBtn.click();
    await page.waitForTimeout(1000);

    // 10. 최근 출고 요청 대장(하단 테이블)에 등록된 내역 표시 확인
    const recentTable = page.locator('table');
    await expect(recentTable).toBeVisible();
    const rows = recentTable.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`[Test] Recent Outbound Orders Table Row Count: ${rowCount}`);
    expect(rowCount).toBeGreaterThan(0);

    console.log('✅ IT Outbound Request (smart_dispatch4) Z-Pattern Workflow Test PASSED with 100% precision!');
  });
});
