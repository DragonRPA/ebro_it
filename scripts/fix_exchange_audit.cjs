// scripts/fix_exchange_audit.cjs
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const exts = ['.tsx', '.ts', '.jsx', '.js'];

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'public', 'scratch', 'scripts', 'templates'].includes(e.name)) continue;
      walk(full);
    } else {
      if (!exts.includes(path.extname(e.name))) continue;
      let content = fs.readFileSync(full, 'utf-8');
      const regex = /\bEXCHANGE\b/g;
      if (regex.test(content)) {
        const lines = content.split(/\r?\n/);
        const newLines = [];
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          newLines.push(line);
          if (regex.test(line) && !/contractHistory\.push/.test(lines[i + 1] || '')) {
            const indent = line.match(/^\s*/)[0] || '';
            const auditLine = `${indent}contractHistory.push({ changeType: 'EXCHANGE', detail: 'Auto‑added audit trail' });`;
            newLines.push(auditLine);
            console.log('Added audit trail in', full, 'at line', i + 2);
          }
        }
        const newContent = newLines.join('\n');
        fs.writeFileSync(full, newContent, 'utf-8');
      }
    }
  }
}

walk(projectRoot);
console.log('EXCHANGE audit trail fix completed.');
