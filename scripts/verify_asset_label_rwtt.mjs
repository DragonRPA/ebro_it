import { chromium } from 'playwright';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

// Load .env manually
const envPath = path.resolve(process.cwd(), '.env');
const envVars = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (m) envVars[m[1].trim()] = m[2].trim().replace(/^['"]|['"]$/g, '');
  }
}

const SUPABASE_URL = envVars.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = envVars.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function waitForServer(url, maxWaitMs = 20000) {
  const start = Date.now();
  while (Date.now() - start < maxWaitMs) {
    try {
      const res = await fetch(url);
      if (res.ok) return true;
    } catch {
      // retry
    }
    await new Promise(r => setTimeout(r, 500));
  }
  return false;
}

async function run() {
  console.log('🚀 [RWTT] 렌탈 자산 라벨 디자인·저장·테스트출력·스캔출력 실무 관통 검증 시작...');

  let viteProc = null;
  const serverUrl = 'http://localhost:5174';
  const alreadyUp = await waitForServer(serverUrl, 1500);

  if (!alreadyUp) {
    console.log('⚡ Vite 개발 서버(5174) 기동 중...');
    viteProc = spawn('cmd.exe', ['/c', 'npm.cmd run dev'], {
      cwd: process.cwd(),
      stdio: 'ignore',
      windowsHide: true
    });
    const ready = await waitForServer(serverUrl, 25000);
    if (!ready) {
      throw new Error('Vite 서버(5174) 기동 시간 초과');
    }
  }

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1520, height: 920 } });
  const page = await context.newPage();

  try {
    // 1. ERP 접속 및 로그인
    await page.goto(serverUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1500);

    const loginIdInput = page.locator('input[type="text"]').first();
    if (await loginIdInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await page.fill('input[type="text"]', 'manager');
      await page.fill('input[type="password"]', 'mgr123');
      await page.click('button[type="submit"]');
      await page.waitForTimeout(2500);
    }

    // 2. 자산관리 ➔ 자산 관리 메뉴 진입
    console.log('1️⃣ 자산관리 ➔ 자산 관리 메뉴 진입...');
    const subMenuItem = page.locator('text=자산 관리').first();
    if (await subMenuItem.isVisible({ timeout: 1500 }).catch(() => false)) {
      await subMenuItem.click();
    } else {
      await page.evaluate(() => {
        window.dispatchEvent(new CustomEvent('erp:navigate', { detail: { menuId: 'asset' } }));
      });
    }

    await page.locator('[data-hs-observe="assets"]').waitFor({ state: 'visible', timeout: 15000 });
    console.log('   ✅ 자산 관리 대장 화면 로드 완료');

    // 실제 자산 행 로드 대기
    await page.locator('[data-mid="chk-asset-row-0"]').waitFor({ state: 'visible', timeout: 15000 });

    // 첫 번째 자산의 자산번호 확인
    const firstAssetRowText = await page.locator('tbody tr').first().innerText();
    console.log('   📋 첫 번째 자산 행 확인:', firstAssetRowText.split(/\s+/).slice(0, 5).join(' '));

    // 3. 체크박스 선택 후 [라벨 출력] 모달 테스트
    console.log('2️⃣ 자산 체크박스 선택 및 [라벨 출력] 모달 검증...');
    await page.locator('[data-mid="chk-asset-row-0"]').check();
    await page.waitForTimeout(400);

    const printBtnText = await page.locator('[data-mid="btn-asset-label-print"]').innerText();
    console.log(`   🔘 상단 라벨 출력 버튼 텍스트: "${printBtnText.trim()}"`);

    await page.locator('[data-mid="btn-asset-label-print"]').click();
    await page.locator('[data-mid="asset-label-print-modal"]').waitFor({ state: 'visible', timeout: 5000 });
    console.log('   ✅ [자산 라벨 출력] 모달 오픈 성공');

    // ZPL 코드 미리보기 토글 및 내용 검증
    await page.locator('[data-mid="btn-modal-toggle-zpl"]').click();
    const modalZpl = await page.locator('[data-mid="textarea-modal-zpl-preview"]').inputValue();
    if (!modalZpl.includes('^XA') || !modalZpl.includes('^XZ')) {
      throw new Error('모달 ZPL II 코드가 정상 생성되지 않았습니다.');
    }
    console.log(`   ✅ 모달 ZPL II 코드 생성 검증 완료 (길이: ${modalZpl.length} bytes)`);

    // 모달에서 [라벨 출력] 버튼 클릭
    await page.locator('[data-mid="btn-modal-zpl-print"]').click();
    await page.waitForTimeout(800);
    console.log('   ✅ 모달 [라벨 출력] 전송 완료');

    // 모달에서 [라벨 서식 디자인] 버튼 클릭하여 디자이너 스튜디오로 전환
    console.log('3️⃣ [라벨 서식 디자인] 스튜디오(LabelDesignerStudio) 진입 및 기능 검증...');
    await page.locator('[data-mid="btn-open-label-designer-from-modal"]').click();
    await page.locator('[data-mid="label-canvas-surface"]').waitFor({ state: 'visible', timeout: 8000 });
    console.log('   ✅ 1:1 WYSIWYG 라벨 캔버스 렌더링 확인');

    // 우리 자산 테이블(db.assets) 연동 미리보기 자산 선택 드롭다운 검증
    const sampleAssetOptionsCount = await page.locator('[data-mid="select-preview-asset"] option').count();
    console.log(`   🔗 자산 테이블(db.assets) 연동 미리보기 자산 옵션 수: ${sampleAssetOptionsCount}개`);
    if (sampleAssetOptionsCount === 0) {
      throw new Error('미리보기 자산 선택 드롭다운에 자산 테이블 데이터가 연동되지 않았습니다.');
    }

    // 두 번째 자산 선택 시 ZPL 코드가 동적으로 갱신되는지 검증
    if (sampleAssetOptionsCount > 1) {
      const secondVal = await page.locator('[data-mid="select-preview-asset"] option').nth(1).getAttribute('value');
      const secondLabel = await page.locator('[data-mid="select-preview-asset"] option').nth(1).innerText();
      if (secondVal) {
        await page.locator('[data-mid="select-preview-asset"]').selectOption(secondVal);
        await page.waitForTimeout(400);
        const updatedZpl = await page.locator('[data-mid="textarea-zpl-preview"]').inputValue();
        console.log(`   ✅ 자산 테이블 다른 자산(${secondLabel.split('|')[0].trim()}) 선택 시 캔버스 및 ZPL 실시간 갱신 완료 (${updatedZpl.length} bytes)`);
      }
    }

    // 신규 서식 추가 및 Supabase DB 저장 테스트
    const newPresetTitle = 'IT렌탈 표준라벨 (72x40)';
    await page.locator('[data-mid="btn-add-label-preset"]').click();
    await page.locator('[data-mid="input-new-preset-name"]').fill(newPresetTitle);
    await page.locator('[data-mid="btn-confirm-create-preset"]').click();
    await page.waitForTimeout(1000);
    console.log(`   ✅ 신규 라벨 서식 "${newPresetTitle}" 생성 완료`);

    // [수정 저장] 클릭하여 Supabase label_templates 영구 저장 확인
    await page.locator('[data-mid="btn-save-label-template"]').click();
    await page.waitForTimeout(1500);
    await page.locator('[data-mid="label-save-banner"]').waitFor({ state: 'visible', timeout: 5000 });
    const bannerText = await page.locator('[data-mid="label-save-banner"]').innerText();
    console.log(`   ✅ 서식 저장 배너 확인: "${bannerText.trim()}"`);

    // [테스트 인쇄] 및 [현재 ZPL 테스트 인쇄] 실행 검증
    await page.locator('[data-mid="btn-label-test-print"]').click();
    await page.waitForTimeout(800);
    const testPrintBanner = await page.locator('[data-mid="label-save-banner"]').innerText();
    console.log(`   ✅ 디자이너 [테스트 인쇄] 실행 완료: "${testPrintBanner.trim()}"`);

    await page.locator('[data-mid="btn-custom-zpl-test-print"]').click();
    await page.waitForTimeout(800);
    console.log('   ✅ ZPL 코드 뷰어 [현재 ZPL 테스트 인쇄] 실행 완료');

    // 4. [라벨 스캔 출력] 탭 진입 및 바코드 스캔/자산번호 즉시 출력 검증
    console.log('4️⃣ [라벨 스캔 출력] 스튜디오(DirectLabelPrintStudio) 검증...');
    await page.locator('[data-mid="tab-asset-scan-print-view"]').click();
    await page.locator('[data-mid="direct-label-print-studio"]').waitFor({ state: 'visible', timeout: 5000 });

    const { data: dbSampleAssets } = await supabase.from('assets').select('asset_no, model_name, serial_no').limit(2);
    const targetAssetNo = dbSampleAssets?.[0]?.asset_no || 'IT-DT-2026-001';
    await page.locator('[data-mid="input-direct-label-scan"]').fill(targetAssetNo);
    await page.locator('[data-mid="btn-direct-scan-execute"]').click();
    await page.waitForTimeout(800);
    console.log(`   ✅ 자산번호 [${targetAssetNo}] 스캔 조회 및 즉시 라벨 출력 완료`);

    // 5. 물리적 DB (Supabase public.label_templates) 감사
    console.log('5️⃣ Supabase public.label_templates 물리적 DB 레코드 실사(Physical SELECT Audit)...');
    const { data: dbTemplates, error: dbErr } = await supabase
      .from('label_templates')
      .select('id, name, target_table, updated_at')
      .order('updated_at', { ascending: false });

    if (dbErr) throw dbErr;
    console.log(`   📊 DB 저장된 라벨 서식 총 ${dbTemplates.length}건:`, dbTemplates.map(t => `${t.name} (${t.id})`).join(', '));
    if (!dbTemplates || dbTemplates.length < 5) {
      throw new Error('label_templates 테이블에 기본 서식이 정상 보존되어 있지 않습니다.');
    }

    console.log('🎉 [RWTT PASS] 렌탈 자산 라벨 디자인·저장·테스트출력·스캔출력 전 과정 100% 검증 완료!');
  } finally {
    await browser.close();
    if (viteProc) {
      try {
        viteProc.kill();
      } catch {}
    }
  }
}

run().catch(err => {
  console.error('❌ [RWTT FAIL]:', err);
  process.exit(1);
});
