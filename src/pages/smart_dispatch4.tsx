// src/pages/smart_dispatch4.tsx
// ─────────────────────────────────────────────────────────────────────────────
// 출고 요청 (Outbound Request) — IT 렌탈 전사 표준 단일 스튜디오
// ─────────────────────────────────────────────────────────────────────────────
// [전사 표준 헌장 준수]
// 1. 카톡 자연어/음성 파싱 전면 배제: 순수 비즈니스 직관 입력 체계로 전면 재설계
// 2. 좌우 분할 배제 & 단일 컬럼 Z-구텐버그 동선 엄격 이행 (헌장 3.5, 3.6)
//    - ① 좌상단 Scope: 고객 검색 ➔ 고객 선택 ➔ 설치장소(CustomerSite) ➔ 담당자 선택
//    - ② 중앙 본문 Body: 요청 출고 모델, 수량, 단가(월/일) 입력 및 스펙조정(VGA, RAM, SSD)
//    - ③ SW 설치 요구사항: OS 선택, 필수 소프트웨어 다중 선택, 계정/도메인 세팅
//    - ④ 출고 배송 일시 & 물류: 요청 일자/시간대, 배송 수단, 현장 인프라 메모
//    - ⑤ 우하단 Terminal Action: 총액 요약 및 [출고 요청 저장] 완결 버튼 (헌장 5.2 DB 무누락 보존)
// 3. 건조한 전문 명사·동사 UI 단일 표준화 (헌장 3.1)
// 4. 셀/레이블 줄바꿈 방지 및 상하 세로 스택 구조 (헌장 3.2, 3.4)
// 5. 하단 최근 출고 요청 대장 즉시 연동
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import {
  db,
  Customer,
  CustomerSite,
  CustomerContact,
  Product,
  Delivery,
  ITDeliveryMethod,
  IT_DELIVERY_METHODS,
  IT_DELIVERY_METHOD_LABELS,
  ProductCategory
} from '../services/db';
import { matchHangul } from '../utils/hangulSearch';
import {
  Building2,
  MapPin,
  User,
  Package,
  Calendar,
  Clock,
  Truck,
  Plus,
  Trash2,
  Save,
  RotateCcw,
  Check,
  AlertCircle,
  Search,
  Laptop,
  Monitor,
  Server,
  HardDrive,
  Cpu,
  Layers,
  FileText,
  Info,
  ChevronDown,
  ChevronUp,
  X,
  Phone,
  Mail,
  ShieldCheck,
  ExternalLink,
  Eye
} from 'lucide-react';
import './smart_dispatch4.css';

// ─────────────────────────────────────────────────────────────────────────────
// 상수 및 프리셋 옵션 정의
// ─────────────────────────────────────────────────────────────────────────────

export const VGA_OPTIONS = [
  '내장 그래픽 (기본)',
  'GTX 1650 4GB',
  'RTX 3060 12GB',
  'RTX 4060 8GB',
  'RTX 4070 12GB',
  'RTX 4080 16GB',
  'RTX 4090 24GB',
  'RTX A4000 16GB (워크스테이션)',
  'RTX A6000 48GB (AI/딥러닝)',
  '직접 입력'
];

export const RAM_OPTIONS = [
  '기본 사양',
  '16GB (8GB x 2)',
  '32GB (16GB x 2)',
  '64GB (32GB x 2)',
  '128GB (32GB x 4)',
  '256GB (64GB x 4)',
  '직접 입력'
];

export const SSD_OPTIONS = [
  '기본 사양',
  '512GB NVMe M.2',
  '1TB NVMe M.2',
  '2TB NVMe M.2',
  '4TB NVMe M.2',
  '추가 1TB HDD',
  '추가 2TB HDD',
  '직접 입력'
];

export const OS_OPTIONS = [
  'Windows 11 Pro (기본 권장)',
  'Windows 10 Pro',
  'Windows Server 2022',
  'Ubuntu 24.04 LTS',
  'CentOS / Rocky Linux',
  'FreeDOS (OS 미설치)',
  '직접 입력'
];

export const SW_PRESETS = [
  { id: 'office', name: 'MS Office (Excel/Word/PPT)' },
  { id: 'hwp', name: '한컴오피스 (한글)' },
  { id: 'v3', name: '안랩 V3 / 기업 백신' },
  { id: 'pdf', name: 'Adobe Acrobat Reader' },
  { id: 'adobe_cc', name: 'Adobe Creative Cloud' },
  { id: 'vscode', name: 'Visual Studio Code / 개발툴' },
  { id: 'browser', name: 'Chrome / Edge 최신' },
  { id: 'erp', name: '사내 ERP / 보안 에이전트' },
  { id: 'messenger', name: '카카오톡 / 사내 메신저' },
  { id: 'zip', name: '알집 / 압축 유틸리티' }
];

export interface OutboundLineItem {
  id: string;
  productId: string;
  modelName: string;
  category: string;
  qty: number;
  monthlyRate: number;
  dailyRate: number;
  // 스펙 조정사항
  vga: string;
  vgaCustom?: string;
  ram: string;
  ramCustom?: string;
  ssd: string;
  ssdCustom?: string;
  customSpecNote: string;
  // SW 요구사항 (품목별)
  os: string;
  osCustom?: string;
  swList: string[];
  customSwNote: string;
}

const createDefaultLineItem = (seq = 1): OutboundLineItem => ({
  id: `item-${Date.now()}-${seq}`,
  productId: '',
  modelName: '',
  category: 'LAPTOP',
  qty: 1,
  monthlyRate: 0,
  dailyRate: 0,
  vga: '내장 그래픽 (기본)',
  ram: '기본 사양',
  ssd: '기본 사양',
  customSpecNote: '',
  os: 'Windows 11 Pro (기본 권장)',
  swList: ['MS Office (Excel/Word/PPT)', '한컴오피스 (한글)', '안랩 V3 / 기업 백신', 'Chrome / Edge 최신'],
  customSwNote: ''
});

// ─────────────────────────────────────────────────────────────────────────────
// 메인 컴포넌트: SmartDispatch4
// ─────────────────────────────────────────────────────────────────────────────

export const SmartDispatch4: React.FC = () => {
  const {
    customers,
    sites,
    contacts,
    products,
    contracts,
    deliveries,
    saveSmartDispatch,
    showErrorModal,
    currentUser,
    hasPermission
  } = useApp();

  const canSave = hasPermission('smart_dispatch', 'save') || hasPermission('delivery', 'save') || hasPermission('smart_dispatch4', 'save');

  // ── [Step 1: 고객 / 설치처 / 담당자 상태] ──
  const [customerSearchQuery, setCustomerSearchQuery] = useState('');
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');

  const [selectedSiteId, setSelectedSiteId] = useState<string>('');
  const [isNewSiteMode, setIsNewSiteMode] = useState(false);
  const [newSiteName, setNewSiteName] = useState('');
  const [newSiteAddress, setNewSiteAddress] = useState('');
  const [newSiteAddressDetail, setNewSiteAddressDetail] = useState('');
  const [newSiteHasFreightElevator, setNewSiteHasFreightElevator] = useState(true);
  const [newSiteRequiresSecurityPass, setNewSiteRequiresSecurityPass] = useState(false);

  const [selectedContactId, setSelectedContactId] = useState<string>('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPosition, setContactPosition] = useState('');

  // ── [Step 2: 요청 출고 모델 및 하드웨어/SW 스펙 조정] ──
  const [lineItems, setLineItems] = useState<OutboundLineItem[]>([createDefaultLineItem(1)]);

  // ── [Step 3: 출고 배송 요청 일시 및 물류] ──
  const tomorrowStr = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return d.toISOString().slice(0, 10);
  }, []);

  const [scheduledDate, setScheduledDate] = useState(tomorrowStr);
  const [timeSlot, setTimeSlot] = useState<'MORNING' | 'AFTERNOON' | 'EXACT' | 'ASAP'>('MORNING');
  const [exactTime, setExactTime] = useState('10:00');
  const [deliveryMethod, setDeliveryMethod] = useState<ITDeliveryMethod>('DIRECT_INSTALL');
  const [deliveryNotes, setDeliveryNotes] = useState('');
  const [orderMemo, setOrderMemo] = useState('');

  // ── 처리 상태 ──
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitProgress, setSubmitProgress] = useState<{ log: string; pct: number } | null>(null);
  const [successResultModal, setSuccessResultModal] = useState<{ isOpen: boolean; title: string; message: string } | null>(null);
  const [detailModalDelivery, setDetailModalDelivery] = useState<Delivery | null>(null);

  // ── 파생 데이터: 선택된 고객사 ──
  const selectedCustomer = useMemo(() => {
    return customers.find(c => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  // 검색된 고객사 목록
  const filteredCustomers = useMemo(() => {
    const q = customerSearchQuery.trim();
    if (!q) return customers.slice(0, 30);
    return customers.filter(c =>
      matchHangul(c.name, q) ||
      (c.bizRegNo && c.bizRegNo.includes(q)) ||
      (c.representative && matchHangul(c.representative, q))
    ).slice(0, 30);
  }, [customers, customerSearchQuery]);

  // 선택 고객사의 소속 설치장소 목록
  const customerSites = useMemo(() => {
    if (!selectedCustomerId) return [];
    return sites.filter(s => s.customerId === selectedCustomerId && s.isActive !== false);
  }, [sites, selectedCustomerId]);

  // 선택 고객사의 등록 담당자 목록
  const customerContacts = useMemo(() => {
    if (!selectedCustomerId) return [];
    return contacts.filter(c => c.customerId === selectedCustomerId && c.isActive !== false);
  }, [contacts, selectedCustomerId]);

  // 선택된 설치장소 객체
  const selectedSite = useMemo(() => {
    return customerSites.find(s => s.id === selectedSiteId) || null;
  }, [customerSites, selectedSiteId]);

  // ── 고객사 선택 시 자동 동기화 ──
  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setCustomerSearchQuery(customer.name);
    setIsCustomerDropdownOpen(false);

    // 해당 고객사의 첫 번째 설치처 자동 선택
    const relatedSites = sites.filter(s => s.customerId === customer.id && s.isActive !== false);
    if (relatedSites.length > 0) {
      const firstSite = relatedSites[0];
      setSelectedSiteId(firstSite.id);
      setIsNewSiteMode(false);
      setNewSiteName(firstSite.name);
      setNewSiteAddress(firstSite.address || '');
      setNewSiteAddressDetail(firstSite.addressDetail || '');
      setNewSiteHasFreightElevator(firstSite.hasFreightElevator ?? true);
      setNewSiteRequiresSecurityPass(firstSite.requiresSecurityPass ?? false);
    } else {
      setSelectedSiteId('NEW');
      setIsNewSiteMode(true);
      setNewSiteName(`${customer.name} 본사`);
      setNewSiteAddress(customer.address || '');
      setNewSiteAddressDetail('');
      setNewSiteHasFreightElevator(true);
      setNewSiteRequiresSecurityPass(false);
    }

    // 해당 고객사의 첫 번째 담당자 자동 선택
    const relatedContacts = contacts.filter(c => c.customerId === customer.id && c.isActive !== false);
    if (relatedContacts.length > 0) {
      const firstContact = relatedContacts[0];
      setSelectedContactId(firstContact.id);
      setContactName(firstContact.name || '');
      setContactPhone(firstContact.contact || '');
      setContactEmail(firstContact.email || '');
      setContactPosition(firstContact.position || '담당자');
    } else {
      setSelectedContactId('');
      setContactName(customer.representative || '');
      setContactPhone(customer.repContact || '');
      setContactEmail(customer.repEmail || '');
      setContactPosition('대표');
    }
  };

  // ── 설치처 변경 핸들러 ──
  const handleSelectSite = (siteId: string) => {
    setSelectedSiteId(siteId);
    if (siteId === 'NEW') {
      setIsNewSiteMode(true);
      setNewSiteName('');
      setNewSiteAddress('');
      setNewSiteAddressDetail('');
      setNewSiteHasFreightElevator(true);
      setNewSiteRequiresSecurityPass(false);
    } else {
      setIsNewSiteMode(false);
      const st = customerSites.find(s => s.id === siteId);
      if (st) {
        setNewSiteName(st.name);
        setNewSiteAddress(st.address || '');
        setNewSiteAddressDetail(st.addressDetail || '');
        setNewSiteHasFreightElevator(st.hasFreightElevator ?? true);
        setNewSiteRequiresSecurityPass(st.requiresSecurityPass ?? false);
        if (st.contactName && !contactName) setContactName(st.contactName);
        if (st.contact && !contactPhone) setContactPhone(st.contact);
      }
    }
  };

  // ── 담당자 변경 핸들러 ──
  const handleSelectContact = (contactId: string) => {
    setSelectedContactId(contactId);
    if (contactId === 'NEW') {
      setContactName('');
      setContactPhone('');
      setContactEmail('');
      setContactPosition('현장담당자');
    } else {
      const ct = customerContacts.find(c => c.id === contactId);
      if (ct) {
        setContactName(ct.name || '');
        setContactPhone(ct.contact || '');
        setContactEmail(ct.email || '');
        setContactPosition(ct.position || '담당자');
      }
    }
  };

  // ── 모델 선택 시 기본 스펙 및 단가 자동 매핑 ──
  const handleSelectProduct = (index: number, productModelName: string) => {
    const prod = products.find(p => p.modelName === productModelName);
    setLineItems(prev => {
      const next = [...prev];
      const target = { ...next[index] };
      target.modelName = productModelName;
      target.productId = prod?.id || '';
      target.category = prod?.category || 'LAPTOP';

      // 기본 스펙 제원 파싱 및 반영
      if (prod) {
        if (prod.defaultGpu) target.vga = prod.defaultGpu;
        if (prod.baseRam) target.ram = prod.baseRam;
        if (prod.baseStorage) target.ssd = prod.baseStorage;
        if (prod.defaultOs) target.os = prod.defaultOs;
      }

      // 카테고리별 표준 기본 월단가 기본 제안
      const cat = prod?.category || 'LAPTOP';
      let defaultMonthly = 50000;
      if (cat === 'SERVER') defaultMonthly = 350000;
      else if (cat === 'DESKTOP') defaultMonthly = 60000;
      else if (cat === 'LAPTOP') defaultMonthly = 70000;
      else if (cat === 'MONITOR') defaultMonthly = 20000;
      else if (cat === 'PRINTER') defaultMonthly = 120000;

      // 고객사의 이전 계약 단가 자동 승계 확인 (헌장 2.2)
      if (selectedCustomer) {
        const custContractIds = contracts.filter(c => c.customerId === selectedCustomer.id).map(c => c.id);
        const pastCA = db.contractAssets
          .filter(ca => custContractIds.includes(ca.contractId) && ca.expectedModel === productModelName && ca.monthlyRentalFee > 0)
          .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))[0];
        if (pastCA) {
          defaultMonthly = pastCA.monthlyRentalFee;
        }
      }

      target.monthlyRate = defaultMonthly;
      target.dailyRate = Math.round(defaultMonthly / 30);

      next[index] = target;
      return next;
    });
  };

  // ── 품목 추가 / 삭제 ──
  const handleAddLineItem = () => {
    setLineItems(prev => [...prev, createDefaultLineItem(prev.length + 1)]);
  };

  const handleRemoveLineItem = (index: number) => {
    if (lineItems.length <= 1) return;
    setLineItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleUpdateItemField = <K extends keyof OutboundLineItem>(
    index: number,
    field: K,
    value: OutboundLineItem[K]
  ) => {
    setLineItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // ── SW 프리셋 토글 ──
  const handleToggleSw = (index: number, swName: string) => {
    setLineItems(prev => {
      const next = [...prev];
      const target = { ...next[index] };
      const set = new Set(target.swList);
      if (set.has(swName)) set.delete(swName);
      else set.add(swName);
      target.swList = Array.from(set);
      next[index] = target;
      return next;
    });
  };

  // ── 폼 전체 초기화 ──
  const handleResetForm = () => {
    if (!window.confirm('입력 중인 출고 요청 서식을 모두 초기화하시겠습니까?')) return;
    setSelectedCustomerId('');
    setCustomerSearchQuery('');
    setSelectedSiteId('');
    setIsNewSiteMode(false);
    setNewSiteName('');
    setNewSiteAddress('');
    setNewSiteAddressDetail('');
    setSelectedContactId('');
    setContactName('');
    setContactPhone('');
    setContactEmail('');
    setContactPosition('');
    setLineItems([createDefaultLineItem(1)]);
    setScheduledDate(tomorrowStr);
    setTimeSlot('MORNING');
    setExactTime('10:00');
    setDeliveryMethod('DIRECT_INSTALL');
    setDeliveryNotes('');
    setOrderMemo('');
  };

  // ── 요약 통계 계산 (Terminal Bar) ──
  const totalItemCount = lineItems.length;
  const totalUnits = useMemo(() => {
    return lineItems.reduce((acc, it) => acc + (Number(it.qty) || 0), 0);
  }, [lineItems]);

  const totalMonthlyFee = useMemo(() => {
    return lineItems.reduce((acc, it) => acc + ((Number(it.qty) || 0) * (Number(it.monthlyRate) || 0)), 0);
  }, [lineItems]);

  const totalVat = Math.round(totalMonthlyFee * 0.1);
  const totalWithVat = totalMonthlyFee + totalVat;

  // ── 출고 요청 저장 실행 (Terminal Action) ──
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    // 1. 유효성 검증
    if (!selectedCustomer && !customerSearchQuery.trim()) {
      showErrorModal('고객사를 검색하거나 선택해주세요.', '출고 요청 유효성 오류');
      return;
    }

    const finalCustName = selectedCustomer ? selectedCustomer.name : customerSearchQuery.trim();
    const finalSiteName = isNewSiteMode ? newSiteName.trim() : (selectedSite?.name || newSiteName.trim() || '본사');
    const finalSiteAddr = isNewSiteMode ? `${newSiteAddress.trim()} ${newSiteAddressDetail.trim()}`.trim() : (selectedSite?.address || newSiteAddress.trim());

    if (!finalSiteName) {
      showErrorModal('설치장소(현장명)를 입력하거나 선택해주세요.', '출고 요청 유효성 오류');
      return;
    }

    if (!finalSiteAddr) {
      showErrorModal('장비가 납품될 설치장소의 도로명 주소를 입력해주세요.', '출고 요청 유효성 오류');
      return;
    }

    if (!contactName.trim()) {
      showErrorModal('현장 수령 담당자 성명을 입력해주세요.', '출고 요청 유효성 오류');
      return;
    }

    if (!contactPhone.trim()) {
      showErrorModal('현장 수령 담당자 연락처를 입력해주세요.', '출고 요청 유효성 오류');
      return;
    }

    // 출고 품목 검증
    for (let i = 0; i < lineItems.length; i++) {
      const it = lineItems[i];
      if (!it.modelName.trim()) {
        showErrorModal(`[품목 #${i + 1}] 출고 모델명을 선택하거나 입력해주세요.`, '출고 요청 유효성 오류');
        return;
      }
      if (!it.qty || it.qty <= 0) {
        showErrorModal(`[품목 #${i + 1}] 수량은 최소 1대 이상이어야 합니다.`, '출고 요청 유효성 오류');
        return;
      }
    }

    if (!scheduledDate) {
      showErrorModal('출고 배송 희망일자를 지정해주세요.', '출고 요청 유효성 오류');
      return;
    }

    setIsSubmitting(true);
    setSubmitProgress({ log: '출고 요청 데이터 검증 및 저장 파이프라인 시작...', pct: 15 });

    try {
      // 시간 슬롯 포맷팅
      const timeLabel = timeSlot === 'EXACT'
        ? exactTime
        : timeSlot === 'MORNING'
          ? '오전 (09:00~12:00)'
          : timeSlot === 'AFTERNOON'
            ? '오후 (13:00~18:00)'
            : '긴급 ASAP';

      // 스펙 세부사항을 포괄하는 equipments 배열 생성
      const sanitizedEquipments = lineItems.map(it => {
        const effectiveVga = it.vga === '직접 입력' ? (it.vgaCustom || '별도 VGA') : it.vga;
        const effectiveRam = it.ram === '직접 입력' ? (it.ramCustom || '별도 RAM') : it.ram;
        const effectiveSsd = it.ssd === '직접 입력' ? (it.ssdCustom || '별도 SSD') : it.ssd;
        const effectiveOs = it.os === '직접 입력' ? (it.osCustom || '별도 OS') : it.os;

        const mRate = Math.max(0, Number(it.monthlyRate) || 0);
        const dRate = Math.max(0, Number(it.dailyRate) || 0);

        return {
          modelName: it.modelName.trim(),
          qty: Math.max(1, Math.floor(Number(it.qty) || 1)),
          monthlyRate: mRate,
          dailyRate: dRate,
          monthlyRent: mRate,
          dailyRent: dRate,
          monthlyRentalFee: mRate,
          dailyRentalFee: dRate,
          unitPrice: mRate,
          vga: effectiveVga,
          ram: effectiveRam,
          ssd: effectiveSsd,
          os: effectiveOs,
          swList: it.swList,
          customSpecNote: it.customSpecNote,
          customSwNote: it.customSwNote
        };
      });

      // 배송 및 특이사항 종합 메모
      const combinedNoteParts = [
        deliveryNotes ? `[배송안내] ${deliveryNotes}` : '',
        orderMemo ? `[특이사항] ${orderMemo}` : '',
        `[배송방식] ${IT_DELIVERY_METHOD_LABELS[deliveryMethod]}`,
        `[엘리베이터] ${newSiteHasFreightElevator ? '있음' : '없음(계단)'}`,
        newSiteRequiresSecurityPass ? '[보안출입 사전등록 필요]' : ''
      ].filter(Boolean);

      const dispatchPayload = {
        customerName: finalCustName,
        siteName: finalSiteName,
        siteAddress: finalSiteAddr,
        siteContactName: contactName.trim(),
        siteContactPhone: contactPhone.trim(),
        siteContactEmail: contactEmail.trim(),
        equipments: sanitizedEquipments,
        loadingTime: `${scheduledDate} ${timeLabel}`,
        unloadingTime: `${scheduledDate} ${timeLabel}`,
        vehicleType: IT_DELIVERY_METHOD_LABELS[deliveryMethod],
        note: combinedNoteParts.join(' | ')
      };

      setSubmitProgress({ log: '계약 체결 및 배차 출고대기 레코드 생성 중...', pct: 60 });

      const res = await saveSmartDispatch(dispatchPayload as any, true, (log, pct) => {
        setSubmitProgress({ log, pct });
      });

      if (!res.success) {
        showErrorModal(res.errorMessage || '출고 요청 저장 중 오류가 발생했습니다.', '출고 저장 오류');
        setIsSubmitting(false);
        setSubmitProgress(null);
        return;
      }

      setSubmitProgress({ log: 'DB 무누락 영구 저장 검증 완료!', pct: 100 });

      // 완료 모달 표출
      setSuccessResultModal({
        isOpen: true,
        title: '출고 요청 등록 완료',
        message: `'${finalCustName}' (${finalSiteName}) 앞으로 총 ${totalUnits}대의 IT 장비 출고 요청이 성공적으로 저장되었습니다.\n\n배차/운송 관리 및 출고 검수 대기 목록에 등록되었습니다.`
      });

      // 폼 초기화 (편의상 고객사는 유지하고 품목/일정 리셋 또는 전체 리셋)
      setLineItems([createDefaultLineItem(1)]);
      setDeliveryNotes('');
      setOrderMemo('');

    } catch (err: any) {
      console.error('Submit order error:', err);
      showErrorModal(`출고 요청 처리 중 예기치 않은 오류가 발생했습니다:\n${err.message || JSON.stringify(err)}`, '시스템 오류');
    } finally {
      setIsSubmitting(false);
      setSubmitProgress(null);
    }
  };

  // ── 최근 출고 요청 내역 (하단 고밀도 대장) ──
  const recentOutboundDeliveries = useMemo(() => {
    return deliveries
      .filter(d => d.type === 'OUTBOUND' || d.type === 'EXCHANGE')
      .sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
      .slice(0, 15);
  }, [deliveries]);

  return (
    <div className="dispatch4-container">
      {/* ── 상단 건조 툴바 (헌장 3.1) ── */}
      <div className="dispatch4-toolbar">
        <div className="dispatch4-toolbar-left">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" />
            <h1 className="dispatch4-title">출고 요청</h1>
          </div>
          <span className="text-xs text-slate-400 hidden md:inline-block">
            고객사 ➔ 설치장소 ➔ 품목 및 스펙조정(VGA/RAM/SSD) ➔ SW설치 ➔ 배송일시 지정 ➔ 저장
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleResetForm}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>초기화</span>
          </button>
        </div>
      </div>

      {/* ── Z-구텐버그 단일 컬럼 스크롤 본문 ── */}
      <div className="dispatch4-single-scroll">
        <form onSubmit={handleSubmitOrder} className="flex flex-col gap-6 max-w-7xl mx-auto w-full pb-28">

          {/* ═══════════════════════════════════════════════════════════════════
              [Step 1: 고객사, 설치장소, 담당자 지정] (좌상단 Scope)
             ═══════════════════════════════════════════════════════════════════ */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/40">1</span>
              <h2 className="text-sm font-bold text-slate-100">고객사 및 설치장소·담당자 지정</h2>
              <span className="text-xs text-slate-400 ml-auto">* 필수 입력 항목</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1-1. 고객사 검색 및 선택 */}
              <div className="flex flex-col gap-1.5 relative">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-indigo-400" />
                  <span>고객사 검색 *</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={e => {
                      setCustomerSearchQuery(e.target.value);
                      setIsCustomerDropdownOpen(true);
                    }}
                    onFocus={() => setIsCustomerDropdownOpen(true)}
                    placeholder="고객사명 또는 사업자번호 검색..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
                </div>

                {/* 고객사 자동완성 드롭다운 */}
                {isCustomerDropdownOpen && filteredCustomers.length > 0 && (
                  <div className="absolute top-[58px] left-0 right-0 z-50 bg-slate-950 border border-slate-700 rounded-lg shadow-2xl max-h-56 overflow-y-auto">
                    {filteredCustomers.map(c => (
                      <div
                        key={c.id}
                        onClick={() => handleSelectCustomer(c)}
                        className="px-3 py-2 hover:bg-indigo-950/60 cursor-pointer border-b border-slate-800/80 last:border-b-0 flex items-center justify-between"
                      >
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-slate-100">{c.name}</span>
                          <span className="text-[11px] text-slate-400">
                            대표: {c.representative || '-'} | 사업자: {c.bizRegNo || '-'}
                          </span>
                        </div>
                        {selectedCustomerId === c.id && (
                          <Check className="w-4 h-4 text-indigo-400 flex-shrink-0" />
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {selectedCustomer && (
                  <div className="p-2.5 bg-indigo-950/20 border border-indigo-900/40 rounded-lg flex items-center justify-between mt-1">
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-indigo-300">{selectedCustomer.name}</span>
                      <span className="text-[11px] text-slate-400">
                        대표: {selectedCustomer.representative || '-'} ({selectedCustomer.repContact || '-'})
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCustomerId('');
                        setCustomerSearchQuery('');
                      }}
                      className="text-[11px] text-slate-400 hover:text-white px-2 py-0.5 rounded bg-slate-800 border border-slate-700"
                    >
                      변경
                    </button>
                  </div>
                )}
              </div>

              {/* 1-2. 고객 설치장소 (CustomerSite) 선택 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-indigo-400" />
                    <span>설치/납품 장소 *</span>
                  </label>
                  {selectedCustomer && (
                    <button
                      type="button"
                      onClick={() => handleSelectSite(isNewSiteMode ? (customerSites[0]?.id || '') : 'NEW')}
                      className="text-[11px] text-indigo-400 hover:underline font-semibold"
                    >
                      {isNewSiteMode ? '기존 설치처 선택' : '+ 신규 설치처 직접입력'}
                    </button>
                  )}
                </div>

                {!isNewSiteMode && customerSites.length > 0 ? (
                  <select
                    value={selectedSiteId}
                    onChange={e => handleSelectSite(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    {customerSites.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.address || '주소 미등록'})
                      </option>
                    ))}
                    <option value="NEW">+ [신규 설치처 직접 입력]</option>
                  </select>
                ) : (
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={newSiteName}
                      onChange={e => setNewSiteName(e.target.value)}
                      placeholder="설치처 명칭 (예: 판교 사옥 5층 개발실)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={newSiteAddress}
                      onChange={e => setNewSiteAddress(e.target.value)}
                      placeholder="도로명 주소 (예: 경기 성남시 분당구 판교역로 166)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                    <input
                      type="text"
                      value={newSiteAddressDetail}
                      onChange={e => setNewSiteAddressDetail(e.target.value)}
                      placeholder="상세 위치 (동/층/호수/전산실 번호 등)"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}

                {/* 화물 엘리베이터 & 보안 출입 사전등록 플래그 */}
                <div className="flex items-center gap-4 mt-1">
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSiteHasFreightElevator}
                      onChange={e => setNewSiteHasFreightElevator(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span>화물 엘리베이터 있음</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-[11px] text-slate-300 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newSiteRequiresSecurityPass}
                      onChange={e => setNewSiteRequiresSecurityPass(e.target.checked)}
                      className="rounded border-slate-700 text-indigo-600 focus:ring-0"
                    />
                    <span>보안 출입 사전등록 필요</span>
                  </label>
                </div>
              </div>

              {/* 1-3. 수령 담당자 선택 및 확인 */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                    <User className="w-3.5 h-3.5 text-indigo-400" />
                    <span>현장 수령 담당자 *</span>
                  </label>
                  {customerContacts.length > 0 && (
                    <select
                      value={selectedContactId}
                      onChange={e => handleSelectContact(e.target.value)}
                      className="text-[11px] bg-slate-800 border border-slate-700 rounded px-2 py-0.5 text-slate-200"
                    >
                      <option value="">담당자 선택...</option>
                      {customerContacts.map(c => (
                        <option key={c.id} value={c.id}>
                          {c.name} ({c.position || '직급미상'} / {c.contact || '연락처없음'})
                        </option>
                      ))}
                      <option value="NEW">+ 직접 입력</option>
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={contactName}
                    onChange={e => setContactName(e.target.value)}
                    placeholder="담당자 성명 *"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    value={contactPosition}
                    onChange={e => setContactPosition(e.target.value)}
                    placeholder="직급 / 부서"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={contactPhone}
                    onChange={e => setContactPhone(e.target.value)}
                    placeholder="휴대폰 연락처 *"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="email"
                    value={contactEmail}
                    onChange={e => setContactEmail(e.target.value)}
                    placeholder="이메일 주소"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </section>


          {/* ═══════════════════════════════════════════════════════════════════
              [Step 2: 요청 출고 모델, 수량, 단가 및 스펙조정(VGA, RAM, SSD)]
             ═══════════════════════════════════════════════════════════════════ */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/40">2</span>
                <h2 className="text-sm font-bold text-slate-100">요청 출고 모델 및 하드웨어 스펙 조정 (VGA, RAM, SSD)</h2>
              </div>
              <button
                type="button"
                onClick={handleAddLineItem}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-sm"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>출고 모델 추가</span>
              </button>
            </div>

            <div className="flex flex-col gap-5">
              {lineItems.map((item, idx) => (
                <div
                  key={item.id}
                  className="p-4 bg-slate-950/70 border border-slate-800 rounded-xl flex flex-col gap-4 relative"
                >
                  {/* 상단 품목 헤더 & 모델 기본 정보 */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-indigo-400 flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5" />
                      <span>출고 품목 #{idx + 1}</span>
                    </span>
                    {lineItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveLineItem(idx)}
                        className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>삭제</span>
                      </button>
                    )}
                  </div>

                  {/* 2-1. 모델 선택, 수량, 월/일 단가 */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div className="flex flex-col gap-1 md:col-span-2">
                      <label className="text-[11px] font-semibold text-slate-300">
                        출고 모델 선택 (IT 제품 카탈로그) *
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={item.modelName}
                          onChange={e => handleSelectProduct(idx, e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        >
                          <option value="">-- [선택] IT 렌탈 제품 카탈로그 --</option>
                          {products.map(p => (
                            <option key={p.id} value={p.modelName}>
                              [{p.category || '기타'}] {p.modelName} {p.manufacturer ? `(${p.manufacturer})` : ''} - {p.spec || ''}
                            </option>
                          ))}
                        </select>
                        <input
                          type="text"
                          value={item.modelName}
                          onChange={e => handleUpdateItemField(idx, 'modelName', e.target.value)}
                          placeholder="또는 직접 모델명 입력..."
                          className="w-1/2 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-300">
                        요청 수량 (대) *
                      </label>
                      <div className="flex items-center">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemField(idx, 'qty', Math.max(1, (item.qty || 1) - 1))}
                          className="px-2.5 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-l-lg text-xs"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={e => handleUpdateItemField(idx, 'qty', Math.max(1, parseInt(e.target.value, 10) || 1))}
                          className="w-full bg-slate-900 border-y border-slate-700 py-2 text-center text-xs text-white font-bold focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateItemField(idx, 'qty', (item.qty || 1) + 1)}
                          className="px-2.5 py-2 bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700 rounded-r-lg text-xs"
                        >
                          +
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-semibold text-slate-300 flex items-center justify-between">
                        <span>월 렌탈료 단가 (원/월)</span>
                        <span className="text-[10px] text-slate-400">일: ₩{Number(item.dailyRate || 0).toLocaleString()}</span>
                      </label>
                      <div className="relative">
                        <input
                          type="number"
                          value={item.monthlyRate === 0 ? '0' : (item.monthlyRate || '')}
                          onChange={e => {
                            const m = parseInt(e.target.value, 10) || 0;
                            handleUpdateItemField(idx, 'monthlyRate', m);
                            handleUpdateItemField(idx, 'dailyRate', Math.round(m / 30));
                          }}
                          placeholder="월단가 (예: 60,000)"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-6 pr-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500"
                        />
                        <span className="absolute left-2.5 top-2 text-xs text-slate-400">₩</span>
                      </div>
                    </div>
                  </div>

                  {/* 2-2. 하드웨어 스펙 조정 세부 그리드 (VGA, RAM, SSD) */}
                  <div className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-3.5">
                    {/* [VGA 그래픽카드 조정] */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                        <Cpu className="w-3.5 h-3.5" />
                        <span>VGA (그래픽카드) 조정</span>
                      </label>
                      <select
                        value={item.vga}
                        onChange={e => handleUpdateItemField(idx, 'vga', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      >
                        {VGA_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {item.vga === '직접 입력' && (
                        <input
                          type="text"
                          value={item.vgaCustom || ''}
                          onChange={e => handleUpdateItemField(idx, 'vgaCustom', e.target.value)}
                          placeholder="요청 그래픽카드 스펙 입력..."
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                        />
                      )}
                    </div>

                    {/* [RAM 메모리 조정] */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-sky-400 flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        <span>RAM (메모리) 증설</span>
                      </label>
                      <select
                        value={item.ram}
                        onChange={e => handleUpdateItemField(idx, 'ram', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-sky-500"
                      >
                        {RAM_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {item.ram === '직접 입력' && (
                        <input
                          type="text"
                          value={item.ramCustom || ''}
                          onChange={e => handleUpdateItemField(idx, 'ramCustom', e.target.value)}
                          placeholder="메모리 규격 및 용량 직접 입력..."
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                        />
                      )}
                    </div>

                    {/* [SSD / 스토리지 조정] */}
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-amber-400 flex items-center gap-1">
                        <HardDrive className="w-3.5 h-3.5" />
                        <span>SSD / 저장장치 증설</span>
                      </label>
                      <select
                        value={item.ssd}
                        onChange={e => handleUpdateItemField(idx, 'ssd', e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-500"
                      >
                        {SSD_OPTIONS.map(opt => (
                          <option key={opt} value={opt}>{opt}</option>
                        ))}
                      </select>
                      {item.ssd === '직접 입력' && (
                        <input
                          type="text"
                          value={item.ssdCustom || ''}
                          onChange={e => handleUpdateItemField(idx, 'ssdCustom', e.target.value)}
                          placeholder="스토리지 규격 및 용량 직접 입력..."
                          className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-white"
                        />
                      )}
                    </div>
                  </div>

                  {/* 2-3. 하드웨어 부속품 메모 */}
                  <div className="flex flex-col gap-1">
                    <label className="text-[11px] font-semibold text-slate-400">
                      부속품 및 하드웨어 특이사항 (케이블, 모니터암, C타입 독, 랙 레일킷 등)
                    </label>
                    <input
                      type="text"
                      value={item.customSpecNote}
                      onChange={e => handleUpdateItemField(idx, 'customSpecNote', e.target.value)}
                      placeholder="예: 2m HDMI 케이블 2개, C타입 100W PD 도킹스테이션 동봉 요청"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>


          {/* ═══════════════════════════════════════════════════════════════════
              [Step 3: SW 설치 요구사항 (OS, 필수 프로그램, 계정 세팅)]
             ═══════════════════════════════════════════════════════════════════ */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/40">3</span>
              <h2 className="text-sm font-bold text-slate-100">소프트웨어(SW) 설치 요구사항 및 OS 세팅</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 3-1. 기본 OS 선택 */}
              <div className="flex flex-col gap-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                  <span>운영체제 (OS) 선택 *</span>
                </label>
                <div className="flex flex-col gap-1.5">
                  {OS_OPTIONS.map(osOpt => {
                    const isSelected = lineItems[0]?.os === osOpt;
                    return (
                      <label
                        key={osOpt}
                        onClick={() => {
                          lineItems.forEach((_, idx) => handleUpdateItemField(idx, 'os', osOpt));
                        }}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-xs cursor-pointer transition ${
                          isSelected
                            ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="radio"
                          name="global_os"
                          checked={isSelected}
                          onChange={() => {}}
                          className="text-indigo-600 focus:ring-0"
                        />
                        <span>{osOpt}</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              {/* 3-2. 필수 설치 소프트웨어 체크리스트 */}
              <div className="flex flex-col gap-2 md:col-span-2">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>필수 설치 소프트웨어 (사전 인스톨 항목 다중 선택)</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SW_PRESETS.map(sw => {
                    const isChecked = lineItems[0]?.swList.includes(sw.name);
                    return (
                      <label
                        key={sw.id}
                        onClick={() => {
                          lineItems.forEach((_, idx) => handleToggleSw(idx, sw.name));
                        }}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg border text-xs cursor-pointer transition ${
                          isChecked
                            ? 'bg-emerald-950/40 border-emerald-500/80 text-emerald-200 font-bold'
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => {}}
                          className="rounded border-slate-700 text-emerald-500 focus:ring-0"
                        />
                        <span className="truncate">{sw.name}</span>
                      </label>
                    );
                  })}
                </div>

                {/* 3-3. 계정 및 세팅 메모 */}
                <div className="flex flex-col gap-1 mt-2">
                  <label className="text-[11px] font-semibold text-slate-300">
                    계정 설정 / 사내 도메인(Active Directory) 조인 / 파티션 분할 요청
                  </label>
                  <input
                    type="text"
                    value={lineItems[0]?.customSwNote || ''}
                    onChange={e => {
                      const val = e.target.value;
                      lineItems.forEach((_, idx) => handleUpdateItemField(idx, 'customSwNote', val));
                    }}
                    placeholder="예: 계정명: user / 비밀번호: 1234, C드라이브 200GB + D드라이브 분할, 사내 인트라넷 보안인증서 적용"
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>
          </section>


          {/* ═══════════════════════════════════════════════════════════════════
              [Step 4: 출고 배송 요청 일시 및 물류 인프라 지정]
             ═══════════════════════════════════════════════════════════════════ */}
          <section className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <span className="w-6 h-6 rounded-full bg-indigo-600/30 text-indigo-400 font-bold text-xs flex items-center justify-center border border-indigo-500/40">4</span>
              <h2 className="text-sm font-bold text-slate-100">출고 배송 요청 일시 및 배송/설치 지정</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* 4-1. 배송 희망 일자 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                  <span>배송 희망일자 *</span>
                </label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={e => setScheduledDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* 4-2. 희망 시간대 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-indigo-400" />
                  <span>배송/도착 희망 시간대 *</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setTimeSlot('MORNING')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                      timeSlot === 'MORNING'
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    오전 (09~12시)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeSlot('AFTERNOON')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                      timeSlot === 'AFTERNOON'
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    오후 (13~18시)
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeSlot('EXACT')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                      timeSlot === 'EXACT'
                        ? 'bg-indigo-950/70 border-indigo-500 text-indigo-200'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    지정 시간
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeSlot('ASAP')}
                    className={`py-2 px-3 text-xs font-semibold rounded-lg border transition ${
                      timeSlot === 'ASAP'
                        ? 'bg-rose-950/60 border-rose-500 text-rose-300'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    긴급 (ASAP)
                  </button>
                </div>
                {timeSlot === 'EXACT' && (
                  <input
                    type="time"
                    value={exactTime}
                    onChange={e => setExactTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-white mt-1"
                  />
                )}
              </div>

              {/* 4-3. 배송 수단 */}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-indigo-400" />
                  <span>배송 및 물류 수단 *</span>
                </label>
                <select
                  value={deliveryMethod}
                  onChange={e => setDeliveryMethod(e.target.value as ITDeliveryMethod)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                >
                  {IT_DELIVERY_METHODS.map(m => (
                    <option key={m} value={m}>
                      {IT_DELIVERY_METHOD_LABELS[m]}
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-slate-400 mt-1">
                  * 직영 차량(스타렉스/탑차) 및 전담 엔지니어가 직접 방문하여 설치 세팅을 진행합니다.
                </span>
              </div>
            </div>

            {/* 4-4. 물류/인프라 및 엔지니어 전달 특이사항 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">
                  현장 반입 / 주차 / 엘리베이터 안내
                </label>
                <input
                  type="text"
                  value={deliveryNotes}
                  onChange={e => setDeliveryNotes(e.target.value)}
                  placeholder="예: 지하 2층 화물용 엘리베이터 진입 가능 (차고 제한 2.3m), 1층 로비 경비실 확인증 수령"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-slate-300">
                  기타 출고 요청 특이사항 메모
                </label>
                <input
                  type="text"
                  value={orderMemo}
                  onChange={e => setOrderMemo(e.target.value)}
                  placeholder="예: 대표님 최종 구두승인건, 익월 10일 첫 청구서 일괄 발행"
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </section>


          {/* ═══════════════════════════════════════════════════════════════════
              [Step 5: 우하단 Terminal Action Bar & 검증 완료] (헌장 3.5 Z-동선)
             ═══════════════════════════════════════════════════════════════════ */}
          <div className="sticky bottom-0 z-40 bg-slate-900/95 backdrop-blur border border-slate-800 rounded-xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-6 text-xs text-slate-300 w-full md:w-auto">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">선택 고객사 / 설치처</span>
                <span className="font-bold text-white truncate max-w-xs">
                  {selectedCustomer ? selectedCustomer.name : (customerSearchQuery || '고객사 미선택')} / {isNewSiteMode ? (newSiteName || '신규') : (selectedSite?.name || '설치처 미선택')}
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">출고 규모</span>
                <span className="font-bold text-indigo-300">
                  {totalItemCount}개 품목 / 총 {totalUnits}대
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">예상 월 렌탈료 합계 (공급가+세)</span>
                <span className="font-extrabold text-amber-400 text-sm">
                  ₩{totalMonthlyFee.toLocaleString()}
                  <span className="text-xs font-normal text-slate-400 ml-1">
                    (+VAT ₩{totalVat.toLocaleString()})
                  </span>
                </span>
              </div>

              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400">배송 희망일시</span>
                <span className="font-bold text-emerald-400">
                  {scheduledDate} ({timeSlot === 'EXACT' ? exactTime : timeSlot === 'MORNING' ? '오전' : timeSlot === 'AFTERNOON' ? '오후' : '긴급'})
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
              <button
                type="submit"
                disabled={isSubmitting || !canSave}
                data-mid="btn-save-outbound-request"
                className={`flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-bold text-sm text-white shadow-lg transition flex-shrink-0 ${
                  isSubmitting || !canSave
                    ? 'bg-slate-700 cursor-not-allowed text-slate-400'
                    : 'bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>{isSubmitting ? '출고 요청 저장 중...' : '출고 요청 저장'}</span>
              </button>
            </div>
          </div>
        </form>


        {/* ═══════════════════════════════════════════════════════════════════
            [하단 섹션: 최근 출고 요청 대장 (Recent Outbound Deliveries)]
           ═══════════════════════════════════════════════════════════════════ */}
        <section className="max-w-7xl mx-auto w-full mt-4 pb-12">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-indigo-400" />
                <h3 className="text-xs font-bold text-slate-200">최근 출고 요청 대장 (최근 15건)</h3>
              </div>
              <span className="text-[11px] text-slate-400">
                실제 DB 연동 완료된 출고 대기 및 배차 상태
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-950/80 text-slate-400 border-b border-slate-800">
                    <th className="py-2 px-3 font-semibold whitespace-nowrap">의뢰번호 / 요청일자</th>
                    <th className="py-2 px-3 font-semibold whitespace-nowrap">고객사 및 설치처</th>
                    <th className="py-2 px-3 font-semibold whitespace-nowrap">출고 품목 및 스펙 요약</th>
                    <th className="py-2 px-3 font-semibold whitespace-nowrap">배송 희망일시 / 수단</th>
                    <th className="py-2 px-3 font-semibold whitespace-nowrap">상태</th>
                    <th className="py-2 px-3 font-semibold whitespace-nowrap text-center">상세</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {recentOutboundDeliveries.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        등록된 출고 요청 내역이 없습니다.
                      </td>
                    </tr>
                  ) : (
                    recentOutboundDeliveries.map(del => {
                      // cargoItems 파싱
                      let itemsList: any[] = [];
                      try {
                        if (del.cargoItems) itemsList = JSON.parse(del.cargoItems);
                      } catch (e) {
                        itemsList = [];
                      }

                      return (
                        <tr key={del.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-2.5 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                            <span className="text-slate-200 font-bold block">{del.id.slice(0, 8)}</span>
                            {del.requestDate || del.createdAt?.slice(0, 10)}
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-slate-200 font-semibold block">{del.destinationAddress?.split('(')[0] || '고객사'}</span>
                            <span className="text-[11px] text-slate-400 truncate max-w-xs block">
                              {del.destinationAddress || '-'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex flex-col gap-1 max-w-md">
                              {itemsList.length > 0 ? (
                                itemsList.map((it, i) => (
                                  <div key={i} className="flex items-center gap-1.5 text-[11px]">
                                    <span className="font-bold text-slate-200">{it.modelName}</span>
                                    <span className="text-indigo-400 font-semibold">{it.count || it.qty || 1}대</span>
                                    {(it.vga || it.ram || it.ssd) && (
                                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">
                                        {[it.vga, it.ram, it.ssd].filter(Boolean).join(' / ')}
                                      </span>
                                    )}
                                  </div>
                                ))
                              ) : (
                                <span className="text-[11px] text-slate-400 truncate">{del.memo || '-'}</span>
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className="text-slate-300 block font-semibold">
                              {del.scheduledDate || del.loadingDate || '-'} ({del.loadingTimeSlot || '시간미정'})
                            </span>
                            <span className="text-[11px] text-slate-400">
                              {del.vehicleType || '직영 배송'}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                              del.status === 'REQUESTED'
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-800/60'
                                : del.status === 'DISPATCHED'
                                  ? 'bg-indigo-950/60 text-indigo-400 border border-indigo-800/60'
                                  : del.status === 'DELIVERED'
                                    ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800/60'
                                    : 'bg-slate-800 text-slate-400'
                            }`}>
                              {del.status === 'REQUESTED' ? '출고대기' : del.status === 'DISPATCHED' ? '배차완료' : del.status === 'DELIVERED' ? '완료' : del.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 whitespace-nowrap text-center">
                            <button
                              type="button"
                              onClick={() => setDetailModalDelivery(del)}
                              className="px-2.5 py-1 text-[11px] font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition"
                            >
                              상세
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>

      {/* ── 완료 알림 모달 ── */}
      {successResultModal && successResultModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-md w-full p-6 shadow-2xl flex flex-col gap-4 animate-in fade-in zoom-in duration-150">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40">
                <Check className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-base font-bold text-white">{successResultModal.title}</h3>
                <span className="text-xs text-slate-400">데이터베이스 동기화 완료</span>
              </div>
            </div>
            <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed bg-slate-950 p-3.5 rounded-xl border border-slate-800">
              {successResultModal.message}
            </p>
            <div className="flex justify-end gap-2 mt-2">
              <button
                type="button"
                onClick={() => setSuccessResultModal(null)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition"
              >
                확인
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── 상세 보기 모달 ── */}
      {detailModalDelivery && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col gap-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-indigo-400" />
                <h3 className="text-base font-bold text-white">출고 요청 상세 내역</h3>
                <span className="text-xs font-mono text-slate-400">#{detailModalDelivery.id.slice(0, 8)}</span>
              </div>
              <button
                type="button"
                onClick={() => setDetailModalDelivery(null)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col gap-3 text-xs text-slate-300">
              <div className="grid grid-cols-2 gap-3 bg-slate-950 p-3.5 rounded-xl border border-slate-800">
                <div>
                  <span className="text-slate-500 block">설치처 및 배송지</span>
                  <span className="font-semibold text-white">{detailModalDelivery.destinationAddress || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-500 block">배송 희망일시 / 수단</span>
                  <span className="font-semibold text-white">
                    {detailModalDelivery.scheduledDate || detailModalDelivery.loadingDate} ({detailModalDelivery.loadingTimeSlot || '시간미정'}) / {detailModalDelivery.vehicleType || '직영배송'}
                  </span>
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-200 block mb-2">출고 품목 및 하드웨어/SW 스펙</span>
                <div className="flex flex-col gap-2">
                  {(() => {
                    let items: any[] = [];
                    try {
                      if (detailModalDelivery.cargoItems) items = JSON.parse(detailModalDelivery.cargoItems);
                    } catch (e) { items = []; }

                    if (items.length === 0) {
                      return <span className="text-slate-500">품목 세부 데이터가 없습니다.</span>;
                    }

                    return items.map((it, idx) => (
                      <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-indigo-300 text-xs">
                            #{idx + 1} {it.modelName} ({it.count || it.qty || 1}대)
                          </span>
                          {it.monthlyRent > 0 && (
                            <span className="text-amber-400 font-bold text-xs">
                              월 ₩{Number(it.monthlyRent).toLocaleString()}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 text-[11px] text-slate-300">
                          {it.vga && <span className="px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800/60 text-emerald-300">VGA: {it.vga}</span>}
                          {it.ram && <span className="px-2 py-0.5 rounded bg-sky-950/70 border border-sky-800/60 text-sky-300">RAM: {it.ram}</span>}
                          {it.ssd && <span className="px-2 py-0.5 rounded bg-amber-950/70 border border-amber-800/60 text-amber-300">SSD: {it.ssd}</span>}
                          {it.os && <span className="px-2 py-0.5 rounded bg-purple-950/70 border border-purple-800/60 text-purple-300">OS: {it.os}</span>}
                        </div>
                        {it.swList && it.swList.length > 0 && (
                          <span className="text-[11px] text-slate-400">
                            SW 설치: {it.swList.join(', ')}
                          </span>
                        )}
                        {it.customSpecNote && (
                          <span className="text-[11px] text-slate-400">
                            부속품: {it.customSpecNote}
                          </span>
                        )}
                      </div>
                    ));
                  })()}
                </div>
              </div>

              <div>
                <span className="font-bold text-slate-200 block mb-1">메모 및 전달사항</span>
                <p className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] text-slate-400 whitespace-pre-line leading-relaxed">
                  {detailModalDelivery.memo || '등록된 메모가 없습니다.'}
                </p>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setDetailModalDelivery(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-lg transition"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmartDispatch4;
