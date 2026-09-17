// scripts/fix_compliance.js
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const exts = ['.tsx', '.ts', '.jsx', '.js'];
const prohibited = ['실시간','스마트','강력한','원클릭','무료','영구','편리','간편','스마트폰'];

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
      let changed = false;
      prohibited.forEach(word => {
        const regex = new RegExp(word, 'g');
        if (regex.test(content)) {
          content = content.replace(regex, '');
          changed = true;
        }
      });
      if (changed) {
        fs.writeFileSync(full, content, 'utf-8');
        console.log('Fixed adjectives in', full);
      }
    }
  }
}

walk(projectRoot);
console.log('Adjective cleanup completed.');
