const fs = require('fs');
const p = 'D:\\OneDrive\\Desktop\\기연리프트자료_\\자동업로드\\초기DB현황1.xlsx';
try {
  const b = fs.readFileSync(p);
  console.log('✅ 파일 확인:', p);
  console.log('   크기:', b.length, 'bytes (', (b.length/1024/1024).toFixed(2), 'MB)');
} catch(e) {
  console.log('❌ 파일 없음:', e.message);
}
