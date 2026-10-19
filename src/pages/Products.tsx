// src/pages/Products.tsx - 전사 표준 헌장 준수 제품 모델 및 제원 관리
import React, { useState, useMemo, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Plus, Download, Search, RefreshCw, FileText, X, Folder, Trash2, 
  ExternalLink, Upload, CheckCircle2, AlertCircle, Eye, Edit2, Save, 
  Package, Layers, Cpu, HardDrive, Monitor, Server, Wifi, Printer, Tv, Tablet, Laptop, Box, FileCode, Camera 
} from 'lucide-react';
import { exportToExcel } from '../services/excel';
import { Product, ProductCategory, PRODUCT_CATEGORIES, PRODUCT_CATEGORY_LABELS, ProductPhoto, ProductPhotoTag, PRODUCT_PHOTO_TAG_LABELS } from '../services/db';
import { SortableTh } from '../components/SortableTh';
import { useSortableData } from '../hooks/useSortableData';
import { decryptSecret } from '../utils/cryptoVault';
import { createHangulMatcher } from '../utils/hangulSearch';
import { getCanonicalModelKey } from '../utils/modelUtils';
import { ProductPhotoManager } from '../components/ProductPhotoManager';
import { ProductPhotoViewerModal } from '../components/ProductPhotoViewerModal';

interface R2DocFile {
  key: string;
  name: string;
  size: number;
  lastModified: string;
  url: string;
}

export const Products: React.FC = () => {
  const { 
    products, saveProduct, hasPermission, assets, 
    refreshAllData, officialMailConfigs, setActiveTab, currentTenant 
  } = useApp();
  
  const canSave = hasPermission('product', 'save');

  // 토스트 알림 상태
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState('');
  const [assetFilter, setAssetFilter] = useState<'ALL' | 'WITH_ASSETS' | 'NO_ASSETS'>('ALL');
  const [manufacturerFilter, setManufacturerFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | ProductCategory>('ALL');
  const [activeStatusFilter, setActiveStatusFilter] = useState('ALL');

  // 상세조회 Dossier 슬라이드오버 및 수정 상태
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Product>>({});
  const [showAddModal, setShowAddModal] = useState(false);
  const [showSpecPreviewModal, setShowSpecPreviewModal] = useState(false);

  // 📷 사진 라이트박스 뷰어 모달 상태
  const [previewPhotos, setPreviewPhotos] = useState<ProductPhoto[]>([]);
  const [previewModelName, setPreviewModelName] = useState<string>('');
  const [previewPhotoIndex, setPreviewPhotoIndex] = useState<number>(0);
  const [showPhotoViewer, setShowPhotoViewer] = useState<boolean>(false);

  // Cloudflare R2 제품별 문서함 상태
  const [r2Files, setR2Files] = useState<R2DocFile[]>([]);
  const [loadingR2Docs, setLoadingR2Docs] = useState<boolean>(false);
  const [uploadingDoc, setUploadingDoc] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState(false);

  const clean = (s?: string) => (s || '').replace(/[- _/]/g, '').toUpperCase().trim();

  // Cloudflare R2 문서 목록 로드
  const fetchR2Files = async () => {
    const activeTenantId = currentTenant?.id || import.meta.env.VITE_TENANT_ID || 'giyuen';
    const config = officialMailConfigs.find(c => (c.tenantId || 'giyuen') === activeTenantId) || officialMailConfigs[0];
    const accountId = config?.r2AccountId || '35014a2514680107d74e1e68d96e6c32';
    const bucketName = config?.r2BucketName || 'giyeon-storage';
    const accessKeyId = config?.r2AccessKeyId || '03cdb7560d37242de608a5db2a976030';
    const secretAccessKey = config?.r2SecretAccessKey ? decryptSecret(config.r2SecretAccessKey) : undefined;
    const publicDomain = config?.r2PublicDomain || 'https://pub-55a68547bdf24600b80d27782912c83e.r2.dev';

    setLoadingR2Docs(true);
    try {
      const res = await fetch('/api/r2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'list',
          prefix: 'Eq_doc/',
          accountId,
          bucketName,
          accessKeyId,
          secretAccessKey
        })
      });
      const data = await res.json();
      if (data.success && Array.isArray(data.files)) {
        const mapped: R2DocFile[] = data.files
          .filter((f: any) => !f.isDirectory && f.key !== 'Eq_doc/')
          .map((f: any) => {
            const parts = f.key.split('/');
            const name = parts[parts.length - 1];
            return {
              key: f.key,
              name,
              size: f.size,
              lastModified: f.lastModified,
              url: `${publicDomain.replace(/\/$/, '')}/${encodeURIComponent(f.key).replace(/%2F/g, '/')}`
            };
          });
        setR2Files(mapped);
      }
    } catch (err) {
      console.warn('R2 docs fetch error:', err);
    } finally {
      setLoadingR2Docs(false);
    }
  };

  useEffect(() => {
    fetchR2Files();
  }, [officialMailConfigs]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refreshAllData();
      await fetchR2Files();
      showToast('최신 데이터를 동기화하였습니다.');
    } catch (err: any) {
      showToast('최신 데이터를 가져오는 데 실패했습니다.', 'error');
    } finally {
      setRefreshing(false);
    }
  };

  // 모델별 보유 자산 통계 매핑 (1자산 1모델 배타 매핑 — 중복 합산 원천 차단 및 shortName 축약명 흡수)
  const assetStatsMap = useMemo(() => {
    type ModelAssetStats = { total: number; owned: number; leased: number; available: number; rented: number; assigned: number; repairing: number };
    const map = new Map<string, ModelAssetStats>();
    const exactModelToProdId = new Map<string, string>();
    const shortNameToProdId = new Map<string, string>();
    const canonicalKeyToProdId = new Map<string, string>();

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      map.set(p.id, { total: 0, owned: 0, leased: 0, available: 0, rented: 0, assigned: 0, repairing: 0 });
      const exactKey = (p.modelName || '').trim().toUpperCase();
      if (exactKey) exactModelToProdId.set(exactKey, p.id);

      const cKey = getCanonicalModelKey(p.modelName);
      if (cKey) {
        // 동일 정규화 키에 복수 제품이 존재하는 경우 공식 하이픈 표기 또는 제원 보유 모델 우선
        const existingId = canonicalKeyToProdId.get(cKey);
        if (!existingId) {
          canonicalKeyToProdId.set(cKey, p.id);
        } else {
          const existingProd = products.find(x => x.id === existingId);
          const preferNew = (p.modelName.includes('-') && !existingProd?.modelName.includes('-')) || (Boolean(p.weight) && !existingProd?.weight);
          if (preferNew) canonicalKeyToProdId.set(cKey, p.id);
        }
      }

      if (p.shortName) {
        const sExact = p.shortName.trim().toUpperCase();
        if (sExact) shortNameToProdId.set(sExact, p.id);
        const sKey = getCanonicalModelKey(p.shortName);
        if (sKey && !canonicalKeyToProdId.has(sKey)) {
          canonicalKeyToProdId.set(sKey, p.id);
        }
      }
    }

    for (let i = 0; i < assets.length; i++) {
      const a = assets[i];
      const rawUpper = (a.modelName || '').trim().toUpperCase();
      const cKey = getCanonicalModelKey(rawUpper);

      const targetProdId =
        exactModelToProdId.get(rawUpper) ||
        shortNameToProdId.get(rawUpper) ||
        canonicalKeyToProdId.get(cKey);

      if (!targetProdId) continue;
      const st = map.get(targetProdId);
      if (!st) continue;

      st.total++;
      if (a.ownerType === 'OWNED' || !a.ownerType) st.owned++;
      if (a.ownerType === 'RENTED') st.leased++;
      if (a.status === 'AVAILABLE' && !a.actualRentReturnDate) st.available++;
      if (a.status === 'RENTED' || (!a.actualRentReturnDate && a.currentCustomerId)) st.rented++;
      if (a.status === 'ASSIGNED') st.assigned++;
      if (a.status === 'REPAIRING') st.repairing++;
    }

    return map;
  }, [products, assets]);

  // 모델별 R2 문서 매핑 (사전 파싱 후 정규화 키 1:1 매칭 — E-Drive와 일반 모델 간 문서 혼입 차단)
  const r2FilesByModelMap = useMemo(() => {
    const map = new Map<string, R2DocFile[]>();
    const parsedR2: { file: R2DocFile; folderModel: string; fCanonical: string }[] = [];
    for (let i = 0; i < r2Files.length; i++) {
      const f = r2Files[i];
      const parts = f.key.split('/');
      if (parts.length >= 3) {
        const folderModel = parts[1];
        parsedR2.push({ file: f, folderModel, fCanonical: getCanonicalModelKey(folderModel) });
      }
    }

    for (let i = 0; i < products.length; i++) {
      const p = products[i];
      const pCanonical = getCanonicalModelKey(p.modelName);
      const sCanonical = p.shortName ? getCanonicalModelKey(p.shortName) : '';
      const matched: R2DocFile[] = [];
      for (let j = 0; j < parsedR2.length; j++) {
        const { file, folderModel, fCanonical } = parsedR2[j];
        if (
          folderModel === p.modelName ||
          (pCanonical && fCanonical === pCanonical) ||
          (sCanonical && fCanonical === sCanonical) ||
          (pCanonical === 'Z4525J' && fCanonical === 'Z45')
        ) {
          matched.push(file);
        }
      }
      map.set(p.id, matched);
    }
    return map;
  }, [products, r2Files]);

  // 고유 제조사
  const uniqueManufacturers = useMemo(() => {
    return Array.from(new Set(products.map(p => p.manufacturer).filter(Boolean))) as string[];
  }, [products]);

  // KPI 통계 (단일 패스 집계)
  const kpiStats = useMemo(() => {
    const totalModels = products.length;
    let withAssets = 0;
    let activeModels = 0;
    let totalMappedAssets = 0;

    for (let i = 0; i < totalModels; i++) {
      const p = products[i];
      const total = assetStatsMap.get(p.id)?.total || 0;
      if (total > 0) {
        withAssets++;
        totalMappedAssets += total;
      }
      if (p.isActive !== false) activeModels++;
    }

    const noAssets = totalModels - withAssets;
    const totalDocs = r2Files.length;

    return { totalModels, withAssets, noAssets, activeModels, totalDocs, totalMappedAssets };
  }, [products, assetStatsMap, r2Files]);

  // 필터링 및 정렬
  const filtered = useMemo(() => {
    const q = searchTerm.trim();
    const matcher = q ? createHangulMatcher(q) : null;

    return products.filter(p => {
      const stats = assetStatsMap.get(p.id);
      const totalAssets = stats ? stats.total : 0;
      if (assetFilter === 'WITH_ASSETS' && totalAssets === 0) return false;
      if (assetFilter === 'NO_ASSETS' && totalAssets > 0) return false;

      if (manufacturerFilter !== 'ALL' && p.manufacturer !== manufacturerFilter) return false;
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (activeStatusFilter === 'ACTIVE' && p.isActive === false) return false;
      if (activeStatusFilter !== 'ALL' && activeStatusFilter !== 'ACTIVE' && p.isActive !== false) return false;

      if (!matcher) return true;
      return (
        matcher.test(p.modelName) ||
        matcher.test(p.shortName || '') ||
        matcher.test(p.manufacturer) ||
        matcher.test(p.cpu || '') ||
        matcher.test(p.category ? PRODUCT_CATEGORY_LABELS[p.category] : '') ||
        matcher.test(p.spec || '') ||
        matcher.test(p.defaultGpu || '') ||
        matcher.test(p.defaultOs || '')
      );
    });
  }, [products, assetStatsMap, assetFilter, searchTerm, manufacturerFilter, categoryFilter, activeStatusFilter]);

  const { items: sortedProducts, sortConfig, requestSort } = useSortableData<Product>(
    filtered,
    { key: 'modelName', direction: 'asc' },
    (p, key) => {
      switch (key) {
        case 'category': return p.category ? PRODUCT_CATEGORY_LABELS[p.category] : '';
        case 'modelName': return p.modelName;
        case 'shortName': return p.shortName || '';
        case 'manufacturer': return p.manufacturer || '';
        case 'cpu': return p.cpu || '';
        case 'baseRam': return p.baseRam || p.onboardRam || 0;
        case 'baseStorage': return p.baseStorage || p.storageSlots || 0;
        case 'defaultGpu': return p.defaultGpu || p.gpuType || '';
        case 'displaySize': return p.displaySize || 0;
        case 'assetCount': return assetStatsMap.get(p.id)?.total || 0;
        case 'isActive': return p.isActive !== false ? 1 : 0;
        default: return (p as any)[key];
      }
    }
  );

  const handleSelectProduct = (product: Product) => {
    setSelectedProduct(product);
    setIsEditing(false);
    setEditForm({ ...product });
  };

  const handleStartEdit = () => {
    if (selectedProduct) {
      setEditForm({ ...selectedProduct });
      setIsEditing(true);
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm(selectedProduct ? { ...selectedProduct } : {});
  };

  const handleSaveEdit = async () => {
    if (!selectedProduct || !editForm || !editForm.modelName) return;

    if (!editForm.modelName.trim()) {
      showToast('모델명을 입력해주세요.', 'error');
      return;
    }

    try {
      const updated = { ...selectedProduct, ...editForm } as Product;
      await saveProduct(updated);
      setSelectedProduct(updated);
      setIsEditing(false);
      await refreshAllData();
      showToast(`제품 모델 [${updated.modelName}] 정보가 저장되었습니다.`);
    } catch (err: any) {
      showToast(`저장 실패: ${err?.message || err}`, 'error');
    }
  };

  const handleOpenAddModal = () => {
    setEditForm({
      category: 'LAPTOP',
      modelName: '',
      shortName: '',
      manufacturer: 'Dell',
      isActive: true,
      cpu: 'Intel Core i7-13700H',
      onboardRam: 16,
      ramSlots: 1,
      maxRam: 64,
      baseRam: '16GB (온보드 16GB + 여유 1슬롯)',
      storageSlots: 2,
      storageFormFactors: 'M.2 NVMe 2280 2개',
      baseStorage: '512GB NVMe',
      gpuType: 'DEDICATED',
      defaultGpu: 'NVIDIA GeForce RTX 4060 Laptop 8GB',
      displaySize: 15.6,
      resolution: '1920x1080 (FHD)',
      defaultOs: 'Windows 11 Pro 64-bit',
      photos: [],
      spec: ''
    });
    setShowAddModal(true);
  };

  const handleSaveAddModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editForm.modelName?.trim()) {
      showToast('모델명을 입력해주세요.', 'error');
      return;
    }
    if (!editForm.category) {
      showToast('제품 분류(카테고리)를 선택해주세요.', 'error');
      return;
    }

    try {
      await saveProduct(editForm as Omit<Product, 'id' | 'createdAt'>);
      setShowAddModal(false);
      setEditForm({});
      await refreshAllData();
      showToast(`신규 모델 [${editForm.modelName}]이 등록되었습니다.`);
    } catch (err: any) {
      showToast(`등록 실패: ${err?.message || err}`, 'error');
    }
  };

  // R2 문서 업로드
  const handleUploadCustomDoc = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedProduct) return;

    setUploadingDoc(true);
    try {
      const activeTenantId = currentTenant?.id || import.meta.env.VITE_TENANT_ID || 'giyuen';
      const config = officialMailConfigs.find(c => (c.tenantId || 'giyuen') === activeTenantId) || officialMailConfigs[0];
      const accountId = config?.r2AccountId || '35014a2514680107d74e1e68d96e6c32';
      const bucketName = config?.r2BucketName || 'giyeon-storage';
      const accessKeyId = config?.r2AccessKeyId || '03cdb7560d37242de608a5db2a976030';
      const secretAccessKey = config?.r2SecretAccessKey ? decryptSecret(config.r2SecretAccessKey) : undefined;

      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64Content = event.target?.result as string;
        const key = `Eq_doc/${selectedProduct.modelName}/${file.name}`;

        const res = await fetch('/api/r2', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'upload',
            accountId,
            bucketName,
            accessKeyId,
            secretAccessKey,
            key,
            base64Content,
            contentType: file.type || 'application/pdf'
          })
        });

        const resJson = await res.json();
        if (resJson.success) {
          showToast(`문서 [${file.name}]이 R2 클라우드에 업로드되었습니다.`);
          await fetchR2Files();
        } else {
          showToast(`업로드 실패: ${resJson.error}`, 'error');
        }
        setUploadingDoc(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showToast(`업로드 실패: ${err.message}`, 'error');
      setUploadingDoc(false);
    }
  };

  // R2 문서 삭제
  const handleDeleteDoc = async (key: string) => {
    try {
      const activeTenantId = currentTenant?.id || import.meta.env.VITE_TENANT_ID || 'giyuen';
      const config = officialMailConfigs.find(c => (c.tenantId || 'giyuen') === activeTenantId) || officialMailConfigs[0];
      const accountId = config?.r2AccountId || '35014a2514680107d74e1e68d96e6c32';
      const bucketName = config?.r2BucketName || 'giyeon-storage';
      const accessKeyId = config?.r2AccessKeyId || '03cdb7560d37242de608a5db2a976030';
      const secretAccessKey = config?.r2SecretAccessKey ? decryptSecret(config.r2SecretAccessKey) : undefined;

      const res = await fetch('/api/r2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete',
          accountId,
          bucketName,
          accessKeyId,
          secretAccessKey,
          key
        })
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('문서가 삭제되었습니다.');
        await fetchR2Files();
      } else {
        showToast(`삭제 실패: ${resJson.error}`, 'error');
      }
    } catch (err: any) {
      showToast(`삭제 오류: ${err.message}`, 'error');
    }
  };

  // 엑셀 내보내기
  const handleExport = () => {
    const excelData = filtered.map((p, idx) => {
      const stats = assetStatsMap.get(p.id) || { total: 0, owned: 0, leased: 0, available: 0, rented: 0, assigned: 0, repairing: 0 };
      const docList = r2FilesByModelMap.get(p.id) || [];
      return {
        '번호': idx + 1,
        '분류': p.category ? PRODUCT_CATEGORY_LABELS[p.category] : '기타 IT',
        '모델명': p.modelName,
        '축약명': p.shortName || '-',
        '제조사': p.manufacturer || '-',
        'CPU': p.cpu || '-',
        '기본RAM': p.baseRam || (p.onboardRam ? `온보드 ${p.onboardRam}GB` : '-'),
        '추가RAM슬롯': p.ramSlots ? `${p.ramSlots}개 (최대 ${p.maxRam || '-'}GB)` : '-',
        '스토리지슬롯': p.storageSlots ? `${p.storageSlots}슬롯 (${p.storageFormFactors || ''})` : '-',
        '기본스토리지': p.baseStorage || '-',
        '그래픽': p.defaultGpu || (p.gpuType === 'DEDICATED' ? '외장 GPU' : p.gpuType === 'INTEGRATED' ? '내장 GPU' : '-'),
        '화면/규격': p.displaySize ? `${p.displaySize}인치 (${p.resolution || ''})` : p.rackUnit ? `${p.rackUnit}U Rack` : p.formFactor || '-',
        '기본OS': p.defaultOs || '-',
        '사용여부': p.isActive !== false ? '사용' : '미사용',
        '총보유대수': stats.total,
        '당사자산대수': stats.owned,
        '외부임차대수': stats.leased,
        '임대가능대수': stats.available,
        '대여중대수': stats.rented,
        'R2문서건수': docList.length,
        '등록일': p.createdAt?.substring(0, 10) || '-'
      };
    });

    exportToExcel(excelData, `제품모델목록_${new Date().toISOString().split('T')[0]}`, '제품목록');
    showToast(`제품 모델 목록 (${filtered.length}건) 엑셀이 다운로드되었습니다.`);
  };

  const ef = (field: keyof Product) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const val = e.target.type === 'number' ? (e.target.value === '' ? undefined : Number(e.target.value)) : e.target.value;
    setEditForm(prev => ({ ...prev, [field]: val }));
  };

  return (
    <div data-hs-observe="products" data-mid="product-header" style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0, gap: '8px', position: 'relative' }}>
      
      {/* 알림 토스트 배너 */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '24px',
          zIndex: 9999,
          padding: '10px 18px',
          borderRadius: '6px',
          backgroundColor: toastMessage.type === 'success' ? 'var(--success)' : 'var(--danger)',
          color: '#ffffff',
          fontWeight: 600,
          fontSize: '13px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.18)',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          animation: 'fadeIn 0.2s ease-in-out'
        }}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ① 상단 헤더 & 파이프라인 (좌상단 Scope + 우상단 Pipeline: 헌장 3.5) */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '8px',
        paddingBottom: '4px',
        borderBottom: '1px solid var(--border-color)',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <h2 style={{ margin: 0, fontWeight: '700', fontSize: '17px', color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
            제품 모델 관리
          </h2>
          <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            총 <strong>{products.length}</strong>개 모델 (조회 <strong>{filtered.length}</strong>개)
          </span>
        </div>

        {/* 우상단 파이프라인 액션 - 표준 횡배치: 조회 -> 저장/등록 -> 엑셀업로드 -> 엑셀다운로드 */}
        <div className="toolbar-actions">
          <button
            className="btn-query"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} /> 조회
          </button>
          {canSave && (
            <button
              data-hs-trigger="Register"
              data-mid="product-btn-add"
              className="btn-save"
              onClick={handleOpenAddModal}
            >
              <Plus size={13} /> 모델 등록
            </button>
          )}
          <button
            className="btn-excel-download"
            onClick={handleExport}
          >
            <Download size={13} /> 엑셀 다운로드
          </button>
        </div>
      </div>

      {/* ② 모델 및 자산 매핑 KPI 바 (Scope) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '6px', flexShrink: 0 }}>
        <div style={{ padding: '7px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>등록 모델수</span>
          <strong style={{ fontSize: '14px', color: 'var(--primary)', whiteSpace: 'nowrap' }}>{kpiStats.totalModels}종</strong>
        </div>
        <div style={{ padding: '7px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>자산 보유 모델</span>
          <strong style={{ fontSize: '14px', color: 'var(--success)', whiteSpace: 'nowrap' }}>{kpiStats.withAssets}종</strong>
        </div>
        <div style={{ padding: '7px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>자산 미보유 모델</span>
          <strong style={{ fontSize: '14px', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{kpiStats.noAssets}종</strong>
        </div>
        <div style={{ padding: '7px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>매핑 실물자산</span>
          <strong style={{ fontSize: '14px', color: 'var(--primary)', whiteSpace: 'nowrap' }}>{kpiStats.totalMappedAssets}대</strong>
        </div>
        <div style={{ padding: '7px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>R2 보관 문서</span>
          <strong style={{ fontSize: '14px', color: '#0070C0', whiteSpace: 'nowrap' }}>{kpiStats.totalDocs}건</strong>
        </div>
        <div style={{ padding: '7px 12px', backgroundColor: 'var(--bg-card)', borderRadius: '6px', border: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>사용 중 모델</span>
          <strong style={{ fontSize: '14px', color: 'var(--success)', whiteSpace: 'nowrap' }}>{kpiStats.activeModels}종</strong>
        </div>
      </div>

      {/* ③ 필터 컨트롤 바 (Vertical Header-Label Layout: 헌장 3.4) */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        padding: '6px 12px',
        backgroundColor: 'var(--bg-card)',
        borderRadius: '6px',
        border: '1px solid var(--border-color)',
        flexWrap: 'wrap',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', flex: '1', minWidth: '180px' }}>
          <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>통합 검색</label>
          <div style={{ position: 'relative' }}>
            <Search size={13} style={{ position: 'absolute', left: '8px', top: '7px', color: 'var(--text-muted)' }} />
            <input
              type="text"
              placeholder="모델명, 제조사, CPU, 분류, 제원 검색..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '4px 8px 4px 26px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '12px'
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>제품 분류</label>
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value as any)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '12px', minWidth: '100px' }}
          >
            <option value="ALL">전체 분류</option>
            {PRODUCT_CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{PRODUCT_CATEGORY_LABELS[cat]}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>자산 보유 여부</label>
          <select
            value={assetFilter}
            onChange={e => setAssetFilter(e.target.value as any)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '12px', minWidth: '110px' }}
          >
            <option value="ALL">전체 ({kpiStats.totalModels})</option>
            <option value="WITH_ASSETS">자산 보유 ({kpiStats.withAssets})</option>
            <option value="NO_ASSETS">자산 미보유 ({kpiStats.noAssets})</option>
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>제조사</label>
          <select
            value={manufacturerFilter}
            onChange={e => setManufacturerFilter(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '12px', minWidth: '100px' }}
          >
            <option value="ALL">전체 제조사</option>
            {uniqueManufacturers.map(m => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          <label style={{ fontSize: '10.5px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>사용 상태</label>
          <select
            value={activeStatusFilter}
            onChange={e => setActiveStatusFilter(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)', fontSize: '12px', minWidth: '90px' }}
          >
            <option value="ALL">전체 상태</option>
            <option value="ACTIVE">사용</option>
            <option value="INACTIVE">미사용</option>
          </select>
        </div>

        {(searchTerm || assetFilter !== 'ALL' || manufacturerFilter !== 'ALL' || categoryFilter !== 'ALL' || activeStatusFilter !== 'ALL') && (
          <button
            onClick={() => { setSearchTerm(''); setAssetFilter('ALL'); setManufacturerFilter('ALL'); setCategoryFilter('ALL'); setActiveStatusFilter('ALL'); }}
            style={{
              marginTop: '16px',
              padding: '4px 8px',
              fontSize: '11.5px',
              border: '1px solid var(--border-color)',
              borderRadius: '4px',
              backgroundColor: 'transparent',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap'
            }}
          >
            <RefreshCw size={11} /> 초기화
          </button>
        )}
      </div>

      {/* ④ 고밀도 제품 모델 대장 그리드 (Body / Inspection: 헌장 3.6 유형 B) */}
      <div style={{
        flex: 1,
        backgroundColor: 'var(--bg-card)',
        borderRadius: '6px',
        border: '1px solid var(--table-border-color)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0
      }}>
        <div style={{ flex: 1, minHeight: 0, overflowX: 'auto', overflowY: 'auto' }}>
          <table data-mid="product-table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '11.5px', whiteSpace: 'nowrap' }}>
            <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
              <tr style={{ backgroundColor: 'var(--bg-app)', borderBottom: '2px solid var(--table-border-color)', color: 'var(--text-secondary)', fontWeight: 700 }}>
                <th style={{ padding: '7px 8px', width: '50px', textAlign: 'center', whiteSpace: 'nowrap' }}>상세</th>
                <th style={{ padding: '7px 8px', width: '60px', textAlign: 'center', whiteSpace: 'nowrap' }}>사진</th>
                <SortableTh sortKey="category" currentSort={sortConfig} onSort={requestSort} align="center" style={{ padding: '7px 8px' }}>분류</SortableTh>
                <SortableTh sortKey="modelName" currentSort={sortConfig} onSort={requestSort} style={{ padding: '7px 8px' }}>모델명</SortableTh>
                <SortableTh sortKey="manufacturer" currentSort={sortConfig} onSort={requestSort} style={{ padding: '7px 8px' }}>제조사</SortableTh>
                <SortableTh sortKey="cpu" currentSort={sortConfig} onSort={requestSort} style={{ padding: '7px 8px' }}>CPU / 프로세서</SortableTh>
                <SortableTh sortKey="baseRam" currentSort={sortConfig} onSort={requestSort} style={{ padding: '7px 8px' }}>RAM 사양</SortableTh>
                <SortableTh sortKey="baseStorage" currentSort={sortConfig} onSort={requestSort} style={{ padding: '7px 8px' }}>스토리지 슬롯</SortableTh>
                <SortableTh sortKey="defaultGpu" currentSort={sortConfig} onSort={requestSort} style={{ padding: '7px 8px' }}>그래픽</SortableTh>
                <SortableTh sortKey="displaySize" currentSort={sortConfig} onSort={requestSort} style={{ padding: '7px 8px' }}>디스플레이/규격</SortableTh>
                <SortableTh sortKey="assetCount" currentSort={sortConfig} onSort={requestSort} style={{ padding: '7px 8px' }}>실물자산 (당사/임차)</SortableTh>
                <th style={{ padding: '7px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>R2 문서함</th>
                <SortableTh sortKey="isActive" currentSort={sortConfig} onSort={requestSort} align="center" style={{ padding: '7px 8px' }}>상태</SortableTh>
              </tr>
            </thead>
            <tbody>
              {sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={13} style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                    조회 조건에 해당하는 IT 제품 모델이 없습니다.
                  </td>
                </tr>
              ) : (
                sortedProducts.map(p => {
                  const stats = assetStatsMap.get(p.id) || { total: 0, owned: 0, leased: 0, available: 0, rented: 0, assigned: 0, repairing: 0 };
                  const docList = r2FilesByModelMap.get(p.id) || [];
                  const catLabel = p.category ? PRODUCT_CATEGORY_LABELS[p.category] : '기타 IT';
                  const ramDesc = p.baseRam || (p.onboardRam ? `온보드 ${p.onboardRam}GB` : '') + (p.ramSlots ? ` + ${p.ramSlots}슬롯` : '') || (p.maxRam ? `최대 ${p.maxRam}GB` : '-');
                  const storageDesc = p.baseStorage || (p.storageSlots ? `${p.storageSlots}슬롯 (${p.storageFormFactors || '기본'})` : '-');
                  const gpuDesc = p.defaultGpu || (p.gpuType === 'DEDICATED' ? '외장 GPU' : p.gpuType === 'INTEGRATED' ? '내장 그래픽' : '-');
                  const displayDesc = p.displaySize ? `${p.displaySize}" ${p.resolution ? `(${p.resolution})` : ''}` : p.rackUnit ? `${p.rackUnit}U Rack` : p.formFactor || '-';

                  return (
                    <tr
                      key={p.id}
                      onClick={() => handleSelectProduct(p)}
                      style={{
                        borderBottom: '1px solid var(--table-row-border)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s',
                        opacity: p.isActive !== false ? 1 : 0.65
                      }}
                      className="hover-row"
                    >
                      {/* 상세 버튼 */}
                      <td style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleSelectProduct(p); }}
                          style={{
                            padding: '2px 6px',
                            fontSize: '11px',
                            border: '1px solid var(--border-color)',
                            borderRadius: '3px',
                            backgroundColor: 'transparent',
                            cursor: 'pointer',
                            color: 'var(--primary)',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          보기
                        </button>
                      </td>

                      {/* 사진 */}
                      <td style={{ padding: '4px 6px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        {p.photos && p.photos.length > 0 ? (
                          <div
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewPhotos(p.photos || []);
                              setPreviewModelName(p.modelName);
                              setPreviewPhotoIndex(0);
                              setShowPhotoViewer(true);
                            }}
                            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                            title="클릭하여 사진 확대 보기"
                          >
                            <div style={{ width: '28px', height: '22px', borderRadius: '3px', overflow: 'hidden', border: '1px solid var(--border-color)', backgroundColor: '#000000', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <img src={p.photos[0].url} alt={p.photos[0].tagLabel || '사진'} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            </div>
                            <span style={{ fontSize: '10.5px', color: 'var(--primary)', fontWeight: 600 }}>
                              📷 {p.photos.length}
                            </span>
                          </div>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '11px' }}>-</span>
                        )}
                      </td>

                      {/* 분류 */}
                      <td style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span className="badge badge-info" style={{ fontSize: '10.5px', padding: '2px 6px' }}>
                          {catLabel}
                        </span>
                      </td>

                      {/* 모델명 */}
                      <td style={{ padding: '6px 8px', fontWeight: 700, color: 'var(--primary)', whiteSpace: 'nowrap' }}>
                        {p.modelName}
                        {p.shortName && <span style={{ marginLeft: '6px', fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 400 }}>({p.shortName})</span>}
                      </td>

                      {/* 제조사 */}
                      <td style={{ padding: '6px 8px', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{p.manufacturer || '-'}</td>

                      {/* CPU */}
                      <td style={{ padding: '6px 8px', color: 'var(--text-main)', whiteSpace: 'nowrap', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={p.cpu || ''}>
                        {p.cpu || '-'}
                      </td>

                      {/* RAM 사양 */}
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>{ramDesc}</td>

                      {/* 스토리지 슬롯 */}
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>{storageDesc}</td>

                      {/* 그래픽 */}
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap', maxWidth: '180px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={gpuDesc}>
                        {gpuDesc}
                      </td>

                      {/* 디스플레이/규격 */}
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>{displayDesc}</td>

                      {/* 실물자산 보유 현황 */}
                      <td style={{ padding: '6px 8px', whiteSpace: 'nowrap' }}>
                        {stats.total > 0 ? (
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                            <span className="badge badge-primary" style={{ fontSize: '10.5px', padding: '2px 6px' }}>
                              총 {stats.total}대
                            </span>
                            <span style={{ fontSize: '10.5px', color: 'var(--text-secondary)' }}>
                              (자사 {stats.owned} · 임차 {stats.leased})
                            </span>
                          </div>
                        ) : (
                          <span className="badge badge-secondary" style={{ fontSize: '10px', padding: '2px 6px' }}>
                            미보유 (0대)
                          </span>
                        )}
                      </td>

                      {/* R2 문서함 */}
                      <td style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); handleSelectProduct(p); }}
                          className={`badge ${docList.length > 0 ? 'badge-primary' : 'badge-secondary'}`}
                          style={{
                            cursor: 'pointer',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '3px',
                            padding: '2px 6px',
                            fontSize: '10px'
                          }}
                        >
                          <Folder size={11} /> {docList.length}건
                        </button>
                      </td>

                      {/* 사용여부 */}
                      <td style={{ padding: '6px 8px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                        <span className={`badge ${p.isActive !== false ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '10px', padding: '2px 6px' }}>
                          {p.isActive !== false ? '사용' : '미사용'}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ⑤ 우하단 Terminal Action: 모델-자산 정합성 회계 대차대조식 검증 바 (헌장 3.5) */}
        <div style={{
          padding: '8px 14px',
          backgroundColor: 'var(--bg-app)',
          borderTop: '1px solid var(--table-border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px',
          fontSize: '11.5px',
          borderRadius: '0 0 6px 6px',
          flexShrink: 0
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flexWrap: 'wrap' }}>
            <span>전사 등록모델: <strong style={{ color: 'var(--primary)' }}>{kpiStats.totalModels}종</strong> (자산보유 {kpiStats.withAssets}종 / 미보유 {kpiStats.noAssets}종)</span>
            <span>|</span>
            <span>매핑 실물자산: <strong style={{ color: 'var(--primary)' }}>{kpiStats.totalMappedAssets}대</strong></span>
            <span>|</span>
            <span>R2 클라우드 보관문서: <strong style={{ color: '#0070C0' }}>{kpiStats.totalDocs}건</strong></span>
          </div>
        </div>
      </div>

      {/* ⑥ 서랍형 상세 Dossier 슬라이드오버 (헌장 3.6 마스터-디테일 스튜디오) */}
      {selectedProduct && (() => {
        const stats = assetStatsMap.get(selectedProduct.id) || { total: 0, owned: 0, leased: 0, available: 0, rented: 0, assigned: 0, repairing: 0 };
        const docList = r2FilesByModelMap.get(selectedProduct.id) || [];

        return (
          <div style={{
            position: 'fixed',
            top: 0,
            right: 0,
            bottom: 0,
            width: '520px',
            maxWidth: '92vw',
            backgroundColor: 'var(--bg-card)',
            borderLeft: '1px solid var(--border-color)',
            boxShadow: '-4px 0 20px rgba(0,0,0,0.18)',
            zIndex: 1000,
            display: 'flex',
            flexDirection: 'column',
            animation: 'slideLeft 0.2s ease-in-out'
          }}>
            {/* 서랍 헤더 */}
            <div style={{
              padding: '12px 16px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--bg-app)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Package className="text-primary" size={16} />
                <span style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
                  [{selectedProduct.modelName}] {isEditing ? '제원 수정' : '모델 제원 원장'}
                </span>
                <span className={`badge ${selectedProduct.isActive !== false ? 'badge-success' : 'badge-secondary'}`} style={{ fontSize: '10px' }}>
                  {selectedProduct.isActive !== false ? '사용' : '미사용'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <button
                  onClick={() => { if (!isEditing) setSelectedProduct(null); }}
                  style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {/* 서랍 본문 스크롤 영역 */}
            <div style={{ padding: '16px', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              
              {/* 1. 실물 자산 보유 및 가동 현황 */}
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Layers size={14} className="text-primary" /> 실물 자산 보유 및 가동 현황
                  </div>
                  {stats.total > 0 && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setActiveTab('asset')}
                      style={{ padding: '2px 6px', fontSize: '10.5px' }}
                    >
                      자산대장 바로가기
                    </button>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '6px', textAlign: 'center', fontSize: '11px' }}>
                  <div style={{ padding: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>총 보유</div>
                    <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>{stats.total}대</strong>
                  </div>
                  <div style={{ padding: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>임대가능</div>
                    <strong style={{ fontSize: '13px', color: 'var(--success)' }}>{stats.available}대</strong>
                  </div>
                  <div style={{ padding: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>대여중</div>
                    <strong style={{ fontSize: '13px', color: 'var(--primary)' }}>{stats.rented}대</strong>
                  </div>
                  <div style={{ padding: '6px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ color: 'var(--text-muted)' }}>정비중</div>
                    <strong style={{ fontSize: '13px', color: 'var(--danger)' }}>{stats.repairing}대</strong>
                  </div>
                </div>

                <div style={{ marginTop: '6px', fontSize: '11px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between' }}>
                  <span>소유구분: 당사자산 {stats.owned}대 / 외부임차 {stats.leased}대</span>
                  <span>출고대기: {stats.assigned}대</span>
                </div>
              </div>

              {/* 2. 제품 사진 자료 (최대 4장: 전면, 후면, 내부, 기타) */}
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <ProductPhotoManager
                  photos={isEditing ? (editForm.photos || []) : (selectedProduct.photos || [])}
                  onChange={isEditing ? (newPhotos => setEditForm(prev => ({ ...prev, photos: newPhotos }))) : undefined}
                  readOnly={!isEditing}
                  modelName={selectedProduct.modelName}
                  category={selectedProduct.category}
                  maxPhotos={4}
                />
              </div>

              {/* 3. R2 클라우드 문서함 스튜디오 (drcf) */}
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Folder size={14} style={{ color: '#0070C0' }} /> 3. R2 클라우드 문서함
                  </div>
                  
                  {/* 파일 업로드 버튼 */}
                  <label className="btn-primary" style={{
                    padding: '2px 8px',
                    fontSize: '11px',
                    borderRadius: '4px',
                    backgroundColor: 'var(--primary)',
                    color: '#ffffff',
                    cursor: uploadingDoc ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Upload size={11} /> {uploadingDoc ? '업로드중...' : '문서 업로드'}
                    <input
                      type="file"
                      disabled={uploadingDoc}
                      onChange={handleUploadCustomDoc}
                      style={{ display: 'none' }}
                      accept=".pdf,.jpg,.jpeg,.png,.xlsx"
                    />
                  </label>
                </div>

                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>
                  보관 경로: <code style={{ color: 'var(--primary)' }}>Eq_doc/{selectedProduct.modelName}/</code>
                </div>

                {/* 문서 목록 */}
                <div style={{ maxHeight: '140px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {docList.length === 0 ? (
                    <div style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '14px 0', fontSize: '11px' }}>
                      보관된 안전인증서나 제원표 문서가 없습니다.
                    </div>
                  ) : (
                    docList.map((doc, dIdx) => (
                      <div
                        key={dIdx}
                        style={{
                          padding: '5px 8px',
                          borderRadius: '4px',
                          backgroundColor: 'var(--bg-card)',
                          border: '1px solid var(--border-color)',
                          fontSize: '11px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center'
                        }}
                      >
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: 'var(--primary)', fontWeight: 600, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '340px' }}
                        >
                          <ExternalLink size={11} /> {doc.name}
                        </a>
                        <button data-hs-trigger="Delete"
                          type="button"
                          onClick={() => handleDeleteDoc(doc.key)}
                          style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--danger)', padding: '2px' }}
                          title="삭제"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>

              {/* 4. IT 하드웨어 상세 제원 및 슬롯 확장성 */}
              <div style={{ padding: '10px 12px', backgroundColor: 'var(--bg-app)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Cpu size={14} className="text-primary" /> 4. IT 하드웨어 상세 제원 & 확장성
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {!isEditing && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => setShowSpecPreviewModal(true)}
                        style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <FileText size={12} /> 제원표 그래픽
                      </button>
                    )}
                    {canSave && !isEditing && (
                      <button
                        type="button"
                        className="btn-primary"
                        onClick={handleStartEdit}
                        style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <Edit2 size={12} /> 수정
                      </button>
                    )}
                    {isEditing && (
                      <>
                        <button data-hs-trigger="Save"
                          type="button"
                          className="btn-success"
                          onClick={handleSaveEdit}
                          style={{ padding: '3px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Save size={12} /> 저장
                        </button>
                        <button
                          type="button"
                          className="btn-secondary"
                          onClick={handleCancelEdit}
                          style={{ padding: '3px 8px', fontSize: '11px' }}
                        >
                          취소
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {isEditing ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {/* 3.1 기본 식별 */}
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '3px' }}>
                      ■ 제품 기본 식별
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div>
                        <label style={labelStyle}>제품 분류 *</label>
                        <select style={inputStyle} value={editForm.category || 'LAPTOP'} onChange={ef('category')}>
                          {PRODUCT_CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{PRODUCT_CATEGORY_LABELS[cat]}</option>
                          ))}
                        </select>
                      </div>
                      <div><label style={labelStyle}>모델명 *</label><input style={inputStyle} value={editForm.modelName || ''} onChange={ef('modelName')} /></div>
                      <div><label style={labelStyle}>축약 모델명</label><input style={inputStyle} placeholder="예: Latitude 5540" value={editForm.shortName || ''} onChange={ef('shortName')} /></div>
                      <div><label style={labelStyle}>제조사 *</label><input style={inputStyle} value={editForm.manufacturer || ''} onChange={ef('manufacturer')} /></div>
                      <div><label style={labelStyle}>출시년도</label><input style={inputStyle} placeholder="예: 2024" value={editForm.releaseYear || ''} onChange={ef('releaseYear')} /></div>
                      <div><label style={labelStyle}>보증 유형</label><input style={inputStyle} placeholder="예: 3년 익일 방문 NBD" value={editForm.warrantyType || ''} onChange={ef('warrantyType')} /></div>
                      <div>
                        <label style={labelStyle}>사용 상태</label>
                        <select
                          style={inputStyle}
                          value={editForm.isActive !== false ? 'true' : 'false'}
                          onChange={e => setEditForm(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                        >
                          <option value="true">사용</option>
                          <option value="false">미사용</option>
                        </select>
                      </div>
                    </div>

                    {/* 3.2 하드웨어 스펙 & 확장 슬롯 */}
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '3px', marginTop: '4px' }}>
                      ■ 하드웨어 코어 제원 및 슬롯 확장성
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>CPU / 프로세서</label>
                        <input style={inputStyle} placeholder="예: Intel Core i7-13700H, Apple M3 Pro, AMD Ryzen 7 7840U" value={editForm.cpu || ''} onChange={ef('cpu')} />
                      </div>
                      <div><label style={labelStyle}>온보드 RAM (GB)</label><input type="number" style={inputStyle} placeholder="예: 16 (온보드 없을시 0)" value={editForm.onboardRam ?? ''} onChange={ef('onboardRam')} /></div>
                      <div><label style={labelStyle}>추가 RAM 슬롯 수</label><input type="number" style={inputStyle} placeholder="예: 1 또는 2" value={editForm.ramSlots ?? ''} onChange={ef('ramSlots')} /></div>
                      <div><label style={labelStyle}>최대 지원 RAM (GB)</label><input type="number" style={inputStyle} placeholder="예: 64" value={editForm.maxRam ?? ''} onChange={ef('maxRam')} /></div>
                      <div><label style={labelStyle}>기본 RAM 구성 요약</label><input style={inputStyle} placeholder="예: 16GB (온보드 16GB + 슬롯1 여유)" value={editForm.baseRam || ''} onChange={ef('baseRam')} /></div>

                      <div><label style={labelStyle}>스토리지 슬롯/베이 수</label><input type="number" style={inputStyle} placeholder="예: 2" value={editForm.storageSlots ?? ''} onChange={ef('storageSlots')} /></div>
                      <div><label style={labelStyle}>스토리지 지원 규격</label><input style={inputStyle} placeholder="예: M.2 NVMe 2280 2개" value={editForm.storageFormFactors || ''} onChange={ef('storageFormFactors')} /></div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>기본 스토리지 요약</label>
                        <input style={inputStyle} placeholder="예: 512GB NVMe SSD" value={editForm.baseStorage || ''} onChange={ef('baseStorage')} />
                      </div>

                      <div>
                        <label style={labelStyle}>GPU 유형</label>
                        <select style={inputStyle} value={editForm.gpuType || 'INTEGRATED'} onChange={ef('gpuType')}>
                          <option value="INTEGRATED">내장 그래픽</option>
                          <option value="DEDICATED">외장 GPU (독립 카드/칩셋)</option>
                          <option value="HYBRID">하이브리드</option>
                        </select>
                      </div>
                      <div><label style={labelStyle}>기본 장착 GPU</label><input style={inputStyle} placeholder="예: NVIDIA RTX 4060 8GB 또는 Intel Iris Xe" value={editForm.defaultGpu || ''} onChange={ef('defaultGpu')} /></div>
                    </div>

                    {/* 3.3 특화 제원 & 폼팩터 */}
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '3px', marginTop: '4px' }}>
                      ■ 카테고리별 특화 제원 및 디스플레이/네트워크
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div><label style={labelStyle}>디스플레이 크기 (인치)</label><input type="number" step="0.1" style={inputStyle} placeholder="예: 15.6 또는 27" value={editForm.displaySize ?? ''} onChange={ef('displaySize')} /></div>
                      <div><label style={labelStyle}>해상도</label><input style={inputStyle} placeholder="예: 1920x1080 (FHD), 4K UHD" value={editForm.resolution || ''} onChange={ef('resolution')} /></div>
                      <div><label style={labelStyle}>패널 타입</label><input style={inputStyle} placeholder="예: IPS, OLED, VA" value={editForm.panelType || ''} onChange={ef('panelType')} /></div>
                      <div><label style={labelStyle}>주사율</label><input style={inputStyle} placeholder="예: 60Hz, 144Hz" value={editForm.refreshRate || ''} onChange={ef('refreshRate')} /></div>

                      <div><label style={labelStyle}>폼팩터 / 규격</label><input style={inputStyle} placeholder="예: 1U Rack, 2U Rack, Tower, Slim" value={editForm.formFactor || ''} onChange={ef('formFactor')} /></div>
                      <div><label style={labelStyle}>랙 유닛 (U)</label><input type="number" style={inputStyle} placeholder="예: 1 또는 2" value={editForm.rackUnit ?? ''} onChange={ef('rackUnit')} /></div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>네트워크 포트</label>
                        <input style={inputStyle} placeholder="예: 1GbE RJ45 4포트 + 10GbE SFP+ 2포트" value={editForm.networkPorts || ''} onChange={ef('networkPorts')} />
                      </div>

                      <div><label style={labelStyle}>기본 탑재 OS</label><input style={inputStyle} placeholder="예: Windows 11 Pro, Ubuntu 22.04" value={editForm.defaultOs || ''} onChange={ef('defaultOs')} /></div>
                      <div><label style={labelStyle}>장비 중량</label><input style={inputStyle} placeholder="예: 1.79 kg" value={editForm.weight || ''} onChange={ef('weight')} /></div>

                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>기본 번들 구성품</label>
                        <input style={inputStyle} placeholder="예: 65W Type-C 전원 어댑터, HDMI 케이블, 전용 파우치" value={editForm.bundledAccessories || ''} onChange={ef('bundledAccessories')} />
                      </div>
                    </div>

                    {/* 3.4 다운로드 및 메모 */}
                    <div style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '3px', marginTop: '4px' }}>
                      ■ 기술 문서 링크 및 기타 제원 메모
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div><label style={labelStyle}>제원표(카탈로그) URL</label><input style={inputStyle} placeholder="https://..." value={editForm.specSheetUrl || ''} onChange={ef('specSheetUrl')} /></div>
                      <div><label style={labelStyle}>매뉴얼 다운로드 URL</label><input style={inputStyle} placeholder="https://..." value={editForm.manualUrl || ''} onChange={ef('manualUrl')} /></div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>드라이버 다운로드 URL</label>
                        <input style={inputStyle} placeholder="https://..." value={editForm.driverDownloadUrl || ''} onChange={ef('driverDownloadUrl')} />
                      </div>
                      <div style={{ gridColumn: 'span 2' }}>
                        <label style={labelStyle}>기타 제원 메모</label>
                        <textarea style={{ ...inputStyle, minHeight: '44px' }} placeholder="특이사항 및 제원" value={editForm.spec || ''} onChange={ef('spec')} />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '11.5px' }}>
                    {/* 읽기 전용 1: 제품 기본 식별 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div><span style={{ color: 'var(--text-secondary)' }}>분류:</span> <strong className="badge badge-info" style={{ fontSize: '10px' }}>{selectedProduct.category ? PRODUCT_CATEGORY_LABELS[selectedProduct.category] : '기타 IT'}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>모델명:</span> <strong>{selectedProduct.modelName}</strong></div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>축약 모델명:</span> {selectedProduct.shortName || '-'}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>제조사:</span> {selectedProduct.manufacturer || '-'}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>출시년도:</span> {selectedProduct.releaseYear || '-'}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>보증 형태:</span> {selectedProduct.warrantyType || '-'}</div>
                      <div><span style={{ color: 'var(--text-secondary)' }}>사용 상태:</span> {selectedProduct.isActive !== false ? '사용' : '미사용'}</div>
                    </div>

                    {/* 읽기 전용 2: 하드웨어 코어 제원 & 슬롯 확장성 */}
                    <div style={{ padding: '8px 10px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--primary)', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Cpu size={12} /> 코어 제원 및 슬롯 확장성
                      </div>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                        <div style={{ gridColumn: 'span 2' }}>
                          <span style={{ color: 'var(--text-secondary)' }}>CPU:</span> <strong>{selectedProduct.cpu || '-'}</strong>
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>기본/최대 RAM:</span>{' '}
                          <strong>{selectedProduct.baseRam || (selectedProduct.onboardRam ? `온보드 ${selectedProduct.onboardRam}GB` : '') || '-'}</strong>
                          {selectedProduct.maxRam ? ` (최대 ${selectedProduct.maxRam}GB)` : ''}
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>RAM 슬롯:</span>{' '}
                          {selectedProduct.ramSlots ? `${selectedProduct.ramSlots}개 확장 슬롯` : (selectedProduct.onboardRam ? '온보드 단독 (확장불가)' : '-')}
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>스토리지 슬롯:</span>{' '}
                          <strong>{selectedProduct.storageSlots ? `${selectedProduct.storageSlots}슬롯` : '-'}</strong>
                          {selectedProduct.storageFormFactors ? ` (${selectedProduct.storageFormFactors})` : ''}
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>기본 스토리지:</span>{' '}
                          {selectedProduct.baseStorage || '-'}
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>그래픽 구분:</span>{' '}
                          {selectedProduct.gpuType === 'DEDICATED' ? '외장 GPU' : selectedProduct.gpuType === 'INTEGRATED' ? '내장 그래픽' : selectedProduct.gpuType || '-'}
                        </div>
                        <div>
                          <span style={{ color: 'var(--text-secondary)' }}>기본 장착 GPU:</span>{' '}
                          <strong>{selectedProduct.defaultGpu || '-'}</strong>
                        </div>
                      </div>
                    </div>

                    {/* 읽기 전용 3: 특화 제원 및 환경 */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      {selectedProduct.displaySize && (
                        <div><span style={{ color: 'var(--text-secondary)' }}>화면 규격:</span> <strong>{selectedProduct.displaySize}"</strong> ({selectedProduct.resolution || '해상도 미지정'})</div>
                      )}
                      {selectedProduct.panelType && (
                        <div><span style={{ color: 'var(--text-secondary)' }}>패널 / 주사율:</span> {selectedProduct.panelType} {selectedProduct.refreshRate ? `/ ${selectedProduct.refreshRate}` : ''}</div>
                      )}
                      {selectedProduct.formFactor && (
                        <div><span style={{ color: 'var(--text-secondary)' }}>폼팩터 / 랙:</span> {selectedProduct.formFactor} {selectedProduct.rackUnit ? `(${selectedProduct.rackUnit}U)` : ''}</div>
                      )}
                      {selectedProduct.networkPorts && (
                        <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-secondary)' }}>네트워크 포트:</span> {selectedProduct.networkPorts}</div>
                      )}
                      {selectedProduct.defaultOs && (
                        <div><span style={{ color: 'var(--text-secondary)' }}>기본 OS:</span> <strong>{selectedProduct.defaultOs}</strong></div>
                      )}
                      {selectedProduct.weight && (
                        <div><span style={{ color: 'var(--text-secondary)' }}>무게:</span> {selectedProduct.weight}</div>
                      )}
                      {selectedProduct.bundledAccessories && (
                        <div style={{ gridColumn: 'span 2' }}><span style={{ color: 'var(--text-secondary)' }}>기본 번들:</span> {selectedProduct.bundledAccessories}</div>
                      )}
                      <div style={{ gridColumn: 'span 2' }}>
                        <span style={{ color: 'var(--text-secondary)' }}>기타 제원 메모:</span> {selectedProduct.spec || '-'}
                      </div>
                    </div>

                    {/* 기술 문서 바로가기 링크 */}
                    {(selectedProduct.specSheetUrl || selectedProduct.manualUrl || selectedProduct.driverDownloadUrl) && (
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '4px', borderTop: '1px dashed var(--border-color)' }}>
                        {selectedProduct.specSheetUrl && (
                          <a href={selectedProduct.specSheetUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <ExternalLink size={11} /> 공식 카탈로그
                          </a>
                        )}
                        {selectedProduct.manualUrl && (
                          <a href={selectedProduct.manualUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <ExternalLink size={11} /> 매뉴얼
                          </a>
                        )}
                        {selectedProduct.driverDownloadUrl && (
                          <a href={selectedProduct.driverDownloadUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <ExternalLink size={11} /> 드라이버 센터
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>

            </div>

            {/* 서랍 푸터 */}
            <div style={{ padding: '10px 16px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedProduct(null)}
                style={{ padding: '5px 14px', fontSize: '12px' }}
              >
                닫기
              </button>
            </div>
          </div>
        );
      })()}

      {/* ⑦ 신규 제품 모델 등록 모달 */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100,
          padding: '20px'
        }}>
          <form onSubmit={handleSaveAddModal} className="card" style={{ width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto', backgroundColor: 'var(--bg-card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Cpu className="text-primary" size={18} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>신규 IT 제품 모델 등록</h3>
              </div>
              <button type="button" onClick={() => setShowAddModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}><X size={18} /></button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', fontSize: '12px' }}>
              {/* 1. 제품 기본 정보 */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '3px' }}>
                  1. 제품 기본 식별
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label style={labelStyle}>제품 분류 *</label>
                    <select style={inputStyle} value={editForm.category || 'LAPTOP'} onChange={ef('category')} required>
                      {PRODUCT_CATEGORIES.map(cat => (
                        <option key={cat} value={cat}>{PRODUCT_CATEGORY_LABELS[cat]}</option>
                      ))}
                    </select>
                  </div>
                  <div><label style={labelStyle}>모델명 *</label><input style={inputStyle} placeholder="예: Latitude 5540" value={editForm.modelName || ''} onChange={ef('modelName')} required /></div>
                  <div><label style={labelStyle}>축약 모델명</label><input style={inputStyle} placeholder="예: 5540" value={editForm.shortName || ''} onChange={ef('shortName')} /></div>
                  <div><label style={labelStyle}>제조사 *</label><input style={inputStyle} placeholder="예: Dell, HP, Lenovo, LG, Samsung, Cisco" value={editForm.manufacturer || ''} onChange={ef('manufacturer')} required /></div>
                  <div><label style={labelStyle}>출시년도</label><input style={inputStyle} placeholder="예: 2024" value={editForm.releaseYear || ''} onChange={ef('releaseYear')} /></div>
                  <div><label style={labelStyle}>보증 유형</label><input style={inputStyle} placeholder="예: 3년 익일 방문 NBD" value={editForm.warrantyType || ''} onChange={ef('warrantyType')} /></div>
                  <div>
                    <label style={labelStyle}>사용 상태</label>
                    <select
                      style={inputStyle}
                      value={editForm.isActive !== false ? 'true' : 'false'}
                      onChange={e => setEditForm(prev => ({ ...prev, isActive: e.target.value === 'true' }))}
                    >
                      <option value="true">사용</option>
                      <option value="false">미사용</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* 2. 하드웨어 스펙 & 확장 슬롯 */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '3px' }}>
                  2. 코어 제원 및 슬롯 확장성
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>CPU / 프로세서</label>
                    <input style={inputStyle} placeholder="예: Intel Core i7-13700H, Apple M3 Pro, AMD Ryzen 7 7840U" value={editForm.cpu || ''} onChange={ef('cpu')} />
                  </div>
                  <div><label style={labelStyle}>온보드 RAM (GB)</label><input type="number" style={inputStyle} placeholder="예: 16 (온보드 없으면 0)" value={editForm.onboardRam ?? ''} onChange={ef('onboardRam')} /></div>
                  <div><label style={labelStyle}>추가 RAM 슬롯 수</label><input type="number" style={inputStyle} placeholder="예: 1 또는 2" value={editForm.ramSlots ?? ''} onChange={ef('ramSlots')} /></div>
                  <div><label style={labelStyle}>최대 지원 RAM (GB)</label><input type="number" style={inputStyle} placeholder="예: 64" value={editForm.maxRam ?? ''} onChange={ef('maxRam')} /></div>
                  <div><label style={labelStyle}>기본 RAM 구성 요약</label><input style={inputStyle} placeholder="예: 16GB (온보드 16GB + 슬롯1 여유)" value={editForm.baseRam || ''} onChange={ef('baseRam')} /></div>

                  <div><label style={labelStyle}>스토리지 슬롯/베이 수</label><input type="number" style={inputStyle} placeholder="예: 2" value={editForm.storageSlots ?? ''} onChange={ef('storageSlots')} /></div>
                  <div><label style={labelStyle}>스토리지 지원 규격</label><input style={inputStyle} placeholder="예: M.2 NVMe 2280 2개" value={editForm.storageFormFactors || ''} onChange={ef('storageFormFactors')} /></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>기본 스토리지 요약</label>
                    <input style={inputStyle} placeholder="예: 512GB NVMe SSD" value={editForm.baseStorage || ''} onChange={ef('baseStorage')} />
                  </div>

                  <div>
                    <label style={labelStyle}>GPU 유형</label>
                    <select style={inputStyle} value={editForm.gpuType || 'INTEGRATED'} onChange={ef('gpuType')}>
                      <option value="INTEGRATED">내장 그래픽</option>
                      <option value="DEDICATED">외장 GPU (독립 카드/칩셋)</option>
                      <option value="HYBRID">하이브리드</option>
                    </select>
                  </div>
                  <div><label style={labelStyle}>기본 장착 GPU</label><input style={inputStyle} placeholder="예: NVIDIA RTX 4060 8GB 또는 Intel Iris Xe" value={editForm.defaultGpu || ''} onChange={ef('defaultGpu')} /></div>
                </div>
              </div>

              {/* 3. 특화 제원 & 환경 */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '3px' }}>
                  3. 카테고리별 특화 제원 & 디스플레이/OS
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div><label style={labelStyle}>화면 크기 (인치)</label><input type="number" step="0.1" style={inputStyle} placeholder="예: 15.6 또는 27" value={editForm.displaySize ?? ''} onChange={ef('displaySize')} /></div>
                  <div><label style={labelStyle}>해상도</label><input style={inputStyle} placeholder="예: 1920x1080 (FHD), 4K UHD" value={editForm.resolution || ''} onChange={ef('resolution')} /></div>
                  <div><label style={labelStyle}>패널 타입</label><input style={inputStyle} placeholder="예: IPS, OLED, VA" value={editForm.panelType || ''} onChange={ef('panelType')} /></div>
                  <div><label style={labelStyle}>주사율</label><input style={inputStyle} placeholder="예: 60Hz, 144Hz" value={editForm.refreshRate || ''} onChange={ef('refreshRate')} /></div>

                  <div><label style={labelStyle}>폼팩터 / 규격</label><input style={inputStyle} placeholder="예: 1U Rack, 2U Rack, Tower" value={editForm.formFactor || ''} onChange={ef('formFactor')} /></div>
                  <div><label style={labelStyle}>랙 유닛 (U)</label><input type="number" style={inputStyle} placeholder="예: 1 또는 2" value={editForm.rackUnit ?? ''} onChange={ef('rackUnit')} /></div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>네트워크 포트</label>
                    <input style={inputStyle} placeholder="예: 1GbE RJ45 4포트 + 10GbE SFP+ 2포트" value={editForm.networkPorts || ''} onChange={ef('networkPorts')} />
                  </div>

                  <div><label style={labelStyle}>기본 탑재 OS</label><input style={inputStyle} placeholder="예: Windows 11 Pro, Ubuntu 22.04" value={editForm.defaultOs || ''} onChange={ef('defaultOs')} /></div>
                  <div><label style={labelStyle}>장비 중량</label><input style={inputStyle} placeholder="예: 1.79 kg" value={editForm.weight || ''} onChange={ef('weight')} /></div>

                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>기본 번들 구성품</label>
                    <input style={inputStyle} placeholder="예: 65W Type-C 전원 어댑터, HDMI 케이블, 전용 파우치" value={editForm.bundledAccessories || ''} onChange={ef('bundledAccessories')} />
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <label style={labelStyle}>기타 제원 메모</label>
                    <textarea style={{ ...inputStyle, minHeight: '44px' }} placeholder="특이사항 및 제원" value={editForm.spec || ''} onChange={ef('spec')} />
                  </div>
                </div>
              </div>

              {/* 4. 사진 자료 (최대 4장: 전면, 후면, 내부, 기타) */}
              <div>
                <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', marginBottom: '6px', borderBottom: '1px solid var(--border-color)', paddingBottom: '3px' }}>
                  4. 사진 자료 (최대 4장: 전면, 후면, 내부, 기타)
                </div>
                <div style={{ backgroundColor: 'var(--bg-app)', padding: '10px 12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                  <ProductPhotoManager
                    photos={editForm.photos || []}
                    onChange={newPhotos => setEditForm(prev => ({ ...prev, photos: newPhotos }))}
                    readOnly={false}
                    modelName={editForm.modelName}
                    category={editForm.category}
                    maxPhotos={4}
                  />
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '16px', paddingTop: '10px', borderTop: '1px solid var(--border-color)' }}>
              <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)} style={{ padding: '6px 14px', fontSize: '12px' }}>취소</button>
              <button data-hs-trigger="Register" type="submit" className="btn-primary" style={{ padding: '6px 16px', fontSize: '12px' }}>등록 완료</button>
            </div>
          </form>
        </div>
      )}

      {/* ⑧ 제원표 그래픽 미리보기 모달 */}
      {showSpecPreviewModal && selectedProduct && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.65)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1150,
          padding: '20px'
        }}>
          <div className="card" style={{
            width: '100%', maxWidth: '720px', maxHeight: '90vh', overflowY: 'auto',
            backgroundColor: 'var(--bg-card)', color: 'var(--text-main)', padding: '20px', borderRadius: '8px', boxShadow: 'var(--shadow-lg)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu className="text-primary" size={20} />
                <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 'bold' }}>
                  [{selectedProduct.modelName}] 하드웨어 아키텍처 및 확장 제원 규격
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowSpecPreviewModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={18} />
              </button>
            </div>

            {/* IT 하드웨어 아키텍처 다이어그램 뷰 */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              {/* CPU & Memory 슬롯 다이어그램 */}
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
                  <Cpu size={14} /> CPU & 메모리 확장 구성
                </div>
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>CPU:</strong> {selectedProduct.cpu || '제원 미기재'}</div>
                  <div style={{ padding: '6px 8px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>온보드 RAM:</span>
                      <strong>{selectedProduct.onboardRam ? `${selectedProduct.onboardRam} GB` : '없음 (0GB)'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>확장 슬롯:</span>
                      <strong>{selectedProduct.ramSlots ? `${selectedProduct.ramSlots} 슬롯` : '0 (확장불가)'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px dashed var(--border-color)', paddingTop: '2px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>최대 지원:</span>
                      <strong style={{ color: 'var(--primary)' }}>{selectedProduct.maxRam ? `${selectedProduct.maxRam} GB` : '-'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 스토리지 슬롯 다이어그램 */}
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
                  <HardDrive size={14} /> 스토리지 슬롯/베이 아키텍처
                </div>
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>기본 스토리지:</strong> {selectedProduct.baseStorage || '기본 미지정'}</div>
                  <div style={{ padding: '6px 8px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px solid var(--border-color)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>슬롯/베이 수:</span>
                      <strong>{selectedProduct.storageSlots ? `${selectedProduct.storageSlots} 슬롯` : '1'}</strong>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: 'var(--text-secondary)' }}>지원 폼팩터:</span>
                      <strong>{selectedProduct.storageFormFactors || 'M.2 / SATA'}</strong>
                    </div>
                  </div>
                </div>
              </div>

              {/* 그래픽 & 비디오 출력 */}
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
                  <Monitor size={14} /> 그래픽 & 디스플레이
                </div>
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>GPU:</strong> {selectedProduct.defaultGpu || (selectedProduct.gpuType === 'DEDICATED' ? '외장 GPU' : '내장 그래픽')}</div>
                  {selectedProduct.displaySize && (
                    <div style={{ color: 'var(--text-secondary)' }}>
                      화면: <strong>{selectedProduct.displaySize}"</strong> ({selectedProduct.resolution || '해상도 미지정'}) {selectedProduct.panelType ? `/ ${selectedProduct.panelType}` : ''}
                    </div>
                  )}
                </div>
              </div>

              {/* 네트워크 & 인프라 규격 */}
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', color: 'var(--primary)', marginBottom: '8px' }}>
                  <Wifi size={14} /> 네트워크 & 폼팩터
                </div>
                <div style={{ fontSize: '11.5px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div><strong>폼팩터:</strong> {selectedProduct.formFactor || (selectedProduct.rackUnit ? `${selectedProduct.rackUnit}U Rack` : '표준')}</div>
                  <div><strong>포트:</strong> {selectedProduct.networkPorts || '표준 RJ-45 LAN / Wi-Fi'}</div>
                </div>
              </div>
            </div>

            {/* 제품 사진 자료 (전면, 후면, 내부, 기타) */}
            {selectedProduct.photos && selectedProduct.photos.length > 0 && (
              <div style={{ backgroundColor: 'var(--bg-app)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-color)', marginBottom: '16px' }}>
                <ProductPhotoManager
                  photos={selectedProduct.photos}
                  readOnly={true}
                  modelName={selectedProduct.modelName}
                  category={selectedProduct.category}
                  maxPhotos={4}
                />
              </div>
            )}

            {/* IT 장비 제원 종합 요약 테이블 */}
            <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid var(--border-color)', fontSize: '11.5px', textAlign: 'center' }}>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ backgroundColor: 'var(--bg-app)', fontWeight: 'bold', width: '20%', padding: '6px' }}>장 비 명</td>
                  <td style={{ width: '30%', padding: '6px', fontWeight: 'bold' }}>{selectedProduct.modelName}</td>
                  <td style={{ backgroundColor: 'var(--bg-app)', fontWeight: 'bold', width: '20%', padding: '6px' }}>제 품 분 류</td>
                  <td style={{ width: '30%', padding: '6px' }}>{selectedProduct.category ? PRODUCT_CATEGORY_LABELS[selectedProduct.category] : '기타 IT'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ backgroundColor: 'var(--bg-app)', fontWeight: 'bold', padding: '6px' }}>제 조 사</td>
                  <td style={{ padding: '6px' }}>{selectedProduct.manufacturer}</td>
                  <td style={{ backgroundColor: 'var(--bg-app)', fontWeight: 'bold', padding: '6px' }}>기 본 O S</td>
                  <td style={{ padding: '6px' }}>{selectedProduct.defaultOs || '미탑재 / 별도'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ backgroundColor: 'var(--bg-app)', fontWeight: 'bold', padding: '6px' }}>C P U</td>
                  <td style={{ padding: '6px' }} colSpan={3}>{selectedProduct.cpu || '-'}</td>
                </tr>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ backgroundColor: 'var(--bg-app)', fontWeight: 'bold', padding: '6px' }}>R A M</td>
                  <td style={{ padding: '6px' }}>{selectedProduct.baseRam || '-'}</td>
                  <td style={{ backgroundColor: 'var(--bg-app)', fontWeight: 'bold', padding: '6px' }}>스 토 리 지</td>
                  <td style={{ padding: '6px' }}>{selectedProduct.baseStorage || '-'}</td>
                </tr>
                <tr>
                  <td style={{ backgroundColor: 'var(--bg-app)', fontWeight: 'bold', padding: '6px' }}>그 래 픽</td>
                  <td style={{ padding: '6px' }}>{selectedProduct.defaultGpu || '-'}</td>
                  <td style={{ backgroundColor: 'var(--bg-app)', fontWeight: 'bold', padding: '6px' }}>보 증 기 간</td>
                  <td style={{ padding: '6px' }}>{selectedProduct.warrantyType || '1년 표준'}</td>
                </tr>
              </tbody>
            </table>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setShowSpecPreviewModal(false)}
                style={{ padding: '5px 14px', fontSize: '12px' }}
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 📷 전역 사진 라이트박스 뷰어 모달 */}
      <ProductPhotoViewerModal
        isOpen={showPhotoViewer}
        onClose={() => setShowPhotoViewer(false)}
        photos={previewPhotos}
        initialIndex={previewPhotoIndex}
        modelName={previewModelName}
      />

    </div>
  );
};

// 헬퍼 스타일
const labelStyle: React.CSSProperties = {
  fontSize: '11px',
  color: 'var(--text-muted)',
  fontWeight: '600',
  display: 'block',
  marginBottom: '3px',
};
const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '5px 8px',
  fontSize: '12px',
  borderRadius: '4px',
  border: '1px solid var(--border-color)',
  backgroundColor: 'var(--bg-app)',
  color: 'var(--text-main)',
  boxSizing: 'border-box',
};
