import { supabase, Asset, Product } from '../services/db';
import { getAssetStatusLabel } from '../config/asset_status_config';
import { generateBarcodeSvgMarkup } from './barcodeGenerator';

export const LOCAL_KEY_ACTIVE_TEMPLATE_ID = 'EBRO_ACTIVE_LABEL_TEMPLATE_ID_V1';
export const LOCAL_KEY_TEMPLATE_PRESETS = 'EBRO_LABEL_TEMPLATE_PRESETS_V1';

export interface LabelSchemaField {
  id: string;
  name: string;
  isKey?: boolean;
  isBarcodeTarget?: boolean;
}

/**
 * 우리 ERP 자산 테이블(db.assets + db.products) 1:1 표준 필드 스키마 정의
 */
export const ASSET_TABLE_SCHEMA_FIELDS: LabelSchemaField[] = [
  { id: 'asset_no', name: '자산번호', isKey: true, isBarcodeTarget: true },
  { id: 'product_name', name: '제품명' },
  { id: 'model_name', name: '모델명' },
  { id: 'serial_no', name: '제조번호(시리얼)', isBarcodeTarget: true },
  { id: 'manufacturer', name: '제조사' },
  { id: 'spec', name: '구성요소(사양)' },
  { id: 'installed_os', name: '설치 OS' },
  { id: 'imei', name: 'IMEI', isBarcodeTarget: true },
  { id: 'mac_lan', name: '유선 MAC' },
  { id: 'mac_wlan', name: '무선 MAC' },
  { id: 'license_key', name: '라이선스 키' },
  { id: 'manufacture_year', name: '연식' },
  { id: 'asset_status', name: '자산상태' },
  { id: 'remark', name: '비고' }
];

export interface LabelElement {
  id: string;
  name: string;
  type: 'text' | 'barcode' | 'line' | 'image';
  field?: string;
  customValue?: string;
  prefix?: string;
  xMm: number;
  yMm: number;
  offsetX?: number;
  offsetY?: number;
  fontSizePt?: number;
  fontFamily?: string;
  barcodeType?: 'CODE128' | 'CODE39' | 'QR' | string;
  targetField?: string;
  heightMm?: number;
  widthMm?: number;
  thicknessMm?: number;
  qrScale?: number;
  showText?: boolean;
  imageDataUrl?: string;
  zplGf?: string | null;
  visible: boolean;
}

export interface LabelPaperConfig {
  widthMm: number;
  heightMm: number;
  dpi: number;
  dotsWidth: number;
  dotsHeight: number;
  targetTable?: string;
  targetPrinterId?: string;
  targetPrinterName?: string;
  useLabelHome?: boolean;
  customHomeX?: number;
  customHomeY?: number;
  usePrintWidth?: boolean;
  isLocked?: boolean;
}

export interface LabelTemplatePreset {
  templateId: string;
  targetTable: string;
  schemaId?: string;
  name: string;
  targetPrinterId?: string;
  targetPrinterName?: string;
  isDefault?: boolean;
  isLocked?: boolean;
  paper: LabelPaperConfig;
  elements: LabelElement[];
}

/**
 * 우리 ERP의 Asset 엔티티를 라벨 엔진용 표준 레코드로 1:1 정규화
 * - camelCase(assetNo, modelName, serialNo 등)와 snake_case(asset_no, model_name, serial_no 등) 양방향 완벽 호환
 */
export function normalizeAssetForLabel(
  asset: Partial<Asset> & Record<string, any>,
  products: Product[] = []
): Record<string, any> {
  if (!asset) {
    return {
      asset_no: 'TEST0001',
      assetNo: 'TEST0001',
      product_name: '렌탈 자산',
      model_name: 'NT950XGK',
      modelName: 'NT950XGK',
      serial_no: 'SN20261001',
      serialNo: 'SN20261001',
      manufacturer: '삼성전자',
      spec: '16GB RAM / 512GB NVMe',
      installed_os: 'Windows 11 Pro',
      imei: '-',
      mac_lan: '00:1A:2B:3C:4D:5E',
      mac_wlan: '00:1A:2B:3C:4D:5F',
      mac_address: '00:1A:2B:3C:4D:5E',
      license_key: '-',
      manufacture_year: '2026',
      asset_status: '임대가능',
      remark: ''
    };
  }

  const matchedProduct = products.find(p => p.modelName && p.modelName === (asset.modelName || asset.model_name));
  const assetNo = asset.assetNo || asset.asset_no || asset.key_value || asset.id || '';
  const modelName = asset.modelName || asset.model_name || '';
  const productName =
    asset.product_name ||
    asset.productName ||
    matchedProduct?.shortName ||
    matchedProduct?.category ||
    modelName ||
    '';
  const categoryMajor = asset.category_major || matchedProduct?.category || '';
  const serialNo = asset.serialNo || asset.serial_no || '';
  const manufacturer = asset.manufacturer || matchedProduct?.manufacturer || '';
  const ramText = asset.ramConfig || (asset.totalRamGb ? `${asset.totalRamGb}GB RAM` : '');
  const storageText = asset.totalStorageText || '';
  const hwSpec = [ramText, storageText, asset.installedGpu, asset.customSpec].filter(Boolean).join(' / ') || asset.spec || matchedProduct?.spec || '';
  const installedOs = asset.installedOs || asset.installed_os || '';
  const wiredMac = asset.wiredMac || asset.mac_lan || '';
  const wifiMac = asset.wifiMac || asset.mac_wlan || '';
  const macAddress = asset.mac_address || wiredMac || wifiMac || '';
  const imei = asset.imei || '';
  const licenseKey = asset.licenseKey || asset.license_key || '';
  const manufactureYear = asset.manufactureYear || asset.manufacture_year || '';
  const statusLabel = asset.asset_status || (asset.status ? getAssetStatusLabel(asset.status) : '정상');
  const remark = asset.memo || asset.memo1 || asset.remark || '';

  return {
    ...asset,
    id: asset.id || assetNo,
    assetNo,
    asset_no: assetNo,
    productName,
    product_name: productName,
    category_major: categoryMajor,
    modelName,
    model_name: modelName,
    serialNo,
    serial_no: serialNo,
    manufacturer,
    spec: hwSpec,
    components: hwSpec,
    asset_option: asset.customSpec || asset.asset_option || hwSpec,
    installedOs,
    installed_os: installedOs,
    wiredMac,
    mac_lan: wiredMac,
    wifiMac,
    mac_wlan: wifiMac,
    mac_address: macAddress,
    imei,
    licenseKey,
    license_key: licenseKey,
    manufactureYear,
    manufacture_year: manufactureYear,
    asset_status: statusLabel,
    remark,
    memo: remark
  };
}

export const BUILTIN_LABEL_PRESETS: LabelTemplatePreset[] = [
  {
    templateId: 'tpl_custom_1786794662574',
    targetTable: 'asset',
    schemaId: 'asset_schema',
    name: 'GK420-대형',
    targetPrinterId: 'prn_win_ZDesigner_GK420d_USB001',
    targetPrinterName: 'ZDesigner GK420d [USB (USB001)]',
    isDefault: true,
    isLocked: true,
    paper: {
      dpi: 203,
      widthMm: 72,
      heightMm: 40,
      isLocked: true,
      dotsWidth: 576,
      dotsHeight: 320,
      targetTable: 'asset',
      useLabelHome: false,
      usePrintWidth: false,
      targetPrinterId: 'prn_win_ZDesigner_GK420d_USB001',
      targetPrinterName: 'ZDesigner GK420d [USB (USB001)]'
    },
    elements: [
      { id: 'elem_asset_no', xMm: 5.5, yMm: 4, name: '자산번호', type: 'text', field: 'asset_no', prefix: '자산번호 : ', visible: true, fontFamily: 'A0N', fontSizePt: 30 },
      { id: 'elem_product_name', xMm: 5.5, yMm: 9.5, name: '제품명', type: 'text', field: 'product_name', prefix: '제품명 : ', visible: true, fontFamily: 'A0N', fontSizePt: 30 },
      { id: 'elem_model_name', xMm: 5.5, yMm: 15.5, name: '모델명', type: 'text', field: 'model_name', prefix: 'M/N : ', visible: true, fontFamily: 'A0N', fontSizePt: 30 },
      { id: 'elem_serial_no', xMm: 5.5, yMm: 22, name: '제조번호(시리얼)', type: 'text', field: 'serial_no', prefix: 'S/N : ', visible: true, fontFamily: 'A0N', fontSizePt: 30 },
      { id: 'elem_manufacturer', xMm: 5.5, yMm: 26, name: '제조사', type: 'text', field: 'manufacturer', prefix: '제조사 : ', visible: false, fontFamily: 'A0N', fontSizePt: 18 },
      { id: 'elem_spec', xMm: 5.5, yMm: 28, name: '구성요소(사양)', type: 'text', field: 'spec', prefix: '사양 : ', visible: false, fontFamily: 'A0N', fontSizePt: 16 },
      { id: 'elem_installed_os', xMm: 5.5, yMm: 30, name: '설치 OS', type: 'text', field: 'installed_os', prefix: 'OS : ', visible: false, fontFamily: 'A0N', fontSizePt: 16 },
      { id: 'elem_imei', xMm: 5.5, yMm: 27, name: 'IMEI', type: 'text', field: 'imei', prefix: 'IMEI: ', visible: false, fontFamily: 'A0N', fontSizePt: 16 },
      { id: 'elem_mac_lan', xMm: 5.5, yMm: 31, name: '유선 MAC', type: 'text', field: 'mac_lan', prefix: 'MAC(L): ', visible: false, fontFamily: 'A0N', fontSizePt: 15 },
      { id: 'elem_mac_wlan', xMm: 5.5, yMm: 34, name: '무선 MAC', type: 'text', field: 'mac_wlan', prefix: 'MAC(W): ', visible: false, fontFamily: 'A0N', fontSizePt: 15 },
      { id: 'elem_license_key', xMm: 5.5, yMm: 36, name: '라이선스 키', type: 'text', field: 'license_key', prefix: 'KEY: ', visible: false, fontFamily: 'A0N', fontSizePt: 14 },
      { id: 'elem_manufacture_year', xMm: 45, yMm: 4, name: '연식', type: 'text', field: 'manufacture_year', prefix: '연식: ', visible: false, fontFamily: 'A0N', fontSizePt: 16 },
      { id: 'elem_asset_status', xMm: 45, yMm: 8, name: '자산상태', type: 'text', field: 'asset_status', prefix: '상태: ', visible: false, fontFamily: 'A0N', fontSizePt: 16 },
      { id: 'elem_remark', xMm: 5.5, yMm: 37, name: '비고', type: 'text', field: 'remark', prefix: '', visible: false, fontFamily: 'A0N', fontSizePt: 14 },
      { id: 'elem_divider', xMm: 1.5, yMm: 7, name: '구분선', type: 'line', visible: false, widthMm: 69, thicknessMm: 0.25 },
      { id: 'elem_barcode', xMm: 22.5, yMm: 28, name: '바코드 / QR', type: 'barcode', prefix: '', qrScale: 4, visible: true, heightMm: 7, showText: false, barcodeType: 'CODE39', targetField: 'asset_no' },
      { id: 'elem_custom_text_1', xMm: 2, yMm: 2, name: '추가 텍스트 1', type: 'text', field: 'custom_text_1', prefix: '', visible: false, fontFamily: 'A0N', fontSizePt: 14, customValue: '' },
      { id: 'elem_custom_text_2', xMm: 2, yMm: 6, name: '추가 텍스트 2', type: 'text', field: 'custom_text_2', prefix: '', visible: false, fontFamily: 'A0N', fontSizePt: 14, customValue: '' },
      { id: 'elem_custom_text_3', xMm: 2, yMm: 10, name: '추가 텍스트 3', type: 'text', field: 'custom_text_3', prefix: '', visible: false, fontFamily: 'A0N', fontSizePt: 14, customValue: '' },
      { id: 'elem_custom_text_4', xMm: 2, yMm: 14, name: '추가 텍스트 4', type: 'text', field: 'custom_text_4', prefix: '', visible: false, fontFamily: 'A0N', fontSizePt: 14, customValue: '' },
      { id: 'elem_image', xMm: 45, yMm: 2, name: '이미지 / 로고', type: 'image', visible: false, widthMm: 18, heightMm: 12, imageDataUrl: '' }
    ]
  },
  {
    templateId: 'tpl_custom_1786802153188',
    targetTable: 'asset',
    schemaId: 'asset_schema',
    name: 'ZT411-대형',
    targetPrinterId: 'prn_win_ZDesigner_ZT411_203dpi_ZPL_LAN_ZDesigner_ZT411-203dpi_ZPL',
    targetPrinterName: 'ZDesigner ZT411-203dpi ZPL [USB (LAN_ZDesigner_ZT411-203dpi_ZPL)]',
    isDefault: false,
    isLocked: true,
    paper: {
      dpi: 203,
      widthMm: 72,
      heightMm: 40,
      isLocked: true,
      dotsWidth: 576,
      dotsHeight: 320,
      targetTable: 'asset',
      useLabelHome: false,
      usePrintWidth: false,
      targetPrinterId: 'prn_win_ZDesigner_ZT411_203dpi_ZPL_LAN_ZDesigner_ZT411-203dpi_ZPL',
      targetPrinterName: 'ZDesigner ZT411-203dpi ZPL [USB (LAN_ZDesigner_ZT411-203dpi_ZPL)]'
    },
    elements: [
      { id: 'elem_asset_no', xMm: 6, yMm: 4.5, name: '자산번호', type: 'text', field: 'asset_no', prefix: '자산번호: ', offsetX: 0, visible: true, fontFamily: 'A0N', fontSizePt: 27 },
      { id: 'elem_product_name', xMm: 6, yMm: 11, name: '제품명', type: 'text', field: 'product_name', prefix: '제품명: ', visible: true, fontFamily: 'A0N', fontSizePt: 25 },
      { id: 'elem_model_name', xMm: 6, yMm: 16.5, name: '모델명', type: 'text', field: 'model_name', prefix: 'M/N: ', visible: true, fontFamily: 'A0N', fontSizePt: 25 },
      { id: 'elem_serial_no', xMm: 6, yMm: 21.5, name: '제조번호(시리얼)', type: 'text', field: 'serial_no', prefix: 'S/N: ', visible: true, fontFamily: 'A0N', fontSizePt: 25 },
      { id: 'elem_barcode', xMm: 6, yMm: 27.5, name: '바코드 / QR', type: 'barcode', prefix: '', qrScale: 4, visible: true, heightMm: 6, showText: false, barcodeType: 'CODE39', targetField: 'asset_no' },
      { id: 'elem_divider', xMm: 1.5, yMm: 7, name: '구분선', type: 'line', visible: false, widthMm: 69, thicknessMm: 0.25 },
      { id: 'elem_custom_text_1', xMm: 2, yMm: 2, name: '추가 텍스트 1', type: 'text', field: 'custom_text_1', prefix: '', visible: false, fontFamily: 'A0N', fontSizePt: 14, customValue: '' },
      { id: 'elem_image', xMm: 45, yMm: 2, name: '이미지 / 로고', type: 'image', visible: false, widthMm: 18, heightMm: 12, imageDataUrl: '' }
    ]
  },
  {
    templateId: 'tpl_custom_1786803292244',
    targetTable: 'asset',
    schemaId: 'asset_schema',
    name: 'GK420D-소형(QR)',
    targetPrinterId: 'prn_win_ZDesigner_GK420d_USB001',
    targetPrinterName: 'ZDesigner GK420d [USB (USB001)]',
    isDefault: false,
    isLocked: true,
    paper: {
      dpi: 203,
      widthMm: 30,
      heightMm: 16,
      isLocked: true,
      dotsWidth: 240,
      dotsHeight: 128,
      targetTable: 'asset',
      useLabelHome: false,
      usePrintWidth: false,
      targetPrinterId: 'prn_win_ZDesigner_GK420d_USB001',
      targetPrinterName: 'ZDesigner GK420d [USB (USB001)]'
    },
    elements: [
      { id: 'elem_asset_no', xMm: 6.5, yMm: 12, name: '자산번호', type: 'text', field: 'asset_no', prefix: '', offsetX: 24, visible: true, fontFamily: 'A0N', fontSizePt: 23 },
      { id: 'elem_barcode', xMm: 8, yMm: 2, name: '바코드 / QR', type: 'barcode', prefix: '', offsetX: 25, qrScale: 3, visible: true, heightMm: 5.5, showText: true, barcodeType: 'QR', targetField: 'asset_no' },
      { id: 'elem_divider', xMm: 1.5, yMm: 7, name: '구분선', type: 'line', visible: false, widthMm: 27, thicknessMm: 0.25 },
      { id: 'elem_custom_text_1', xMm: 2, yMm: 2, name: '추가 텍스트 1', type: 'text', field: 'custom_text_1', prefix: '', visible: false, fontFamily: 'A0N', fontSizePt: 14, customValue: '' },
      { id: 'elem_image', xMm: 18, yMm: 2, name: '이미지 / 로고', type: 'image', visible: false, widthMm: 10, heightMm: 10, imageDataUrl: '' }
    ]
  }
];

export const DEFAULT_LABEL_TEMPLATE: LabelTemplatePreset = BUILTIN_LABEL_PRESETS[0];

/**
 * 우리 자산 테이블(db.assets) 필드와 1:1 바인딩되는 신규 라벨 서식 생성기
 */
export function createEmptyTemplate(
  name = '새 라벨 서식',
  targetTable = 'asset',
  widthMm = 72,
  heightMm = 40,
  targetPrinterId = '',
  targetPrinterName = '',
  customFields: LabelSchemaField[] | null = null
): LabelTemplatePreset {
  const dotsWidth = Math.round(widthMm * 8);
  const dotsHeight = Math.round(heightMm * 8);
  const id = `tpl_custom_${Date.now()}`;

  const fields = (customFields && customFields.length > 0) ? customFields : ASSET_TABLE_SCHEMA_FIELDS;

  const dynamicElements: LabelElement[] = fields.map((f, idx) => ({
    id: `elem_${f.id}`,
    name: f.name,
    type: 'text',
    field: f.id,
    prefix: f.isKey ? '자산번호 : ' : `${f.name} : `,
    xMm: 4.0,
    yMm: Math.min(heightMm - 6, 3.5 + (idx * 5.0)),
    offsetX: 0,
    offsetY: 0,
    fontSizePt: f.isKey ? 28 : 24,
    fontFamily: 'A0N',
    visible: idx < 4 // 기본 상위 4개 항목(자산번호, 제품명, 모델명, 제조번호) 표시
  }));

  const barcodeTargetField = fields.find(f => f.isBarcodeTarget || f.isKey)?.id || 'asset_no';

  dynamicElements.push({
    id: 'elem_barcode',
    name: '바코드 / QR',
    type: 'barcode',
    barcodeType: 'CODE128',
    targetField: barcodeTargetField,
    prefix: '',
    xMm: 4.0,
    yMm: Math.min(heightMm - 11, 26.0),
    offsetX: 0,
    offsetY: 0,
    heightMm: 8.0,
    qrScale: 4,
    showText: true,
    visible: true
  });

  dynamicElements.push({
    id: 'elem_divider',
    name: '구분선',
    type: 'line',
    xMm: 1.5,
    yMm: 7.0,
    offsetX: 0,
    offsetY: 0,
    widthMm: Math.max(10, widthMm - 3),
    thicknessMm: 0.25,
    visible: false
  });

  for (let i = 1; i <= 4; i++) {
    dynamicElements.push({
      id: `elem_custom_text_${i}`,
      name: `추가 텍스트 ${i}`,
      type: 'text',
      field: `custom_text_${i}`,
      customValue: '',
      prefix: '',
      xMm: 2.0,
      yMm: Math.min(heightMm - 4, 20.0 + (i * 3.5)),
      offsetX: 0,
      offsetY: 0,
      fontSizePt: 16,
      fontFamily: 'A0N',
      visible: false
    });
  }

  dynamicElements.push({
    id: 'elem_image',
    name: '이미지 / 로고',
    type: 'image',
    imageDataUrl: '',
    widthMm: 18.0,
    heightMm: 12.0,
    xMm: Math.max(10, widthMm - 22.0),
    yMm: 2.0,
    offsetX: 0,
    offsetY: 0,
    visible: false
  });

  return {
    templateId: id,
    targetTable: targetTable || 'asset',
    schemaId: 'asset_schema',
    name,
    targetPrinterId: targetPrinterId || '',
    targetPrinterName: targetPrinterName || '',
    isDefault: false,
    isLocked: false,
    paper: {
      widthMm: Number(widthMm) || 72,
      heightMm: Number(heightMm) || 40,
      dpi: 203,
      dotsWidth,
      dotsHeight,
      targetTable: targetTable || 'asset',
      targetPrinterId: targetPrinterId || '',
      targetPrinterName: targetPrinterName || '',
      isLocked: false
    },
    elements: dynamicElements
  };
}

/**
 * 서식 내에 우리 자산 테이블의 신규 필드가 누락되어 있으면 비노출(visible: false) 상태로 보충하여
 * 사용자가 체크리스트에서 언제든 켜고 끌 수 있도록 보장
 */
export function ensureAssetFieldsInTemplate(tpl: LabelTemplatePreset): LabelTemplatePreset {
  if (!tpl || !Array.isArray(tpl.elements)) return DEFAULT_LABEL_TEMPLATE;
  const existingFields = new Set(tpl.elements.map(e => e.field).filter(Boolean));
  const existingIds = new Set(tpl.elements.map(e => e.id).filter(Boolean));
  const additions: LabelElement[] = [];

  ASSET_TABLE_SCHEMA_FIELDS.forEach((f, idx) => {
    const elemId = `elem_${f.id}`;
    if (!existingFields.has(f.id) && !existingIds.has(elemId)) {
      additions.push({
        id: elemId,
        name: f.name,
        type: 'text',
        field: f.id,
        prefix: `${f.name}: `,
        xMm: 4.0,
        yMm: Math.min((tpl.paper?.heightMm || 40) - 5, 4.0 + (idx * 3.5)),
        offsetX: 0,
        offsetY: 0,
        fontSizePt: 18,
        fontFamily: 'A0N',
        visible: false
      });
    }
  });

  if (!existingIds.has('elem_barcode') && !tpl.elements.some(e => e.type === 'barcode')) {
    additions.push({
      id: 'elem_barcode',
      name: '바코드 / QR',
      type: 'barcode',
      barcodeType: 'CODE128',
      targetField: 'asset_no',
      prefix: '',
      xMm: 4.0,
      yMm: 26.0,
      heightMm: 7.0,
      qrScale: 4,
      showText: true,
      visible: true
    });
  }

  if (!existingIds.has('elem_divider') && !tpl.elements.some(e => e.type === 'line')) {
    additions.push({
      id: 'elem_divider',
      name: '구분선',
      type: 'line',
      xMm: 1.5,
      yMm: 7.0,
      widthMm: Math.max(10, (tpl.paper?.widthMm || 72) - 3),
      thicknessMm: 0.25,
      visible: false
    });
  }

  for (let i = 1; i <= 4; i++) {
    const cid = `elem_custom_text_${i}`;
    if (!existingIds.has(cid)) {
      additions.push({
        id: cid,
        name: `추가 텍스트 ${i}`,
        type: 'text',
        field: `custom_text_${i}`,
        customValue: '',
        prefix: '',
        xMm: 2.0,
        yMm: 20.0 + (i * 3.5),
        fontSizePt: 14,
        fontFamily: 'A0N',
        visible: false
      });
    }
  }

  if (!existingIds.has('elem_image') && !tpl.elements.some(e => e.type === 'image')) {
    additions.push({
      id: 'elem_image',
      name: '이미지 / 로고',
      type: 'image',
      imageDataUrl: '',
      widthMm: 18.0,
      heightMm: 12.0,
      xMm: 45.0,
      yMm: 2.0,
      visible: false
    });
  }

  if (additions.length === 0) return tpl;
  return {
    ...tpl,
    elements: [...tpl.elements, ...additions]
  };
}

/**
 * 전체 프리셋 목록 로드 (로컬 스토리지 캐시 또는 기본 내장 프리셋)
 */
export function getAllPresets(): LabelTemplatePreset[] {
  try {
    const stored = localStorage.getItem(LOCAL_KEY_TEMPLATE_PRESETS);
    if (stored) {
      const list = JSON.parse(stored);
      if (Array.isArray(list) && list.length > 0) {
        return list.map(ensureAssetFieldsInTemplate);
      }
    }
  } catch (e) {}
  return BUILTIN_LABEL_PRESETS.map(ensureAssetFieldsInTemplate);
}

/**
 * 현재 활성 템플릿 로드
 */
export function getStoredLabelTemplate(): LabelTemplatePreset {
  try {
    const activeId = localStorage.getItem(LOCAL_KEY_ACTIVE_TEMPLATE_ID);
    const presets = getAllPresets();
    if (activeId) {
      const found = presets.find(p => p.templateId === activeId);
      if (found) return ensureAssetFieldsInTemplate(found);
    }
    if (presets.length > 0) return ensureAssetFieldsInTemplate(presets[0]);
  } catch (e) {}
  return ensureAssetFieldsInTemplate(DEFAULT_LABEL_TEMPLATE);
}

/**
 * 활성 템플릿 로컬 저장 및 프리셋 목록 갱신
 */
export function saveStoredLabelTemplate(template: LabelTemplatePreset): boolean {
  try {
    const presets = getAllPresets();
    const idx = presets.findIndex(p => p.templateId === template.templateId);
    let updatedPresets: LabelTemplatePreset[];
    if (idx >= 0) {
      updatedPresets = [...presets];
      updatedPresets[idx] = template;
    } else {
      updatedPresets = [...presets, template];
    }
    localStorage.setItem(LOCAL_KEY_TEMPLATE_PRESETS, JSON.stringify(updatedPresets));
    localStorage.setItem(LOCAL_KEY_ACTIVE_TEMPLATE_ID, template.templateId);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 템플릿 삭제 및 로컬/백엔드 동기화
 */
export async function deleteStoredLabelTemplate(templateId: string): Promise<boolean> {
  try {
    const presets = getAllPresets();
    const updatedPresets = presets.filter(p => p.templateId !== templateId);
    localStorage.setItem(LOCAL_KEY_TEMPLATE_PRESETS, JSON.stringify(updatedPresets));

    const activeId = localStorage.getItem(LOCAL_KEY_ACTIVE_TEMPLATE_ID);
    if (activeId === templateId) {
      const nextId = updatedPresets[0]?.templateId || DEFAULT_LABEL_TEMPLATE.templateId;
      localStorage.setItem(LOCAL_KEY_ACTIVE_TEMPLATE_ID, nextId);
    }

    if (supabase) {
      await supabase.from('label_templates').delete().eq('id', templateId);
    }
    return true;
  } catch (e) {
    console.warn('템플릿 삭제 실패:', e);
    return false;
  }
}

/**
 * Supabase 백엔드(label_templates)에서 전체 라벨 서식 목록 조회 및 동기화
 */
export async function syncTemplatesWithBackend(): Promise<LabelTemplatePreset[]> {
  if (!supabase) return getAllPresets();

  try {
    const { data, error } = await supabase
      .from('label_templates')
      .select('*')
      .order('created_at', { ascending: true });

    if (!error && Array.isArray(data) && data.length > 0) {
      const backendPresets: LabelTemplatePreset[] = data.map((row: any) => {
        const prnId = row.paper?.targetPrinterId || row.target_printer_id || '';
        const prnName = row.paper?.targetPrinterName || row.target_printer_name || '';
        const targetTbl = row.paper?.targetTable || row.target_table || 'asset';
        const isLocked = Boolean(row.is_locked || row.paper?.isLocked);
        const paperObj: LabelPaperConfig = {
          ...(row.paper || { widthMm: 72, heightMm: 40, dpi: 203, dotsWidth: 576, dotsHeight: 320 }),
          targetTable: targetTbl,
          targetPrinterId: prnId,
          targetPrinterName: prnName,
          isLocked
        };

        return ensureAssetFieldsInTemplate({
          templateId: row.id,
          targetTable: targetTbl,
          schemaId: row.schema_id || 'asset_schema',
          name: row.name,
          targetPrinterId: prnId,
          targetPrinterName: prnName,
          isDefault: Boolean(row.is_default),
          isLocked,
          paper: paperObj,
          elements: Array.isArray(row.elements) ? row.elements : []
        });
      });

      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(LOCAL_KEY_TEMPLATE_PRESETS, JSON.stringify(backendPresets));
      }
      return backendPresets;
    }
  } catch (err) {
    console.warn('서버 라벨 서식 조회 실패 (로컬 캐시 유지):', err);
  }

  return getAllPresets();
}

/**
 * Supabase 백엔드에 라벨 서식 저장 (온라인 DB + 로컬 동시 보존)
 */
export async function saveBackendLabelTemplate(
  template: LabelTemplatePreset
): Promise<{ success: boolean; message: string }> {
  const targetPrinterId = template.targetPrinterId || template.paper?.targetPrinterId || '';
  const targetPrinterName = template.targetPrinterName || template.paper?.targetPrinterName || '';
  const targetTable = template.targetTable || template.paper?.targetTable || 'asset';
  const isLocked = Boolean(template.isLocked ?? template.paper?.isLocked);

  const normalized: LabelTemplatePreset = {
    ...template,
    targetTable,
    targetPrinterId,
    targetPrinterName,
    isLocked,
    paper: {
      ...(template.paper || { widthMm: 72, heightMm: 40, dpi: 203, dotsWidth: 576, dotsHeight: 320 }),
      targetTable,
      targetPrinterId,
      targetPrinterName,
      isLocked
    }
  };

  saveStoredLabelTemplate(normalized);
  if (!supabase) return { success: true, message: '로컬 서식 저장 완료' };

  try {
    const payload = {
      id: normalized.templateId || `tpl_custom_${Date.now()}`,
      schema_id: 'asset_schema',
      target_table: targetTable,
      name: normalized.name || '라벨 서식',
      paper: normalized.paper,
      elements: Array.isArray(normalized.elements) ? normalized.elements : [],
      target_printer_id: targetPrinterId,
      target_printer_name: targetPrinterName,
      is_default: Boolean(normalized.isDefault),
      is_locked: isLocked,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('label_templates').upsert(payload, { onConflict: 'id' });
    if (error) throw error;
    return { success: true, message: 'DB 서식 저장 완료' };
  } catch (err: any) {
    console.error('백엔드 라벨 서식 저장 오류:', err);
    return { success: false, message: `DB 저장 오류: ${err.message || String(err)}` };
  }
}

/**
 * 템플릿 확정 잠금(Lock) / 해제(Unlock) 토글 및 즉시 동기화
 */
export async function updatePresetLock(
  templateId: string,
  isLocked: boolean
): Promise<{ success: boolean; isLocked?: boolean }> {
  try {
    const presets = getAllPresets();
    const idx = presets.findIndex(p => p.templateId === templateId);
    if (idx >= 0) {
      presets[idx].isLocked = Boolean(isLocked);
      if (!presets[idx].paper) {
        presets[idx].paper = { widthMm: 72, heightMm: 40, dpi: 203, dotsWidth: 576, dotsHeight: 320 };
      }
      presets[idx].paper.isLocked = Boolean(isLocked);
      localStorage.setItem(LOCAL_KEY_TEMPLATE_PRESETS, JSON.stringify(presets));

      if (supabase) {
        await supabase.from('label_templates').update({
          paper: presets[idx].paper,
          is_locked: Boolean(isLocked),
          updated_at: new Date().toISOString()
        }).eq('id', templateId);
      }
      return { success: true, isLocked: Boolean(isLocked) };
    }
  } catch (e) {
    console.warn('템플릿 잠금 상태 변경 실패:', e);
  }
  return { success: false };
}

/**
 * mm -> ZPL Dot 변환 (203 DPI 기준 1mm ≈ 8 dots)
 */
export function mmToDots(mm: number, dpi = 203): number {
  return Math.round(Number(mm || 0) * (dpi / 25.4));
}

/**
 * 정통 네이티브 한글 ZPL II 생성 엔진
 * - Zebra GK-420D / ZD-420D / ZT-411 한글 폰트 지원 (^SEE:UHANGUL.DAT^FS^CW1,E:KFONT3.FNT^CI26^FS)
 * - 요소별 X/Y 좌표(mm) + 인쇄 미세 보정값(offsetX, offsetY) 정밀 합산
 */
export function generateDynamicZpl(
  rawItem: Record<string, any> = {},
  template: LabelTemplatePreset = DEFAULT_LABEL_TEMPLATE,
  products: Product[] = []
): string {
  const t = template || DEFAULT_LABEL_TEMPLATE;
  const paper = t.paper || DEFAULT_LABEL_TEMPLATE.paper;
  const dpi = paper.dpi || 203;
  const item = normalizeAssetForLabel(rawItem, products);

  const getValue = (elem: Partial<LabelElement>): string => {
    if (!elem) return '';
    if (elem.field === 'custom' || elem.field?.startsWith('custom_text_')) {
      return elem.customValue || '';
    }
    const fieldKey = elem.field || '';
    const raw = item[fieldKey] ?? item.data?.[fieldKey] ?? (elem.id ? item[elem.id] : undefined);
    if (raw !== undefined && raw !== null && raw !== '') return String(raw);
    if (fieldKey === 'asset_no' || fieldKey === 'assetNo') return String(item.assetNo || item.asset_no || 'TEST0001');
    if (fieldKey === 'serial_no' || fieldKey === 'serialNo') return String(item.serialNo || item.serial_no || '-');
    if (fieldKey === 'model_name' || fieldKey === 'modelName') return String(item.modelName || item.model_name || '-');
    if (fieldKey === 'product_name' || fieldKey === 'productName') return String(item.productName || item.product_name || '-');
    return '';
  };

  const hasKorean = (str: string) => /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(str);

  const containsKorean = (t.elements || []).some(elem => {
    if (!elem.visible || elem.type !== 'text') return false;
    const text = `${elem.prefix || ''}${getValue(elem)}`;
    return hasKorean(text);
  });

  const zplCommands: string[] = [
    containsKorean
      ? '^XA^MD21^BY2,2.0^FS^SEE:UHANGUL.DAT^FS^CW1,E:KFONT3.FNT^CI26^FS'
      : '^XA^MD21'
  ];

  const widthMm = Number(t.paper?.widthMm) || 72;
  const dotsPerMm = dpi / 25.4;

  // [옵션 1] ^LH (라벨 원점 설정)
  if (t.paper?.useLabelHome) {
    let homeXDots = 0;
    if (typeof t.paper?.customHomeX === 'number' && !isNaN(t.paper.customHomeX)) {
      homeXDots = Math.round(t.paper.customHomeX * dotsPerMm);
    } else if (widthMm < 104) {
      homeXDots = Math.max(0, Math.round(((104.0 - widthMm) / 2.0) * dotsPerMm));
    }
    const homeYDots = Math.max(0, Math.round((Number(t.paper?.customHomeY) || 0) * dotsPerMm));
    zplCommands.push(`^LH${homeXDots},${homeYDots}`);
  }

  // [옵션 2] ^PW (인쇄폭 선언)
  if (t.paper?.usePrintWidth) {
    const printWidthDots = Math.round(widthMm * dotsPerMm);
    zplCommands.push(`^PW${printWidthDots}`);
  }

  (t.elements || []).forEach(elem => {
    if (!elem.visible) return;

    const finalXMm = Math.max(0, (Number(elem.xMm) || 0) + (Number(elem.offsetX) || 0));
    const finalYMm = Math.max(0, (Number(elem.yMm) || 0) + (Number(elem.offsetY) || 0));

    const posX = mmToDots(finalXMm, dpi);
    const posY = mmToDots(finalYMm, dpi);

    if (elem.type === 'text') {
      const val = getValue(elem);
      const prefix = elem.prefix || '';
      const text = `${prefix}${val}`;
      const fontH = Math.max(10, Math.min(120, Math.round(elem.fontSizePt || 25)));
      const fontW = fontH;

      const fontCmd = hasKorean(text) ? `^A1N,${fontH},${fontW}` : `^A0N,${fontH},${fontW}`;
      zplCommands.push(`^FO${posX},${posY}${fontCmd}^FD${text}^FS`);
    } else if (elem.type === 'line') {
      const lineW = mmToDots(elem.widthMm || 60, dpi);
      const lineThick = Math.max(1, mmToDots(elem.thicknessMm || 0.25, dpi));
      zplCommands.push(`^FO${posX},${posY}^GB${lineW},${lineThick},${lineThick}^FS`);
    } else if (elem.type === 'image') {
      const imgW = mmToDots(elem.widthMm || 20, dpi);
      const imgH = mmToDots(elem.heightMm || 10, dpi);
      if (elem.zplGf) {
        zplCommands.push(`^FO${posX},${posY}${elem.zplGf}^FS`);
      } else {
        zplCommands.push(`^FO${posX},${posY}^GB${imgW},${imgH},1^FS`);
      }
    } else if (elem.type === 'barcode') {
      const targetField = elem.targetField || 'asset_no';
      const targetVal = String(getValue({ field: targetField }) || item[targetField] || item.asset_no || 'TEST0001');
      const showTextParam = elem.showText ? 'Y' : 'N';
      const barcodeType = elem.barcodeType || 'CODE128';

      if (barcodeType === 'QR') {
        const qrMag = Math.max(1, Math.min(10, elem.qrScale || 3));
        zplCommands.push(`^FO${posX},${posY}^BQN,2,${qrMag}^FDLA,${targetVal}^FS`);
      } else {
        const barHeightDots = mmToDots(elem.heightMm || 10, dpi);
        zplCommands.push(`^FO${posX},${posY}^BCN,${barHeightDots},${showTextParam}^FD${targetVal}^FS`);
      }
    }
  });

  zplCommands.push('^XZ');
  return zplCommands.join('\n');
}

/**
 * ImageDataUrl (Base64)을 ZPL II ^GF (Graphic Field) 16진수 비트맵 명령어로 정밀 변환
 */
export async function convertImageToZplGf(
  imageDataUrl: string,
  widthDots: number,
  heightDots: number,
  threshold = 128
): Promise<string | null> {
  if (!imageDataUrl || widthDots <= 0 || heightDots <= 0) return null;

  return new Promise(resolve => {
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = widthDots;
          canvas.height = heightDots;
          const ctx = canvas.getContext('2d', { willReadFrequently: true });
          if (!ctx) return resolve(null);

          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, widthDots, heightDots);
          ctx.drawImage(img, 0, 0, widthDots, heightDots);

          const imgData = ctx.getImageData(0, 0, widthDots, heightDots);
          const pixels = imgData.data;

          const bytesPerRow = Math.ceil(widthDots / 8);
          const totalBytes = bytesPerRow * heightDots;
          let hexData = '';

          for (let y = 0; y < heightDots; y++) {
            let byteVal = 0;
            let bitCount = 0;

            for (let x = 0; x < widthDots; x++) {
              const idx = (y * widthDots + x) * 4;
              const r = pixels[idx];
              const g = pixels[idx + 1];
              const b = pixels[idx + 2];
              const a = pixels[idx + 3];

              const luminance = (0.299 * r) + (0.587 * g) + (0.114 * b);
              const isBlack = (a > 64 && luminance < threshold) ? 1 : 0;

              byteVal = (byteVal << 1) | isBlack;
              bitCount++;

              if (bitCount === 8) {
                hexData += byteVal.toString(16).padStart(2, '0').toUpperCase();
                byteVal = 0;
                bitCount = 0;
              }
            }

            if (bitCount > 0) {
              byteVal = byteVal << (8 - bitCount);
              hexData += byteVal.toString(16).padStart(2, '0').toUpperCase();
            }
          }

          resolve(`^GFA,${totalBytes},${totalBytes},${bytesPerRow},${hexData}`);
        } catch (e) {
          console.warn('Canvas 이미지 ZPL 변환 오류:', e);
          resolve(null);
        }
      };
      img.onerror = () => resolve(null);
      img.src = imageDataUrl;
    } else {
      resolve(null);
    }
  });
}

/**
 * 이미지 요소를 포함한 비동기 ZPL 생성 엔진
 */
export async function generateDynamicZplAsync(
  item: Record<string, any> = {},
  template: LabelTemplatePreset = DEFAULT_LABEL_TEMPLATE,
  products: Product[] = []
): Promise<string> {
  if (!template || !Array.isArray(template.elements)) return '';

  const dpi = template.paper?.dpi || 203;

  for (const elem of template.elements) {
    if (elem.type === 'image' && elem.visible && elem.imageDataUrl && !elem.zplGf) {
      const imgW = mmToDots(elem.widthMm || 20, dpi);
      const imgH = mmToDots(elem.heightMm || 10, dpi);
      elem.zplGf = await convertImageToZplGf(elem.imageDataUrl, imgW, imgH);
    }
  }

  return generateDynamicZpl(item, template, products);
}

export async function generateWysiwygZpl(
  item: Record<string, any> = {},
  template: LabelTemplatePreset = DEFAULT_LABEL_TEMPLATE,
  products: Product[] = []
): Promise<string> {
  return generateDynamicZplAsync(item, template, products);
}

/**
 * 1:1 실물 규격 HTML 라벨 문서 생성기 (로컬 에이전트 HTML 인쇄 및 브라우저 직접 인쇄용)
 */
export function generateLabelPrintHtml(
  items: Record<string, any>[],
  template: LabelTemplatePreset = DEFAULT_LABEL_TEMPLATE,
  products: Product[] = [],
  copiesPerItem = 1
): string {
  const t = template || DEFAULT_LABEL_TEMPLATE;
  const widthMm = Number(t.paper?.widthMm) || 72;
  const heightMm = Number(t.paper?.heightMm) || 40;
  const PX_PER_MM = 3.78;
  const copies = Math.max(1, Number(copiesPerItem) || 1);

  const pagesHtml: string[] = [];

  for (const rawItem of items) {
    const data = normalizeAssetForLabel(rawItem, products);

    for (let c = 0; c < copies; c++) {
      let elementsHtml = '';

      for (const elem of t.elements || []) {
        if (!elem.visible) continue;

        const finalXMm = Math.max(0, (Number(elem.xMm) || 0) + (Number(elem.offsetX) || 0));
        const finalYMm = Math.max(0, (Number(elem.yMm) || 0) + (Number(elem.offsetY) || 0));
        const leftPx = (finalXMm * PX_PER_MM).toFixed(1);
        const topPx = (finalYMm * PX_PER_MM).toFixed(1);

        if (elem.type === 'text') {
          let val = '';
          if (elem.field === 'custom' || elem.field?.startsWith('custom_text_')) {
            val = elem.customValue || '';
          } else if (elem.field) {
            val = String(data[elem.field] ?? '');
          }
          const displayVal = `${elem.prefix || ''}${val}`;
          const fontSizePx = ((elem.fontSizePt || 25) * (PX_PER_MM / 8.0)).toFixed(1);
          const fontFam = elem.fontFamily === 'A0N' ? "'Malgun Gothic', monospace, sans-serif" : "'Malgun Gothic', sans-serif";
          elementsHtml += `<div style="position:absolute;left:${leftPx}px;top:${topPx}px;font-size:${fontSizePx}px;font-weight:700;font-family:${fontFam};white-space:nowrap;line-height:1.1;color:#000;">${displayVal}</div>`;
        } else if (elem.type === 'line') {
          const wPx = ((elem.widthMm || 65) * PX_PER_MM).toFixed(1);
          const hPx = Math.max(1, (elem.thicknessMm || 0.25) * PX_PER_MM).toFixed(1);
          elementsHtml += `<div style="position:absolute;left:${leftPx}px;top:${topPx}px;width:${wPx}px;height:${hPx}px;background:#000;"></div>`;
        } else if (elem.type === 'image' && elem.imageDataUrl) {
          const wPx = ((elem.widthMm || 18) * PX_PER_MM).toFixed(1);
          const hPx = ((elem.heightMm || 12) * PX_PER_MM).toFixed(1);
          elementsHtml += `<img src="${elem.imageDataUrl}" style="position:absolute;left:${leftPx}px;top:${topPx}px;width:${wPx}px;height:${hPx}px;object-fit:fill;" />`;
        } else if (elem.type === 'barcode') {
          const targetField = elem.targetField || 'asset_no';
          const bcVal = String(data[targetField] || data.asset_no || 'TEST0001');
          const heightPx = (elem.heightMm || 10) * PX_PER_MM;
          const qrScale = Math.max(1, Math.min(10, Number(elem.qrScale) || 3));
          const qrSizeMm = (qrScale * 25.0) / 8.0;
          const qrSizePx = qrSizeMm * PX_PER_MM;

          const svgHtml = generateBarcodeSvgMarkup({
            value: bcVal,
            type: elem.barcodeType || 'CODE128',
            heightPx,
            qrSizePx,
            showText: elem.showText !== false,
            scale: PX_PER_MM / 9.0,
            prefix: elem.prefix || ''
          });
          elementsHtml += `<div style="position:absolute;left:${leftPx}px;top:${topPx}px;">${svgHtml}</div>`;
        }
      }

      const wPx = Math.round(widthMm * PX_PER_MM);
      const hPx = Math.round(heightMm * PX_PER_MM);
      pagesHtml.push(`
        <div class="label-page" style="width:${wPx}px;height:${hPx}px;position:relative;overflow:hidden;background:#ffffff;color:#000000;page-break-after:always;box-sizing:border-box;">
          ${elementsHtml}
        </div>
      `);
    }
  }

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <title>자산 라벨 인쇄</title>
  <style>
    @page { size: ${widthMm}mm ${heightMm}mm; margin: 0; }
    * { box-sizing: border-box; -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
    html, body { margin: 0; padding: 0; background: #ffffff; color: #000000; }
    .label-page:last-child { page-break-after: auto; }
  </style>
</head>
<body>
  ${pagesHtml.join('\n')}
</body>
</html>`;
}
