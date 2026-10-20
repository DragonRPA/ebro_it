const { execSync } = require('child_process');

const PROJECT_POLICIES = [
  { name: 'ebro_it', keep: 12 },             // 헌장 6.3 준수 (최근 12개 보존)
  { name: 'ebro_awp', keep: 12 },            // 헌장 6.3 준수 (최근 12개 보존)
  { name: 'space-consult-assist', keep: 5 }, // 최신 5개 보존
  { name: 'homepage', keep: 5 }              // 최신 5개 보존
];

function purgeProjectDeployments(projectName, maxKeep) {
  console.log(`\n======================================================`);
  console.log(`🔍 [${projectName}] Vercel 배포 슬롯 검사 중 (보존 목표: 최근 ${maxKeep}개)...`);
  console.log(`======================================================`);

  let nextToken = null;
  const allDeployments = [];

  while (true) {
    const cmd = nextToken
      ? `cmd /c npx.cmd vercel list ${projectName} --limit 100 -F json --next ${nextToken}`
      : `cmd /c npx.cmd vercel list ${projectName} --limit 100 -F json`;

    try {
      const output = execSync(cmd, { encoding: 'utf-8' });
      const jsonStr = output.substring(output.indexOf('{'));
      const data = JSON.parse(jsonStr);

      if (data.deployments && Array.isArray(data.deployments)) {
        data.deployments.forEach(d => allDeployments.push(d));
      }

      if (data.pagination && data.pagination.next) {
        nextToken = data.pagination.next;
      } else {
        break;
      }
    } catch (e) {
      console.warn(`목록 조회 중 중단 (${projectName}):`, e.message);
      break;
    }
  }

  console.log(`📊 [${projectName}] 총 ${allDeployments.length}개 배포 슬롯 발견.`);

  // 1. Error / Canceled 슬롯 즉시 100% 무조건 삭제 (헌장 6.3)
  const errorDeployments = allDeployments.filter(d => d.state === 'ERROR' || d.state === 'CANCELED');
  let errorDeletedCount = 0;
  for (const errDep of errorDeployments) {
    const target = errDep.url || errDep.id;
    try {
      console.log(`  🚨 [ERROR/CANCELED 슬롯 즉시 삭제] ${target} (${errDep.state})`);
      execSync(`cmd /c npx.cmd vercel remove ${target} --safe --yes`, { stdio: 'ignore' });
      errorDeletedCount++;
    } catch (e) {
      console.warn(`  ⚠️ 에러 슬롯 삭제 실패: ${target}`);
    }
  }

  // 2. 정상(READY 등) 배포 슬롯 최신순 정렬 및 슬롯 한도 관리
  const readyDeployments = allDeployments.filter(d => d.state !== 'ERROR' && d.state !== 'CANCELED');
  readyDeployments.sort((a, b) => b.createdAt - a.createdAt);

  if (readyDeployments.length <= maxKeep) {
    console.log(`✅ [${projectName}] 유효 배포 슬롯이 ${readyDeployments.length}개로 보존 한도(${maxKeep}개) 이하입니다. 정리 불필요.`);
    return errorDeletedCount;
  }

  const toRemove = readyDeployments.slice(maxKeep);
  console.log(`⚠️ 보존 한도(${maxKeep}개) 초과! 과거 배포 총 ${toRemove.length}개를 안전하게 삭제(Purge)합니다.`);

  let deletedCount = 0;
  for (let i = 0; i < toRemove.length; i++) {
    const dep = toRemove[i];
    const target = dep.url || dep.id;
    try {
      console.log(`[${i + 1}/${toRemove.length}] 🗑️ 과거 배포 삭제: ${target} (${dep.state})`);
      // --safe 옵션으로 활성 프로덕션 도메인/별칭 연결 건은 절대 삭제되지 않음
      execSync(`cmd /c npx.cmd vercel remove ${target} --safe --yes`, { stdio: 'ignore' });
      deletedCount++;
    } catch (err) {
      console.warn(`  ⚠️ 삭제 스킵 또는 실패: ${target}`);
    }
  }

  console.log(`✅ [${projectName}] 과거 배포 슬롯 ${deletedCount}개 정리 완료!`);
  return errorDeletedCount + deletedCount;
}

function runAll() {
  console.log(`🚀 [Vercel Deployment Storage 청정화] 전사 4대 프로젝트 일괄 정리 시작...`);
  let totalDeleted = 0;

  for (const policy of PROJECT_POLICIES) {
    const count = purgeProjectDeployments(policy.name, policy.keep);
    totalDeleted += count;
  }

  console.log(`\n======================================================`);
  console.log(`🎉 [전사 Vercel 정리 완결] 총 ${totalDeleted}개 과거 배포 슬롯 삭제 완료!`);
  console.log(`======================================================\n`);
}

runAll();