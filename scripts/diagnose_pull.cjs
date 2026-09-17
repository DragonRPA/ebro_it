const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env', 'utf8');
let u = '', k = '';
env.split('\n').forEach(l => {
  const parts = l.split('=');
  const a = parts[0];
  const b = parts.slice(1).join('=');
  if (a === 'VITE_SUPABASE_URL') u = b.trim();
  if (a === 'VITE_SUPABASE_ANON_KEY') k = b.trim();
});

const sb = createClient(u, k);

const mapping = {
  prepaidTransactions: 'prepaid_transactions',
  delinquencyActionLogs: 'delinquency_action_logs',
  users: 'users', departments: 'departments', permissions: 'permissions',
  customers: 'customers', contacts: 'customer_contacts', sites: 'customer_sites',
  products: 'products', assets: 'assets', consumables: 'consumables',
  consumableLogs: 'consumable_logs', consumablePurchases: 'consumable_purchases',
  contracts: 'contracts', contractAssets: 'contract_assets', contractHistory: 'contract_history',
  deliveries: 'deliveries', transportCompanies: 'transport_companies', transportDrivers: 'transport_drivers',
  billings: 'billings', billingDetails: 'billing_details', payments: 'payments',
  paymentDepositLinks: 'payment_deposit_links', repairs: 'repairs', repairConsumables: 'repair_consumables',
  bankTransactions: 'bank_transactions', bankMatchingRules: 'bank_matching_rules',
  assetInOutLogs: 'asset_inout_logs', googleConfigs: 'google_configs', vendors: 'vendors',
  cashFlowSnapshots: 'cash_flow_snapshots', outboundInspections: 'outbound_inspections',
  depreciationLogs: 'depreciation_logs', purchaseSettlements: 'purchase_settlements',
  purchaseSettlementItems: 'purchase_settlement_items', externalLeases: 'external_leases',
  inspectionChecklistItems: 'inspection_checklist_items',
  mechanicConsumableStocks: 'mechanic_consumable_stocks', receivables: 'receivables',
};

const ALL_DB_KEYS = [
  'users','departments','permissions','customers','contacts','sites',
  'products','assets','consumables','consumableLogs','consumablePurchases',
  'contracts','contractAssets','contractHistory','deliveries',
  'transportCompanies','transportDrivers','vendors',
  'billings','billingDetails','payments','paymentDepositLinks','repairs','repairConsumables','todos',
  'bankTransactions','bankMatchingRules','bankInitialBalances','googleConfigs','assetInOutLogs',
  'cashFlowSnapshots','outboundInspections','depreciationLogs',
  'purchaseSettlements','purchaseSettlementItems','settlementPaymentLogs','externalLeases',
  'annualLeaveQuotas','leaveUsages','overtimeRecords','payrollClosings','inspectionChecklistItems',
  'prepaidTransactions','delinquencyActionLogs','mechanicConsumableStocks','receivables'
];

async function diagnose() {
  console.log('=== DB PULL 진단: 각 테이블 fetch 결과 ===');
  const results = [];

  for (const key of ALL_DB_KEYS) {
    const tableName = mapping[key] || key;
    try {
      const { data, error } = await sb.from(tableName).select('*').range(0, 0);
      if (error) {
        results.push({ key, tableName, status: 'ERROR', detail: error.message });
      } else {
        results.push({ key, tableName, status: 'OK', detail: '' });
      }
    } catch (e) {
      results.push({ key, tableName, status: 'THROW', detail: e.message });
    }
  }

  console.log('\n--- 성공 ---');
  results.filter(r => r.status === 'OK').forEach(r => console.log(`  OK: ${r.key} -> ${r.tableName}`));
  console.log('\n--- 실패 ---');
  results.filter(r => r.status !== 'OK').forEach(r => console.log(`  FAIL: ${r.key} -> ${r.tableName} [${r.status}] ${r.detail}`));
}

diagnose();
