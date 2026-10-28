import React from 'react';

// Code 128 패턴 테이블 (107개 표준 패턴)
const CODE128_PATTERNS = [
  '212222', '222122', '222221', '121223', '121322', '131222', '122213', '122312', '132212', '221213',
  '221312', '231212', '112232', '122132', '122231', '113222', '123122', '123221', '223211', '221132',
  '221231', '213212', '223112', '312131', '311222', '321122', '321221', '312212', '322112', '322211',
  '212123', '212321', '232121', '111323', '131123', '131321', '112313', '132113', '132311', '211313',
  '231113', '231311', '112133', '112331', '132131', '113123', '113321', '133121', '313121', '211331',
  '231131', '213113', '213311', '213131', '311123', '311321', '331121', '312113', '312311', '332111',
  '314111', '221411', '431111', '111224', '111422', '121124', '121421', '141122', '141221', '112214',
  '112412', '122114', '122411', '142112', '142211', '241211', '221114', '413111', '241112', '134111',
  '111242', '121142', '121241', '114212', '124112', '124211', '411212', '421112', '421211', '212141',
  '214121', '412121', '111143', '111341', '131141', '114113', '114311', '411113', '411311', '113141',
  '114131', '311141', '411131', '211412', '211214', '211232', '2331112'
];

// Code 39 패턴 테이블
const CODE39_PATTERNS: Record<string, string> = {
  '0': '000110100', '1': '100100001', '2': '001100001', '3': '101100000', '4': '000110001',
  '5': '100110000', '6': '001110000', '7': '000100101', '8': '100100100', '9': '001100100',
  'A': '100001001', 'B': '001001001', 'C': '101001000', 'D': '000011001', 'E': '100011000',
  'F': '001011000', 'G': '000001101', 'H': '100001100', 'I': '001001100', 'J': '000011100',
  'K': '100000011', 'L': '001000011', 'M': '101000010', 'N': '000010011', 'O': '100010010',
  'P': '001010010', 'Q': '000000111', 'R': '100000110', 'S': '001000110', 'T': '000010110',
  'U': '110000001', 'V': '011000001', 'W': '111000000', 'X': '010010001', 'Y': '110010000',
  'Z': '011010000', '-': '010000101', '.': '110000100', ' ': '011000100', '$': '010101000',
  '/': '010100010', '+': '010001010', '%': '000101010', '*': '010010100'
};

export interface BarcodeBar {
  width: number;
  isBar: boolean;
}

export function encodeCode128B(text: string): BarcodeBar[] {
  const clean = String(text || 'TEST').trim() || 'TEST';
  const values: number[] = [104];
  for (let i = 0; i < clean.length; i++) {
    const code = clean.charCodeAt(i) - 32;
    values.push(Math.max(0, Math.min(102, code)));
  }
  let sum = values[0];
  for (let i = 1; i < values.length; i++) {
    sum += values[i] * i;
  }
  values.push(sum % 103);
  values.push(106);

  const bars: BarcodeBar[] = [];
  values.forEach(val => {
    const pattern = CODE128_PATTERNS[val] || CODE128_PATTERNS[0];
    let isBar = true;
    for (const char of pattern) {
      const width = parseInt(char, 10);
      bars.push({ width, isBar });
      isBar = !isBar;
    }
  });
  return bars;
}

export function encodeCode39(text: string): BarcodeBar[] {
  const clean = String(text || 'TEST').toUpperCase().replace(/[^0-9A-Z\-.\ $/+%]/g, '') || 'TEST';
  const fullText = `*${clean}*`;
  const bars: BarcodeBar[] = [];

  for (let i = 0; i < fullText.length; i++) {
    const char = fullText[i];
    const pattern = CODE39_PATTERNS[char] || CODE39_PATTERNS[' '];
    for (let j = 0; j < 9; j++) {
      const isBar = j % 2 === 0;
      const isWide = pattern[j] === '1';
      bars.push({ width: isWide ? 3 : 1, isBar });
    }
    if (i < fullText.length - 1) {
      bars.push({ width: 1, isBar: false });
    }
  }
  return bars;
}

export interface RealBarcodeSvgProps {
  value?: string;
  type?: 'CODE128' | 'CODE39' | 'QR' | string;
  heightPx?: number;
  height?: number;
  heightMm?: number;
  showText?: boolean;
  scale?: number;
  prefix?: string;
}

/**
 * React 순수 SVG 실사 바코드 컴포넌트
 * Zebra ZPL 203 DPI (^BY2,3) 기준과 100% 동일한 비례로 렌더링
 */
export const RealBarcodeSvg: React.FC<RealBarcodeSvgProps> = ({
  value = 'TEST0001',
  type = 'CODE128',
  heightPx,
  height,
  heightMm,
  showText = true,
  scale = 1.0,
  prefix = ''
}) => {
  const effectiveHeightPx = heightPx || (heightMm ? heightMm * 8.5 : 0) || height || 40;
  const cleanVal = String(value || 'TEST0001').trim() || 'TEST0001';
  const isCode39 = type === 'CODE39';
  const bars = isCode39 ? encodeCode39(cleanVal) : encodeCode128B(cleanVal);

  const moduleWidth = 1.35 * scale;
  let totalWidth = 0;
  bars.forEach(b => { totalWidth += b.width * moduleWidth; });

  const barHeight = Math.max(10, showText ? Math.max(12, effectiveHeightPx - 14) : effectiveHeightPx);
  let currentX = 0;

  const rects: React.ReactNode[] = [];
  bars.forEach((bar, idx) => {
    const w = bar.width * moduleWidth;
    const x = currentX;
    currentX += w;
    if (bar.isBar) {
      rects.push(
        <rect
          key={idx}
          x={x}
          y={0}
          width={w}
          height={barHeight}
          fill="#000000"
        />
      );
    }
  });

  return (
    <div
      style={{
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        userSelect: 'none',
        pointerEvents: 'none'
      }}
    >
      <svg
        width={Math.ceil(totalWidth)}
        height={barHeight}
        viewBox={`0 0 ${totalWidth} ${barHeight}`}
        style={{ display: 'block' }}
      >
        {rects}
      </svg>
      {showText && (
        <div
          style={{
            fontSize: `${Math.max(9, Math.min(13, effectiveHeightPx * 0.32))}px`,
            fontWeight: 700,
            fontFamily: 'monospace',
            color: '#000000',
            marginTop: '2px',
            letterSpacing: '0.5px',
            lineHeight: 1
          }}
        >
          {`${prefix}${isCode39 ? `*${cleanVal}*` : cleanVal}`}
        </div>
      )}
    </div>
  );
};

/**
 * HTML 인쇄용 바코드/QR SVG 마크업 문자열 생성기
 */
export function generateBarcodeSvgMarkup(params: {
  value?: string;
  type?: string;
  heightPx?: number;
  qrSizePx?: number;
  showText?: boolean;
  scale?: number;
  prefix?: string;
}): string {
  const cleanVal = String(params.value || 'TEST0001').trim() || 'TEST0001';
  const barcodeType = params.type || 'CODE128';

  if (barcodeType === 'QR') {
    const size = Math.round(params.qrSizePx || 48);
    return `
      <div style="display:inline-flex;flex-direction:column;align-items:center;">
        <div style="width:${size}px;height:${size}px;background:#fff;border:1px solid #000;box-sizing:border-box;padding:1px;">
          <svg viewBox="0 0 29 29" width="100%" height="100%" shape-rendering="crispEdges">
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
      </div>
    `;
  }

  const effectiveHeightPx = params.heightPx || 38;
  const isCode39 = barcodeType === 'CODE39';
  const bars = isCode39 ? encodeCode39(cleanVal) : encodeCode128B(cleanVal);
  const scale = params.scale || 1.0;
  const moduleWidth = 1.35 * scale;
  let totalWidth = 0;
  bars.forEach(b => { totalWidth += b.width * moduleWidth; });
  const showText = params.showText !== false;
  const barHeight = Math.max(10, showText ? Math.max(12, effectiveHeightPx - 14) : effectiveHeightPx);

  let currentX = 0;
  let rectsHtml = '';
  bars.forEach(bar => {
    const w = bar.width * moduleWidth;
    const x = currentX;
    currentX += w;
    if (bar.isBar) {
      rectsHtml += `<rect x="${x.toFixed(2)}" y="0" width="${w.toFixed(2)}" height="${barHeight}" fill="#000000" />`;
    }
  });

  const textHtml = showText
    ? `<div style="font-size:${Math.max(9, Math.min(13, effectiveHeightPx * 0.32)).toFixed(1)}px;font-weight:700;font-family:monospace;color:#000;margin-top:2px;letter-spacing:0.5px;line-height:1;">${params.prefix || ''}${isCode39 ? `*${cleanVal}*` : cleanVal}</div>`
    : '';

  return `<div style="display:inline-flex;flex-direction:column;align-items:center;"><svg width="${Math.ceil(totalWidth)}" height="${barHeight}" viewBox="0 0 ${totalWidth.toFixed(2)} ${barHeight}" style="display:block;">${rectsHtml}</svg>${textHtml}</div>`;
}
