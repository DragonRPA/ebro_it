// audit.ts
import * as fs from 'fs';
import * as path from 'path';

const projectRoot = path.resolve(__dirname, '..');
const reportPath = path.join(projectRoot, 'audit_report.md');

interface Violation {
  file: string;
  line: number;
  message: string;
}

const violations: Violation[] = [];

function scanFile(filePath: string) {
  const ext = path.extname(filePath);
  if (!['.tsx', '.ts', '.js', '.jsx', '.css'].includes(ext)) return;
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split(/\r?\n/);
  lines.forEach((line, idx) => {
    const lineNum = idx + 1;
    // 1. Prohibited adjectives in UI text (Korean examples)
    const prohibited = ['실시간', '스마트', '강력한', '원클릭', '무료', '영구', '편리', '간편', '스마트폰'];
    prohibited.forEach(word => {
      if (line.includes(word)) {
        violations.push({file: filePath, line: lineNum, message: `Prohibited adjective "${word}" in UI text`});
      }
    });
    // 2. Horizontal label-input stack detection (label and input on same line)
    if (/\<label[^>]*>.*<\/label>\s*<input/.test(line)) {
      violations.push({file: filePath, line: lineNum, message: 'Horizontal label-input layout detected (should be vertical)'});
    }
    // 3. Missing white-space: nowrap on table cells/labels
    if (/\<(th|td)[^>]*>/.test(line) && !/white-space:\s*nowrap/.test(line)) {
      violations.push({file: filePath, line: lineNum, message: 'Table cell may lack white-space: nowrap'});
    }
    // 4. Asset state transition not using RENTED (simple pattern)
    if (/status\s*[:=]\s*[\'\"](?!RENTED)[A-Z_]+[\'\"]/.test(line)) {
      violations.push({file: filePath, line: lineNum, message: 'Asset status change not using RENTED'});
    }
    // 5. DB CUD without awaitPendingWrites (detect .insert/.update/.delete without await)
    if (/\.(insert|update|delete)\(/.test(line) && !/await/.test(line)) {
      violations.push({file: filePath, line: lineNum, message: 'DB CUD operation without await'});
    }
    // 6. Missing audit trail for EXCHANGE (search for changeType) – if "EXCHANGE" appears without changeType
    if (/EXCHANGE/.test(line) && !/changeType\s*[:=]/.test(line)) {
      violations.push({file: filePath, line: lineNum, message: 'EXCHANGE usage without explicit audit trail'});
    }
    // 7. Prohibited python -c usage
    if (/python\s+-c/.test(line)) {
      violations.push({file: filePath, line: lineNum, message: 'Prohibited python -c usage'});
    }
    // 8. TODO or 임시 comments
    if (/\bTODO\b|\b임시\b/.test(line)) {
      violations.push({file: filePath, line: lineNum, message: 'TODO or temporary comment'});
    }
  });
}

function walk(dir: string) {
  const entries = fs.readdirSync(dir, {withFileTypes: true});
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'public', 'scratch', 'scripts', 'templates'].includes(entry.name)) continue;
      walk(fullPath);
    } else {
      scanFile(fullPath);
    }
  }
}

walk(projectRoot);

let report = '# Audit Report\n\n';
if (violations.length === 0) {
  report += 'No violations found.\n';
} else {
  report += `Found ${violations.length} violations:\n\n`;
  for (const v of violations) {
    report += `- **${v.file}**: line ${v.line} – ${v.message}\n`;
  }
}

fs.writeFileSync(reportPath, report, 'utf-8');
console.log('Audit completed. Report written to', reportPath);
