const fs = require('fs');
const path = require('path');

const backupPath = path.join(__dirname, '../backups/db_49_tables_full_backup_2026-08-31T09-17-28-862Z.json');
const backup = JSON.parse(fs.readFileSync(backupPath, 'utf8'));

const products = backup.products || [];
console.log(`백업 내 제품 수: ${products.length}개`);

const detailedProducts = products.filter(p => p.workingHeight || p.weight || (p.specSheetUrl && p.specSheetUrl.startsWith('http')));
console.log(`상세 제원 또는 실제 URL 보유 제품 수: ${detailedProducts.length}개`);

detailedProducts.slice(0, 10).forEach(p => {
  console.log(`- [${p.modelName}] 제조사: ${p.manufacturer}, 높이: ${p.workingHeight}, 중량: ${p.weight}, specSheet: ${p.specSheetUrl ? p.specSheetUrl.slice(0, 60) + '...' : 'null'}`);
});
