// src/pages/ConsumableStockPage.tsx
import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Boxes, CheckSquare, Plus, Download, 
  CheckCircle2, Edit, Trash2, X, AlertTriangle, FileCheck
} from 'lucide-react';
import { exportToExcel } from '../services/excel';
import { SortableTh } from '../components/SortableTh';
import { useSortableData } from '../hooks/useSortableData';
import { 
  Consumable, StocktakingAudit, StocktakingAuditItem, db 
} from '../services/db';
import { createHangulMatcher } from '../utils/hangulSearch';

export const ConsumableStockPage: React.FC = () => {
  const {
    consumables,
    stocktakingAudits,
    stocktakingAuditItems,
    currentUser,
    addConsumable,
    updateConsumable,
    deleteConsumable,
    createStocktakingAudit,
    updateStocktakingItem,
    confirmStocktakingAudit,
    cancelStocktakingAudit,
    hasPermission,
    showErrorModal
  } = useApp();

  const canSave = hasPermission('consumable_stock', 'save') || hasPermission('consumable', 'save');

  // O(1) 룩업 맵 사전 연산
  const consumableMap = useMemo(() => {
    const map = new Map<string, Consumable>();
    for (const c of consumables) map.set(c.id, c);
    return map;
  }, [consumables]);

  const auditMap = useMemo(() => {
    const map = new Map<string, StocktakingAudit>();
    for (const a of stocktakingAudits) map.set(a.id, a);
    return map;
  }, [stocktakingAudits]);

  const auditItemsByAuditIdMap = useMemo(() => {
    const map = new Map<string, StocktakingAuditItem[]>();
    for (const item of stocktakingAuditItems) {
      const arr = map.get(item.auditId);
      if (arr) arr.push(item);
      else map.set(item.auditId, [item]);
    }
    return map;
  }, [stocktakingAuditItems]);

  // 활성 탭: STOCK (소모품 재고) | STOCKTAKING (재고실사)
  const [activeTab, setActiveTab] = useState<'STOCK' | 'STOCKTAKING'>('STOCK');

  // 토스트 알림 상태
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // --- [1] 소모품 재고 상태 ---
  const [stockSearch, setStockSearch] = useState('');
  const [showMasterModal, setShowMasterModal] = useState(false);
  const [masterEditingId, setMasterEditingId] = useState<string | null>(null);
  const [masterModelName, setMasterModelName] = useState('');
  const [masterUnit, setMasterUnit] = useState('개');
  const [masterUnitPrice, setMasterUnitPrice] = useState(0);
  const [masterSupplier, setMasterSupplier] = useState('');
  const [masterInitialStockQty, setMasterInitialStockQty] = useState(0);

  // --- [2] 재고 실사 상태 ---
  const [selectedAuditId, setSelectedAuditId] = useState('');
  const [auditStatusFilter, setAuditStatusFilter] = useState<'ALL' | 'DRAFT' | 'CONFIRMED' | 'CANCELLED'>('ALL');
  const [showCreateAuditModal, setShowCreateAuditModal] = useState(false);
  const [newAuditMemo, setNewAuditMemo] = useState('');
  const [auditItemSearch, setAuditItemSearch] = useState('');

  // 재고 통계 요약
  const stockSummary = useMemo(() => {
    let totalQty = 0;
    let totalValue = 0;
    for (const c of consumables) {
      const qty = c.stockQty || 0;
      totalQty += qty;
      totalValue += qty * (c.unitPrice || 0);
    }

    return {
      totalKinds: consumables.length,
      totalQty,
      totalValue
    };
  }, [consumables]);

  const draftAuditsCount = useMemo(() => {
    let count = 0;
    for (const a of stocktakingAudits) {
      if (a.status === 'DRAFT') count++;
    }
    return count;
  }, [stocktakingAudits]);

  const filteredAudits = useMemo(() => {
    return stocktakingAudits.filter(a => {
      const matchStatus = auditStatusFilter === 'ALL' || a.status === auditStatusFilter;
      return matchStatus;
    });
  }, [stocktakingAudits, auditStatusFilter]);

  const currentAudit = useMemo(() => {
    return selectedAuditId ? auditMap.get(selectedAuditId) : undefined;
  }, [auditMap, selectedAuditId]);

  const currentAuditItems = useMemo(() => {
    if (!currentAudit) return [];
    const items = auditItemsByAuditIdMap.get(currentAudit.id) || [];
    if (!auditItemSearch) return items;
    const matcher = createHangulMatcher(auditItemSearch);
    return items.filter(item => matcher.test(item.modelName));
  }, [currentAudit, auditItemsByAuditIdMap, auditItemSearch]);

  // 정렬용 Enriched Data
  const enrichedStock = useMemo(() => {
    const matcher = stockSearch ? createHangulMatcher(stockSearch) : null;
    return consumables.filter(c => {
      return !matcher || matcher.testAny([c.modelName, c.supplier]);
    }).map(c => {
      const hqValue = (c.stockQty || 0) * (c.unitPrice || 0);
      return { ...c, hqValue };
    });
  }, [consumables, stockSearch]);

  const { items: sortedStock, requestSort: requestSortStock, sortConfig: sortConfigStock } = useSortableData(enrichedStock);

  // --- 엑셀 다운로드 핸들러 ---
  const handleExportStock = () => {
    const excelData = consumables.map((c, idx) => {
      return {
        'No': idx + 1,
        '소모품 품목명': c.modelName,
        '재고 수량': c.stockQty,
        '단위': c.unit || '개',
        '단가': `${(c.unitPrice || 0).toLocaleString()}원`,
        '재고 평가액': `${((c.stockQty || 0) * (c.unitPrice || 0)).toLocaleString()}원`,
        '최근 구입처': c.supplier || '-'
      };
    });

    exportToExcel(excelData, `소모품_재고대장_${new Date().toISOString().split('T')[0]}`, '소모품재고');
  };

  // --- 품목 마스터 CUD 핸들러 ---
  const openCreateMaster = () => {
    setMasterEditingId(null);
    setMasterModelName('');
    setMasterUnit('개');
    setMasterUnitPrice(0);
    setMasterSupplier('');
    setMasterInitialStockQty(0);
    setShowMasterModal(true);
  };

  const openEditMaster = (item: Consumable) => {
    setMasterEditingId(item.id);
    setMasterModelName(item.modelName);
    setMasterUnit(item.unit || '개');
    setMasterUnitPrice(item.unitPrice || 0);
    setMasterSupplier(item.supplier || '');
    setMasterInitialStockQty(item.stockQty || 0);
    setShowMasterModal(true);
  };

  const handleSaveMaster = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!masterModelName.trim()) {
      showToast('품목명을 입력해 주세요.', 'error');
      return;
    }
    try {
      if (masterEditingId) {
        await updateConsumable(masterEditingId, {
          modelName: masterModelName.trim(),
          unit: masterUnit.trim() || '개',
          unitPrice: masterUnitPrice,
          supplier: masterSupplier.trim()
        });
        showToast('품목 마스터 정보가 성공적으로 수정되었습니다.');
      } else {
        await addConsumable({
          modelName: masterModelName.trim(),
          unit: masterUnit.trim() || '개',
          unitPrice: masterUnitPrice,
          supplier: masterSupplier.trim(),
          stockQty: masterInitialStockQty
        });
        showToast('신규 품목 마스터가 성공적으로 등록되었습니다.');
      }
      setShowMasterModal(false);
    } catch (err: any) {
      showErrorModal(`품목 저장 실패:\n${err?.message || err}`);
    }
  };

  const handleDeleteMaster = async (id: string, modelName: string) => {
    if (!window.confirm(`[${modelName}] 품목을 정말 삭제하시겠습니까?`)) return;
    try {
      await deleteConsumable(id);
      showToast(`[${modelName}] 품목이 삭제되었습니다.`);
    } catch (err: any) {
      showErrorModal(`품목 삭제 실패:\n${err?.message || err}`);
    }
  };

  // --- 신규 실사 전표 생성 핸들러 ---
  const handleCreateAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSave) return;

    try {
      const newAudit = await createStocktakingAudit('HQ', undefined, newAuditMemo);
      await db.awaitPendingWrites();
      showToast(`재고실사 전표(${newAudit.auditNo})가 성공적으로 생성되었습니다.`);
      setSelectedAuditId(newAudit.id);
      setShowCreateAuditModal(false);
      setNewAuditMemo('');
    } catch (err: any) {
      showErrorModal(`실사 전표 생성 실패:\n${err?.message || err}`);
    }
  };

  // --- 실사 품목 수량 인라인 수정 핸들러 ---
  const handleAuditItemQtyChange = async (itemId: string, newActualQty: number, diffReason?: StocktakingAuditItem['diffReason'], note?: string) => {
    if (!selectedAuditId) return;
    try {
      await updateStocktakingItem(selectedAuditId, itemId, newActualQty, diffReason, note);
    } catch (err: any) {
      showToast(err?.message || '수량 반영 실패', 'error');
    }
  };

  // --- 실사 확정 핸들러 ---
  const handleConfirmAudit = async (auditId: string) => {
    if (!canSave) return;
    try {
      await confirmStocktakingAudit(auditId);
      await db.awaitPendingWrites();
      showToast('재고 실사가 최종 확정되어 전산 재고가 강제 보정되었습니다.');
    } catch (err: any) {
      showErrorModal(`실사 확정 실패:\n${err?.message || err}`);
    }
  };

  // --- 실사 취소 핸들러 ---
  const handleCancelAudit = async (auditId: string) => {
    if (!canSave) return;
    try {
      await cancelStocktakingAudit(auditId);
      await db.awaitPendingWrites();
      showToast('실사 전표가 취소되었습니다.');
    } catch (err: any) {
      showErrorModal(`실사 취소 실패:\n${err?.message || err}`);
    }
  };

  return (
    <div data-hs-observe="consumablestockpage" data-subview="consumable_stock" data-subview-title="Generated" style={{ display: 'flex', flexDirection: 'column', gap: '14px', height: '100%' }}>
      {/* ─── 토스트 알림 ─── */}
      {toastMessage && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 9999,
          padding: '12px 20px', borderRadius: '8px',
          backgroundColor: toastMessage.type === 'success' ? '#059669' : '#dc2626',
          color: '#ffffff', fontWeight: 600, fontSize: '13px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          display: 'flex', alignItems: 'center', gap: '8px'
        }}>
          {toastMessage.type === 'success' ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ─── [Z-패턴 1단계: 헤더 & 탭 네비게이션] ─── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '8px', borderBottom: '1px solid var(--border-color)', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Boxes size={18} color="var(--primary)" />
          <h2 data-mid="consumable_stock-header" style={{ fontSize: '17px', fontWeight: 700, margin: 0, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>
            소모품 재고 관리
          </h2>
        </div>

        {/* 탭 버튼군 (무수식어 건조 표준: 주기장재고 / 재고실사 2개) */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          <button
            type="button"
            className={activeTab === 'STOCK' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('STOCK')}
            style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <Boxes size={14} /> 소모품 재고
          </button>
          <button
            type="button"
            className={activeTab === 'STOCKTAKING' ? 'btn-primary' : 'btn-secondary'}
            onClick={() => setActiveTab('STOCKTAKING')}
            style={{ padding: '8px 14px', fontSize: '13px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
          >
            <CheckSquare size={14} /> 재고 실사
            {draftAuditsCount > 0 && (
              <span style={{
                backgroundColor: 'var(--warning)', color: '#fff', fontSize: '11px',
                padding: '1px 6px', borderRadius: '10px', fontWeight: 700
              }}>
                {draftAuditsCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* [TAB 1] 소모품 재고 */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'STOCK' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 상단 통계 카드 */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
            <div className="card" style={{ margin: 0, padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>총 관리 품목 수</div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: 'var(--primary)' }}>
                {stockSummary.totalKinds}종
              </div>
            </div>
            <div className="card" style={{ margin: 0, padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>보유 재고 수량</div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: 'var(--success)' }}>
                {stockSummary.totalQty.toLocaleString()}개
              </div>
            </div>
            <div className="card" style={{ margin: 0, padding: '16px' }}>
              <div style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>재고 평가액</div>
              <div style={{ fontSize: '22px', fontWeight: 800, marginTop: '4px', color: 'var(--text-primary)' }}>
                ₩{stockSummary.totalValue.toLocaleString()}
              </div>
            </div>
          </div>

          {/* 검색 및 액션 바 */}
          <div className="card" style={{ margin: 0, padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="text"
                  value={stockSearch}
                  onChange={e => setStockSearch(e.target.value)}
                  placeholder="품목명, 공급처 검색..."
                  style={{ padding: '6px 10px', fontSize: '12.5px', width: '220px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                />
              </div>

              <div className="toolbar-actions">
                {canSave && (
                  <button data-hs-trigger="Register"
                    type="button"
                    className="btn-save"
                    onClick={openCreateMaster}
                  >
                    <Plus size={13} /> 품목 마스터 등록
                  </button>
                )}
                <button
                  type="button"
                  className="btn-excel-download"
                  onClick={handleExportStock}
                >
                  <Download size={13} /> 재고 엑셀 내보내기
                </button>
              </div>
            </div>
          </div>

          {/* 품목 마스터 목록 테이블 */}
          <div className="card" style={{ margin: 0 }}>
            <div className="table-container" style={{ border: 'none', boxShadow: 'none', maxHeight: 'calc(100vh - 340px)', overflowY: 'auto', overflowX: 'auto' }}>
              <table>
                <thead>
                  <tr>
                    <th>No</th>
                    <SortableTh label="품목명" sortKey="modelName" currentSort={sortConfigStock} onSort={requestSortStock} />
                    <SortableTh label="재고 수량" sortKey="stockQty" currentSort={sortConfigStock} onSort={requestSortStock} align="center" />
                    <SortableTh label="단위" sortKey="unit" currentSort={sortConfigStock} onSort={requestSortStock} />
                    <SortableTh label="단가" sortKey="unitPrice" currentSort={sortConfigStock} onSort={requestSortStock} />
                    <SortableTh label="재고 평가액" sortKey="hqValue" currentSort={sortConfigStock} onSort={requestSortStock} />
                    <SortableTh label="공급처" sortKey="supplier" currentSort={sortConfigStock} onSort={requestSortStock} />
                    <th style={{ textAlign: 'center' }}>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {(() => {
                    const filtered = sortedStock;

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', padding: '36px 0', color: 'var(--text-muted)' }}>
                            등록된 소모품 품목이 없습니다.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((c, idx) => {
                      const hqValue = c.hqValue;

                      return (
                        <tr key={c.id}>
                          <td style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                          <td><strong style={{ color: 'var(--primary)' }}>{c.modelName}</strong></td>
                          <td style={{ textAlign: 'center', fontWeight: 700, color: c.stockQty > 0 ? '#059669' : '#dc2626' }}>
                            {c.stockQty}
                          </td>
                          <td style={{ fontSize: '12px' }}>{c.unit || '개'}</td>
                          <td style={{ fontSize: '12px' }}>{(c.unitPrice || 0).toLocaleString()}원</td>
                          <td style={{ fontWeight: 600 }}>{hqValue.toLocaleString()}원</td>
                          <td style={{ fontSize: '12px' }}>{c.supplier || '-'}</td>
                          <td style={{ textAlign: 'center' }}>
                            {canSave && (
                              <div style={{ display: 'inline-flex', gap: '4px' }}>
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  onClick={() => openEditMaster(c)}
                                  style={{ padding: '2px 6px', fontSize: '11px' }}
                                >
                                  <Edit size={12} />
                                </button>
                                <button
                                  type="button"
                                  className="btn-secondary"
                                  onClick={() => handleDeleteMaster(c.id, c.modelName)}
                                  style={{ padding: '2px 6px', fontSize: '11px', color: 'var(--danger)' }}
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* [TAB 2] 재고 실사 (Stocktaking Audit Studio) */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {activeTab === 'STOCKTAKING' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* 상단: 실사 전표 스코프 및 필터 바 */}
          <div className="card" style={{ margin: 0, padding: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)' }}>실사 상태</label>
                  <select
                    value={auditStatusFilter}
                    onChange={e => setAuditStatusFilter(e.target.value as any)}
                    style={{ padding: '6px 8px', fontSize: '12px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                  >
                    <option value="ALL">전체 상태</option>
                    <option value="DRAFT">작성중</option>
                    <option value="CONFIRMED">실사확정</option>
                    <option value="CANCELLED">취소</option>
                  </select>
                </div>
              </div>

              {canSave && (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    setNewAuditMemo('');
                    setShowCreateAuditModal(true);
                  }}
                  style={{ display: 'flex', alignItems: 'center', gap: '4px', padding: '8px 14px', fontSize: '13px' }}
                >
                  <Plus size={14} /> 새 실사 전표 생성
                </button>
              )}
            </div>

            {/* 실사 전표 카드 목록 */}
            <div style={{ marginTop: '12px', borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
              <div style={{ fontSize: '11.5px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-secondary)' }}>
                실사 전표 목록 ({stocktakingAudits.length}건)
              </div>
              <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '6px' }}>
                {(() => {
                  if (filteredAudits.length === 0) {
                    return (
                      <div style={{ fontSize: '12px', color: 'var(--text-muted)', padding: '10px 0' }}>
                        조건에 맞는 실사 전표가 없습니다. [새 실사 전표 생성] 버튼을 눌러 실사를 시작하세요.
                      </div>
                    );
                  }

                  return filteredAudits.map(a => {
                    const isSelected = selectedAuditId === a.id;
                    const statusColor = a.status === 'CONFIRMED' ? '#059669' : (a.status === 'CANCELLED' ? '#dc2626' : '#d97706');
                    const statusBg = a.status === 'CONFIRMED' ? 'rgba(5, 150, 105, 0.1)' : (a.status === 'CANCELLED' ? 'rgba(220, 38, 38, 0.1)' : 'rgba(217, 119, 6, 0.1)');

                    return (
                      <div
                        key={a.id}
                        onClick={() => setSelectedAuditId(a.id)}
                        style={{
                          minWidth: '220px', padding: '10px 14px', borderRadius: '8px', cursor: 'pointer',
                          backgroundColor: isSelected ? 'rgba(59, 130, 246, 0.08)' : 'var(--bg-app)',
                          border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border-color)'
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontSize: '12px', fontWeight: 800, color: 'var(--primary)' }}>{a.auditNo}</span>
                          <span style={{ fontSize: '11px', fontWeight: 700, padding: '2px 6px', borderRadius: '4px', color: statusColor, backgroundColor: statusBg }}>
                            {a.status === 'CONFIRMED' ? '확정' : a.status === 'CANCELLED' ? '취소' : '작성중'}
                          </span>
                        </div>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginTop: '4px' }}>
                          소모품 실사
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                          {a.auditDate} | {(auditItemsByAuditIdMap.get(a.id) || []).length}개 품목
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>

          {/* 선택 전표 상세 대사 스튜디오 */}
          {(() => {
            if (!currentAudit) {
              return (
                <div className="card" style={{ margin: 0, padding: '40px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  상단에서 실사 전표를 선택하면 전산 재고 vs 실사 수량 대사 작업대가 표시됩니다.
                </div>
              );
            }

            const currentItems = currentAuditItems;
            const isDraft = currentAudit.status === 'DRAFT';

            return (
              <div className="card" style={{ margin: 0 }}>
                <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px' }}>
                  <div>
                    <h3 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <FileCheck size={16} style={{ color: 'var(--primary)' }} />
                      전표 {currentAudit.auditNo} 실사 검증 대장
                    </h3>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                      전산재고 ↔ 실사수량 1:1 인라인 검증 및 차이 사유 확정
                    </span>
                  </div>

                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type="text"
                      value={auditItemSearch}
                      onChange={e => setAuditItemSearch(e.target.value)}
                      placeholder="실사 품목 검색..."
                      style={{ padding: '5px 8px', fontSize: '12px', width: '150px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                    />
                    {isDraft && canSave && (
                      <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => handleCancelAudit(currentAudit.id)}
                        style={{ padding: '5px 10px', fontSize: '12px', color: 'var(--danger)' }}
                      >
                        전표 취소
                      </button>
                    )}
                  </div>
                </div>

                <div className="table-container" style={{ border: 'none', boxShadow: 'none', maxHeight: 'calc(100vh - 420px)', overflowY: 'auto', overflowX: 'auto' }}>
                  <table>
                    <thead>
                      <tr>
                        <th style={{ textAlign: 'center' }}>No</th>
                        <th>품목명</th>
                        <th>단위</th>
                        <th style={{ textAlign: 'right' }}>단가</th>
                        <th style={{ textAlign: 'center' }}>전산 수량</th>
                        <th style={{ textAlign: 'center' }}>실사 수량</th>
                        <th style={{ textAlign: 'center' }}>차이 수량</th>
                        <th style={{ textAlign: 'right' }}>차이 금액</th>
                        <th>차이 사유 (망실/감모 원인)</th>
                        <th>메모</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length === 0 ? (
                        <tr>
                          <td colSpan={10} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--text-muted)' }}>
                            실사 대상 품목이 없습니다.
                          </td>
                        </tr>
                      ) : (
                        currentItems.map((item, idx) => {
                          const hasDiff = item.diffQty !== 0;

                          return (
                            <tr key={item.id} style={{ backgroundColor: hasDiff ? 'rgba(239, 68, 68, 0.04)' : undefined }}>
                              <td style={{ textAlign: 'center', fontSize: '12px', color: 'var(--text-muted)' }}>{idx + 1}</td>
                              <td><strong style={{ color: 'var(--primary)' }}>{item.modelName}</strong></td>
                              <td style={{ fontSize: '12px' }}>{item.unit}</td>
                              <td style={{ textAlign: 'right', fontSize: '12px' }}>₩{(item.unitPrice || 0).toLocaleString()}</td>
                              <td style={{ textAlign: 'center', fontWeight: 700 }}>{item.systemQty}</td>
                              <td style={{ textAlign: 'center' }}>
                                {isDraft ? (
                                  <input
                                    type="number"
                                    min={0}
                                    value={item.actualQty}
                                    onChange={e => {
                                      const val = parseInt(e.target.value) || 0;
                                      handleAuditItemQtyChange(item.id, val, item.diffReason, item.note);
                                    }}
                                    style={{
                                      width: '70px', padding: '4px', textAlign: 'center', fontWeight: 800,
                                      borderRadius: '4px',
                                      border: hasDiff ? '2px solid #dc2626' : '1px solid var(--border-color)',
                                      backgroundColor: hasDiff ? '#fff1f2' : 'inherit'
                                    }}
                                  />
                                ) : (
                                  <strong style={{ color: 'var(--primary)' }}>{item.actualQty}</strong>
                                )}
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {item.diffQty === 0 ? (
                                  <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>0</span>
                                ) : item.diffQty > 0 ? (
                                  <span className="badge badge-primary" style={{ fontWeight: 800 }}>+{item.diffQty} (잉여)</span>
                                ) : (
                                  <span className="badge badge-danger" style={{ fontWeight: 800 }}>{item.diffQty} (감모)</span>
                                )}
                              </td>
                              <td style={{
                                textAlign: 'right', fontWeight: 700, fontSize: '12px',
                                color: item.diffAmount === 0 ? 'inherit' : (item.diffAmount > 0 ? '#2563eb' : '#dc2626')
                              }}>
                                {item.diffAmount === 0 ? '-' : `₩${(item.diffAmount || 0).toLocaleString()}`}
                              </td>
                              <td>
                                {isDraft ? (
                                  <select
                                    value={item.diffReason || 'OTHER'}
                                    disabled={!hasDiff}
                                    onChange={e => handleAuditItemQtyChange(item.id, item.actualQty, e.target.value as any, item.note)}
                                    style={{ padding: '3px 6px', fontSize: '11px', width: '100%', opacity: hasDiff ? 1 : 0.4 }}
                                  >
                                    <option value="LOST">망실/도난</option>
                                    <option value="DAMAGED">파손/부식/폐기</option>
                                    <option value="UNRECORDED_USAGE">미기록 소모</option>
                                    <option value="SURPLUS">미등록 잉여</option>
                                    <option value="OTHER">기타 사유</option>
                                  </select>
                                ) : (
                                  <span style={{ fontSize: '11.5px', color: 'var(--text-secondary)' }}>
                                    {item.diffReason === 'LOST' ? '망실/도난' :
                                     item.diffReason === 'DAMAGED' ? '파손/부식' :
                                     item.diffReason === 'UNRECORDED_USAGE' ? '미기록 소모' :
                                     item.diffReason === 'SURPLUS' ? '미등록 잉여' : (item.diffQty !== 0 ? '기타' : '-')}
                                  </span>
                                )}
                              </td>
                              <td>
                                {isDraft ? (
                                  <input
                                    type="text"
                                    value={item.note || ''}
                                    placeholder="특이사항 메모..."
                                    onChange={e => handleAuditItemQtyChange(item.id, item.actualQty, item.diffReason, e.target.value)}
                                    style={{ width: '100%', padding: '3px 6px', fontSize: '11px', borderRadius: '4px', border: '1px solid var(--border-color)' }}
                                  />
                                ) : (
                                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>{item.note || '-'}</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>

                {/* 하단 Gutenberg Z-패턴 대차대조식 터미널 바 */}
                <div style={{
                  padding: '14px 20px', backgroundColor: 'var(--bg-app)', borderTop: '1px solid var(--border-color)',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px'
                }}>
                  <div style={{ fontSize: '12px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    <span><strong>실물 총액:</strong> ₩{currentAudit.totalActualAmount.toLocaleString()}원</span>
                    <span>=</span>
                    <span>💻 <strong>전산 총액:</strong> ₩{currentAudit.totalSystemAmount.toLocaleString()}원</span>
                    <span>+</span>
                    <span><strong>실사 차액:</strong> ₩{currentAudit.totalDiffAmount.toLocaleString()}원</span>
                  </div>

                  {isDraft && canSave && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleConfirmAudit(currentAudit.id)}
                      style={{ padding: '8px 18px', fontSize: '13px', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}
                    >
                      <CheckCircle2 size={16} /> 실사 확정 및 재고 강제 반영
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 품목 마스터 CUD 모달 */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {showMasterModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleSaveMaster} className="card" style={{ width: '90%', maxWidth: '450px', backgroundColor: 'var(--bg-card)', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>
                {masterEditingId ? '품목 마스터 정보 수정' : '신규 품목 마스터 등록'}
              </h3>
              <button type="button" onClick={() => setShowMasterModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>품목명 *</label>
                <input
                  type="text"
                  value={masterModelName}
                  onChange={e => setMasterModelName(e.target.value)}
                  placeholder="예: DDR5 RAM 32GB, NVMe SSD 1TB, 전원 케이블"
                  required
                  style={{ padding: '8px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>단위</label>
                  <input
                    type="text"
                    value={masterUnit}
                    onChange={e => setMasterUnit(e.target.value)}
                    placeholder="개, 세트 등"
                    style={{ padding: '8px', fontSize: '13px' }}
                  />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>기본 단가 (원)</label>
                  <input
                    type="number"
                    min={0}
                    value={masterUnitPrice}
                    onChange={e => setMasterUnitPrice(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ padding: '8px', fontSize: '13px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>주요 공급처</label>
                <input
                  type="text"
                  value={masterSupplier}
                  onChange={e => setMasterSupplier(e.target.value)}
                  placeholder="예: 삼성전자, SK하이닉스, 컴퓨존"
                  style={{ padding: '8px', fontSize: '13px' }}
                />
              </div>

              {!masterEditingId && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <label style={{ fontSize: '12px', fontWeight: 600 }}>초기 보유 수량</label>
                  <input
                    type="number"
                    min={0}
                    value={masterInitialStockQty}
                    onChange={e => setMasterInitialStockQty(Math.max(0, parseInt(e.target.value) || 0))}
                    style={{ padding: '8px', fontSize: '13px' }}
                  />
                </div>
              )}

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowMasterModal(false)} style={{ flex: 1, padding: '10px' }}>
                  취소
                </button>
                <button data-hs-trigger="Register" type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  {masterEditingId ? '수정 완료' : '등록 완료'}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ──────────────────────────────────────────────────────────────────────── */}
      {/* 신규 실사 전표 생성 모달 */}
      {/* ──────────────────────────────────────────────────────────────────────── */}
      {showCreateAuditModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <form onSubmit={handleCreateAuditSubmit} className="card" style={{ width: '90%', maxWidth: '450px', backgroundColor: 'var(--bg-card)', margin: 0 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0 }}>새 재고 실사 전표 생성</h3>
              <button type="button" onClick={() => setShowCreateAuditModal(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                <X size={18} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>실사 대상 *</label>
                <input
                  type="text"
                  value="소모품 창고 재고"
                  disabled
                  style={{ padding: '8px', fontSize: '13px', backgroundColor: 'var(--bg-app)', color: 'var(--text-muted)' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600 }}>실사 목적 및 메모</label>
                <input
                  type="text"
                  value={newAuditMemo}
                  onChange={e => setNewAuditMemo(e.target.value)}
                  placeholder="예: 2026년 상반기 정기 재고 실사"
                  style={{ padding: '8px', fontSize: '13px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '10px' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowCreateAuditModal(false)} style={{ flex: 1, padding: '10px' }}>
                  취소
                </button>
                <button type="submit" className="btn-primary" style={{ flex: 1, padding: '10px' }}>
                  실사 전표 생성
                </button>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
