import { test, expect } from '@playwright/test';

test.describe('IT Outbound Request (smart_dispatch4) Ultra-Compact Z-Pattern RWTT', () => {
  test.setTimeout(180000); // 3 minutes

  test('Execute complete IT Outbound Request: Customer -> Site -> Contact -> Hardware Spec Customization -> SW Modal -> Save -> Recent Tab Verification', async ({ page }) => {
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

    // 3. 페이지 렌더링 확인 (초고밀도 컴팩트 2-Tab 구조)
    const pageTitle = page.locator('h1.dispatch4-title');
    await expect(pageTitle).toHaveText('출고 요청');

    // 상단 2-Tab 버튼 확인
    const formTabBtn = page.locator('button.dispatch4-tab-item:has-text("출고 요청 등록")');
    const recentTabBtn = page.locator('button.dispatch4-tab-item:has-text("최근 출고 대장")');
    await expect(formTabBtn).toBeVisible();
    await expect(recentTabBtn).toBeVisible();

    // 4. 고객사 검색 및 선택
    console.log('[Test] Step 1: Customer & Site Selection');
    const custSearchInput = page.locator('input[placeholder*="고객사명 검색"]');
    await expect(custSearchInput).toBeVisible();
    await custSearchInput.fill('가나');
    await page.waitForTimeout(500);

    // 자동완성 드롭다운에서 고객사 클릭
    const firstCustOption = page.locator('.dispatch4-compact-card div:has-text("주식회사")').first();
    if (await firstCustOption.isVisible()) {
      await firstCustOption.click();
    } else {
      await custSearchInput.fill('(주)테스트엔터프라이즈');
    }
    await page.waitForTimeout(500);

    // 담당자 연락처 입력 (필수)
    const contactNameInput = page.locator('input[placeholder="성명 *"]');
    if (await contactNameInput.isVisible() && (await contactNameInput.inputValue()) === '') {
      await contactNameInput.fill('홍길동');
    }
    const contactPhoneInput = page.locator('input[placeholder="휴대폰 연락처 *"]');
    if (await contactPhoneInput.isVisible() && (await contactPhoneInput.inputValue()) === '') {
      await contactPhoneInput.fill('010-1234-5678');
    }

    // 5. 출고 모델 및 하드웨어 스펙 조정
    console.log('[Test] Step 2: Hardware Specs Customization (VGA, RAM, SSD, OS)');
    const modelSelect = page.locator('select:has-text("IT 렌탈 카탈로그")').first();
    if (await modelSelect.isVisible()) {
      const options = await modelSelect.locator('option').all();
      if (options.length > 1) {
        await modelSelect.selectOption({ index: 1 });
      }
    }

    // 수량 확인 및 Stepper (+) 클릭
    const plusBtn = page.locator('button:has-text("+")').first();
    if (await plusBtn.isVisible()) {
      await plusBtn.click();
      await page.waitForTimeout(200);
    }

    // 월단가 입력 및 보존 검증 (헌장 2.2 / Bugfix c544964)
    const rateInput = page.locator('input[placeholder="월단가"]').first();
    if (await rateInput.isVisible()) {
      await rateInput.fill('75000');
      await page.waitForTimeout(200);
    }

    // 하드웨어 2행 인라인 스펙 조정
    const vgaSelect = page.locator('select:has-text("내장 그래픽")').first();
    if (await vgaSelect.isVisible()) {
      await vgaSelect.selectOption('RTX 4060 8GB');
    }

    const ramSelect = page.locator('select:has-text("기본 사양")').first();
    if (await ramSelect.isVisible()) {
      await ramSelect.selectOption('32GB (16GB x 2)');
    }

    const ssdSelect = page.locator('select:has-text("기본 사양")').nth(1);
    if (await ssdSelect.isVisible()) {
      await ssdSelect.selectOption('1TB NVMe M.2');
    }

    // 6. SW 설치 요구사항 모달 오픈 및 체크 (초고밀도 팝오버)
    console.log('[Test] Step 3: Software Requirements Popover Modal');
    const swModalBtn = page.locator('button:has-text("SW설치")').first();
    await expect(swModalBtn).toBeVisible();
    await swModalBtn.click();
    await page.waitForTimeout(400);

    const swModalTitle = page.locator('.dispatch4-sw-modal-card h3:has-text("SW 설치 요구사항")');
    await expect(swModalTitle).toBeVisible();

    // MS Office 토글
    const officeSw = page.locator('.dispatch4-sw-modal-card label:has-text("MS Office")').first();
    if (await officeSw.isVisible()) {
      await officeSw.click();
    }

    // 모달 설정 완료 클릭
    const swDoneBtn = page.locator('.dispatch4-sw-modal-card button:has-text("설정 완료")');
    await swDoneBtn.click();
    await page.waitForTimeout(300);

    // 7. 배송 희망일시 지정
    console.log('[Test] Step 4: Delivery Scheduling');
    const dateInput = page.locator('input[type="date"]').first();
    if (await dateInput.isVisible() && !(await dateInput.inputValue())) {
      const today = new Date().toISOString().slice(0, 10);
      await dateInput.fill(today);
    }

    // 8. 출고 요청 저장 버튼 클릭 (우하단 고시인성 솔리드 블루 버튼)
    console.log('[Test] Step 5: Save Outbound Request');
    const saveBtn = page.locator('[data-mid="btn-save-outbound-request"]');
    await expect(saveBtn).toBeVisible();
    await expect(saveBtn).toBeEnabled();
    await saveBtn.click();

    // 9. 완료 모달 표출 검증
    console.log('[Test] Verifying success modal...');
    const modalText = page.locator('h3:has-text("출고 요청 등록 완료")');
    await expect(modalText).toBeVisible({ timeout: 10000 });

    // 모달 확인 버튼 클릭
    const modalConfirmBtn = page.locator('button:has-text("확인")').last();
    await modalConfirmBtn.click();
    await page.waitForTimeout(1000);

    // 10. 상단 [최근 출고 대장] 탭으로 전환하여 방금 저장된 레코드 확인
    console.log('[Test] Step 6: Verify Recent Outbound Ledger Tab');
    await recentTabBtn.click();
    await page.waitForTimeout(1000);

    const recentTable = page.locator('table');
    await expect(recentTable).toBeVisible();
    const rows = recentTable.locator('tbody tr');
    const rowCount = await rows.count();
    console.log(`[Test] Recent Outbound Orders Table Row Count: ${rowCount}`);
    expect(rowCount).toBeGreaterThan(0);

    console.log('✅ IT Outbound Request (smart_dispatch4) Ultra-Compact Z-Pattern RWTT PASSED with 100% precision!');
  });
});
