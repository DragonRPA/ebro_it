const fs = require('fs');
const path = require('path');

const auditData = JSON.parse(fs.readFileSync(path.join(__dirname, '../scratch_eq_doc_audit_kiyeun-storage.json'), 'utf8'));

console.log('====================================================');
console.log('📋 [CF 버킷 Eq_doc vs DB 등록 모델 대사 상세 분석 보고서]');
console.log('====================================================\n');

console.log('1. R2 버킷 완전 누락 모델 (문서 미보유):');
console.log(auditData.missingInR2);

console.log('\n2. R2 버킷 초과 보유 모델 (DB 미등록):');
console.log(auditData.extraInR2.map(e => e.r2Folder));
