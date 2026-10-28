import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Printer, Search, Settings, X } from 'lucide-react';
import { Asset, Product } from '../services/db';
import { RealBarcodeSvg } from '../utils/barcodeGenerator';
import {
  LabelTemplatePreset,
  LabelElement,
  DEFAULT_LABEL_TEMPLATE,
  getAllPresets,
  syncTemplatesWithBackend,
  normalizeAssetForLabel,
  generateDynamicZpl,
  generateDynamicZplAsync,
  generateLabelPrintHtml
} from '../utils/labelTemplateEngine';
import {
  LabelPrinterInfo,
  getRegisteredPrinters,
  fetchActualConnectedPrinters,
  sendZplToPrinter,
  openBrowserLabelPrintWindow
} from '../utils/labelPrinterManager';

interface PrintLogRecord {
  id: string;
  printedAt: string;
  assetNo: string;
  modelName: string;
  serialNo: string;
  presetName: string;
  printerName: string;
  copies: number;
  mode: 'ZPL' | 'BROWSER';
  asset: Asset;
}

const PRINT_HISTORY_STORAGE_KEY = 'ebro_asset_label_print_history_v1';

const loadPrintHistory = (): PrintLogRecord[] => {
  try {
    const raw = localStorage.getItem(PRINT_HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.slice(0, 100) : [];
  } catch {
    return [];
  }
};

const savePrintHistory = (records: PrintLogRecord[]) => {
  try {
    localStorage.setItem(PRINT_HISTORY_STORAGE_KEY, JSON.stringify(records.slice(0, 100)));
  } catch {
    // ignore storage quota errors
  }
};

/**
 * 1:1 실물 비례 라벨 캔버스 렌더러 (디자이너와 100% 동일한 WYSIWYG 미리보기)
 */
export const LabelWysiwygPreviewCard: React.FC<{
  preset: LabelTemplatePreset;
  normalizedAsset: Record<string, any>;
  scale?: number;
}> = ({ preset, normalizedAsset, scale = 3.78 }) => {
  const widthMm = Number(preset.paper?.widthMm) || 72;
  const heightMm = Number(preset.paper?.heightMm) || 40;

  return (
    <div
      style={{
        width: `${widthMm * scale}px`,
        height: `${heightMm * scale}px`,
        backgroundColor: '#ffffff',
        color: '#000000',
        border: '1.5px solid #1e293b',
        borderRadius: '4px',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: '0 4px 14px rgba(0,0,0,0.14)',
        flexShrink: 0,
        userSelect: 'none'
      }}
    >
      {(preset.elements || []).map((el: LabelElement, idx: number) => {
        if (!el.visible) return null;
        const finalXMm = Math.max(0, (Number(el.xMm) || 0) + (Number(el.offsetX) || 0));
        const finalYMm = Math.max(0, (Number(el.yMm) || 0) + (Number(el.offsetY) || 0));
        const leftPx = finalXMm * scale;
        const topPx = finalYMm * scale;

        if (el.type === 'barcode') {
          const targetCol = el.targetField || 'asset_no';
          const rawVal = String(normalizedAsset[targetCol] || normalizedAsset.asset_no || 'AST-001');
          const bFormat = el.barcodeType || 'CODE128';
          const bHeightMm = Number(el.heightMm) || 10;
          const qrScale = Number(el.qrScale) || 3;

          if (bFormat === 'QR') {
            const qrSizeMm = (qrScale * 25.0) / 8.0;
            const qrSizePx = Math.max(24, qrSizeMm * scale);
            return (
              <div
                key={el.id || idx}
                style={{
                  position: 'absolute',
                  left: `${leftPx}px`,
                  top: `${topPx}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center'
                }}
              >
                <div
                  style={{
                    width: `${qrSizePx}px`,
                    height: `${qrSizePx}px`,
                    border: '2px solid #000',
                    display: 'grid',
                    gridTemplateColumns: 'repeat(5, 1fr)',
                    gridTemplateRows: 'repeat(5, 1fr)',
                    padding: '2px',
                    backgroundColor: '#fff',
                    boxSizing: 'border-box'
                  }}
                >
                  {Array.from({ length: 25 }).map((_, qIdx) => (
                    <div
                      key={qIdx}
                      style={{
                        backgroundColor:
                          [0, 1, 2, 4, 5, 6, 10, 12, 14, 18, 20, 21, 22, 24].includes(qIdx)
                            ? '#000'
                            : '#fff'
                      }}
                    />
                  ))}
                </div>
                {el.showText !== false && (
                  <span style={{ fontSize: '9px', fontFamily: 'monospace', fontWeight: 700, color: '#000', marginTop: '1px', whiteSpace: 'nowrap' }}>
                    {rawVal}
                  </span>
                )}
              </div>
            );
          }

          return (
            <div
              key={el.id || idx}
              style={{
                position: 'absolute',
                left: `${leftPx}px`,
                top: `${topPx}px`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start'
              }}
            >
              <RealBarcodeSvg
                value={rawVal}
                type={bFormat}
                heightPx={Math.max(16, Math.round(bHeightMm * scale))}
                showText={el.showText !== false}
                scale={scale / 9.0}
                prefix={el.prefix || ''}
              />
            </div>
          );
        }

        if (el.type === 'line') {
          const lineW = (Number(el.widthMm) || 60) * scale;
          const lineT = Math.max(1, (Number(el.thicknessMm) || 0.25) * scale);
          return (
            <div
              key={el.id || idx}
              style={{
                position: 'absolute',
                left: `${leftPx}px`,
                top: `${topPx}px`,
                width: `${lineW}px`,
                height: `${lineT}px`,
                backgroundColor: '#000000'
              }}
            />
          );
        }

        if (el.type === 'image') {
          const imgW = (Number(el.widthMm) || 18) * scale;
          const imgH = (Number(el.heightMm) || 10) * scale;
          return (
            <div
              key={el.id || idx}
              style={{
                position: 'absolute',
                left: `${leftPx}px`,
                top: `${topPx}px`,
                width: `${imgW}px`,
                height: `${imgH}px`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden'
              }}
            >
              {el.imageDataUrl ? (
                <img src={el.imageDataUrl} alt={el.name || '로고'} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
              ) : (
                <span style={{ fontSize: '9px', color: '#64748b', border: '1px dashed #94a3b8', padding: '1px 4px' }}>로고</span>
              )}
            </div>
          );
        }

        // 일반 텍스트 요소
        let textVal = '';
        if (el.field === 'custom' || (el.field && el.field.startsWith('custom_text'))) {
          textVal = el.customValue ?? '';
        } else if (el.field) {
          textVal = String(normalizedAsset[el.field] ?? '');
        }
        const prefixStr = el.prefix !== undefined ? el.prefix : '';
        const fontPt = Number(el.fontSizePt) || 25;
        const fontPx = Math.max(8, Math.round(fontPt * (scale / 8.0)));

        return (
          <div
            key={el.id || idx}
            style={{
              position: 'absolute',
              left: `${leftPx}px`,
              top: `${topPx}px`,
              fontSize: `${fontPx}px`,
              fontWeight: 700,
              color: '#000000',
              whiteSpace: 'nowrap',
              lineHeight: 1.15,
              fontFamily: el.fontFamily === 'A0N' ? "'Malgun Gothic', monospace, sans-serif" : "'Pretendard', 'Malgun Gothic', sans-serif"
            }}
          >
            {prefixStr}{textVal}
          </div>
        );
      })}
    </div>
  );
};

/**
 * 1) 자산 목록/상세에서 선택한 1~N건 자산 라벨 인쇄 모달
 */
export const AssetLabelPrintModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  selectedAssets: Asset[];
  products?: Product[];
  onOpenDesigner?: () => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}> = ({ isOpen, onClose, selectedAssets, products = [], onOpenDesigner, showToast }) => {
  const [presets, setPresets] = useState<LabelTemplatePreset[]>(() => getAllPresets());
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [connectedPrinters, setConnectedPrinters] = useState<LabelPrinterInfo[]>(() => getRegisteredPrinters());
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(() => getRegisteredPrinters()[0]?.id || '');
  const [copies, setCopies] = useState<number>(1);
  const [previewAssetIndex, setPreviewAssetIndex] = useState<number>(0);
  const [showZplPreview, setShowZplPreview] = useState<boolean>(false);
  const [isPrinting, setIsPrinting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) return;
    setPreviewAssetIndex(0);
    let mounted = true;
    syncTemplatesWithBackend().then(synced => {
      if (mounted && synced.length > 0) {
        setPresets(synced);
        setSelectedPresetIdx(prev => (prev < synced.length ? prev : 0));
        if (synced[0]?.targetPrinterId) {
          setSelectedPrinterId(synced[0].targetPrinterId);
        }
      }
    });
    fetchActualConnectedPrinters().then(list => {
      if (mounted && list.length > 0) {
        setConnectedPrinters(list);
        setSelectedPrinterId(prev => prev || list[0].id);
      }
    });
    return () => {
      mounted = false;
    };
  }, [isOpen]);

  const activePreset = presets[selectedPresetIdx] || presets[0] || DEFAULT_LABEL_TEMPLATE;

  useEffect(() => {
    if (activePreset?.targetPrinterId) {
      setSelectedPrinterId(activePreset.targetPrinterId);
    }
  }, [selectedPresetIdx, activePreset?.targetPrinterId]);

  const activePrinterObj = useMemo(() => {
    return (
      connectedPrinters.find(p => p.id === selectedPrinterId || p.name === selectedPrinterId) ||
      connectedPrinters[0]
    );
  }, [connectedPrinters, selectedPrinterId]);

  const normalizedAssets = useMemo(() => {
    return (selectedAssets || []).map(a => normalizeAssetForLabel(a, products));
  }, [selectedAssets, products]);

  const currentPreviewAsset = normalizedAssets[previewAssetIndex] || normalizedAssets[0];

  const currentZplCode = useMemo(() => {
    if (!activePreset || !currentPreviewAsset) return '';
    return generateDynamicZpl(currentPreviewAsset, activePreset, products);
  }, [activePreset, currentPreviewAsset, products]);

  if (!isOpen) return null;

  const handleZplPrintAll = async () => {
    if (!activePreset || normalizedAssets.length === 0 || isPrinting) return;
    try {
      setIsPrinting(true);
      const zplChunks: string[] = [];
      const repeatCount = Math.max(1, Math.min(20, Number(copies) || 1));

      for (const normItem of normalizedAssets) {
        const zpl = await generateDynamicZplAsync(normItem, activePreset, products);
        for (let c = 0; c < repeatCount; c++) {
          zplChunks.push(zpl);
        }
      }

      const fullZplStream = zplChunks.join('\n\n');
      const result = await sendZplToPrinter(fullZplStream, activePrinterObj);

      const nowStr = new Date().toLocaleTimeString('ko-KR', { hour12: false });
      const newLogs: PrintLogRecord[] = selectedAssets.map(a => ({
        id: `${Date.now()}-${a.id}`,
        printedAt: nowStr,
        assetNo: a.assetNo,
        modelName: a.modelName,
        serialNo: a.serialNo || '-',
        presetName: activePreset.name,
        printerName: activePrinterObj?.name || '기본 프린터',
        copies: repeatCount,
        mode: 'ZPL',
        asset: a
      }));
      const prevHistory = loadPrintHistory();
      savePrintHistory([...newLogs, ...prevHistory]);

      if (showToast) {
        showToast(
          `자산 ${selectedAssets.length}건 (총 ${selectedAssets.length * repeatCount}매) 라벨 인쇄 전송 완료 (${result.message})`,
          'success'
        );
      }
    } catch (err: any) {
      if (showToast) {
        showToast(`라벨 출력 오류: ${err?.message || err}`, 'error');
      }
    } finally {
      setIsPrinting(false);
    }
  };

  const handleBrowserPrintAll = () => {
    if (!activePreset || normalizedAssets.length === 0) return;
    const repeatCount = Math.max(1, Math.min(20, Number(copies) || 1));
    const html = generateLabelPrintHtml(selectedAssets, activePreset, products, repeatCount);
    openBrowserLabelPrintWindow(html);
    if (showToast) {
      showToast(`브라우저 라벨 인쇄 창 호출 완료 (${selectedAssets.length * repeatCount}매)`, 'success');
    }
  };

  return (
    <div
      data-mid="asset-label-print-modal"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.65)',
        zIndex: 2500,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '920px',
          maxWidth: '96vw',
          maxHeight: '90vh',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '8px',
          border: '1px solid var(--border-color)',
          boxShadow: '0 20px 50px rgba(0,0,0,0.35)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div
          style={{
            padding: '12px 16px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-app)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Printer size={17} style={{ color: 'var(--primary)' }} />
            <h3 style={{ margin: 0, fontSize: '15px', fontWeight: 700, color: 'var(--text-main)', whiteSpace: 'nowrap' }}>
              자산 라벨 출력
            </h3>
            <span className="badge badge-primary" style={{ fontSize: '11px' }}>
              대상 자산 {selectedAssets.length}건
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {onOpenDesigner && (
              <button
                type="button"
                className="btn-secondary"
                data-mid="btn-open-label-designer-from-modal"
                onClick={() => {
                  onClose();
                  onOpenDesigner();
                }}
                style={{ padding: '4px 10px', fontSize: '11.5px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
              >
                <Settings size={13} /> 라벨 서식 디자인
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              style={{ border: 'none', backgroundColor: 'transparent', cursor: 'pointer', color: 'var(--text-muted)' }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 상단 출력 설정 바 (헌장 3.4 상하 스택 레이블) */}
        <div
          style={{
            padding: '10px 16px',
            borderBottom: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-card)',
            display: 'flex',
            alignItems: 'flex-end',
            gap: '12px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '210px', flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              라벨 서식 선택
            </label>
            <select
              data-mid="select-modal-label-preset"
              value={selectedPresetIdx}
              onChange={e => setSelectedPresetIdx(Number(e.target.value))}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 600
              }}
            >
              {presets.map((p, idx) => (
                <option key={p.templateId || idx} value={idx}>
                  {p.name} ({p.paper?.widthMm || 72}×{p.paper?.heightMm || 40}mm)
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '210px', flex: 1 }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              대상 프린터
            </label>
            <select
              data-mid="select-modal-label-printer"
              value={selectedPrinterId}
              onChange={e => setSelectedPrinterId(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '12px'
              }}
            >
              {connectedPrinters.map(p => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '90px' }}>
            <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              자산당 매수
            </label>
            <input
              type="number"
              min={1}
              max={20}
              value={copies}
              onChange={e => setCopies(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
              style={{
                padding: '6px 8px',
                borderRadius: '4px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '12px',
                fontWeight: 600
              }}
            />
          </div>

          <button
            type="button"
            className="btn-secondary"
            data-mid="btn-modal-toggle-zpl"
            onClick={() => setShowZplPreview(prev => !prev)}
            style={{ padding: '6px 12px', fontSize: '12px', whiteSpace: 'nowrap' }}
          >
            {showZplPreview ? 'ZPL 코드 숨기기' : 'ZPL 코드 보기'}
          </button>
        </div>

        {/* 모달 본문: 좌측 대상 자산 목록 / 우측 1:1 실물 라벨 미리보기 */}
        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', flex: 1, minHeight: '360px', overflow: 'hidden' }}>
          {/* 좌측: 선택된 자산 리스트 */}
          <div
            style={{
              borderRight: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden'
            }}
          >
            <div style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-color)', fontSize: '11.5px', fontWeight: 700, color: 'var(--text-secondary)' }}>
              출력 대상 자산 목록 ({selectedAssets.length}건)
            </div>
            <div style={{ flex: 1, overflowY: 'auto', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {selectedAssets.map((asset, idx) => {
                const isSelected = idx === previewAssetIndex;
                return (
                  <div
                    key={asset.id || idx}
                    onClick={() => setPreviewAssetIndex(idx)}
                    style={{
                      padding: '8px 10px',
                      borderRadius: '5px',
                      cursor: 'pointer',
                      border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border-color)',
                      backgroundColor: isSelected ? 'var(--bg-card)' : 'transparent',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '2px'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <strong style={{ fontSize: '12px', color: 'var(--text-main)' }}>{asset.assetNo}</strong>
                      <span style={{ fontSize: '10px', color: 'var(--text-muted)' }}>#{idx + 1}</span>
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {asset.modelName}
                    </div>
                    <div style={{ fontSize: '10px', fontFamily: 'monospace', color: 'var(--text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      S/N: {asset.serialNo || '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 우측: 1:1 캔버스 미리보기 & ZPL 뷰어 */}
          <div
            style={{
              padding: '16px',
              backgroundColor: 'var(--bg-card)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              overflowY: 'auto'
            }}
          >
            {activePreset && currentPreviewAsset ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <span>
                    미리보기 자산: <strong style={{ color: 'var(--text-main)' }}>{currentPreviewAsset.asset_no}</strong> ({currentPreviewAsset.model_name})
                  </span>
                  <span>|</span>
                  <span>
                    용지 규격: <strong>{activePreset.paper?.widthMm || 72} × {activePreset.paper?.heightMm || 40} mm</strong>
                  </span>
                </div>

                <div
                  style={{
                    padding: '20px',
                    backgroundColor: '#f1f5f9',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <LabelWysiwygPreviewCard preset={activePreset} normalizedAsset={currentPreviewAsset} scale={3.78} />
                </div>

                {showZplPreview && (
                  <div style={{ width: '100%', maxWidth: '540px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', marginBottom: '4px' }}>
                      생성된 ZPL II 코드 ({currentPreviewAsset.asset_no})
                    </div>
                    <textarea
                      readOnly
                      data-mid="textarea-modal-zpl-preview"
                      value={currentZplCode}
                      style={{
                        width: '100%',
                        height: '110px',
                        fontFamily: 'monospace',
                        fontSize: '11px',
                        padding: '8px',
                        borderRadius: '4px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: '#0f172a',
                        color: '#38bdf8',
                        resize: 'none'
                      }}
                    />
                  </div>
                )}
              </>
            ) : (
              <div style={{ color: 'var(--text-muted)', fontSize: '13px' }}>출력할 자산이 없습니다.</div>
            )}
          </div>
        </div>

        {/* 모달 푸터: 우하단 Terminal Action (헌장 3.5) */}
        <div
          style={{
            padding: '10px 16px',
            borderTop: '1px solid var(--border-color)',
            backgroundColor: 'var(--bg-app)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap'
          }}
        >
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
            선택 자산 <strong>{selectedAssets.length}건</strong> × <strong>{copies}매</strong> = 총{' '}
            <strong style={{ color: 'var(--primary)' }}>{selectedAssets.length * copies}매</strong> 출력 예정
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              className="btn-secondary"
              onClick={onClose}
              style={{ padding: '6px 14px', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              닫기
            </button>
            <button
              type="button"
              className="btn-secondary"
              data-mid="btn-modal-browser-print"
              onClick={handleBrowserPrintAll}
              style={{ padding: '6px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
            >
              <Printer size={14} /> 브라우저 인쇄
            </button>
            <button
              type="button"
              className="btn-primary"
              data-mid="btn-modal-zpl-print"
              onClick={handleZplPrintAll}
              disabled={isPrinting || selectedAssets.length === 0}
              style={{ padding: '6px 16px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
            >
              <Printer size={14} /> {isPrinting ? '전송중...' : `라벨 출력 (${selectedAssets.length * copies}매)`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * 2) 바코드 스캔 / 자산번호 검색 즉시 라벨 출력 스튜디오 (LabelPrintStation DirectPrintTab 이식)
 */
export const DirectLabelPrintStudio: React.FC<{
  assets: Asset[];
  products?: Product[];
  onOpenDesigner?: () => void;
  showToast?: (msg: string, type?: 'success' | 'error') => void;
}> = ({ assets, products = [], onOpenDesigner, showToast }) => {
  const [presets, setPresets] = useState<LabelTemplatePreset[]>(() => getAllPresets());
  const [selectedPresetIdx, setSelectedPresetIdx] = useState<number>(0);
  const [connectedPrinters, setConnectedPrinters] = useState<LabelPrinterInfo[]>(() => getRegisteredPrinters());
  const [selectedPrinterId, setSelectedPrinterId] = useState<string>(() => getRegisteredPrinters()[0]?.id || '');
  const [scanInput, setScanInput] = useState<string>('');
  const [autoPrintOnScan, setAutoPrintOnScan] = useState<boolean>(true);
  const [copies, setCopies] = useState<number>(1);
  const [activeAsset, setActiveAsset] = useState<Asset | null>(() => assets[0] || null);
  const [printHistory, setPrintHistory] = useState<PrintLogRecord[]>(() => loadPrintHistory());
  const scanInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    let mounted = true;
    syncTemplatesWithBackend().then(synced => {
      if (mounted && synced.length > 0) {
        setPresets(synced);
        if (synced[0]?.targetPrinterId) {
          setSelectedPrinterId(synced[0].targetPrinterId);
        }
      }
    });
    fetchActualConnectedPrinters().then(list => {
      if (mounted && list.length > 0) {
        setConnectedPrinters(list);
        setSelectedPrinterId(prev => prev || list[0].id);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!activeAsset && assets.length > 0) {
      setActiveAsset(assets[0]);
    }
  }, [assets, activeAsset]);

  const activePreset = presets[selectedPresetIdx] || presets[0] || DEFAULT_LABEL_TEMPLATE;

  useEffect(() => {
    if (activePreset?.targetPrinterId) {
      setSelectedPrinterId(activePreset.targetPrinterId);
    }
  }, [selectedPresetIdx, activePreset?.targetPrinterId]);

  const activePrinterObj = useMemo(() => {
    return (
      connectedPrinters.find(p => p.id === selectedPrinterId || p.name === selectedPrinterId) ||
      connectedPrinters[0]
    );
  }, [connectedPrinters, selectedPrinterId]);

  const normalizedActiveAsset = useMemo(() => {
    const target = activeAsset || assets[0];
    if (!target) {
      return normalizeAssetForLabel(
        {
          id: 'sample',
          assetNo: 'AST-0001',
          modelName: 'ThinkPad T14 Gen4',
          serialNo: 'SN-20260001'
        },
        products
      );
    }
    return normalizeAssetForLabel(target, products);
  }, [activeAsset, assets, products]);

  const executePrintForAsset = async (targetAsset: Asset, mode: 'ZPL' | 'BROWSER' = 'ZPL') => {
    if (!activePreset) return;
    const norm = normalizeAssetForLabel(targetAsset, products);
    const repeatCount = Math.max(1, Math.min(20, Number(copies) || 1));

    if (mode === 'BROWSER') {
      const html = generateLabelPrintHtml([targetAsset], activePreset, products, repeatCount);
      openBrowserLabelPrintWindow(html);
    } else {
      const zplSingle = await generateDynamicZplAsync(norm, activePreset, products);
      const stream = Array.from({ length: repeatCount }, () => zplSingle).join('\n\n');
      const res = await sendZplToPrinter(stream, activePrinterObj);
      if (showToast) {
        showToast(`[${targetAsset.assetNo}] 라벨 인쇄 전송 완료 (${res.message})`, 'success');
      }
    }

    const logItem: PrintLogRecord = {
      id: `${Date.now()}-${targetAsset.id}`,
      printedAt: new Date().toLocaleTimeString('ko-KR', { hour12: false }),
      assetNo: targetAsset.assetNo,
      modelName: targetAsset.modelName,
      serialNo: targetAsset.serialNo || '-',
      presetName: activePreset.name,
      printerName: activePrinterObj?.name || '기본 프린터',
      copies: repeatCount,
      mode,
      asset: targetAsset
    };

    setPrintHistory(prev => {
      const updated = [logItem, ...prev.slice(0, 99)];
      savePrintHistory(updated);
      return updated;
    });
  };

  const handleScanLookupAndPrint = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const q = scanInput.trim().toLowerCase();
    if (!q) return;

    // 1순위: 자산번호 / 시리얼번호 / IMEI / MAC 정확히 일치
    let matched = assets.find(
      a =>
        a.assetNo.toLowerCase() === q ||
        (a.serialNo && a.serialNo.toLowerCase() === q) ||
        (a.imei && a.imei.toLowerCase() === q) ||
        (a.wiredMac && a.wiredMac.toLowerCase() === q) ||
        (a.wifiMac && a.wifiMac.toLowerCase() === q)
    );

    // 2순위: 부분 일치
    if (!matched) {
      matched = assets.find(
        a =>
          a.assetNo.toLowerCase().includes(q) ||
          (a.serialNo && a.serialNo.toLowerCase().includes(q)) ||
          (a.imei && a.imei.toLowerCase().includes(q)) ||
          a.modelName.toLowerCase().includes(q)
      );
    }

    if (!matched) {
      if (showToast) {
        showToast(`입력한 식별자(${scanInput})와 일치하는 자산이 없습니다.`, 'error');
      }
      return;
    }

    setActiveAsset(matched);
    if (autoPrintOnScan) {
      await executePrintForAsset(matched, 'ZPL');
      setScanInput('');
      scanInputRef.current?.focus();
    } else if (showToast) {
      showToast(`자산 [${matched.assetNo}] 조회 완료`, 'success');
    }
  };

  return (
    <div
      data-mid="direct-label-print-studio"
      style={{
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
        gap: '8px',
        overflow: 'hidden'
      }}
    >
      {/* 상단 스캔 및 서식/프린터 제어 바 (헌장 3.4 상하 스택 레이블) */}
      <form
        onSubmit={handleScanLookupAndPrint}
        style={{
          padding: '10px 14px',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '6px',
          border: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'flex-end',
          gap: '10px',
          flexWrap: 'wrap',
          flexShrink: 0
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', flex: 1.5, minWidth: '240px' }}>
          <label style={{ fontSize: '11px', fontWeight: 700, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            바코드 스캔 / 자산번호·S/N·IMEI 입력
          </label>
          <div style={{ position: 'relative', display: 'flex', gap: '6px' }}>
            <input
              ref={scanInputRef}
              data-mid="input-direct-label-scan"
              type="text"
              value={scanInput}
              onChange={e => setScanInput(e.target.value)}
              placeholder="자산번호, 시리얼번호(S/N), IMEI 스캔 후 Enter"
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: '4px',
                border: '1.5px solid var(--primary)',
                backgroundColor: 'var(--bg-app)',
                color: 'var(--text-main)',
                fontSize: '12.5px',
                fontWeight: 600
              }}
            />
            <button
              type="submit"
              data-mid="btn-direct-scan-execute"
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: '12px', fontWeight: 700, whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '4px' }}
            >
              <Search size={13} /> {autoPrintOnScan ? '조회 및 출력' : '자산 조회'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '185px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            적용 라벨 서식
          </label>
          <select
            data-mid="select-direct-label-preset"
            value={selectedPresetIdx}
            onChange={e => setSelectedPresetIdx(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            {presets.map((p, idx) => (
              <option key={p.templateId || idx} value={idx}>
                {p.name} ({p.paper?.widthMm || 72}×{p.paper?.heightMm || 40}mm)
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '185px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            출력 프린터
          </label>
          <select
            value={selectedPrinterId}
            onChange={e => setSelectedPrinterId(e.target.value)}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              fontSize: '12px'
            }}
          >
            {connectedPrinters.map(p => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', width: '75px' }}>
          <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
            인쇄 매수
          </label>
          <input
            type="number"
            min={1}
            max={20}
            value={copies}
            onChange={e => setCopies(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
            style={{
              padding: '6px 8px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              color: 'var(--text-main)',
              fontSize: '12px',
              fontWeight: 600
            }}
          />
        </div>

        <label
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--text-main)',
            cursor: 'pointer',
            paddingBottom: '6px',
            whiteSpace: 'nowrap'
          }}
        >
          <input
            type="checkbox"
            checked={autoPrintOnScan}
            onChange={e => setAutoPrintOnScan(e.target.checked)}
          />
          스캔 시 자동 출력
        </label>

        {onOpenDesigner && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onOpenDesigner}
            style={{ padding: '6px 12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '4px', whiteSpace: 'nowrap' }}
          >
            <Settings size={13} /> 라벨 서식 디자인
          </button>
        )}
      </form>

      {/* 중단 본문: 좌측 조회 자산 & 1:1 라벨 미리보기 / 우측 출력 이력 */}
      <div style={{ display: 'grid', gridTemplateColumns: '440px 1fr', gap: '8px', flex: 1, minHeight: 0, overflow: 'hidden' }}>
        {/* 좌측: 1:1 실물 라벨 미리보기 및 단건 즉시 인쇄 */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            overflowY: 'auto',
            gap: '12px'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
              라벨 인쇄 미리보기 ({activePreset?.name})
            </strong>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
              {activePreset?.paper?.widthMm || 72} × {activePreset?.paper?.heightMm || 40} mm
            </span>
          </div>

          <div
            style={{
              flex: 1,
              backgroundColor: '#f1f5f9',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '210px'
            }}
          >
            {activePreset && (
              <LabelWysiwygPreviewCard preset={activePreset} normalizedAsset={normalizedActiveAsset} scale={3.6} />
            )}
          </div>

          {activeAsset && (
            <div
              style={{
                padding: '10px 12px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '6px',
                fontSize: '11.5px'
              }}
            >
              <div><span style={{ color: 'var(--text-secondary)' }}>자산번호:</span> <strong>{activeAsset.assetNo}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>모델명:</span> <strong>{activeAsset.modelName}</strong></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>시리얼(S/N):</span> <span style={{ fontFamily: 'monospace' }}>{activeAsset.serialNo || '-'}</span></div>
              <div><span style={{ color: 'var(--text-secondary)' }}>IMEI/MAC:</span> <span style={{ fontFamily: 'monospace' }}>{activeAsset.imei || activeAsset.wiredMac || '-'}</span></div>
              <div style={{ gridColumn: 'span 2' }}>
                <span style={{ color: 'var(--text-secondary)' }}>하드웨어 사양:</span> {normalizedActiveAsset.spec || '-'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              className="btn-secondary"
              disabled={!activeAsset}
              onClick={() => activeAsset && executePrintForAsset(activeAsset, 'BROWSER')}
              style={{ padding: '7px 14px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
            >
              <Printer size={14} /> 브라우저 인쇄
            </button>
            <button
              type="button"
              data-mid="btn-direct-zpl-print-now"
              className="btn-primary"
              disabled={!activeAsset}
              onClick={() => activeAsset && executePrintForAsset(activeAsset, 'ZPL')}
              style={{ padding: '7px 16px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
            >
              <Printer size={14} /> 현재 자산 라벨 출력
            </button>
          </div>
        </div>

        {/* 우측: 금일 라벨 출력 이력 대장 */}
        <div
          style={{
            backgroundColor: 'var(--bg-card)',
            borderRadius: '6px',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden'
          }}
        >
          <div
            style={{
              padding: '10px 14px',
              borderBottom: '1px solid var(--border-color)',
              backgroundColor: 'var(--bg-app)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}
          >
            <strong style={{ fontSize: '13px', color: 'var(--text-main)' }}>
              라벨 출력 이력 ({printHistory.length}건)
            </strong>
            {printHistory.length > 0 && (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => {
                  setPrintHistory([]);
                  savePrintHistory([]);
                }}
                style={{ padding: '3px 8px', fontSize: '11px' }}
              >
                이력 비우기
              </button>
            )}
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11.5px', textAlign: 'left' }}>
              <thead style={{ position: 'sticky', top: 0, backgroundColor: 'var(--bg-app)', borderBottom: '1px solid var(--border-color)' }}>
                <tr>
                  <th style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>재출력</th>
                  <th style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>출력시각</th>
                  <th style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>자산번호</th>
                  <th style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>모델명</th>
                  <th style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>시리얼번호</th>
                  <th style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>적용 서식</th>
                  <th style={{ padding: '7px 10px', whiteSpace: 'nowrap' }}>프린터</th>
                  <th style={{ padding: '7px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>매수</th>
                </tr>
              </thead>
              <tbody>
                {printHistory.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ padding: '36px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                      출력된 라벨 이력이 없습니다. 상단에서 바코드를 스캔하거나 자산을 선택해 출력하세요.
                    </td>
                  </tr>
                ) : (
                  printHistory.map(log => (
                    <tr
                      key={log.id}
                      onClick={() => log.asset && setActiveAsset(log.asset)}
                      style={{ borderBottom: '1px solid var(--border-color)', cursor: 'pointer' }}
                      className="hover-row"
                    >
                      <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>
                        <button
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            if (log.asset) executePrintForAsset(log.asset, 'ZPL');
                          }}
                          style={{
                            padding: '2px 7px',
                            fontSize: '11px',
                            borderRadius: '3px',
                            border: '1px solid var(--border-color)',
                            backgroundColor: 'transparent',
                            color: 'var(--primary)',
                            cursor: 'pointer',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          재출력
                        </button>
                      </td>
                      <td style={{ padding: '6px 10px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{log.printedAt}</td>
                      <td style={{ padding: '6px 10px', fontWeight: 700, whiteSpace: 'nowrap' }}>{log.assetNo}</td>
                      <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>{log.modelName}</td>
                      <td style={{ padding: '6px 10px', fontFamily: 'monospace', whiteSpace: 'nowrap' }}>{log.serialNo}</td>
                      <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>{log.presetName}</td>
                      <td style={{ padding: '6px 10px', whiteSpace: 'nowrap' }}>{log.printerName}</td>
                      <td style={{ padding: '6px 10px', textAlign: 'center', whiteSpace: 'nowrap' }}>{log.copies}매</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
