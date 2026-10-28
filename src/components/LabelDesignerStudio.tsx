import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Sliders,
  Save,
  RotateCcw,
  Eye,
  EyeOff,
  Type,
  Barcode,
  Maximize2,
  Printer,
  CheckCircle2,
  Move,
  Plus,
  Trash2,
  FolderOpen,
  Download,
  Lock,
  Unlock,
  Upload,
  RefreshCw,
  Copy
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  ASSET_TABLE_SCHEMA_FIELDS,
  DEFAULT_LABEL_TEMPLATE,
  LabelTemplatePreset,
  LabelElement,
  createEmptyTemplate,
  getAllPresets,
  getStoredLabelTemplate,
  saveStoredLabelTemplate,
  deleteStoredLabelTemplate,
  saveBackendLabelTemplate,
  syncTemplatesWithBackend,
  updatePresetLock,
  generateDynamicZpl,
  generateWysiwygZpl,
  convertImageToZplGf,
  mmToDots,
  normalizeAssetForLabel,
  generateLabelPrintHtml
} from '../utils/labelTemplateEngine';
import {
  LabelPrinterInfo,
  getRegisteredPrinters,
  getActivePrinterId,
  setActivePrinterId,
  sendZplToPrinter,
  fetchActualConnectedPrinters,
  openBrowserLabelPrintWindow
} from '../utils/labelPrinterManager';
import { RealBarcodeSvg } from '../utils/barcodeGenerator';

const PX_PER_MM = 3.78;

export const LabelDesignerStudio: React.FC = () => {
  const { assets, products } = useApp();

  const [presets, setPresets] = useState<LabelTemplatePreset[]>(getAllPresets);
  const [template, setTemplate] = useState<LabelTemplatePreset>(() => {
    const stored = getStoredLabelTemplate();
    return stored && Array.isArray(stored.elements) ? stored : DEFAULT_LABEL_TEMPLATE;
  });
  const [selectedElemId, setSelectedElemId] = useState<string>('elem_asset_no');
  const [saveBanner, setSaveBanner] = useState<string>('');
  const [zplPreview, setZplPreview] = useState<string>('');
  const [isZplManuallyEdited, setIsZplManuallyEdited] = useState<boolean>(false);
  const [isTestingPrint, setIsTestingPrint] = useState<boolean>(false);
  const [testPrintCopies, setTestPrintCopies] = useState<number>(1);
  const [printers, setPrinters] = useState<LabelPrinterInfo[]>(getRegisteredPrinters);
  const [isScanningPrinters, setIsScanningPrinters] = useState<boolean>(false);

  // 미리보기 샘플 자산 선택 (우리 자산 테이블 연동)
  const [selectedSampleAssetId, setSelectedSampleAssetId] = useState<string>('');

  // 디자인 추가 모달 상태
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [newPresetName, setNewPresetName] = useState<string>('');
  const [newWidthMm, setNewWidthMm] = useState<number>(72);
  const [newHeightMm, setNewHeightMm] = useState<number>(40);
  const [newTargetPrinterId, setNewTargetPrinterId] = useState<string>('');

  // 디자인 목록 관리 모달 상태
  const [isListModalOpen, setIsListModalOpen] = useState<boolean>(false);

  const canvasRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    isDragging: boolean;
    elemId: string | null;
    startX: number;
    startY: number;
    origXMm: number;
    origYMm: number;
  }>({
    isDragging: false,
    elemId: null,
    startX: 0,
    startY: 0,
    origXMm: 0,
    origYMm: 0
  });
  const importFileRef = useRef<HTMLInputElement | null>(null);

  const isCurrentLocked = Boolean(template?.isLocked || template?.paper?.isLocked);

  // 미리보기 대상 자산 레코드 결정 (실제 db.assets 첫 번째 자산 또는 선택된 자산)
  const previewAssetData = useMemo(() => {
    const foundAsset = selectedSampleAssetId
      ? assets.find(a => a.id === selectedSampleAssetId || a.assetNo === selectedSampleAssetId)
      : assets[0];
    if (foundAsset) {
      return normalizeAssetForLabel(foundAsset, products);
    }
    return normalizeAssetForLabel({}, products);
  }, [assets, products, selectedSampleAssetId]);

  useEffect(() => {
    if (!selectedSampleAssetId && assets.length > 0) {
      setSelectedSampleAssetId(assets[0].id);
    }
  }, [assets, selectedSampleAssetId]);

  // 마운트 시 DB 서식 및 로컬 프린터 동기화
  useEffect(() => {
    Promise.all([
      syncTemplatesWithBackend(),
      fetchActualConnectedPrinters()
    ]).then(([syncedPresets, detectedPrinters]) => {
      if (detectedPrinters && detectedPrinters.length > 0) {
        setPrinters(detectedPrinters);
      }
      if (syncedPresets && syncedPresets.length > 0) {
        setPresets(syncedPresets);
        const active = getStoredLabelTemplate() || syncedPresets[0];
        if (active && Array.isArray(active.elements)) {
          setTemplate(active);
          if (active.elements.length > 0) {
            setSelectedElemId(active.elements[0].id);
          }
        }
      }
    }).catch(() => {});
  }, []);

  // 실시간 ZPL 미리보기 갱신
  useEffect(() => {
    if (!isZplManuallyEdited) {
      try {
        const zpl = generateDynamicZpl(previewAssetData, template, products);
        setZplPreview(zpl);
      } catch (e) {
        console.warn('ZPL Preview Error:', e);
      }
    }
  }, [template, previewAssetData, products, isZplManuallyEdited]);

  const handleToggleLock = async () => {
    const nextLock = !isCurrentLocked;
    setTemplate(prev => ({
      ...prev,
      isLocked: nextLock,
      paper: {
        ...prev.paper,
        isLocked: nextLock
      }
    }));

    const res = await updatePresetLock(template.templateId, nextLock);
    setPresets(getAllPresets());
    if (res.success) {
      setSaveBanner(nextLock
        ? `[${template.name}] 서식이 확정 잠금 처리되었습니다.`
        : `[${template.name}] 서식 잠금이 해제되어 편집이 가능합니다.`
      );
      setTimeout(() => setSaveBanner(''), 3000);
    }
  };

  const handleDiscoverPrinters = async () => {
    setIsScanningPrinters(true);
    try {
      const detected = await fetchActualConnectedPrinters();
      if (detected && detected.length > 0) {
        setPrinters(detected);
        setSaveBanner(`연결된 프린터 ${detected.length}대를 감지하였습니다.`);
        setTimeout(() => setSaveBanner(''), 3500);
      }
    } finally {
      setIsScanningPrinters(false);
    }
  };

  const handleSelectPreset = (presetId: string) => {
    const found = presets.find(p => p.templateId === presetId);
    if (found && Array.isArray(found.elements)) {
      setTemplate(found);
      setIsZplManuallyEdited(false);
      saveStoredLabelTemplate(found);
      if (found.elements.length > 0) {
        setSelectedElemId(found.elements[0].id);
      }

      const targetPrnId = found.targetPrinterId || found.paper?.targetPrinterId;
      const targetPrnName = found.targetPrinterName || found.paper?.targetPrinterName;
      if (targetPrnId || targetPrnName) {
        const targetPrn = printers.find(p =>
          (targetPrnId && p.id === targetPrnId) ||
          (targetPrnName && (p.name === targetPrnName || p.rawName === targetPrnName))
        );
        if (targetPrn) {
          setActivePrinterId(targetPrn.id);
        }
      }
    }
  };

  const handleCreateNewPreset = async () => {
    if (!newPresetName.trim()) {
      alert('디자인 서식 명칭을 입력하세요.');
      return;
    }

    const selectedPrn = printers.find(p => p.id === newTargetPrinterId) || printers[0];
    const newTpl = createEmptyTemplate(
      newPresetName.trim(),
      'asset',
      Number(newWidthMm) || 72,
      Number(newHeightMm) || 40,
      selectedPrn?.id || '',
      selectedPrn?.name || '',
      ASSET_TABLE_SCHEMA_FIELDS
    );

    const res = await saveBackendLabelTemplate(newTpl);
    const updatedList = getAllPresets();
    setPresets(updatedList);
    setTemplate(newTpl);
    if (newTpl.elements.length > 0) {
      setSelectedElemId(newTpl.elements[0].id);
    }
    setIsAddModalOpen(false);
    setNewPresetName('');
    setSaveBanner(`신규 서식 [${newTpl.name}] 생성 완료 (${res.message})`);
    setTimeout(() => setSaveBanner(''), 3500);
  };

  const handleDeleteCurrentPreset = async () => {
    if (presets.length <= 1) {
      alert('최소 1개의 기본 라벨 서식은 유지되어야 합니다.');
      return;
    }
    if (!window.confirm(`현재 선택된 [${template.name}] 서식을 삭제하시겠습니까?`)) {
      return;
    }
    const deletedId = template.templateId;
    await deleteStoredLabelTemplate(deletedId);
    const updatedList = getAllPresets();
    setPresets(updatedList);
    const nextTpl = updatedList[0] || DEFAULT_LABEL_TEMPLATE;
    setTemplate(nextTpl);
    setSaveBanner('서식이 삭제되었습니다.');
    setTimeout(() => setSaveBanner(''), 3000);
  };

  const handleExportTemplateJson = (targetTpl: LabelTemplatePreset = template) => {
    try {
      const exportData = {
        ...targetTpl,
        exportedAt: new Date().toISOString(),
        version: '3.0'
      };
      const jsonStr = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const safeName = (targetTpl.name || 'label_template').replace(/[^a-zA-Z0-9가-힣_-]/g, '_');
      a.href = url;
      a.download = `라벨서식_${safeName}_${targetTpl.paper?.widthMm || 72}x${targetTpl.paper?.heightMm || 40}mm.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setSaveBanner(`[${targetTpl.name}] JSON 파일이 다운로드되었습니다.`);
      setTimeout(() => setSaveBanner(''), 3500);
    } catch (e: any) {
      alert('JSON 내보내기 오류: ' + e.message);
    }
  };

  const handleImportTemplateJson = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !parsed.paper || !Array.isArray(parsed.elements)) {
        alert('유효한 라벨 서식 JSON 파일이 아닙니다.');
        return;
      }

      const importedTpl: LabelTemplatePreset = {
        ...parsed,
        templateId: parsed.templateId || `tpl_import_${Date.now()}`,
        name: parsed.name || file.name.replace(/\.json$/i, ''),
        targetTable: 'asset'
      };

      const res = await saveBackendLabelTemplate(importedTpl);
      const updatedList = getAllPresets();
      setPresets(updatedList);
      setTemplate(importedTpl);
      setIsZplManuallyEdited(false);
      if (importedTpl.elements.length > 0) {
        setSelectedElemId(importedTpl.elements[0].id);
      }

      setSaveBanner(`[${importedTpl.name}] JSON 서식을 불러와 저장하였습니다. (${res.message})`);
      setTimeout(() => setSaveBanner(''), 4000);
    } catch (err: any) {
      alert('JSON 파일 읽기 실패: ' + err.message);
    } finally {
      e.target.value = '';
    }
  };

  const selectedElem = useMemo(() => {
    if (!template || !Array.isArray(template.elements)) return undefined;
    return template.elements.find(e => e.id === selectedElemId) || template.elements[0];
  }, [template, selectedElemId]);

  const handlePaperResize = (field: 'widthMm' | 'heightMm', val: string | number) => {
    const num = Math.max(15, Math.min(150, Number(val) || 20));
    setIsZplManuallyEdited(false);
    setTemplate(prev => {
      const nextPaper = {
        ...prev.paper,
        [field]: num,
        dotsWidth: field === 'widthMm' ? mmToDots(num, prev.paper.dpi) : prev.paper.dotsWidth,
        dotsHeight: field === 'heightMm' ? mmToDots(num, prev.paper.dpi) : prev.paper.dotsHeight
      };
      return { ...prev, paper: nextPaper };
    });
  };

  const updateElement = (elemId: string, patch: Partial<LabelElement>) => {
    setIsZplManuallyEdited(false);
    setTemplate(prev => ({
      ...prev,
      elements: prev.elements.map(el => (el.id === elemId ? { ...el, ...patch } : el))
    }));
  };

  const handleMouseDown = (e: React.MouseEvent, elem: LabelElement) => {
    e.stopPropagation();
    setSelectedElemId(elem.id);
    if (isCurrentLocked) return;

    dragRef.current = {
      isDragging: true,
      elemId: elem.id,
      startX: e.clientX,
      startY: e.clientY,
      origXMm: Number(elem.xMm) || 0,
      origYMm: Number(elem.yMm) || 0
    };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDragging || !dragRef.current.elemId) return;
    const dxPx = e.clientX - dragRef.current.startX;
    const dyPx = e.clientY - dragRef.current.startY;

    const dxMm = dxPx / PX_PER_MM;
    const dyMm = dyPx / PX_PER_MM;

    const newXMm = Math.max(
      0,
      Math.min(template.paper.widthMm - 2, Math.round((dragRef.current.origXMm + dxMm) * 2) / 2)
    );
    const newYMm = Math.max(
      0,
      Math.min(template.paper.heightMm - 2, Math.round((dragRef.current.origYMm + dyMm) * 2) / 2)
    );

    updateElement(dragRef.current.elemId, { xMm: newXMm, yMm: newYMm });
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
    dragRef.current.elemId = null;
  };

  const handleSave = async () => {
    setSaveBanner('저장 중...');
    const res = await saveBackendLabelTemplate(template);
    setPresets(getAllPresets());
    setSaveBanner(`[${template.name}] 저장 완료 (${res.message})`);
    setTimeout(() => setSaveBanner(''), 4000);
  };

  const handleReset = () => {
    if (!window.confirm('현재 서식의 레이아웃을 초기 기본값으로 되돌리시겠습니까?')) return;
    const resetTpl = createEmptyTemplate(
      template.name,
      'asset',
      template.paper?.widthMm || 72,
      template.paper?.heightMm || 40,
      template.targetPrinterId || '',
      template.targetPrinterName || '',
      ASSET_TABLE_SCHEMA_FIELDS
    );
    resetTpl.templateId = template.templateId;
    setTemplate(resetTpl);
    saveStoredLabelTemplate(resetTpl);
    setSaveBanner('초기 레이아웃으로 복원되었습니다.');
    setTimeout(() => setSaveBanner(''), 3000);
  };

  const resolveActivePrinter = (): LabelPrinterInfo => {
    const allPrinters = getRegisteredPrinters();
    const activePrinterId = template.targetPrinterId || getActivePrinterId();
    return allPrinters.find(p => p.id === activePrinterId) || allPrinters[0];
  };

  const handleTestPrint = async () => {
    setIsTestingPrint(true);
    try {
      await saveBackendLabelTemplate(template);
      setPresets(getAllPresets());

      let zpl = '';
      try {
        zpl = await generateWysiwygZpl(previewAssetData, template, products);
      } catch {
        zpl = generateDynamicZpl(previewAssetData, template, products);
      }

      const copies = Math.max(1, Number(testPrintCopies) || 1);
      if (copies > 1 && zpl.includes('^XZ')) {
        zpl = zpl.replace(/\^XZ\s*$/, `^PQ${copies},0,1,Y\n^XZ`);
      }

      setZplPreview(zpl);
      setIsZplManuallyEdited(false);

      const activePrinter = resolveActivePrinter();
      const res = await sendZplToPrinter(zpl, activePrinter);

      setSaveBanner(`[${activePrinter?.name || '기본 프린터'}] 테스트 라벨 ${copies}매 출력 완료 (${res.message})`);
      setTimeout(() => setSaveBanner(''), 4000);
    } catch (e: any) {
      alert('테스트 인쇄 오류: ' + e.message);
    } finally {
      setIsTestingPrint(false);
    }
  };

  const handleCustomZplTestPrint = async () => {
    if (!zplPreview || !zplPreview.trim()) {
      alert('출력할 ZPL 코드가 비어있습니다.');
      return;
    }
    setIsTestingPrint(true);
    try {
      let finalZpl = zplPreview.trim();
      const copies = Math.max(1, Number(testPrintCopies) || 1);
      if (copies > 1 && finalZpl.includes('^XZ') && !finalZpl.includes('^PQ')) {
        finalZpl = finalZpl.replace(/\^XZ\s*$/, `^PQ${copies},0,1,Y\n^XZ`);
      }

      const activePrinter = resolveActivePrinter();
      const res = await sendZplToPrinter(finalZpl, activePrinter);

      setSaveBanner(`수정된 ZPL 코드로 [${activePrinter?.name || '기본 프린터'}] 테스트 라벨 ${copies}매 출력 완료 (${res.message})`);
      setTimeout(() => setSaveBanner(''), 4000);
    } catch (e: any) {
      alert('ZPL 직접 인쇄 오류: ' + e.message);
    } finally {
      setIsTestingPrint(false);
    }
  };

  const handleBrowserPreviewPrint = () => {
    const html = generateLabelPrintHtml([previewAssetData], template, products, testPrintCopies);
    openBrowserLabelPrintWindow(html);
  };

  const canvasWidthPx = Math.round((template.paper?.widthMm || 72) * PX_PER_MM);
  const canvasHeightPx = Math.round((template.paper?.heightMm || 40) * PX_PER_MM);

  return (
    <div
      data-mid="label-designer-studio"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
        height: '100%',
        minHeight: 0,
        overflowY: 'auto',
        padding: '4px 2px',
        color: 'var(--text-main)'
      }}
    >
      {/* 1. 상단 서식 선택 및 액션 바 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          backgroundColor: 'var(--bg-card)',
          padding: '8px 12px',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          flexWrap: 'wrap',
          gap: '8px',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <Sliders size={16} style={{ color: 'var(--primary)' }} />
          <span style={{ fontWeight: 700, fontSize: '13.5px', whiteSpace: 'nowrap' }}>라벨 서식 디자인</span>

          {/* 서식 선택 드롭다운 */}
          <select
            data-mid="select-label-preset"
            value={template.templateId}
            onChange={e => handleSelectPreset(e.target.value)}
            style={{
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--primary)',
              borderRadius: '4px',
              padding: '4px 8px',
              color: 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            {presets.map(p => (
              <option key={p.templateId} value={p.templateId}>
                {(p.isLocked || p.paper?.isLocked) ? '🔒 ' : ''}
                {p.name} ({p.paper?.widthMm}×{p.paper?.heightMm}mm)
              </option>
            ))}
          </select>

          <button
            type="button"
            data-mid="btn-add-label-preset"
            onClick={() => setIsAddModalOpen(true)}
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
          >
            <Plus size={12} /> 디자인 추가
          </button>

          <button
            type="button"
            data-mid="btn-list-label-presets"
            onClick={() => setIsListModalOpen(true)}
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
          >
            <FolderOpen size={12} /> 디자인 목록 ({presets.length})
          </button>

          <button
            type="button"
            data-mid="btn-toggle-label-lock"
            onClick={handleToggleLock}
            className="btn-secondary"
            style={{
              padding: '4px 8px',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              borderColor: isCurrentLocked ? 'var(--warning)' : 'var(--border-color)',
              color: isCurrentLocked ? 'var(--warning)' : 'var(--text-secondary)',
              fontWeight: 700,
              whiteSpace: 'nowrap'
            }}
          >
            {isCurrentLocked ? <Lock size={12} /> : <Unlock size={12} />}
            {isCurrentLocked ? '잠금 해제' : '서식 잠금'}
          </button>

          <button
            type="button"
            data-mid="btn-export-label-json"
            onClick={() => handleExportTemplateJson(template)}
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
          >
            <Download size={12} /> JSON 내보내기
          </button>

          <input
            ref={importFileRef}
            type="file"
            accept=".json,application/json"
            onChange={handleImportTemplateJson}
            style={{ display: 'none' }}
          />
          <button
            type="button"
            data-mid="btn-import-label-json"
            onClick={() => importFileRef.current?.click()}
            className="btn-secondary"
            style={{ padding: '4px 8px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
          >
            <Upload size={12} /> JSON 불러오기
          </button>
        </div>

        {/* 우측 액션 버튼군 */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            onClick={handleReset}
            disabled={isCurrentLocked}
            className="btn-secondary"
            style={{
              padding: '4px 8px',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              opacity: isCurrentLocked ? 0.45 : 1,
              cursor: isCurrentLocked ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <RotateCcw size={12} /> 초기화
          </button>

          <button
            type="button"
            onClick={handleDeleteCurrentPreset}
            disabled={isCurrentLocked}
            className="btn-secondary"
            style={{
              padding: '4px 8px',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: 'var(--danger)',
              opacity: isCurrentLocked ? 0.45 : 1,
              cursor: isCurrentLocked ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Trash2 size={12} /> 디자인 삭제
          </button>

          <button
            type="button"
            data-mid="btn-save-label-template"
            onClick={handleSave}
            disabled={isCurrentLocked}
            className="btn-primary"
            style={{
              padding: '4px 10px',
              fontSize: '11.5px',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: 700,
              opacity: isCurrentLocked ? 0.45 : 1,
              cursor: isCurrentLocked ? 'not-allowed' : 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            <Save size={12} /> 수정 저장
          </button>

          {/* 매수 및 테스트 인쇄 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              backgroundColor: 'var(--bg-app)',
              padding: '2px 6px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)'
            }}
          >
            <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>매수</span>
            <input
              type="number"
              min={1}
              max={50}
              value={testPrintCopies}
              onChange={e => setTestPrintCopies(Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)))}
              style={{
                width: '40px',
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border-color)',
                borderRadius: '3px',
                padding: '2px 4px',
                color: 'var(--text-main)',
                fontSize: '11.5px',
                fontWeight: 700,
                textAlign: 'center'
              }}
            />
            <button
              type="button"
              data-mid="btn-label-test-print"
              onClick={handleTestPrint}
              disabled={isTestingPrint}
              className="btn-success"
              style={{
                padding: '4px 10px',
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontWeight: 700,
                whiteSpace: 'nowrap'
              }}
            >
              <Printer size={12} /> {isTestingPrint ? '전송중...' : '테스트 인쇄'}
            </button>
            <button
              type="button"
              data-mid="btn-label-browser-print"
              onClick={handleBrowserPreviewPrint}
              className="btn-secondary"
              style={{
                padding: '4px 8px',
                fontSize: '11.5px',
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                whiteSpace: 'nowrap'
              }}
            >
              <Printer size={12} /> 브라우저 인쇄
            </button>
          </div>
        </div>
      </div>

      {/* 상태 알림 배너 */}
      {saveBanner && (
        <div
          data-mid="label-save-banner"
          style={{
            backgroundColor: 'rgba(16, 185, 129, 0.14)',
            border: '1px solid var(--success)',
            color: 'var(--success)',
            padding: '7px 12px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            flexShrink: 0
          }}
        >
          <CheckCircle2 size={15} /> {saveBanner}
        </div>
      )}

      {/* 2. 메인 2단 구성 (좌: 설정 패널 | 우: 1:1 캔버스 + ZPL 뷰어) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '380px 1fr',
          gap: '12px',
          alignItems: 'start',
          flex: 1,
          minHeight: 0
        }}
      >
        {/* [좌측 패널] 서식 설정, 항목 체크리스트, 선택 요소 정밀 속성 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            backgroundColor: 'var(--bg-card)',
            padding: '10px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}
        >
          {/* 디자인 명칭 & 출력 프린터 지정 */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>디자인 명칭</label>
              <input
                type="text"
                disabled={isCurrentLocked}
                value={template.name || ''}
                onChange={e => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '4px 8px',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 700
                }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600 }}>
                  출력 대상 프린터 지정
                </label>
                <button
                  type="button"
                  onClick={handleDiscoverPrinters}
                  disabled={isScanningPrinters}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    fontSize: '10.5px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                    padding: 0
                  }}
                >
                  <RefreshCw size={10} /> {isScanningPrinters ? '검색중...' : '프린터 재검색'}
                </button>
              </div>
              <select
                disabled={isCurrentLocked}
                value={template.targetPrinterId || template.paper?.targetPrinterId || ''}
                onChange={e => {
                  const prn = printers.find(p => p.id === e.target.value);
                  const pId = prn?.id || '';
                  const pName = prn?.name || '';
                  setTemplate(prev => ({
                    ...prev,
                    targetPrinterId: pId,
                    targetPrinterName: pName,
                    paper: {
                      ...prev.paper,
                      targetPrinterId: pId,
                      targetPrinterName: pName
                    }
                  }));
                }}
                style={{
                  width: '100%',
                  backgroundColor: 'var(--bg-card)',
                  border: '1px solid var(--border-color)',
                  borderRadius: '4px',
                  padding: '4px 6px',
                  color: 'var(--text-main)',
                  fontSize: '11.5px',
                  fontWeight: 600
                }}
              >
                <option value="">기본 활성 프린터 사용</option>
                {printers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* 라벨 용지 규격 (mm) */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px'
            }}
          >
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Maximize2 size={12} /> 라벨 용지 규격 (mm)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>가로 폭 (mm)</label>
                <input
                  type="number"
                  disabled={isCurrentLocked}
                  value={template.paper.widthMm}
                  onChange={e => handlePaperResize('widthMm', e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
                <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>세로 높이 (mm)</label>
                <input
                  type="number"
                  disabled={isCurrentLocked}
                  value={template.paper.heightMm}
                  onChange={e => handlePaperResize('heightMm', e.target.value)}
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    padding: '4px 6px',
                    color: 'var(--text-main)',
                    fontSize: '12px',
                    fontWeight: 700
                  }}
                />
              </div>
            </div>

            {/* ZPL 프린터 원점(^LH) 및 인쇄폭(^PW) 옵션 */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginTop: '2px', paddingTop: '6px', borderTop: '1px dashed var(--border-color)' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  disabled={isCurrentLocked}
                  checked={Boolean(template.paper?.useLabelHome)}
                  onChange={e => {
                    const checked = e.target.checked;
                    const widthMm = Number(template.paper?.widthMm) || 72;
                    const defaultX = widthMm < 104 ? Math.max(0, Math.round(((104 - widthMm) / 2) * 10) / 10) : 0;
                    setIsZplManuallyEdited(false);
                    setTemplate(prev => ({
                      ...prev,
                      paper: {
                        ...prev.paper,
                        useLabelHome: checked,
                        customHomeX: prev.paper?.customHomeX !== undefined ? prev.paper.customHomeX : defaultX,
                        customHomeY: prev.paper?.customHomeY !== undefined ? prev.paper.customHomeY : 0
                      }
                    }));
                  }}
                />
                <span>^LH 라벨 원점 지정</span>
              </label>

              {template.paper?.useLabelHome && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', paddingLeft: '18px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>^LH X (mm)</label>
                    <input
                      type="number"
                      step="0.5"
                      disabled={isCurrentLocked}
                      value={template.paper?.customHomeX ?? 0}
                      onChange={e => {
                        setIsZplManuallyEdited(false);
                        setTemplate(prev => ({
                          ...prev,
                          paper: { ...prev.paper, customHomeX: Number(e.target.value) || 0 }
                        }));
                      }}
                      style={{ width: '100%', padding: '3px 6px', fontSize: '11px', borderRadius: '3px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>^LH Y (mm)</label>
                    <input
                      type="number"
                      step="0.5"
                      disabled={isCurrentLocked}
                      value={template.paper?.customHomeY ?? 0}
                      onChange={e => {
                        setIsZplManuallyEdited(false);
                        setTemplate(prev => ({
                          ...prev,
                          paper: { ...prev.paper, customHomeY: Number(e.target.value) || 0 }
                        }));
                      }}
                      style={{ width: '100%', padding: '3px 6px', fontSize: '11px', borderRadius: '3px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                  </div>
                </div>
              )}

              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  disabled={isCurrentLocked}
                  checked={Boolean(template.paper?.usePrintWidth)}
                  onChange={e => {
                    setIsZplManuallyEdited(false);
                    setTemplate(prev => ({
                      ...prev,
                      paper: { ...prev.paper, usePrintWidth: e.target.checked }
                    }));
                  }}
                />
                <span>^PW 인쇄폭 선언 ({Math.round((Number(template.paper?.widthMm) || 72) * 8)} dots)</span>
              </label>
            </div>
          </div>

          {/* 출력 항목 선택 (우리 자산 테이블 헤더 연동) */}
          <div
            style={{
              backgroundColor: 'var(--bg-app)',
              padding: '8px 10px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px'
            }}
          >
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: 'var(--primary)', marginBottom: '2px' }}>
              출력 항목 선택 (자산 테이블 필드)
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '210px', overflowY: 'auto', paddingRight: '2px' }}>
              {template.elements.map(elem => {
                const isSelected = elem.id === selectedElemId;
                return (
                  <div
                    key={elem.id}
                    onClick={() => setSelectedElemId(elem.id)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      backgroundColor: isSelected ? 'var(--bg-card)' : 'transparent',
                      border: isSelected ? '1px solid var(--primary)' : '1px solid transparent',
                      cursor: 'pointer',
                      fontSize: '11.5px'
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <input
                        type="checkbox"
                        disabled={isCurrentLocked}
                        checked={elem.visible}
                        onChange={e => {
                          e.stopPropagation();
                          updateElement(elem.id, { visible: e.target.checked });
                        }}
                      />
                      <span style={{ fontWeight: isSelected ? 700 : 500, color: elem.visible ? 'var(--text-main)' : 'var(--text-muted)' }}>
                        {elem.name}
                      </span>
                    </div>
                    {elem.visible ? <Eye size={12} style={{ color: 'var(--success)' }} /> : <EyeOff size={12} style={{ color: 'var(--text-muted)' }} />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* 선택 항목 정밀 속성 편집기 */}
          {selectedElem && (
            <div
              style={{
                backgroundColor: 'var(--bg-app)',
                padding: '10px',
                borderRadius: '6px',
                border: '1px solid var(--primary)',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}
            >
              <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                {selectedElem.type === 'barcode' ? <Barcode size={14} /> : <Type size={14} />}
                <span>[{selectedElem.name}] 속성 편집</span>
              </div>

              {/* 1. 텍스트 항목 */}
              {selectedElem.type === 'text' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {(selectedElem.field === 'custom' || selectedElem.field?.startsWith('custom_text_')) && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>고정 텍스트 내용</label>
                      <input
                        type="text"
                        disabled={isCurrentLocked}
                        value={selectedElem.customValue || ''}
                        onChange={e => updateElement(selectedElem.id, { customValue: e.target.value })}
                        placeholder="출력할 고정 문구 입력"
                        style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                    </div>
                  )}

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>앞머리 표기 (Prefix)</label>
                    <input
                      type="text"
                      disabled={isCurrentLocked}
                      value={selectedElem.prefix || ''}
                      onChange={e => updateElement(selectedElem.id, { prefix: e.target.value })}
                      placeholder="예: 자산번호 : "
                      style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>X 좌표 (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        disabled={isCurrentLocked}
                        value={selectedElem.xMm}
                        onChange={e => updateElement(selectedElem.id, { xMm: Number(e.target.value) })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Y 좌표 (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        disabled={isCurrentLocked}
                        value={selectedElem.yMm}
                        onChange={e => updateElement(selectedElem.id, { yMm: Number(e.target.value) })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                    </div>
                  </div>

                  {/* 인쇄 위치 보정 (offsetX, offsetY) */}
                  <div style={{ padding: '6px 8px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--primary)' }}>인쇄 위치 보정 (X / Y mm)</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>X 보정 (mm)</label>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <button type="button" disabled={isCurrentLocked} onClick={() => updateElement(selectedElem.id, { offsetX: Math.round(((Number(selectedElem.offsetX) || 0) - 0.5) * 10) / 10 })} className="btn-secondary" style={{ padding: '2px 5px', fontSize: '10px' }}>-0.5</button>
                          <input type="number" step="0.5" disabled={isCurrentLocked} value={selectedElem.offsetX || 0} onChange={e => updateElement(selectedElem.id, { offsetX: Number(e.target.value) || 0 })} style={{ width: '100%', textAlign: 'center', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '3px', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }} />
                          <button type="button" disabled={isCurrentLocked} onClick={() => updateElement(selectedElem.id, { offsetX: Math.round(((Number(selectedElem.offsetX) || 0) + 0.5) * 10) / 10 })} className="btn-secondary" style={{ padding: '2px 5px', fontSize: '10px' }}>+0.5</button>
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Y 보정 (mm)</label>
                        <div style={{ display: 'flex', gap: '2px' }}>
                          <button type="button" disabled={isCurrentLocked} onClick={() => updateElement(selectedElem.id, { offsetY: Math.round(((Number(selectedElem.offsetY) || 0) - 0.5) * 10) / 10 })} className="btn-secondary" style={{ padding: '2px 5px', fontSize: '10px' }}>-0.5</button>
                          <input type="number" step="0.5" disabled={isCurrentLocked} value={selectedElem.offsetY || 0} onChange={e => updateElement(selectedElem.id, { offsetY: Number(e.target.value) || 0 })} style={{ width: '100%', textAlign: 'center', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '3px', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }} />
                          <button type="button" disabled={isCurrentLocked} onClick={() => updateElement(selectedElem.id, { offsetY: Math.round(((Number(selectedElem.offsetY) || 0) + 0.5) * 10) / 10 })} className="btn-secondary" style={{ padding: '2px 5px', fontSize: '10px' }}>+0.5</button>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* 글자 크기 (1pt 단위) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>글자 크기 (pt)</label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <button type="button" disabled={isCurrentLocked} onClick={() => updateElement(selectedElem.id, { fontSizePt: Math.max(8, (Number(selectedElem.fontSizePt) || 25) - 1) })} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>-1</button>
                      <input
                        type="number"
                        min={8}
                        max={120}
                        disabled={isCurrentLocked}
                        value={selectedElem.fontSizePt || 25}
                        onChange={e => updateElement(selectedElem.id, { fontSizePt: Math.max(8, Math.min(120, Number(e.target.value) || 25)) })}
                        style={{ flex: 1, textAlign: 'center', padding: '4px 6px', fontSize: '12px', fontWeight: 700, borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                      <button type="button" disabled={isCurrentLocked} onClick={() => updateElement(selectedElem.id, { fontSizePt: Math.min(120, (Number(selectedElem.fontSizePt) || 25) + 1) })} className="btn-secondary" style={{ padding: '3px 8px', fontSize: '11px', fontWeight: 700 }}>+1</button>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. 바코드 / QR 항목 */}
              {selectedElem.type === 'barcode' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>바코드 규격</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '4px' }}>
                      {(['CODE128', 'CODE39', 'QR'] as const).map(bType => (
                        <button
                          key={bType}
                          type="button"
                          disabled={isCurrentLocked}
                          onClick={() => updateElement(selectedElem.id, { barcodeType: bType })}
                          style={{
                            padding: '4px 6px',
                            fontSize: '11px',
                            fontWeight: 700,
                            borderRadius: '4px',
                            border: (selectedElem.barcodeType || 'CODE128') === bType ? '1px solid var(--primary)' : '1px solid var(--border-color)',
                            backgroundColor: (selectedElem.barcodeType || 'CODE128') === bType ? 'var(--primary)' : 'var(--bg-card)',
                            color: (selectedElem.barcodeType || 'CODE128') === bType ? '#ffffff' : 'var(--text-main)',
                            cursor: 'pointer'
                          }}
                        >
                          {bType === 'QR' ? '2D QR' : bType}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>바코드 대상 필드</label>
                    <select
                      disabled={isCurrentLocked}
                      value={selectedElem.targetField || 'asset_no'}
                      onChange={e => updateElement(selectedElem.id, { targetField: e.target.value })}
                      style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                    >
                      {ASSET_TABLE_SCHEMA_FIELDS.map(f => (
                        <option key={f.id} value={f.id}>{f.name} ({f.id})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>X 좌표 (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        disabled={isCurrentLocked}
                        value={selectedElem.xMm}
                        onChange={e => updateElement(selectedElem.id, { xMm: Number(e.target.value) })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Y 좌표 (mm)</label>
                      <input
                        type="number"
                        step="0.5"
                        disabled={isCurrentLocked}
                        value={selectedElem.yMm}
                        onChange={e => updateElement(selectedElem.id, { yMm: Number(e.target.value) })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                    </div>
                  </div>

                  {/* 바코드 인쇄 위치 보정 */}
                  <div style={{ padding: '6px 8px', backgroundColor: 'var(--bg-card)', borderRadius: '4px', border: '1px dashed var(--border-color)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontSize: '10.5px', fontWeight: 700, color: 'var(--primary)' }}>인쇄 위치 보정 (X / Y mm)</span>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>X 보정 (mm)</label>
                        <input type="number" step="0.5" disabled={isCurrentLocked} value={selectedElem.offsetX || 0} onChange={e => updateElement(selectedElem.id, { offsetX: Number(e.target.value) || 0 })} style={{ width: '100%', padding: '3px 6px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '3px', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }} />
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>Y 보정 (mm)</label>
                        <input type="number" step="0.5" disabled={isCurrentLocked} value={selectedElem.offsetY || 0} onChange={e => updateElement(selectedElem.id, { offsetY: Number(e.target.value) || 0 })} style={{ width: '100%', padding: '3px 6px', fontSize: '11px', border: '1px solid var(--border-color)', borderRadius: '3px', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }} />
                      </div>
                    </div>
                  </div>

                  {selectedElem.barcodeType === 'QR' ? (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>QR 코드 크기 배율 (1~10)</label>
                      <input
                        type="number"
                        min={1}
                        max={10}
                        disabled={isCurrentLocked}
                        value={selectedElem.qrScale || 4}
                        onChange={e => updateElement(selectedElem.id, { qrScale: Number(e.target.value) })}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                    </div>
                  ) : (
                    <>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>바코드 높이 (mm)</label>
                        <input
                          type="number"
                          step="0.5"
                          min={3}
                          max={40}
                          disabled={isCurrentLocked}
                          value={selectedElem.heightMm || 8}
                          onChange={e => updateElement(selectedElem.id, { heightMm: Number(e.target.value) })}
                          style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                        />
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11.5px', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          disabled={isCurrentLocked}
                          checked={selectedElem.showText !== false}
                          onChange={e => updateElement(selectedElem.id, { showText: e.target.checked })}
                        />
                        <span>하단 텍스트 표시</span>
                      </label>
                    </>
                  )}
                </div>
              )}

              {/* 3. 구분선 항목 */}
              {selectedElem.type === 'line' && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>X 시작 (mm)</label>
                    <input type="number" step="0.5" disabled={isCurrentLocked} value={selectedElem.xMm} onChange={e => updateElement(selectedElem.id, { xMm: Number(e.target.value) })} style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Y 위치 (mm)</label>
                    <input type="number" step="0.5" disabled={isCurrentLocked} value={selectedElem.yMm} onChange={e => updateElement(selectedElem.id, { yMm: Number(e.target.value) })} style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>가로 길이 (mm)</label>
                    <input type="number" step="1" disabled={isCurrentLocked} value={selectedElem.widthMm || 60} onChange={e => updateElement(selectedElem.id, { widthMm: Number(e.target.value) })} style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>두께 (mm)</label>
                    <input type="number" step="0.1" disabled={isCurrentLocked} value={selectedElem.thicknessMm || 0.25} onChange={e => updateElement(selectedElem.id, { thicknessMm: Number(e.target.value) })} style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} />
                  </div>
                </div>
              )}

              {/* 4. 이미지 / 로고 항목 */}
              {selectedElem.type === 'image' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                    <label
                      style={{
                        flex: 1,
                        padding: '5px 8px',
                        textAlign: 'center',
                        borderRadius: '4px',
                        border: '1px solid var(--primary)',
                        color: 'var(--primary)',
                        fontSize: '11.5px',
                        fontWeight: 700,
                        cursor: isCurrentLocked ? 'not-allowed' : 'pointer'
                      }}
                    >
                      이미지 선택 (PNG/JPG)
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isCurrentLocked}
                        style={{ display: 'none' }}
                        onChange={e => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = async ev => {
                            const dataUrl = String(ev.target?.result || '');
                            const dpi = template.paper?.dpi || 203;
                            const imgW = mmToDots(selectedElem.widthMm || 18, dpi);
                            const imgH = mmToDots(selectedElem.heightMm || 12, dpi);
                            const zplGf = await convertImageToZplGf(dataUrl, imgW, imgH);
                            updateElement(selectedElem.id, {
                              imageDataUrl: dataUrl,
                              zplGf,
                              visible: true
                            });
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>
                    {selectedElem.imageDataUrl && (
                      <button
                        type="button"
                        disabled={isCurrentLocked}
                        onClick={() => updateElement(selectedElem.id, { imageDataUrl: '', zplGf: null })}
                        className="btn-secondary"
                        style={{ padding: '5px 8px', fontSize: '11px', color: 'var(--danger)' }}
                      >
                        제거
                      </button>
                    )}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>X 좌표 (mm)</label>
                      <input type="number" step="0.5" disabled={isCurrentLocked} value={selectedElem.xMm} onChange={e => updateElement(selectedElem.id, { xMm: Number(e.target.value) })} style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>Y 좌표 (mm)</label>
                      <input type="number" step="0.5" disabled={isCurrentLocked} value={selectedElem.yMm} onChange={e => updateElement(selectedElem.id, { yMm: Number(e.target.value) })} style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>가로 폭 (mm)</label>
                      <input
                        type="number"
                        step="1"
                        disabled={isCurrentLocked}
                        value={selectedElem.widthMm || 18}
                        onChange={async e => {
                          const newW = Number(e.target.value) || 18;
                          const dpi = template.paper?.dpi || 203;
                          let zplGf = selectedElem.zplGf;
                          if (selectedElem.imageDataUrl) {
                            zplGf = await convertImageToZplGf(selectedElem.imageDataUrl, mmToDots(newW, dpi), mmToDots(selectedElem.heightMm || 12, dpi));
                          }
                          updateElement(selectedElem.id, { widthMm: newW, zplGf });
                        }}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <label style={{ fontSize: '10.5px', color: 'var(--text-secondary)', fontWeight: 600 }}>세로 높이 (mm)</label>
                      <input
                        type="number"
                        step="1"
                        disabled={isCurrentLocked}
                        value={selectedElem.heightMm || 12}
                        onChange={async e => {
                          const newH = Number(e.target.value) || 12;
                          const dpi = template.paper?.dpi || 203;
                          let zplGf = selectedElem.zplGf;
                          if (selectedElem.imageDataUrl) {
                            zplGf = await convertImageToZplGf(selectedElem.imageDataUrl, mmToDots(selectedElem.widthMm || 18, dpi), mmToDots(newH, dpi));
                          }
                          updateElement(selectedElem.id, { heightMm: newH, zplGf });
                        }}
                        style={{ width: '100%', padding: '4px 6px', fontSize: '11.5px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-card)', color: 'var(--text-main)' }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* [우측 패널] 1:1 정밀 드래그 앤 드롭 라벨 캔버스 + ZPL II 코드 편집기 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            backgroundColor: 'var(--bg-card)',
            padding: '14px',
            borderRadius: '6px',
            border: '1px solid var(--border-color)'
          }}
        >
          {/* 상단 미리보기 대상 자산 선택 바 (우리 자산 테이블 연동) */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '8px',
              paddingBottom: '8px',
              borderBottom: '1px solid var(--border-color)'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 700 }}>
              <Move size={14} style={{ color: 'var(--primary)' }} />
              <span>라벨 캔버스 ({template.paper.widthMm}mm × {template.paper.heightMm}mm)</span>
              {isCurrentLocked && (
                <span className="badge badge-warning" style={{ fontSize: '10px', padding: '1px 6px' }}>잠금됨</span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-secondary)', fontWeight: 600, whiteSpace: 'nowrap' }}>
                미리보기 자산 선택 (자산 테이블):
              </label>
              <select
                data-mid="select-preview-asset"
                value={selectedSampleAssetId}
                onChange={e => setSelectedSampleAssetId(e.target.value)}
                style={{
                  padding: '4px 8px',
                  fontSize: '11.5px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  color: 'var(--text-main)',
                  maxWidth: '280px',
                  fontWeight: 600
                }}
              >
                {assets.slice(0, 200).map(a => (
                  <option key={a.id} value={a.id}>
                    {a.assetNo} | {a.modelName} ({a.serialNo || 'S/N 없음'})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* 1:1 정밀 캔버스 작업대 */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              padding: '24px',
              backgroundColor: '#0f172a',
              borderRadius: '6px',
              border: '1px solid #334155',
              minHeight: '220px',
              overflow: 'auto'
            }}
          >
            <div
              ref={canvasRef}
              data-mid="label-canvas-surface"
              style={{
                width: `${canvasWidthPx}px`,
                height: `${canvasHeightPx}px`,
                backgroundColor: '#ffffff',
                color: '#000000',
                borderRadius: '4px',
                boxShadow: '0 8px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px #cbd5e1',
                position: 'relative',
                overflow: 'hidden',
                userSelect: 'none',
                backgroundImage:
                  'linear-gradient(to right, #f1f5f9 1px, transparent 1px), linear-gradient(to bottom, #f1f5f9 1px, transparent 1px)',
                backgroundSize: `${PX_PER_MM * 5}px ${PX_PER_MM * 5}px`,
                flexShrink: 0
              }}
            >
              {template.elements.filter(e => e.visible).map(elem => {
                const isSelected = elem.id === selectedElemId;
                const leftPx = (Number(elem.xMm) || 0) * PX_PER_MM;
                const topPx = (Number(elem.yMm) || 0) * PX_PER_MM;

                if (elem.type === 'text') {
                  let displayVal = elem.prefix || '';
                  if (elem.field === 'custom' || elem.field?.startsWith('custom_text_')) {
                    displayVal += elem.customValue || `[${elem.name}]`;
                  } else if (elem.field) {
                    displayVal += String(previewAssetData[elem.field] || elem.field.toUpperCase());
                  }
                  const fontSizePx = (elem.fontSizePt || 25) * (PX_PER_MM / 8.0);

                  return (
                    <div
                      key={elem.id}
                      onMouseDown={e => handleMouseDown(e, elem)}
                      style={{
                        position: 'absolute',
                        left: `${leftPx}px`,
                        top: `${topPx}px`,
                        fontSize: `${fontSizePx}px`,
                        fontWeight: 700,
                        fontFamily: elem.fontFamily === 'A0N' ? 'monospace, sans-serif' : 'sans-serif',
                        whiteSpace: 'nowrap',
                        cursor: isCurrentLocked ? 'default' : 'grab',
                        padding: '1px 3px',
                        borderRadius: '2px',
                        border: isSelected ? '1.5px dashed #0284c7' : '1px solid transparent',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                        lineHeight: 1.1,
                        color: '#000000'
                      }}
                    >
                      {displayVal}
                    </div>
                  );
                }

                if (elem.type === 'barcode') {
                  const targetField = elem.targetField || 'asset_no';
                  const bcVal = String(previewAssetData[targetField] || previewAssetData.asset_no || 'TEST0001');
                  const heightPx = (elem.heightMm || 10) * PX_PER_MM;
                  const qrScale = Math.max(1, Math.min(10, Number(elem.qrScale) || 3));
                  const qrSizeMm = (qrScale * 25.0) / 8.0;
                  const qrSizePx = qrSizeMm * PX_PER_MM;

                  return (
                    <div
                      key={elem.id}
                      onMouseDown={e => handleMouseDown(e, elem)}
                      style={{
                        position: 'absolute',
                        left: `${leftPx}px`,
                        top: `${topPx}px`,
                        cursor: isCurrentLocked ? 'default' : 'grab',
                        padding: '2px',
                        border: isSelected ? '1.5px dashed #0284c7' : '1px solid transparent',
                        backgroundColor: isSelected ? 'rgba(56, 189, 248, 0.12)' : 'transparent',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center'
                      }}
                    >
                      {elem.barcodeType === 'QR' ? (
                        <div
                          style={{
                            width: `${qrSizePx}px`,
                            height: `${qrSizePx}px`,
                            backgroundColor: '#ffffff',
                            border: '1px solid #000000',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxSizing: 'border-box',
                            padding: '1px'
                          }}
                        >
                          <svg viewBox="0 0 29 29" width="100%" height="100%" shapeRendering="crispEdges">
                            <rect x="0" y="0" width="7" height="7" fill="#000" />
                            <rect x="1" y="1" width="5" height="5" fill="#fff" />
                            <rect x="2" y="2" width="3" height="3" fill="#000" />
                            <rect x="22" y="0" width="7" height="7" fill="#000" />
                            <rect x="23" y="1" width="5" height="5" fill="#fff" />
                            <rect x="24" y="2" width="3" height="3" fill="#000" />
                            <rect x="0" y="22" width="7" height="7" fill="#000" />
                            <rect x="1" y="23" width="5" height="5" fill="#fff" />
                            <rect x="2" y="24" width="3" height="3" fill="#000" />
                            <rect x="9" y="2" width="2" height="2" fill="#000" />
                            <rect x="13" y="2" width="2" height="2" fill="#000" />
                            <rect x="17" y="2" width="2" height="2" fill="#000" />
                            <rect x="9" y="6" width="3" height="2" fill="#000" />
                            <rect x="14" y="6" width="2" height="3" fill="#000" />
                            <rect x="18" y="7" width="2" height="2" fill="#000" />
                            <rect x="2" y="9" width="2" height="3" fill="#000" />
                            <rect x="6" y="10" width="2" height="2" fill="#000" />
                            <rect x="10" y="10" width="3" height="3" fill="#000" />
                            <rect x="15" y="11" width="4" height="2" fill="#000" />
                            <rect x="21" y="10" width="2" height="4" fill="#000" />
                            <rect x="25" y="11" width="3" height="2" fill="#000" />
                            <rect x="2" y="14" width="3" height="2" fill="#000" />
                            <rect x="7" y="14" width="2" height="3" fill="#000" />
                            <rect x="11" y="15" width="2" height="2" fill="#000" />
                            <rect x="15" y="15" width="3" height="3" fill="#000" />
                            <rect x="20" y="16" width="3" height="2" fill="#000" />
                            <rect x="25" y="15" width="2" height="3" fill="#000" />
                            <rect x="9" y="20" width="3" height="2" fill="#000" />
                            <rect x="14" y="20" width="2" height="3" fill="#000" />
                            <rect x="18" y="21" width="4" height="2" fill="#000" />
                            <rect x="24" y="20" width="3" height="2" fill="#000" />
                            <rect x="9" y="24" width="2" height="3" fill="#000" />
                            <rect x="13" y="25" width="3" height="2" fill="#000" />
                            <rect x="18" y="25" width="2" height="3" fill="#000" />
                            <rect x="22" y="24" width="3" height="3" fill="#000" />
                          </svg>
                        </div>
                      ) : (
                        <RealBarcodeSvg
                          value={bcVal}
                          type={elem.barcodeType || 'CODE128'}
                          heightPx={heightPx}
                          showText={elem.showText !== false}
                          scale={PX_PER_MM / 9.0}
                          prefix={elem.prefix || ''}
                        />
                      )}
                    </div>
                  );
                }

                if (elem.type === 'line') {
                  const widthPx = (elem.widthMm || 65) * PX_PER_MM;
                  const thicknessPx = Math.max(1, (elem.thicknessMm || 0.25) * PX_PER_MM);
                  return (
                    <div
                      key={elem.id}
                      onMouseDown={e => handleMouseDown(e, elem)}
                      style={{
                        position: 'absolute',
                        left: `${leftPx}px`,
                        top: `${topPx}px`,
                        width: `${widthPx}px`,
                        height: `${thicknessPx}px`,
                        backgroundColor: '#000000',
                        cursor: isCurrentLocked ? 'default' : 'grab',
                        outline: isSelected ? '2px dashed #0284c7' : 'none'
                      }}
                    />
                  );
                }

                if (elem.type === 'image') {
                  const widthPx = (elem.widthMm || 18) * PX_PER_MM;
                  const heightPx = (elem.heightMm || 12) * PX_PER_MM;
                  return (
                    <div
                      key={elem.id}
                      onMouseDown={e => handleMouseDown(e, elem)}
                      style={{
                        position: 'absolute',
                        left: `${leftPx}px`,
                        top: `${topPx}px`,
                        width: `${widthPx}px`,
                        height: `${heightPx}px`,
                        cursor: isCurrentLocked ? 'default' : 'grab',
                        border: isSelected ? '1.5px dashed #0284c7' : '1px dashed #94a3b8',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                      }}
                    >
                      {elem.imageDataUrl ? (
                        <img
                          src={elem.imageDataUrl}
                          alt="label-logo"
                          style={{ width: '100%', height: '100%', objectFit: 'fill', pointerEvents: 'none' }}
                        />
                      ) : (
                        <span style={{ fontSize: '9px', color: '#64748b', fontWeight: 700 }}>이미지/로고</span>
                      )}
                    </div>
                  );
                }

                return null;
              })}
            </div>
          </div>

          {/* ZPL II 코드 뷰어 및 수동 편집기 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: 'var(--primary)' }}>
                  ZPL 코드
                </span>
                {isZplManuallyEdited ? (
                  <span className="badge badge-warning" style={{ fontSize: '10px', padding: '1px 6px' }}>수동 편집됨</span>
                ) : (
                  <span className="badge badge-success" style={{ fontSize: '10px', padding: '1px 6px' }}>디자인 연동됨</span>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {isZplManuallyEdited && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsZplManuallyEdited(false);
                      setZplPreview(generateDynamicZpl(previewAssetData, template, products));
                    }}
                    className="btn-secondary"
                    style={{ padding: '3px 8px', fontSize: '11px' }}
                  >
                    디자인 기준 복원
                  </button>
                )}

                <button
                  type="button"
                  data-mid="btn-custom-zpl-test-print"
                  onClick={handleCustomZplTestPrint}
                  disabled={isTestingPrint}
                  className="btn-primary"
                  style={{ padding: '3px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 700 }}
                >
                  <Printer size={11} /> {isZplManuallyEdited ? '수정된 ZPL 테스트 인쇄' : '현재 ZPL 테스트 인쇄'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(zplPreview);
                    setSaveBanner('ZPL 코드가 클립보드에 복사되었습니다.');
                    setTimeout(() => setSaveBanner(''), 2500);
                  }}
                  className="btn-secondary"
                  style={{ padding: '3px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Copy size={11} /> 코드 복사
                </button>
              </div>
            </div>

            <textarea
              data-mid="textarea-zpl-preview"
              value={zplPreview}
              onChange={e => {
                setZplPreview(e.target.value);
                setIsZplManuallyEdited(true);
              }}
              spellCheck={false}
              style={{
                width: '100%',
                minHeight: '130px',
                backgroundColor: '#020617',
                border: isZplManuallyEdited ? '1.5px solid #f59e0b' : '1px solid #334155',
                borderRadius: '6px',
                padding: '10px',
                fontSize: '11.5px',
                color: '#38bdf8',
                fontFamily: 'monospace',
                lineHeight: 1.45,
                resize: 'vertical'
              }}
            />
          </div>
        </div>
      </div>

      {/* [모달 1] 신규 라벨 디자인 서식 추가 모달 */}
      {isAddModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--primary)',
              borderRadius: '8px',
              padding: '18px',
              width: '420px',
              maxWidth: '92vw',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>새 라벨 디자인 서식 추가</span>
              <button type="button" onClick={() => setIsAddModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>서식 명칭</label>
              <input
                type="text"
                data-mid="input-new-preset-name"
                value={newPresetName}
                onChange={e => setNewPresetName(e.target.value)}
                placeholder="예: 노트북 표준 라벨 (72x40)"
                style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
              />
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>출력 대상 프린터 지정</label>
              <select
                value={newTargetPrinterId}
                onChange={e => setNewTargetPrinterId(e.target.value)}
                style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
              >
                <option value="">기본 활성 프린터 사용</option>
                {printers.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>가로 폭 (mm)</label>
                <input
                  type="number"
                  value={newWidthMm}
                  onChange={e => setNewWidthMm(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '11.5px', fontWeight: 600, color: 'var(--text-secondary)' }}>세로 높이 (mm)</label>
                <input
                  type="number"
                  value={newHeightMm}
                  onChange={e => setNewHeightMm(Number(e.target.value))}
                  style={{ width: '100%', padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)', color: 'var(--text-main)' }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', gap: '6px' }}>
              <button type="button" onClick={() => { setNewWidthMm(72); setNewHeightMm(40); }} className="btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '11px' }}>72×40mm (표준)</button>
              <button type="button" onClick={() => { setNewWidthMm(30); setNewHeightMm(16); }} className="btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '11px' }}>30×16mm (소형 QR)</button>
              <button type="button" onClick={() => { setNewWidthMm(42); setNewHeightMm(20); }} className="btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '11px' }}>42×20mm (중소형)</button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px', marginTop: '4px' }}>
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="btn-secondary" style={{ padding: '5px 12px', fontSize: '12px' }}>취소</button>
              <button type="button" data-mid="btn-confirm-create-preset" onClick={handleCreateNewPreset} className="btn-primary" style={{ padding: '5px 14px', fontSize: '12px', fontWeight: 700 }}>생성하기</button>
            </div>
          </div>
        </div>
      )}

      {/* [모달 2] 저장된 디자인 목록 관리 모달 */}
      {isListModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999
          }}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-card)',
              border: '1px solid var(--primary)',
              borderRadius: '8px',
              padding: '18px',
              width: '560px',
              maxWidth: '94vw',
              maxHeight: '80vh',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
              <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary)' }}>저장된 라벨 디자인 목록 ({presets.length}개)</span>
              <button type="button" onClick={() => setIsListModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>✕</button>
            </div>

            <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '6px', paddingRight: '4px' }}>
              {presets.map(p => {
                const isCurrent = p.templateId === template.templateId;
                const locked = Boolean(p.isLocked || p.paper?.isLocked);
                return (
                  <div
                    key={p.templateId}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'var(--bg-app)',
                      border: isCurrent ? '1.5px solid var(--primary)' : '1px solid var(--border-color)'
                    }}
                  >
                    <div
                      onClick={() => {
                        handleSelectPreset(p.templateId);
                        setIsListModalOpen(false);
                      }}
                      style={{ cursor: 'pointer', flex: 1 }}
                    >
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: isCurrent ? 'var(--primary)' : 'var(--text-main)' }}>
                        {locked ? '🔒 ' : ''}{p.name} {isCurrent && <span style={{ fontSize: '10.5px', color: 'var(--success)' }}>(현재 선택됨)</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        규격: {p.paper?.widthMm}×{p.paper?.heightMm}mm | 표시항목: {(p.elements || []).filter(e => e.visible).length}개 | 프린터: {p.targetPrinterName || p.paper?.targetPrinterName || '기본 프린터'}
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '4px' }}>
                      <button
                        type="button"
                        onClick={async e => {
                          e.stopPropagation();
                          const nextLock = !locked;
                          await updatePresetLock(p.templateId, nextLock);
                          setPresets(getAllPresets());
                          if (p.templateId === template.templateId) {
                            setTemplate(prev => ({
                              ...prev,
                              isLocked: nextLock,
                              paper: { ...prev.paper, isLocked: nextLock }
                            }));
                          }
                        }}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        {locked ? '잠금해제' : '잠금'}
                      </button>

                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          handleExportTemplateJson(p);
                        }}
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        JSON
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          handleSelectPreset(p.templateId);
                          setIsListModalOpen(false);
                        }}
                        className="btn-primary"
                        style={{ padding: '4px 8px', fontSize: '11px' }}
                      >
                        불러오기
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setIsListModalOpen(false)} className="btn-secondary" style={{ padding: '5px 14px', fontSize: '12px' }}>닫기</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
