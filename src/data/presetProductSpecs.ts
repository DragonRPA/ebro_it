export interface ProductPresetSpec {
  id?: string;
  modelName: string;
  manufacturer: string;
  feet: number; // 디스플레이 인치 또는 규격 (예: 14, 16, 27, 34)
  category?: 'LAPTOP' | 'DESKTOP' | 'MONITOR' | 'SERVER' | 'NETWORK' | 'TABLET' | 'PERIPHERAL';
  spec?: string | null;
  cpu?: string | null;
  ram?: string | null;
  storage?: string | null;
  gpu?: string | null;
  os?: string | null;
  displaySize?: string | null;
  weight?: string | null;
  asContact?: string | null;
  specSheetUrl?: string | null;
  safetyCertUrl?: string | null;
  emergencyGuideUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const PRESET_PRODUCT_SPECS: Record<string, ProductPresetSpec> = {
  "ThinkPad T14 Gen 4": {
    id: "PROD-IT-001",
    modelName: "ThinkPad T14 Gen 4",
    manufacturer: "Lenovo",
    feet: 14,
    category: "LAPTOP",
    spec: "i7-1360P / 32GB RAM / 1TB NVMe / 14인치 WUXGA IPS / Win11 Pro",
    cpu: "Intel Core i7-1360P (12코어 16스레드)",
    ram: "32GB DDR5-5600",
    storage: "1TB M.2 PCIe 4.0 NVMe SSD",
    gpu: "Intel Iris Xe Graphics",
    os: "Windows 11 Pro 64-bit",
    displaySize: "14.0형 (1920x1200) 16:10",
    weight: "1.36 kg",
    asContact: "1670-0088 (레노버 비즈니스 센터)",
    isActive: true,
    createdAt: "2026-09-17T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z"
  },
  "MacBook Pro 16 M3 Pro": {
    id: "PROD-IT-002",
    modelName: "MacBook Pro 16 M3 Pro",
    manufacturer: "Apple",
    feet: 16,
    category: "LAPTOP",
    spec: "M3 Pro 12C CPU 18C GPU / 36GB 통합메모리 / 512GB SSD / Liquid Retina XDR",
    cpu: "Apple M3 Pro (12코어 CPU)",
    ram: "36GB 통합 메모리",
    storage: "512GB 초고속 SSD",
    gpu: "18코어 GPU",
    os: "macOS Sonoma",
    displaySize: "16.2형 Liquid Retina XDR (3456x2234)",
    weight: "2.14 kg",
    asContact: "080-333-4000 (Apple Care 비즈니스)",
    isActive: true,
    createdAt: "2026-09-17T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z"
  },
  "Galaxy Book4 Pro 16": {
    id: "PROD-IT-003",
    modelName: "Galaxy Book4 Pro 16",
    manufacturer: "Samsung",
    feet: 16,
    category: "LAPTOP",
    spec: "Core Ultra 7 155H / 32GB LPDDR5X / 1TB NVMe / 16인치 3K AMOLED 터치",
    cpu: "Intel Core Ultra 7 155H (16코어, NPU 탑재)",
    ram: "32GB LPDDR5X-7467",
    storage: "1TB PCIe 4.0 NVMe SSD",
    gpu: "Intel Arc Graphics",
    os: "Windows 11 Pro 64-bit",
    displaySize: "16.0형 Dynamic AMOLED 2X 3K (2880x1800)",
    weight: "1.56 kg",
    asContact: "1588-3366 (삼성전자 서비스)",
    isActive: true,
    createdAt: "2026-09-17T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z"
  },
  "Dell OptiPlex 7010 Micro": {
    id: "PROD-IT-004",
    modelName: "Dell OptiPlex 7010 Micro",
    manufacturer: "Dell",
    feet: 0,
    category: "DESKTOP",
    spec: "i7-13700T / 32GB DDR5 / 1TB NVMe / 초소형 폼팩터 / Win11 Pro",
    cpu: "Intel Core i7-13700T (16코어 24스레드)",
    ram: "32GB DDR5-4800",
    storage: "1TB M.2 PCIe NVMe SSD",
    gpu: "Intel UHD Graphics 770",
    os: "Windows 11 Pro 64-bit",
    displaySize: "본체 전용 (모니터 별도)",
    weight: "1.09 kg",
    asContact: "080-854-0066 (델 프로서포트)",
    isActive: true,
    createdAt: "2026-09-17T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z"
  },
  "HP Z2 Mini G9 Workstation": {
    id: "PROD-IT-005",
    modelName: "HP Z2 Mini G9 Workstation",
    manufacturer: "HP",
    feet: 0,
    category: "DESKTOP",
    spec: "i9-13900K / 64GB DDR5 ECC / 2TB NVMe / NVIDIA RTX A2000 12GB",
    cpu: "Intel Core i9-13900K (24코어 32스레드)",
    ram: "64GB DDR5-4800 ECC",
    storage: "2TB HP Z Turbo M.2 NVMe SSD",
    gpu: "NVIDIA RTX A2000 12GB GDDR6",
    os: "Windows 11 Pro for Workstations",
    displaySize: "전문가용 렌더링/CAD 워크스테이션",
    weight: "2.40 kg",
    asContact: "1588-3003 (HP 엔터프라이즈 지원)",
    isActive: true,
    createdAt: "2026-09-17T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z"
  },
  "Dell UltraSharp U2723QE": {
    id: "PROD-IT-006",
    modelName: "Dell UltraSharp U2723QE",
    manufacturer: "Dell",
    feet: 27,
    category: "MONITOR",
    spec: "27인치 4K UHD IPS Black / 90W PD USB-C Hub / RJ45 이더넷 내장",
    displaySize: "27형 4K UHD (3840x2160) IPS Black",
    weight: "6.64 kg (스탠드 포함)",
    asContact: "080-854-0066 (델 모니터 무상교체 서비스)",
    isActive: true,
    createdAt: "2026-09-17T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z"
  },
  "LG 34WN80C-B UltraWide": {
    id: "PROD-IT-007",
    modelName: "LG 34WN80C-B UltraWide",
    manufacturer: "LG",
    feet: 34,
    category: "MONITOR",
    spec: "34인치 21:9 WQHD 커브드 / sRGB 99% / 60W USB-C 연결",
    displaySize: "34형 21:9 곡면 UltraWide (3440x1440)",
    weight: "8.50 kg",
    asContact: "1544-7777 (LG전자 서비스)",
    isActive: true,
    createdAt: "2026-09-17T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z"
  },
  "Dell PowerEdge R750": {
    id: "PROD-IT-008",
    modelName: "Dell PowerEdge R750",
    manufacturer: "Dell",
    feet: 2,
    category: "SERVER",
    spec: "2U Rack / Dual Xeon Silver 4314 / 128GB ECC / 8x 1.92TB NVMe / Dual 1400W PSU",
    cpu: "Dual Intel Xeon Silver 4314 (32코어 64스레드)",
    ram: "128GB (4x 32GB) DDR4-3200 RDIMM ECC",
    storage: "8x 1.92TB Enterprise Read Intensive NVMe SSD",
    gpu: "iDRAC9 Enterprise 원격 관리",
    os: "VMware ESXi / RHEL / Ubuntu Server Ready",
    displaySize: "2U 랙마운트 엔터프라이즈 서버",
    weight: "28.6 kg",
    asContact: "080-854-0066 (델 엔터프라이즈 4시간 현장대응)",
    isActive: true,
    createdAt: "2026-09-17T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z"
  },
  "Cisco Catalyst C9200L-48P-4X": {
    id: "PROD-IT-009",
    modelName: "Cisco Catalyst C9200L-48P-4X",
    manufacturer: "Cisco",
    feet: 1,
    category: "NETWORK",
    spec: "48-Port 1G PoE+ (740W) / 4x 10G SFP+ Uplink / L3 스위치",
    displaySize: "1U 랙마운트 엔터프라이즈 L3 스위치",
    weight: "4.80 kg",
    asContact: "080-008-8088 (시스코 TAC 비즈니스 지원)",
    isActive: true,
    createdAt: "2026-09-17T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z"
  },
  "iPad Pro 12.9 6th Cellular": {
    id: "PROD-IT-010",
    modelName: "iPad Pro 12.9 6th Cellular",
    manufacturer: "Apple",
    feet: 13,
    category: "TABLET",
    spec: "Apple M2 8C CPU / 256GB / Wi-Fi + 5G 셀룰러 / Liquid Retina XDR",
    cpu: "Apple M2 칩",
    ram: "8GB RAM",
    storage: "256GB 초고속 스토리지",
    os: "iPadOS 17+",
    displaySize: "12.9형 Liquid Retina XDR (2732x2048)",
    weight: "685 g",
    asContact: "080-333-4000 (Apple Care 비즈니스)",
    isActive: true,
    createdAt: "2026-09-17T00:00:00.000Z",
    updatedAt: "2026-09-17T00:00:00.000Z"
  }
};
