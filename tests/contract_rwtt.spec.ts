import { test, expect } from '@playwright/test';

test.describe('Contract RWTT: Contracts Lifecycle and Detail Inspection', () => {
  test.setTimeout(180000); // 3 minutes

  test('Perform contract inspection, search, and tab switching in ERP', async ({ page }) => {
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

    // 2. 계약 관리로 이동
    console.log('[RWTT Contract] Navigating to contracts...');
    await page.evaluate(() => {
      window.dispatchEvent(new CustomEvent('erp:navigate', { detail: { menuId: 'contracts' } }));
    });
    await page.waitForTimeout(2000);

    // 3. 계약 관리 헤더 확인
    const header = page.locator('h1, h2, span').filter({ hasText: /계약/ }).first();
    await expect(header).toBeVisible();

    // 4. 상태 필터 탭 전환 스트레스 (전체, 진행중, 만료 등)
    const tabButtons = page.locator('button').filter({ hasText: /(전체|진행중|종료|완료)/ });
    const tabCount = await tabButtons.count();
    for (let i = 0; i < Math.min(tabCount, 4); i++) {
      const btn = tabButtons.nth(i);
      if (await btn.isVisible()) {
        await btn.click();
        await page.waitForTimeout(300);
      }
    }

    // 5. 검색창 필터링
    const searchInput = page.locator('input[placeholder*="검색"]').first();
    if (await searchInput.isVisible()) {
      await searchInput.fill('테스트');
      await page.waitForTimeout(300);
      await searchInput.fill('');
      await page.waitForTimeout(300);
    }

    console.log('✅ Contract RWTT inspection completed successfully!');
  });
});
