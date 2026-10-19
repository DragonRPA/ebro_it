// scripts/seed_dev_device.cjs
const { Client } = require('pg');

const client = new Client({
  host: 'aws-0-ap-southeast-1.pooler.supabase.com',
  port: 5432,
  user: 'postgres.uvmhqwpkmzxrrlkeguul',
  password: 'BwYofacVm0ibBz67',
  database: 'postgres',
  ssl: { rejectUnauthorized: false }
});

async function run() {
  await client.connect();
  const query = `
    INSERT INTO developer_authorized_devices (
      id, "deviceId", "developerId", "developerName", "machineName",
      "macAddress", "hardwareFingerprint", platform, status, "isPrimary",
      "emergencyBreakGlassUsed", note, "registeredAt", "lastVerifiedAt", tenant_id
    ) VALUES (
      'DEV-PC-PRIMARY-01', 'DEV-PC-PRIMARY-01', 'sys-admin', '대표 개발자', '개발자 워크스테이션 (Win32)',
      'D4-AB-61-46-47-82', 'HW-47A4-E661-24C32G', 'Win32/x86_64', 'ACTIVE', true,
      false, '대표 개발자 공인 워크스테이션', NOW(), NOW(), 'tenant-ebro-it'
    )
    ON CONFLICT (id) DO UPDATE SET
      "hardwareFingerprint" = EXCLUDED."hardwareFingerprint",
      "lastVerifiedAt" = NOW(),
      status = 'ACTIVE';
  `;
  await client.query(query);
  console.log('✅ Registered dev PC in uvmhqwpkmzxrrlkeguul');
  const res = await client.query('SELECT id, "developerName", "macAddress", "hardwareFingerprint", status FROM developer_authorized_devices');
  console.log('Current devices in DB:', res.rows);
  await client.end();
}

run();
