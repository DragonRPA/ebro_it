// scripts/fix_table_cells.cjs
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '..');
const exts = ['.tsx', '.ts', '.jsx', '.js'];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  // Replace <th> not having style attribute
  content = content.replace(/<th(?![^>]*\bstyle=)[^>]*>/g, match => {
    // Insert style attribute before closing >
    return match.replace('>', ' style={{ whiteSpace: "nowrap" }}>');
  });
  // Replace <td> not having style attribute
  content = content.replace(/<td(?![^>]*\bstyle=)[^>]*>/g, match => {
    return match.replace('>', ' style={{ whiteSpace: "nowrap" }}>');
  });
  // Also handle existing style without whiteSpace
  content = content.replace(/style=\{([^}]*?)\}/g, (full, inner) => {
    if (/whiteSpace/.test(inner)) return full;
    return `style={{ ${inner}, whiteSpace: "nowrap" }}`;
  });
  fs.writeFileSync(filePath, content, 'utf-8');
}

function walk(dir) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      if (['node_modules', 'dist', '.git', 'public', 'scratch', 'scripts', 'templates'].includes(e.name)) continue;
      walk(full);
    } else {
      if (!exts.includes(path.extname(e.name))) continue;
      processFile(full);
    }
  }
}

walk(projectRoot);
console.log('Table cell nowrap fixes applied.');
