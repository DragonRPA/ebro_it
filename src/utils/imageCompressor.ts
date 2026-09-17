// src/utils/imageCompressor.ts
/**
 * 모바일 고해상도 사진(삼성 S24 등 200MP급) OOM 방지 압축 유틸리티
 *
 * [핵심 원칙]
 * - new Image() + drawImage() 방식: 원본 전체를 GPU 텍스처로 디코딩 → 수백 MB 스파이크 → OOM
 * - createImageBitmap({resizeWidth, resizeHeight}): OS 네이티브 리사이즈 후 전달 → 메모리 최소화
 * - 파일 크기 사전 차단: 20MB 초과는 압축 시도 자체 불가로 안내
 */

const MAX_FILE_BYTES = 20 * 1024 * 1024; // 20MB 초과 시 안내
const TARGET_WIDTH = 800;
const TARGET_HEIGHT = 800;
const JPEG_QUALITY = 0.6;

/**
 * createImageBitmap 기반 메모리 안전 압축 (주 경로)
 */
async function compressWithImageBitmap(file: File): Promise<string> {
  const blob = file as Blob;

  // 1단계: OS Native 리사이즈 (GPU에 원본 올리지 않고 작게 리샘플)
  const bitmap = await createImageBitmap(blob, {
    resizeWidth: TARGET_WIDTH,
    resizeHeight: TARGET_HEIGHT,
    resizeQuality: 'medium',
  });

  // 2단계: 소형 Canvas에만 그리기 (800×800 이하)
  const canvas = document.createElement('canvas');
  canvas.width = bitmap.width;
  canvas.height = bitmap.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) {
    bitmap.close();
    canvas.width = 0;
    canvas.height = 0;
    return '';
  }

  ctx.drawImage(bitmap, 0, 0);
  bitmap.close(); // GPU 텍스처 즉시 해제

  const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

  // Canvas GPU 메모리 즉시 해제
  canvas.width = 0;
  canvas.height = 0;

  return dataUrl;
}

/**
 * createImageBitmap 미지원 구형 브라우저 폴백 (BlobURL + Image 방식)
 */
function compressWithImageElement(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const blobUrl = URL.createObjectURL(file);
    const img = new Image();
    img.src = blobUrl;
    img.onload = () => {
      URL.revokeObjectURL(blobUrl);

      let width = img.width;
      let height = img.height;

      if (width > TARGET_WIDTH || height > TARGET_HEIGHT) {
        if (width > height) {
          height = Math.round((height * TARGET_WIDTH) / width);
          width = TARGET_WIDTH;
        } else {
          width = Math.round((width * TARGET_HEIGHT) / height);
          height = TARGET_HEIGHT;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        img.src = '';
        canvas.width = 0;
        canvas.height = 0;
        resolve('');
        return;
      }

      ctx.drawImage(img, 0, 0, width, height);
      const dataUrl = canvas.toDataURL('image/jpeg', JPEG_QUALITY);

      canvas.width = 0;
      canvas.height = 0;
      img.src = '';

      resolve(dataUrl);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(blobUrl);
      img.src = '';
      reject(err);
    };
  });
}

/**
 * 메인 압축 함수 - createImageBitmap 우선, 폴백은 Image 방식
 */
export async function compressImageFile(
  file: File,
  _maxWidth?: number,
  _maxHeight?: number,
  _quality?: number
): Promise<string> {
  // 파일 크기 사전 차단
  if (file.size > MAX_FILE_BYTES) {
    throw new Error(
      `파일이 너무 큽니다 (${(file.size / 1024 / 1024).toFixed(1)}MB).\n` +
      `카메라 해상도를 낮추거나, 기본 카메라 앱에서 촬영 후 갤러리에서 선택해 주세요.`
    );
  }

  if (typeof createImageBitmap === 'function') {
    return compressWithImageBitmap(file);
  } else {
    return compressWithImageElement(file);
  }
}

export interface CompressedResult {
  file: File;
  base64: string;
  mimeType: string;
  isCompressed: boolean;
  originalSize: number;
  compressedSize: number;
}

/**
 * Consumables.tsx 호환용 File ➔ CompressedResult 반환 압축 헬퍼
 */
export async function compressFileIfNeeded(file: File, maxMB: number = 1): Promise<CompressedResult> {
  if (!file.type.startsWith('image/')) {
    const reader = new FileReader();
    const base64 = await new Promise<string>((resolve) => {
      reader.onload = (e) => resolve(e.target?.result as string || '');
      reader.readAsDataURL(file);
    });
    return {
      file,
      base64,
      mimeType: file.type || 'application/octet-stream',
      isCompressed: false,
      originalSize: file.size,
      compressedSize: file.size
    };
  }

  const dataUrl = await compressImageFile(file);
  const response = await fetch(dataUrl);
  const blob = await response.blob();
  const compressedFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", { type: 'image/jpeg' });

  return {
    file: compressedFile,
    base64: dataUrl,
    mimeType: 'image/jpeg',
    isCompressed: compressedFile.size < file.size,
    originalSize: file.size,
    compressedSize: compressedFile.size
  };
}
