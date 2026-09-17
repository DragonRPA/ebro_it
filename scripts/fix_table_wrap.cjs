// scripts/fix_table_wrap.cjs
const fs = require('fs');
const path = require('path');

const cssFile = path.resolve(__dirname, '..', 'src', 'App.css');
let content = fs.readFileSync(cssFile, 'utf-8');
// Append rule if not present
const rule = '\n/* Added rule for table cells to prevent wrap */\nth, td { white-space: nowrap; }';
if (!content.includes('white-space: nowrap')) {
  content += rule;
  fs.writeFileSync(cssFile, content, 'utf-8');
  console.log('Appended nowrap rule to', cssFile);
} else {
  console.log('nowrap rule already present');
}
