// src/components/ProductPhotoManager.tsx
// IT 제품별 최대 4장 사진자료 관리 컴포넌트 (전면, 후면, 내부, 기타)
import React, { useState, useRef } from 'react';
import { 
  Camera, Upload, Trash2, Eye, Plus, AlertCircle, RefreshCw, ZoomIn, Check
} from 'lucide-react';
import { 
  ProductPhoto, ProductPhotoTag, PRODUCT_PHOTO_TAGS, PRODUCT_PHOTO_TAG_LABELS, ProductCategory 
} from '../services/db';
import { compressImageFile } from '../utils/imageCompressor';
import { ProductPhotoViewerModal } from './ProductPhotoViewerModal';

export interface ProductPhotoManagerProps {
  photos: ProductPhoto[];
  onChange?: (photos: ProductPhoto[]) => void;
  readOnly?: boolean;
  modelName?: string;
  category?: ProductCategory;
  maxPhotos?: number; // 기본값 4
}

export const ProductPhotoManager: React.FC<ProductPhotoManagerProps> = ({
  photos = [],
  onChange,
  readOnly = false,
  modelName = '',
  category = 'LAPTOP',
  maxPhotos = 4
}) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [targetSlotTag, setTargetSlotTag] = useState<ProductPhotoTag>('FRONT');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const multiFileInputRef = useRef<HTMLInputElement>(null);

  // 현재 등록된 사진 수
  const currentCount = photos.length;
  const isMaxReached = currentCount >= maxPhotos;

  // 태그별 등록된 사진 찾기 (전면, 후면, 내부, 기타)
  const getPhotoByTag = (tag: ProductPhotoTag) => {
    return photos.find(p => p.tag === tag);
  };

  // 사진 클릭 시 뷰어 열기
  const handleOpenViewer = (index: number) => {
    setViewerIndex(index);
    setViewerOpen(true);
  };

  // 특정 태그 슬롯에 사진 업로드 트리거
  const handleTriggerUploadForTag = (tag: ProductPhotoTag) => {
    if (readOnly || isMaxReached) return;
    setTargetSlotTag(tag);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  // 범용 사진 추가 트리거 (최대 4장 이내에서 빈 태그 자동 선택)
  const handleTriggerGeneralUpload = () => {
    if (readOnly || isMaxReached) return;
    // 아직 등록되지 않은 태그 우선 탐색
    const unusedTag = PRODUCT_PHOTO_TAGS.find(t => !photos.some(p => p.tag === t)) || 'OTHER';
    setTargetSlotTag(unusedTag);
    if (multiFileInputRef.current) {
      multiFileInputRef.current.value = '';
      multiFileInputRef.current.click();
    }
  };

  // 파일 업로드 처리 (압축 후 추가)
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onChange) return;

    setIsProcessing(true);
    try {
      const remainingSlots = maxPhotos - photos.length;
      const filesToProcess = Array.from(files).slice(0, remainingSlots);

      const newPhotos: ProductPhoto[] = [...photos];
      let currentTagIndex = PRODUCT_PHOTO_TAGS.indexOf(targetSlotTag);
      if (currentTagIndex === -1) currentTagIndex = 0;

      for (let i = 0; i < filesToProcess.length; i++) {
        const file = filesToProcess[i];
        // 1200x1200px 0.75 퀄리티 압축 (메모리 OOM 방지 및 빠른 렌더링)
        const compressedDataUrl = await compressImageFile(file, 1200, 1200, 0.75);

        // 태그 결정: 첫 파일은 선택된 태그, 추가 파일은 미사용 태그 순차 할당
        let assignTag: ProductPhotoTag = targetSlotTag;
        if (i > 0) {
          const unusedTags = PRODUCT_PHOTO_TAGS.filter(t => !newPhotos.some(p => p.tag === t));
          assignTag = unusedTags[0] || 'OTHER';
        }

        // 만약 해당 태그에 이미 사진이 있고 슬롯 직접 교체인 경우 기존 사진 교체
        const existingIdx = newPhotos.findIndex(p => p.tag === assignTag);
        const newPhotoItem: ProductPhoto = {
          id: `photo-${Date.now()}-${i}-${Math.random().toString(36).substr(2, 5)}`,
          tag: assignTag,
          tagLabel: PRODUCT_PHOTO_TAG_LABELS[assignTag],
          url: compressedDataUrl,
          caption: `${modelName ? `[${modelName}] ` : ''}${PRODUCT_PHOTO_TAG_LABELS[assignTag]} 사진`,
          createdAt: new Date().toISOString()
        };

        if (filesToProcess.length === 1 && existingIdx >= 0) {
          newPhotos[existingIdx] = newPhotoItem;
        } else {
          newPhotos.push(newPhotoItem);
        }
      }

      onChange(newPhotos.slice(0, maxPhotos));
    } catch (err: any) {
      alert(`사진 압축 처리 실패: ${err?.message || err}`);
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (multiFileInputRef.current) multiFileInputRef.current.value = '';
    }
  };

  // 사진 삭제
  const handleDeletePhoto = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (readOnly || !onChange) return;
    const updated = photos.filter(p => p.id !== id);
    onChange(updated);
  };

  // 사진 태그 변경 (전면/후면/내부/기타)
  const handleChangePhotoTag = (id: string, newTag: ProductPhotoTag) => {
    if (readOnly || !onChange) return;
    const updated = photos.map(p => {
      if (p.id === id) {
        return {
          ...p,
          tag: newTag,
          tagLabel: PRODUCT_PHOTO_TAG_LABELS[newTag]
        };
      }
      return p;
    });
    onChange(updated);
  };

  // 사진 캡션(설명) 변경
  const handleChangeCaption = (id: string, newCaption: string) => {
    if (readOnly || !onChange) return;
    const updated = photos.map(p => {
      if (p.id === id) {
        return { ...p, caption: newCaption };
      }
      return p;
    });
    onChange(updated);
  };

  // 태그별 컬러 스타일
  const getTagColor = (tag: string) => {
    switch (tag) {
      case 'FRONT':
        return { bg: 'rgba(37, 99, 235, 0.1)', text: '#2563eb', border: '#93c5fd' };
      case 'REAR':
        return { bg: 'rgba(71, 85, 105, 0.1)', text: '#475569', border: '#cbd5e1' };
      case 'INSIDE':
        return { bg: 'rgba(5, 150, 105, 0.1)', text: '#059669', border: '#a7f3d0' };
      case 'OTHER':
      default:
        return { bg: 'rgba(124, 58, 237, 0.1)', text: '#7c3aed', border: '#ddd6fe' };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* 숨겨진 파일 인풋 */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        style={{ display: 'none' }}
      />
      <input
        type="file"
        ref={multiFileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        multiple
        style={{ display: 'none' }}
      />

      {/* 헤더 및 등록 현황 카운터 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Camera size={14} className="text-primary" />
          <span style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: '12px' }}>
            사진 자료 (전면, 후면, 내부, 기타)
          </span>
          <span
            style={{
              padding: '1px 6px',
              borderRadius: '10px',
              fontSize: '10.5px',
              fontWeight: 700,
              backgroundColor: currentCount > 0 ? 'rgba(37, 99, 235, 0.1)' : 'var(--bg-app)',
              color: currentCount > 0 ? 'var(--primary)' : 'var(--text-muted)',
              border: '1px solid var(--border-color)'
            }}
          >
            {currentCount} / {maxPhotos}장
          </span>
        </div>

        {!readOnly && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {!isMaxReached && (
              <button
                type="button"
                className="btn-secondary"
                onClick={handleTriggerGeneralUpload}
                disabled={isProcessing}
                style={{
                  padding: '2px 8px',
                  fontSize: '11px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                {isProcessing ? (
                  <RefreshCw size={11} className="animate-spin" />
                ) : (
                  <Plus size={11} />
                )}
                사진 추가
              </button>
            )}
            {isMaxReached && (
              <span style={{ fontSize: '10.5px', color: 'var(--success)', fontWeight: 600 }}>
                최대 4장 등록 완료
              </span>
            )}
          </div>
        )}
      </div>

      {/* 4분할 슬롯 카드 그리드 (2x2 모바일 또는 4단 횡배치) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
          gap: '8px'
        }}
      >
        {/* 등록된 사진들 목록 */}
        {photos.map((photo, index) => {
          const tagStyle = getTagColor(photo.tag);
          const tagLabel = PRODUCT_PHOTO_TAG_LABELS[photo.tag as ProductPhotoTag] || photo.tagLabel || photo.tag;

          return (
            <div
              key={photo.id || index}
              style={{
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                backgroundColor: 'var(--bg-card)',
                overflow: 'hidden',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                position: 'relative'
              }}
            >
              {/* 이미지 썸네일 영역 */}
              <div
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingTop: '75%', // 4:3 비율
                  backgroundColor: '#000000',
                  cursor: 'pointer'
                }}
                onClick={() => handleOpenViewer(index)}
                title="클릭하여 확대 미리보기"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || tagLabel}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />

                {/* 태그 배지 오버레이 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    left: '4px',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 700,
                    backgroundColor: tagStyle.bg,
                    color: tagStyle.text,
                    border: `1px solid ${tagStyle.border}`,
                    backdropFilter: 'blur(2px)',
                    zIndex: 2
                  }}
                >
                  {tagLabel}
                </div>

                {/* 돋보기 오버레이 */}
                <div
                  style={{
                    position: 'absolute',
                    top: '4px',
                    right: '4px',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderRadius: '4px',
                    padding: '2px 4px',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    zIndex: 2
                  }}
                >
                  <ZoomIn size={11} />
                </div>
              </div>

              {/* 편집 컨트롤 바 (편집 모드 시) */}
              {!readOnly ? (
                <div
                  style={{
                    padding: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '4px',
                    backgroundColor: 'var(--bg-app)',
                    borderTop: '1px solid var(--border-color)'
                  }}
                >
                  {/* 태그 선택 및 삭제 버튼 */}
                  <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                    <select
                      value={photo.tag}
                      onChange={e => handleChangePhotoTag(photo.id, e.target.value as ProductPhotoTag)}
                      style={{
                        flex: 1,
                        padding: '2px 4px',
                        fontSize: '10.5px',
                        borderRadius: '3px',
                        border: '1px solid var(--border-color)',
                        backgroundColor: 'var(--bg-card)',
                        color: 'var(--text-main)',
                        fontWeight: 600
                      }}
                      title="사진 위치/구분 변경"
                    >
                      {PRODUCT_PHOTO_TAGS.map(t => (
                        <option key={t} value={t}>
                          {PRODUCT_PHOTO_TAG_LABELS[t]}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={e => handleDeletePhoto(photo.id, e)}
                      style={{
                        padding: '2px 5px',
                        borderRadius: '3px',
                        border: 'none',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="사진 삭제"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>

                  {/* 캡션 입력창 */}
                  <input
                    type="text"
                    placeholder="설명/특이사항"
                    value={photo.caption || ''}
                    onChange={e => handleChangeCaption(photo.id, e.target.value)}
                    style={{
                      width: '100%',
                      padding: '2px 4px',
                      fontSize: '10px',
                      borderRadius: '3px',
                      border: '1px solid var(--border-color)',
                      backgroundColor: 'var(--bg-card)',
                      color: 'var(--text-main)'
                    }}
                    title="사진 설명"
                  />
                </div>
              ) : (
                /* 읽기 전용 캡션 */
                photo.caption && (
                  <div
                    style={{
                      padding: '4px 6px',
                      fontSize: '10.5px',
                      color: 'var(--text-secondary)',
                      backgroundColor: 'var(--bg-app)',
                      borderTop: '1px solid var(--border-color)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}
                    title={photo.caption}
                  >
                    {photo.caption}
                  </div>
                )
              )}
            </div>
          );
        })}

        {/* 빈 슬롯 추천 추가 버튼 (최대 4장 미만일 때) */}
        {!readOnly &&
          PRODUCT_PHOTO_TAGS.map(tag => {
            // 이미 등록된 태그인지 확인
            const hasTag = photos.some(p => p.tag === tag);
            if (hasTag || currentCount >= maxPhotos) return null;

            const tagStyle = getTagColor(tag);
            const tagLabel = PRODUCT_PHOTO_TAG_LABELS[tag];

            return (
              <div
                key={`empty-${tag}`}
                onClick={() => handleTriggerUploadForTag(tag)}
                style={{
                  borderRadius: '6px',
                  border: '1px dashed var(--border-color)',
                  backgroundColor: 'var(--bg-app)',
                  padding: '12px 6px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  minHeight: '110px',
                  transition: 'all 0.15s'
                }}
                title={`${tagLabel} 사진 등록`}
              >
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: tagStyle.bg,
                    color: tagStyle.text,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Plus size={16} />
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: tagStyle.text }}>
                    {tagLabel} 등록
                  </div>
                  <div style={{ fontSize: '9.5px', color: 'var(--text-muted)' }}>
                    클릭하여 추가
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {/* 등록된 사진이 없고 읽기 전용인 경우 */}
      {readOnly && currentCount === 0 && (
        <div
          style={{
            padding: '16px',
            backgroundColor: 'var(--bg-app)',
            borderRadius: '6px',
            border: '1px dashed var(--border-color)',
            textAlign: 'center',
            color: 'var(--text-muted)',
            fontSize: '11.5px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '4px'
          }}
        >
          <Camera size={20} style={{ opacity: 0.4 }} />
          <span>등록된 제품 사진 자료가 없습니다. (최대 4장)</span>
        </div>
      )}

      {/* 라이트박스 뷰어 모달 */}
      <ProductPhotoViewerModal
        isOpen={viewerOpen}
        onClose={() => setViewerOpen(false)}
        photos={photos}
        initialIndex={viewerIndex}
        modelName={modelName}
      />
    </div>
  );
};
