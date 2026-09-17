// src/services/bankParser.ts
import * as XLSX from 'xlsx';
import { BankTransaction } from './db';

export interface ParsedBankResult {
  bankName: string;
  accountNumber: string;
  transactions: BankTransaction[];
  totalRows: number;
}

/**
 * 엑셀 cell 값 문자열 변환 및 trim 헬퍼
 */
const cleanStr = (val: unknown): string => {
  if (val === null || val === undefined) return '';
  return String(val).trim();
};

/**
 * 원화 숫자 파싱 헬퍼 (쉼표, '원', 공백 제거)
 */
const parseNumber = (val: unknown): number => {
  if (val === null || val === undefined) return 0;
  if (typeof val === 'number') return isNaN(val) ? 0 : val;
  const cleaned = String(val).replace(/,/g, '').replace(/원/g, '').trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * 날짜 파싱 정규화 (YYYY-MM-DD HH:mm:ss 또는 YYYY.MM.DD 등)
 */
const normalizeDateStr = (val: unknown): string => {
  const s = cleanStr(val);
  if (!s) return '';

  // 엑셀 시리얼 날짜 수치인 경우
  if (typeof val === 'number') {
    const dateObj = XLSX.SSF.parse_date_code(val);
    if (dateObj) {
      const yyyy = dateObj.y;
      const mm = String(dateObj.m).padStart(2, '0');
      const dd = String(dateObj.d).padStart(2, '0');
      const hh = String(dateObj.H).padStart(2, '0');
      const min = String(dateObj.M).padStart(2, '0');
      const ss = String(dateObj.S).padStart(2, '0');
      return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
    }
  }

  // 문자열 날짜 정규화
  const replaced = s.replace(/\./g, '-').replace(/\//g, '-');
  if (/^\d{4}-\d{2}-\d{2}/.test(replaced)) {
    if (replaced.length === 10) {
      return `${replaced} 00:00:00`;
    }
    return replaced.substring(0, 19);
  }

  return s;
};

/**
 * 엑셀 헤더 동적 자동 감지 및 통장 입출금 내역 파서
 */
export const parseBankExcelFile = async (
  file: File,
  forcedBankName?: string
): Promise<ParsedBankResult> => {
  const data = await file.arrayBuffer();
  const workbook = XLSX.read(data, { type: 'array' });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];

  // Sheet를 2D 배열로 변환 ({ header: 1, raw: true })
  const rows: (unknown[])[] = XLSX.utils.sheet_to_json(sheet, { header: 1, raw: true });

  if (!rows || rows.length === 0) {
    throw new Error('엑셀 파일에 데이터가 존재하지 않습니다.');
  }

  // 1. 상단 메타데이터 수색 (은행명 및 계좌번호 추출)
  const fullTextUpper = rows.slice(0, 15).map(r => r.map(c => cleanStr(c)).join(' ')).join(' ');

  let detectedBank = forcedBankName || '통장거래';
  if (!forcedBankName) {
    if (fullTextUpper.includes('우리은행')) detectedBank = '우리은행';
    else if (fullTextUpper.includes('신한은행')) detectedBank = '신한은행';
    else if (fullTextUpper.includes('국민은행') || fullTextUpper.includes('KB')) detectedBank = 'KB국민은행';
    else if (fullTextUpper.includes('하나은행')) detectedBank = '하나은행';
    else if (fullTextUpper.includes('농협') || fullTextUpper.includes('NH')) detectedBank = 'NH농협은행';
    else if (fullTextUpper.includes('기업은행') || fullTextUpper.includes('IBK')) detectedBank = 'IBK기업은행';
  }

  let extractedAccount = '';
  const acctMatch = fullTextUpper.match(/(?:계좌번호|계좌|Account)\s*[:：]?\s*([0-9\-]{8,20})/i);
  if (acctMatch && acctMatch[1]) {
    extractedAccount = acctMatch[1];
  }

  // 2. 최적의 헤더 행(Header Row) 동적 파악
  let headerRowIndex = -1;
  const colMap = {
    date: -1,
    summary: -1,
    counterparty: -1,
    deposit: -1,
    withdraw: -1,
    balance: -1,
    branch: -1,
    memo: -1
  };

  for (let r = 0; r < Math.min(20, rows.length); r++) {
    const rowStrArr = rows[r].map(c => cleanStr(c));
    const rowJoined = rowStrArr.join(' ');

    // 날짜/일시 컬럼 존재 여부 확인
    const dateIdx = rowStrArr.findIndex(c => 
      c.includes('거래일시') || c.includes('거래일자') || c.includes('거래일') || c.includes('일시') || c === '날짜'
    );

    if (dateIdx !== -1) {
      headerRowIndex = r;
      colMap.date = dateIdx;

      // 각 필드 열 위치 동적 매핑
      rowStrArr.forEach((cellText, idx) => {
        if (cellText === '적요' || cellText.includes('거래구분')) {
          if (colMap.summary === -1) colMap.summary = idx;
        }
        if (cellText.includes('기재내용') || cellText === '내용' || cellText.includes('입금자') || cellText.includes('이체자') || cellText.includes('거래상대')) {
          if (colMap.counterparty === -1) colMap.counterparty = idx;
        }
        if (cellText.includes('입금') || cellText.includes('입금액') || cellText.includes('입금(원)')) {
          if (colMap.deposit === -1) colMap.deposit = idx;
        }
        if (cellText.includes('지급') || cellText.includes('출금') || cellText.includes('출금액') || cellText.includes('지급(원)')) {
          if (colMap.withdraw === -1) colMap.withdraw = idx;
        }
        if (cellText.includes('잔액') || cellText.includes('거래후 잔액') || cellText.includes('거래후잔액')) {
          if (colMap.balance === -1) colMap.balance = idx;
        }
        if (cellText.includes('취급점') || cellText.includes('거래점') || cellText.includes('거래점명')) {
          if (colMap.branch === -1) colMap.branch = idx;
        }
        if (cellText.includes('메모') || cellText.includes('비고')) {
          if (colMap.memo === -1) colMap.memo = idx;
        }
      });
      break;
    }
  }

  // 동적 감지 실패 시 기본 포맷 추정
  if (headerRowIndex === -1) {
    headerRowIndex = 0;
    colMap.date = 0;
    colMap.counterparty = 1;
    colMap.deposit = 2;
    colMap.withdraw = 3;
  }

  const transactions: BankTransaction[] = [];
  const nowStr = new Date().toISOString();

  // 3. 데이터 행 순회 파싱 및 정규화
  for (let r = headerRowIndex + 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;

    const firstCell = cleanStr(row[0]);
    // 합계/소계/안내 문구 제외
    if (firstCell.includes('총') || firstCell.includes('합계') || firstCell.includes('소계') || firstCell.includes('조회')) continue;

    const rawDate = colMap.date !== -1 ? row[colMap.date] : row[0];
    const txDateStr = normalizeDateStr(rawDate);
    if (!txDateStr || txDateStr === '-') continue;

    const summaryStr = colMap.summary !== -1 ? cleanStr(row[colMap.summary]) : '';
    const counterpartyStr = colMap.counterparty !== -1 ? cleanStr(row[colMap.counterparty]) : '';
    const depositVal = colMap.deposit !== -1 ? parseNumber(row[colMap.deposit]) : 0;
    const withdrawVal = colMap.withdraw !== -1 ? parseNumber(row[colMap.withdraw]) : 0;
    const balanceVal = colMap.balance !== -1 ? parseNumber(row[colMap.balance]) : 0;
    const branchStr = colMap.branch !== -1 ? cleanStr(row[colMap.branch]) : '';
    const memoStr = colMap.memo !== -1 ? cleanStr(row[colMap.memo]) : '';

    // 실질적 입금자명 결정
    const finalSenderName = counterpartyStr || summaryStr || '미기재';

    transactions.push({
      id: `tx-${Date.now()}-${r}-${Math.random().toString(36).substr(2, 5)}`,
      bankName: detectedBank,
      accountNumber: extractedAccount || `${detectedBank} 통장`,
      transactionDate: txDateStr,
      summary: summaryStr,
      counterparty: finalSenderName,
      senderName: finalSenderName,
      depositAmount: depositVal,
      withdrawAmount: withdrawVal,
      balance: balanceVal,
      branchName: branchStr,
      memo: memoStr,
      isDeposit: depositVal > 0,
      createdAt: nowStr
    });
  }

  return {
    bankName: detectedBank,
    accountNumber: extractedAccount,
    transactions,
    totalRows: transactions.length
  };
};
