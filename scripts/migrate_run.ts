import fs from 'fs';
import https from 'https';
import * as XLSX from 'xlsx';
import { parseInitialExcelWorkbook, TABLE_COLUMNS } from '../src/services/migrationEngine';

const SUPABASE_URL = 'wywgkikkjgbnlljkkmnz.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind5d2draWtramdibmxsamtrbW56Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNjcxMzgsImV4cCI6MjA5OTk0MzEzOH0.gSftxhQjFmWUQzikx-Q5UsdgNKSZISZqJvUGeLBOCqU';

function fetchUsers() {
  return new Promise<any[]>((resolve, reject) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: '/rest/v1/users?select=*',
      method: 'GET',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
      }
    };
    const req = https.request(opts, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve(JSON.parse(data));
        } else {
          reject(new Error(`Fetch users failed: ${res.statusCode} ${data}`));
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

function postJson(table: string, rows: any[]) {
  return new Promise<void>((resolve, reject) => {
    const body = JSON.stringify(rows);
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/${table}`,
      method: 'POST',
      headers: {
        'apikey': SUPABASE_ANON,
        'Authorization': `Bearer ${SUPABASE_ANON}`,
        'Content-Type': 'application/json',
        'Prefer': 'resolution=merge-duplicates,return=minimal'
      }
    };
    const req = https.request(opts, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => {
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
          resolve();
        } else {
          reject(new Error(`${table} POST ${res.statusCode}: ${d.slice(0,200)}`));
        }
      });
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

const OVERRIDE_COLUMNS: any = {
  products: TABLE_COLUMNS.products,
  vendors: [
    'id', 'name', 'type', 'types', 'bizRegNo', 'representative', 'contactName', 'contact', 'email', 'address', 'bankAccount', 'isActive', 'memo', 'createdAt', 'updatedAt'
  ],
  customers: [
    'id', 'name', 'bizRegNo', 'representative', 'repContact', 'repEmail',
    'address', 'defaultBillingDay', 'isClosed', 'createdAt', 'updatedAt'
  ],
  customer_sites: [
    'id', 'customerId', 'name', 'address', 'contactName', 'contact', 'email', 'createdAt', 'updatedAt'
  ],
  customer_contacts: [
    'id', 'customerId', 'name', 'position', 'contact', 'email', 'createdAt', 'updatedAt'
  ],
  assets: [
    'id', 'modelName', 'assetNo', 'serialNo', 'manufacturer', 'manufactureYear',
    'ownerType', 'status', 'acquisitionDate', 'acquisitionPrice', 'depreciationMonths',
    'residualValueRate', 'accumDepreciation', 'bookValue', 'renter', 'supplier',
    'rentStart', 'rentEnd', 'monthlyRentFee', 'dailyRentFee', 'actualRentReturnDate',
    'currentCustomerId', 'currentSiteId', 'contractStart', 'contractEnd',
    'cumRentalFee', 'cumRepairCost', 'note', 'memo', 'createdAt', 'updatedAt'
  ],
  contracts: TABLE_COLUMNS.contracts,
  contract_history: [
    'id', 'contractId', 'changeType', 'changeDate', 'prevEndDate', 'newEndDate', 'description', 'createdAt'
  ],
  contract_assets: TABLE_COLUMNS.contract_assets,
  external_leases: [
    'id', 'vendorId', 'contractId', 'contractAssetId', 'assetDescription', 'monthlyRentFee', 'dailyRentFee', 'leaseStartDate', 'leaseEndDate', 'status', 'statementFileUrl', 'memo', 'createdAt', 'updatedAt'
  ],
  deliveries: TABLE_COLUMNS.deliveries,
  outbound_inspections: TABLE_COLUMNS.outbound_inspections,
  asset_inout_logs: TABLE_COLUMNS.asset_inout_logs,
  billings: [
    'id', 'customerId', 'contractId', 'billingYm', 'billingDate', 'totalAmount', 'paidAmount', 'status', 'createdAt', 'updatedAt'
  ],
  billing_details: [
    'id', 'billingId', 'contractAssetId', 'assetId', 'receivableId', 'itemName', 'quantity', 'unitPrice', 'amount', 'description', 'internalDescription', 'displayName', 'createdAt', 'updatedAt'
  ],
  purchase_billings: [
    'id', 'vendorId', 'billingYm', 'totalAmount', 'paidAmount', 'status', 'createdAt', 'updatedAt'
  ],
  purchase_billing_details: [
    'id', 'purchaseBillId', 'assetId', 'contractId', 'expenseType', 'itemName', 'amount', 'createdAt', 'updatedAt'
  ],
  receivables: [
    'id', 'contractId', 'customerId', 'type', 'totalAmount', 'billedAmount', 'internalDescription', 'displayName', 'occurredDate', 'status', 'createdAt', 'updatedAt'
  ]
};

async function batchUpsert(table: string, rows: any[], chunkSize = 200) {
  if (!rows || rows.length === 0) return;
  const cols = OVERRIDE_COLUMNS[table] || TABLE_COLUMNS[table];
  
  const filtered = rows.map(r => {
    const o: any = {};
    for (const k of cols) {
      o[k] = r[k] !== undefined ? r[k] : null;
    }
    return o;
  });

  const uniqueMap = new Map();
  filtered.forEach(r => uniqueMap.set(r.id, r));
  const uniqueFiltered = Array.from(uniqueMap.values());
  
  
  console.log(`[${table}] uploading ${uniqueFiltered.length} rows...`);
  for (let i = 0; i < uniqueFiltered.length; i += chunkSize) {
    const chunk = uniqueFiltered.slice(i, i + chunkSize);
    await postJson(table, chunk);
  }
}

async function runMigration() {
  console.log('Fetching users...');
  const users = await fetchUsers();
  console.log(`Found ${users.length} users.`);
  
  const excelPath = 'D:\\OneDrive\\Desktop\\기연리프트자료_\\자동업로드\\초기DB현황1.xlsx';
  console.log(`Reading Excel file: ${excelPath}`);
  const fileBuffer = fs.readFileSync(excelPath);
  
  console.log('Parsing Excel...');
  const parsed = parseInitialExcelWorkbook(fileBuffer, users);
  
  console.log('--- Parsing Stats ---');
  console.log(JSON.stringify(parsed.stats, null, 2));
  
  // Map entities to match the DB schema
  parsed.customers.forEach(c => {
    c.defaultBillingDay = c.billingDay;
    c.isClosed = c.isActive === false;
  });
  
  parsed.customerContacts.forEach(c => {
    c.contact = c.phone;
  });
  
  parsed.assets.forEach(a => {
    a.renter = a.vendorId;
  });
  
  parsed.contractHistories.forEach(c => {
    if (c.changeType === 'INITIAL_START') c.changeType = 'REGISTER';
    c.changeDate = c.snapshot?.startDate || c.createdAt;
  });

  parsed.externalLeases.forEach(e => {
    e.assetDescription = `${e.modelName} (${e.assetNo})`;
    e.leaseStartDate = e.rentStart;
    e.leaseEndDate = e.rentEnd;
    e.status = 'ACTIVE';
  });

  parsed.billings.forEach(b => {
    b.contractId = null;
    b.status = b.status === 'REQUESTED' ? 'UNPAID' : b.status;
  });

  parsed.billingDetails.forEach(bd => {
    bd.amount = bd.totalAmount || 0;
    bd.description = bd.note || '';
  });
  
  parsed.purchaseBillings.forEach(pb => {
    pb.status = pb.status === 'REQUESTED' ? 'REQUESTED' : pb.status;
  });

  parsed.purchaseBillingDetails.forEach(pbd => {
    pbd.purchaseBillId = pbd.purchaseBillingId;
    pbd.amount = pbd.totalAmount || 0;
    pbd.expenseType = 'OTHER';
  });

  parsed.receivables.forEach(r => {
    r.contractId = null;
    r.totalAmount = r.amount || 0;
    r.billedAmount = 0;
    r.internalDescription = r.note || '';
    r.type = 'OTHER';
    r.status = 'PENDING';
    r.occurredDate = r.occurredDate || '2026-08-31';
  });

  const order = [
    { table: 'products', data: parsed.products },
    { table: 'vendors', data: parsed.vendors },
    { table: 'customers', data: parsed.customers },
    { table: 'customer_sites', data: parsed.customerSites },
    { table: 'customer_contacts', data: parsed.customerContacts },
    { table: 'assets', data: parsed.assets },
    { table: 'contracts', data: parsed.contracts },
    { table: 'contract_history', data: parsed.contractHistories },
    { table: 'contract_assets', data: parsed.contractAssets },
    { table: 'external_leases', data: parsed.externalLeases },
    { table: 'billings', data: parsed.billings },
    { table: 'billing_details', data: parsed.billingDetails },
    { table: 'purchase_billings', data: parsed.purchaseBillings },
    { table: 'purchase_billing_details', data: parsed.purchaseBillingDetails },
    { table: 'receivables', data: parsed.receivables },
  ];
  
  for (const { table, data } of order) {
    await batchUpsert(table, data);
  }
  console.log('Migration Complete.');
}

runMigration().catch(err => {
  console.error('Migration failed:', err);
  process.exit(1);
});
