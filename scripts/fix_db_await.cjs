// scripts/fix_db_await.cjs
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const exts = ['.tsx', '.ts', '.jsx', '.js'];

function walk(dir) {
  const entries = fs.readdirSync(dir, {withFileTypes:true});
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules','dist','.git','public','scratch','scripts','templates'].includes(e.name)) continue;
      walk(full);
    } else {
      if (!exts.includes(path.extname(e.name))) continue;
      let content = fs.readFileSync(full, 'utf-8');
      const lines = content.split(/\r?\n/);
      let changed = false;
      const newLines = lines.map(line => {
        if (/await\s+.*\.(insert|update|delete)\s*\(/.test(line)) return line; // already awaited
        const match = line.match(/(\S+\s*\.\s*(insert|update|delete)\s*\()/);
        if (match && !/\/\//.test(line)) {
          changed = true;
          return line.replace(match[1], 'await ' + match[1]);
        }
        return line;
      });
      if (changed) {
        fs.writeFileSync(full, newLines.join('\n'), 'utf-8');
        console.log('Added await to DB CUD in', full);
      }
    }
  }
}

walk(projectRoot);
console.log('DB await cleanup completed.');
