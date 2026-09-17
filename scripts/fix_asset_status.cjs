// scripts/fix_asset_status.cjs
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
      const regex = /status\s*[:=]\s*['"](?!RENTED)([A-Z_]+)['"]/g;
      if (regex.test(content)) {
        const newContent = content.replace(regex, 'status = "RENTED"');
        fs.writeFileSync(full, newContent, 'utf-8');
        console.log('Fixed asset status in', full);
      }
    }
  }
}

walk(projectRoot);
console.log('Asset status cleanup completed.');
