const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const envFile = fs.readFileSync(path.join(__dirname, '..', '.env'), 'utf-8');
const envLines = envFile.split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('#'));

const envVars = {};
for (const line of envLines) {
  const idx = line.indexOf('=');
  if (idx !== -1) {
    const key = line.slice(0, idx).trim();
    const val = line.slice(idx + 1).trim();
    envVars[key] = val;
  }
}

// Also add R2_ serverless fallbacks
if (envVars['VITE_R2_ACCOUNT_ID']) envVars['R2_ACCOUNT_ID'] = envVars['VITE_R2_ACCOUNT_ID'];
if (envVars['VITE_R2_BUCKET_NAME']) envVars['R2_BUCKET_NAME'] = envVars['VITE_R2_BUCKET_NAME'];
if (envVars['VITE_R2_ACCESS_KEY_ID']) envVars['R2_ACCESS_KEY_ID'] = envVars['VITE_R2_ACCESS_KEY_ID'];
if (envVars['VITE_R2_SECRET_ACCESS_KEY']) envVars['R2_SECRET_ACCESS_KEY'] = envVars['VITE_R2_SECRET_ACCESS_KEY'];

console.log(`Syncing ${Object.keys(envVars).length} env variables to Vercel (dragonrpa/ebro_it)...`);

for (const [key, val] of Object.entries(envVars)) {
  for (const target of ['production', 'preview', 'development']) {
    try {
      execSync(`npx.cmd vercel env add ${key} ${target}`, {
        input: val + '\n',
        stdio: ['pipe', 'ignore', 'ignore']
      });
      console.log(`✓ Added ${key} to ${target}`);
    } catch (e) {
      console.log(`- ${key} (${target}) failed or already exists`);
    }
  }
}
console.log('Finished syncing env vars!');
