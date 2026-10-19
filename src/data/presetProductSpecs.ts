export type ProductCategory = 
  | 'LAPTOP' 
  | 'DESKTOP' 
  | 'MONITOR' 
  | 'TV' 
  | 'SERVER' 
  | 'NETWORK' 
  | 'TABLET' 
  | 'PRINTER' 
  | 'SOFTWARE' 
  | 'OTHER';

export interface ProductPresetSpec {
  id?: string;
  category: ProductCategory;
  manufacturer: string;
  modelName: string;
  shortName?: string | null;
  feet?: number; // 하위 호환용 (화면 인치 또는 규격 크기)
  spec: string;
  releaseYear?: string;
  warrantyType?: string;
  bundledAccessories?: string;

  // 하드웨어 스펙 및 슬롯
  cpu?: string | null;
  onboardRam?: number;
  ramSlots?: number;
  maxRam?: number;
  baseRam?: string | null;
  storageSlots?: number;
  storageFormFactors?: string | null;
  baseStorage?: string | null;
  gpuType?: 'INTEGRATED' | 'DEDICATED' | 'HYBRID';
  defaultGpu?: string | null;
  gpuSlots?: number;

  // 카테고리별 특화 제원
  displaySize?: number;
  resolution?: string | null;
  panelType?: string | null;
  refreshRate?: string | null;
  aspectRatio?: string | null;
  weight?: string | null;
  formFactor?: string | null;
  rackUnit?: number;
  cpuSockets?: number;
  networkPorts?: string | null;
  powerRedundancy?: boolean;
  printType?: string | null;
  printSpeed?: string | null;
  paperSize?: string | null;
  defaultOs?: string | null;
  tvStandType?: string | null;

  specSheetUrl?: string | null;
  manualUrl?: string | null;
  driverDownloadUrl?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: any;
}

export const PRESET_PRODUCT_SPECS: Record<string, ProductPresetSpec> = {
  // 1. LAPTOP
  "ThinkPad T14 Gen 4": {
    id: "PROD-IT-001",
    category: "LAPTOP",
    manufacturer: "Lenovo",
    modelName: "ThinkPad T14 Gen 4",
    shortName: "T14 G4",
    feet: 14,
    spec: "i7-1360P / 16G 온보드 + 1슬롯 / 512GB NVMe / 14인치 WUXGA IPS / Win11 Pro",
    releaseYear: "2023",
    warrantyType: "Lenovo Premier NBD 익일방문 (3년)",
    bundledAccessories: "65W USB-C GaN 어댑터, 전원코드, 전용 파우치",
    cpu: "Intel Core i7-1360P (12코어 16스레드)",
    onboardRam: 16,
    ramSlots: 1,
    maxRam: 48,
    baseRam: "16GB DDR5-5600 (온보드 16GB)",
    storageSlots: 1,
    storageFormFactors: "M.2 2280 NVMe PCIe 4.0",
    baseStorage: "512GB M.2 NVMe SSD",
    gpuType: "INTEGRATED",
    defaultGpu: "Intel Iris Xe Graphics",
    gpuSlots: 0,
    displaySize: 14.0,
    resolution: "WUXGA (1920x1200) 16:10",
    panelType: "IPS 400nits 눈부심방지",
    refreshRate: "60Hz",
    aspectRatio: "16:10",
    weight: "1.36 kg",
    formFactor: "슬림 비즈니스 노트북",
    defaultOs: "Windows 11 Pro 64-bit",
    isActive: true
  },
  "MacBook Pro 16 M3 Pro": {
    id: "PROD-IT-002",
    category: "LAPTOP",
    manufacturer: "Apple",
    modelName: "MacBook Pro 16 M3 Pro",
    shortName: "MBP 16 M3",
    feet: 16,
    spec: "M3 Pro 12C / 36GB 통합메모리 / 512GB SSD / Liquid Retina XDR",
    releaseYear: "2023",
    warrantyType: "AppleCare for Enterprise (3년)",
    bundledAccessories: "140W USB-C 전원 어댑터, MagSafe 3 케이블 (2m)",
    cpu: "Apple M3 Pro (12코어 CPU, 18코어 GPU)",
    onboardRam: 36,
    ramSlots: 0,
    maxRam: 36,
    baseRam: "36GB 통합 메모리 (온보드 고정)",
    storageSlots: 0,
    storageFormFactors: "온보드 고속 SSD",
    baseStorage: "512GB 초고속 SSD",
    gpuType: "INTEGRATED",
    defaultGpu: "Apple 18-Core GPU",
    gpuSlots: 0,
    displaySize: 16.2,
    resolution: "Liquid Retina XDR (3456x2234)",
    panelType: "Mini-LED XDR 1000nits",
    refreshRate: "120Hz ProMotion",
    aspectRatio: "16:10",
    weight: "2.14 kg",
    formFactor: "프로페셔널 모바일 워크스테이션",
    defaultOs: "macOS Sonoma",
    isActive: true
  },
  "Galaxy Book4 Pro 16": {
    id: "PROD-IT-003",
    category: "LAPTOP",
    manufacturer: "Samsung",
    modelName: "Galaxy Book4 Pro 16",
    shortName: "GB4 Pro 16",
    feet: 16,
    spec: "Core Ultra 7 / 32GB LPDDR5X / 1TB NVMe / 16인치 3K AMOLED / Win11 Pro",
    releaseYear: "2024",
    warrantyType: "삼성전자 기업 B2B 전담 서비스 (1년)",
    bundledAccessories: "65W 소형 어댑터, C to C 케이블",
    cpu: "Intel Core Ultra 7 155H (16코어 22스레드)",
    onboardRam: 32,
    ramSlots: 0,
    maxRam: 32,
    baseRam: "32GB LPDDR5X (온보드)",
    storageSlots: 2,
    storageFormFactors: "M.2 2280 NVMe 슬롯 2개 (1개 장착, 1개 확장용 빈슬롯)",
    baseStorage: "1TB M.2 PCIe 4.0 NVMe SSD",
    gpuType: "INTEGRATED",
    defaultGpu: "Intel Arc Graphics",
    gpuSlots: 0,
    displaySize: 16.0,
    resolution: "Dynamic AMOLED 2X 3K (2880x1800)",
    panelType: "AMOLED 터치스크린",
    refreshRate: "120Hz",
    aspectRatio: "16:10",
    weight: "1.56 kg",
    formFactor: "초경량 프리미엄 노트북",
    defaultOs: "Windows 11 Pro 64-bit",
    isActive: true
  },

  // 2. DESKTOP
  "Dell OptiPlex 7010 Micro": {
    id: "PROD-IT-004",
    category: "DESKTOP",
    manufacturer: "Dell",
    modelName: "Dell OptiPlex 7010 Micro",
    shortName: "OptiPlex 7010M",
    feet: 0,
    spec: "i7-13700T / 16GB DDR5 (2슬롯) / 512GB NVMe / 초소형 미니PC / Win11 Pro",
    releaseYear: "2023",
    warrantyType: "Dell ProSupport NBD 현장방문 (3년)",
    bundledAccessories: "90W 전원 어댑터, 무선 키보드/마우스 세트, DP to HDMI 젠더",
    cpu: "Intel Core i7-13700T (16코어 24스레드)",
    onboardRam: 0,
    ramSlots: 2,
    maxRam: 64,
    baseRam: "16GB (16GB*1) DDR5",
    storageSlots: 1,
    storageFormFactors: "M.2 2280 NVMe SSD",
    baseStorage: "512GB M.2 NVMe SSD",
    gpuType: "INTEGRATED",
    defaultGpu: "Intel UHD Graphics 770",
    gpuSlots: 0,
    weight: "1.09 kg",
    formFactor: "초소형 1리터 Micro PC",
    defaultOs: "Windows 11 Pro 64-bit",
    isActive: true
  },
  "HP Z2 Mini G9 Workstation": {
    id: "PROD-IT-005",
    category: "DESKTOP",
    manufacturer: "HP",
    modelName: "HP Z2 Mini G9 Workstation",
    shortName: "Z2 Mini G9",
    feet: 0,
    spec: "i9-13900K / 64GB DDR5 / 1TB NVMe / NVIDIA RTX A2000 12GB / 워크스테이션",
    releaseYear: "2023",
    warrantyType: "HP CarePack NBD 워크스테이션 전담 (3년)",
    bundledAccessories: "280W 전원 어댑터, VESA 마운트 브라켓, 무선 키마 세트",
    cpu: "Intel Core i9-13900K (24코어 32스레드)",
    onboardRam: 0,
    ramSlots: 2,
    maxRam: 64,
    baseRam: "64GB (32GB*2) DDR5-5600",
    storageSlots: 2,
    storageFormFactors: "M.2 2280 PCIe 4.0 슬롯 2개",
    baseStorage: "1TB M.2 PCIe 4.0 NVMe SSD",
    gpuType: "DEDICATED",
    defaultGpu: "NVIDIA RTX A2000 12GB",
    gpuSlots: 1,
    weight: "2.40 kg",
    formFactor: "소형 미니 워크스테이션",
    defaultOs: "Windows 11 Pro for Workstations",
    isActive: true
  },

  // 3. MONITOR
  "Dell UltraSharp U2723QE": {
    id: "PROD-IT-006",
    category: "MONITOR",
    manufacturer: "Dell",
    modelName: "Dell UltraSharp U2723QE",
    shortName: "U2723QE 4K",
    feet: 27,
    spec: "27인치 4K UHD IPS Black / 90W PD USB-C Hub / RJ45 이더넷 / 피벗 스탠드",
    releaseYear: "2022",
    warrantyType: "Dell 프리미엄 패널 교환 보증 (3년)",
    bundledAccessories: "전원코드, Type-C to C 케이블 (1m), DP 케이블, USB-A to C 업스트림",
    displaySize: 27.0,
    resolution: "4K UHD (3840x2160)",
    panelType: "IPS Black (명암비 2000:1, DCI-P3 98%)",
    refreshRate: "60Hz",
    aspectRatio: "16:9",
    weight: "6.64 kg",
    formFactor: "피벗/엘리베이션/스위블 다기능 스탠드",
    isActive: true
  },
  "LG 34WN80C-B UltraWide": {
    id: "PROD-IT-007",
    category: "MONITOR",
    manufacturer: "LG",
    modelName: "LG 34WN80C-B UltraWide",
    shortName: "34WN80C 21:9",
    feet: 34,
    spec: "34인치 21:9 WQHD 커브드 / sRGB 99% / 60W USB-C 연결 / 높낮이/틸트",
    releaseYear: "2023",
    warrantyType: "LG전자 서비스센터 (1년)",
    bundledAccessories: "전원 어댑터, HDMI 케이블, USB Type-C 케이블",
    displaySize: 34.0,
    resolution: "UltraWide QHD (3440x1440)",
    panelType: "IPS 커브드 (1900R)",
    refreshRate: "60Hz",
    aspectRatio: "21:9",
    weight: "8.50 kg",
    formFactor: "커브드 와이드 모니터",
    isActive: true
  },

  // 4. TV
  "Samsung 65인치 4K UHD 사이니지 TV": {
    id: "PROD-IT-008",
    category: "TV",
    manufacturer: "Samsung",
    modelName: "Samsung 65인치 4K UHD 사이니지 TV",
    shortName: "삼성 65인치 TV",
    feet: 65,
    spec: "65인치 4K UHD / 상업용 16/7 연속운용 / 이동식 바퀴형 거치대 포함 / 스마트 기능",
    releaseYear: "2023",
    warrantyType: "삼성 B2B 사이니지 출장서비스 (2년)",
    bundledAccessories: "리모컨, 전원코드, 이동식 바퀴형 스탠드 거치대, HDMI 케이블 (5m)",
    displaySize: 65.0,
    resolution: "4K UHD (3840x2160)",
    panelType: "Crystal UHD VA",
    refreshRate: "60Hz",
    aspectRatio: "16:9",
    weight: "21.3 kg",
    tvStandType: "이동식 바퀴형 스탠드 거치대",
    defaultOs: "Tizen OS (스마트 TV 및 화면 미러링 지원)",
    isActive: true
  },

  // 5. SERVER
  "Dell PowerEdge R750": {
    id: "PROD-IT-009",
    category: "SERVER",
    manufacturer: "Dell",
    modelName: "Dell PowerEdge R750",
    shortName: "R750 2U",
    feet: 2,
    spec: "2U Rack / Dual Xeon 4314 (32C) / 128GB ECC (32슬롯) / 8x 2.5인치 베이 / 800W Dual",
    releaseYear: "2022",
    warrantyType: "Dell ProSupport Mission Critical 4HR 현장방문 (3년)",
    bundledAccessories: "슬라이딩 ReadyRails 랙 레일킷, 전원코드 2개, 전면 베젤",
    cpu: "Intel Xeon Silver 4314 (16C/32T 2.4GHz) 2개 장착",
    onboardRam: 0,
    ramSlots: 32,
    maxRam: 2048,
    baseRam: "128GB (32GB*4) DDR4-3200 ECC RDIMM",
    storageSlots: 8,
    storageFormFactors: "8x 2.5인치 SAS/SATA/NVMe 핫스왑 베이",
    baseStorage: "2x 480GB SATA SSD (RAID 1) + 6개 확장 베이",
    gpuType: "INTEGRATED",
    defaultGpu: "Matrox G200 내장",
    gpuSlots: 6,
    formFactor: "2U 랙마운트",
    rackUnit: 2,
    cpuSockets: 2,
    networkPorts: "2x 10GbE SFP+ 및 2x 1GbE RJ45",
    powerRedundancy: true,
    weight: "28.6 kg",
    defaultOs: "No OS (고객사 지정 Linux / Windows Server 설치 지원)",
    isActive: true
  },

  // 6. NETWORK
  "Cisco Catalyst C9200L-48P-4X": {
    id: "PROD-IT-010",
    category: "NETWORK",
    manufacturer: "Cisco",
    modelName: "Cisco Catalyst C9200L-48P-4X",
    shortName: "C9200L 48P",
    feet: 1,
    spec: "48-Port PoE+ (740W) / 4x 10G SFP+ Uplink / Layer 3 엔터프라이즈 스위치",
    releaseYear: "2022",
    warrantyType: "Cisco SmartNet 익일 NBD 교체 지원 (1년)",
    bundledAccessories: "19인치 랙마운트 브라켓킷, 콘솔 케이블, 전원코드",
    formFactor: "1U 랙마운트",
    rackUnit: 1,
    networkPorts: "48x 1G RJ45 (PoE+ 740W 지원) + 4x 10G SFP+ 업링크",
    powerRedundancy: true,
    weight: "4.80 kg",
    isActive: true
  },

  // 7. TABLET
  "iPad Pro 12.9 6th Cellular": {
    id: "PROD-IT-011",
    category: "TABLET",
    manufacturer: "Apple",
    modelName: "iPad Pro 12.9 6th Cellular",
    shortName: "iPad Pro 12.9 셀룰러",
    feet: 13,
    spec: "Apple M2 / 256GB / Wi-Fi + 5G 셀룰러 (IMEI) / Liquid Retina XDR",
    releaseYear: "2022",
    warrantyType: "AppleCare for Enterprise (2년)",
    bundledAccessories: "20W USB-C 충전기, C to C 케이블 (1m)",
    cpu: "Apple M2 8코어 CPU",
    onboardRam: 8,
    ramSlots: 0,
    maxRam: 8,
    baseRam: "8GB 통합 메모리 (온보드)",
    storageSlots: 0,
    storageFormFactors: "온보드 저장공간",
    baseStorage: "256GB 고속 플래시",
    gpuType: "INTEGRATED",
    defaultGpu: "Apple 10-Core GPU",
    displaySize: 12.9,
    resolution: "Liquid Retina XDR (2732x2048)",
    panelType: "Mini-LED ProMotion 120Hz",
    weight: "685 g",
    formFactor: "대화면 프리미엄 태블릿",
    defaultOs: "iPadOS 17",
    isActive: true
  },

  // 8. PRINTER
  "FujiFilm ApeosPort C3060 A3 복합기": {
    id: "PROD-IT-012",
    category: "PRINTER",
    manufacturer: "FujiFilm",
    modelName: "FujiFilm ApeosPort C3060 A3 복합기",
    shortName: "후지 C3060 복합기",
    feet: 0,
    spec: "A3 컬러 디지털 복합기 / 출력속도 30 PPM / 복사, 인쇄, 스캔, 팩스 / 양면 자동급지",
    releaseYear: "2023",
    warrantyType: "후지필름비즈니스이노베이션 무상 정기점검 및 토너 공급 렌탈케어",
    bundledAccessories: "기본 토너 1세트, 전원코드, 랜선, 팩스선",
    printType: "A3 컬러 레이저 복합기",
    printSpeed: "30 PPM (흑백/컬러 동일)",
    paperSize: "최대 A3 (A4, B4, A3 지원)",
    formFactor: "스탠드 일체형 중대형 복합기",
    networkPorts: "Gigabit Ethernet RJ45, USB 2.0",
    weight: "75.0 kg",
    isActive: true
  },

  // 9. SOFTWARE
  "Microsoft 365 Business Standard": {
    id: "PROD-IT-013",
    category: "SOFTWARE",
    manufacturer: "Microsoft",
    modelName: "Microsoft 365 Business Standard",
    shortName: "M365 Business Std",
    feet: 0,
    spec: "1인당 PC 5대 + 모바일 5대 / Word, Excel, PowerPoint, Outlook, Teams, OneDrive 1TB",
    releaseYear: "2024",
    warrantyType: "MS 공식 온라인 기술지원",
    bundledAccessories: "전자 라이선스 인증키 발송",
    formFactor: "클라우드 구독 라이선스 (연간)",
    defaultOs: "Windows / macOS / 모바일 호환",
    isActive: true
  },
  "Windows 11 Pro 64-bit DSP 라이선스": {
    id: "PROD-IT-014",
    category: "SOFTWARE",
    manufacturer: "Microsoft",
    modelName: "Windows 11 Pro 64-bit DSP 라이선스",
    shortName: "Win11 Pro DSP",
    feet: 0,
    spec: "기업용 Windows 11 Pro COA 스티커 및 제품키 1디바이스 영구귀속 라이선스",
    releaseYear: "2023",
    warrantyType: "영구 라이선스",
    bundledAccessories: "정품 COA 스티커 및 제품키 카드",
    formFactor: "장치 귀속형 라이선스 (DSP/OEM)",
    defaultOs: "Windows 11 Pro",
    isActive: true
  },

  // 10. OTHER
  "CalDigit TS4 썬더볼트4 18-in-1 도킹스테이션": {
    id: "PROD-IT-015",
    category: "OTHER",
    manufacturer: "CalDigit",
    modelName: "CalDigit TS4 썬더볼트4 18-in-1 도킹스테이션",
    shortName: "CalDigit TS4",
    feet: 0,
    spec: "Thunderbolt 4 / 최대 98W 호스트 충전 / 2.5GbE LAN / 18개 확장 포트 / 듀얼 6K 디스플레이",
    releaseYear: "2022",
    warrantyType: "공식 수입원 무상 보증 (2년)",
    bundledAccessories: "230W 전원 어댑터, 썬더볼트4 케이블 (0.8m), 고무 받침대",
    formFactor: "데스크탑 도킹 스테이션",
    weight: "640 g",
    networkPorts: "2.5 Gigabit Ethernet RJ45",
    isActive: true
  }
};
