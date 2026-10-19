// src/components/ProductPhotoViewerModal.tsx
// IT 제품 사진 전용 라이트박스 뷰어 모달 (전사 표준 헌장 준수)
import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight, ExternalLink, Download, Image as ImageIcon } from 'lucide-react';
import { ProductPhoto, PRODUCT_PHOTO_TAG_LABELS, ProductPhotoTag } from '../services/db';

export interface ProductPhotoViewerModalProps {
  isOpen: boolean;
  onClose: () => void;
  photos: ProductPhoto[];
  initialIndex?: number;
  modelName?: string;
}

export const ProductPhotoViewerModal: React.FC<ProductPhotoViewerModalProps> = ({
  isOpen,
  onClose,
  photos,
  initialIndex = 0,
  modelName = ''
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, photos.length - 1)));
    }
  }, [isOpen, initialIndex, photos.length]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowLeft') {
        setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, photos.length, onClose]);

  if (!isOpen || photos.length === 0) return null;

  const currentPhoto = photos[currentIndex] || photos[0];
  const tagKey = (currentPhoto.tag || 'FRONT') as ProductPhotoTag;
  const tagLabel = PRODUCT_PHOTO_TAG_LABELS[tagKey] || currentPhoto.tagLabel || currentPhoto.tag || '사진';

  // 태그별 배지 스타일
  const getTagBadgeStyle = (t: string) => {
    switch (t) {
      case 'FRONT':
        return { backgroundColor: '#2563eb', color: '#ffffff' };
      case 'REAR':
        return { backgroundColor: '#475569', color: '#ffffff' };
      case 'INSIDE':
        return { backgroundColor: '#059669', color: '#ffffff' };
      case 'OTHER':
      default:
        return { backgroundColor: '#7c3aed', color: '#ffffff' };
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.92)',
        zIndex: 2500,
        display: 'flex',
        flexDirection: 'column',
        backdropFilter: 'blur(4px)',
        userSelect: 'none'
      }}
      onClick={onClose}
    >
      {/* 상단 툴바 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '12px 20px',
          color: '#ffffff',
          backgroundColor: 'rgba(0, 0, 0, 0.4)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          flexShrink: 0
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <ImageIcon size={18} style={{ color: '#38bdf8' }} />
          <span style={{ fontSize: '15px', fontWeight: 700 }}>
            {modelName ? `[${modelName}]` : ''} 제품 사진
          </span>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
              fontWeight: 600,
              ...getTagBadgeStyle(tagKey)
            }}
          >
            {tagLabel}
          </span>
          <span style={{ fontSize: '12px', color: 'rgba(255,255,255,0.7)' }}>
            ({currentIndex + 1} / {photos.length})
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <a
            href={currentPhoto.url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              color: '#cbd5e1',
              textDecoration: 'none',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
              backgroundColor: 'rgba(255,255,255,0.08)'
            }}
            title="새 탭에서 원본 열기"
          >
            <ExternalLink size={13} /> 원본
          </a>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#ffffff',
              cursor: 'pointer',
              padding: '4px',
              display: 'flex',
              alignItems: 'center'
            }}
            title="닫기 (ESC)"
          >
            <X size={22} />
          </button>
        </div>
      </div>

      {/* 중앙 메인 뷰어 영역 */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          padding: '20px 60px',
          overflow: 'hidden'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 이전 버튼 */}
        {photos.length > 1 && (
          <button
            onClick={() => setCurrentIndex(prev => (prev > 0 ? prev - 1 : photos.length - 1))}
            style={{
              position: 'absolute',
              left: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              zIndex: 10
            }}
            title="이전 사진 (←)"
          >
            <ChevronLeft size={24} />
          </button>
        )}

        {/* 메인 이미지 */}
        <div
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <img
            src={currentPhoto.url}
            alt={currentPhoto.caption || tagLabel}
            style={{
              maxWidth: '88vw',
              maxHeight: '70vh',
              objectFit: 'contain',
              borderRadius: '6px',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              backgroundColor: '#000000'
            }}
          />

          {/* 캡션/설명 */}
          {currentPhoto.caption && (
            <div
              style={{
                marginTop: '12px',
                padding: '6px 14px',
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
                borderRadius: '6px',
                color: '#ffffff',
                fontSize: '13px',
                textAlign: 'center',
                maxWidth: '600px'
              }}
            >
              {currentPhoto.caption}
            </div>
          )}
        </div>

        {/* 다음 버튼 */}
        {photos.length > 1 && (
          <button
            onClick={() => setCurrentIndex(prev => (prev < photos.length - 1 ? prev + 1 : 0))}
            style={{
              position: 'absolute',
              right: '20px',
              top: '50%',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              borderRadius: '50%',
              width: '44px',
              height: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
              zIndex: 10
            }}
            title="다음 사진 (→)"
          >
            <ChevronRight size={24} />
          </button>
        )}
      </div>

      {/* 하단 썸네일 스트립 */}
      {photos.length > 1 && (
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 20px',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            flexShrink: 0
          }}
          onClick={e => e.stopPropagation()}
        >
          {photos.map((p, idx) => {
            const pTagKey = (p.tag || 'FRONT') as ProductPhotoTag;
            const pTagLabel = PRODUCT_PHOTO_TAG_LABELS[pTagKey] || p.tagLabel || p.tag || '사진';
            const isSelected = idx === currentIndex;

            return (
              <div
                key={p.id || idx}
                onClick={() => setCurrentIndex(idx)}
                style={{
                  position: 'relative',
                  width: '64px',
                  height: '48px',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: isSelected ? '2px solid #38bdf8' : '1px solid rgba(255,255,255,0.2)',
                  opacity: isSelected ? 1 : 0.6,
                  transition: 'all 0.15s'
                }}
              >
                <img
                  src={p.url}
                  alt={pTagLabel}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
                <span
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    fontSize: '9px',
                    textAlign: 'center',
                    backgroundColor: 'rgba(0,0,0,0.7)',
                    color: '#ffffff',
                    padding: '1px 0'
                  }}
                >
                  {pTagLabel}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
