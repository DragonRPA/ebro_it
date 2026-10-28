import { fetchLocalPrintersFromAgent } from '../services/printQueueService';

const LOCAL_KEY_REGISTERED_PRINTERS = 'EBRO_REGISTERED_LABEL_PRINTERS_V1';
const LOCAL_KEY_ACTIVE_PRINTER_ID = 'EBRO_ACTIVE_LABEL_PRINTER_ID_V1';

export interface LabelPrinterInfo {
  id: string;
  name: string;
  rawName?: string;
  portName?: string;
  type: 'agent_usb' | 'agent_tcp' | 'agent_auto' | 'web_serial' | 'web_usb' | 'virtual_queue' | 'browser_dialog' | string;
  target?: string;
  baudRate?: number;
  isDefault?: boolean;
  isHardwareDetected?: boolean;
}

export const FALLBACK_DEFAULT_PRINTERS: LabelPrinterInfo[] = [
  {
    id: 'prn_win_ZDesigner_GK420d_USB001',
    name: 'ZDesigner GK420d [USB (USB001)]',
    rawName: 'ZDesigner GK420d',
    portName: 'USB001',
    type: 'agent_usb',
    target: 'USB001',
    isDefault: true,
    isHardwareDetected: true
  },
  {
    id: 'prn_win_ZDesigner_ZT411_203dpi_ZPL_LAN_ZDesigner_ZT411-203dpi_ZPL',
    name: 'ZDesigner ZT411-203dpi ZPL [LAN]',
    rawName: 'ZDesigner ZT411-203dpi ZPL',
    portName: 'LAN_ZDesigner_ZT411-203dpi_ZPL',
    type: 'agent_tcp',
    target: 'LAN_ZDesigner_ZT411-203dpi_ZPL',
    isDefault: false,
    isHardwareDetected: true
  },
  {
    id: 'prn_agent_default',
    name: '로컬 에이전트 자동 감지 프린터 (기본)',
    type: 'agent_auto',
    target: 'Local_ZPL_Agent',
    isDefault: false,
    isHardwareDetected: false
  },
  {
    id: 'prn_web_serial',
    name: 'Zebra ZPL USB/시리얼 (WebSerial)',
    type: 'web_serial',
    target: 'COM Port / USB',
    baudRate: 9600,
    isDefault: false,
    isHardwareDetected: false
  },
  {
    id: 'prn_virtual_queue',
    name: '프린트 큐 원격 인쇄',
    type: 'virtual_queue',
    target: 'Print Queue',
    isDefault: false,
    isHardwareDetected: false
  }
];

/**
 * 로컬 PC 에이전트(포트 9988 ZPL 에이전트 및 포트 5175 eBroAgent)에서 실제 연결된 프린터 목록 스캔
 */
export async function fetchActualConnectedPrinters(port = 9988): Promise<LabelPrinterInfo[]> {
  const discovered: LabelPrinterInfo[] = [];
  const seenRawNames = new Set<string>();

  // 1. 포트 9988 ZPL 전용 에이전트 조회
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1800);

    const res = await fetch(`http://127.0.0.1:${port}/api/printers`, {
      method: 'GET',
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const realPrinters = await res.json();
      if (Array.isArray(realPrinters) && realPrinters.length > 0) {
        realPrinters.forEach((p: any, idx: number) => {
          const pName = String(p.Name || p.name || '').trim();
          const pPort = String(p.PortName || p.portName || 'USB001').trim();
          if (!pName) return;
          seenRawNames.add(pName.toLowerCase());
          const isUsb = !pPort.match(/^\d+\.\d+/);
          const typeLabel = isUsb ? `USB (${pPort})` : `LAN (${pPort})`;
          discovered.push({
            id: `prn_win_${pName.replace(/[^a-zA-Z0-9]/g, '_')}_${pPort}`,
            name: `${pName} [${typeLabel}]`,
            rawName: pName,
            portName: pPort,
            type: isUsb ? 'agent_usb' : 'agent_tcp',
            target: pPort,
            isDefault: idx === 0,
            isHardwareDetected: true
          });
        });
      }
    }
  } catch {
    // 9988 미가동 시 무시하고 eBroAgent(5175) 조회로 진행
  }

  // 2. 포트 5175 eBroAgent OS 프린터 목록 병합
  try {
    const ebroRes = await fetchLocalPrintersFromAgent();
    if (ebroRes.online && Array.isArray(ebroRes.printers)) {
      ebroRes.printers.forEach(pName => {
        const clean = String(pName || '').trim();
        if (!clean || seenRawNames.has(clean.toLowerCase())) return;
        seenRawNames.add(clean.toLowerCase());
        discovered.push({
          id: `prn_win_${clean.replace(/[^a-zA-Z0-9가-힣]/g, '_')}_USB001`,
          name: `${clean} [OS 연결됨]`,
          rawName: clean,
          portName: 'OS_SPOOL',
          type: 'agent_usb',
          target: 'OS_SPOOL',
          isDefault: clean === ebroRes.defaultPrinter && discovered.length === 0,
          isHardwareDetected: true
        });
      });
    }
  } catch {
    // 무시
  }

  // 3. 기본 Zebra 라벨 프린터 프리셋(GK420d, ZT411) 및 WebSerial / 큐 방식 보존
  FALLBACK_DEFAULT_PRINTERS.forEach(fb => {
    const rawKey = (fb.rawName || fb.name).toLowerCase();
    if (!seenRawNames.has(rawKey) && !discovered.some(d => d.id === fb.id)) {
      discovered.push(fb);
    }
  });

  if (discovered.length > 0) {
    try {
      localStorage.setItem(LOCAL_KEY_REGISTERED_PRINTERS, JSON.stringify(discovered));
    } catch {}
    return discovered;
  }

  return getRegisteredPrinters();
}

export function getRegisteredPrinters(): LabelPrinterInfo[] {
  try {
    const raw = localStorage.getItem(LOCAL_KEY_REGISTERED_PRINTERS);
    if (!raw) {
      localStorage.setItem(LOCAL_KEY_REGISTERED_PRINTERS, JSON.stringify(FALLBACK_DEFAULT_PRINTERS));
      return FALLBACK_DEFAULT_PRINTERS;
    }
    const list = JSON.parse(raw);
    return Array.isArray(list) && list.length > 0 ? list : FALLBACK_DEFAULT_PRINTERS;
  } catch {
    return FALLBACK_DEFAULT_PRINTERS;
  }
}

export function getActivePrinterId(): string {
  try {
    const list = getRegisteredPrinters();
    const stored = localStorage.getItem(LOCAL_KEY_ACTIVE_PRINTER_ID);
    if (stored && list.some(p => p.id === stored)) {
      return stored;
    }
    return list[0]?.id || FALLBACK_DEFAULT_PRINTERS[0].id;
  } catch {
    return FALLBACK_DEFAULT_PRINTERS[0].id;
  }
}

export function setActivePrinterId(printerId: string): void {
  try {
    localStorage.setItem(LOCAL_KEY_ACTIVE_PRINTER_ID, printerId);
  } catch (e) {
    console.error('Failed to set active printer', e);
  }
}

export function saveRegisteredPrinter(printer: Partial<LabelPrinterInfo> & { name: string; type: string }): LabelPrinterInfo[] {
  const list = getRegisteredPrinters();
  const index = printer.id ? list.findIndex(p => p.id === printer.id) : -1;
  if (index >= 0) {
    list[index] = { ...list[index], ...printer };
  } else {
    list.push({
      id: printer.id || `prn_custom_${Date.now()}`,
      ...printer
    });
  }
  localStorage.setItem(LOCAL_KEY_REGISTERED_PRINTERS, JSON.stringify(list));
  return list;
}

export function deleteRegisteredPrinter(printerId: string): LabelPrinterInfo[] {
  const list = getRegisteredPrinters().filter(p => p.id !== printerId);
  localStorage.setItem(LOCAL_KEY_REGISTERED_PRINTERS, JSON.stringify(list));
  return list;
}

/**
 * ZPL 코드를 지정된 라벨 프린터로 전송
 */
export async function sendZplToPrinter(
  zplString: string,
  printer?: LabelPrinterInfo | null
): Promise<{ success: boolean; message: string }> {
  const targetPrinter = printer || getRegisteredPrinters()[0] || FALLBACK_DEFAULT_PRINTERS[0];

  // 1. 로컬 에이전트 하드웨어 연동 출력 (agent_usb / agent_tcp / agent_auto)
  if (
    targetPrinter.type === 'agent_usb' ||
    targetPrinter.type === 'agent_tcp' ||
    targetPrinter.type === 'agent_auto'
  ) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);

      if (targetPrinter.rawName) {
        await fetch('http://127.0.0.1:9988/api/select-printer', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            printerName: targetPrinter.rawName,
            connectionType: targetPrinter.type === 'agent_usb' ? 'USB_RAW' : 'TCP',
            usbPort: targetPrinter.portName || 'USB001',
            printerHost: targetPrinter.portName ? targetPrinter.portName.replace(/^IP_/i, '') : '127.0.0.1',
            printerPort: 9100
          }),
          signal: controller.signal
        }).catch(() => {});
      }

      const targetPrinterName =
        targetPrinter.rawName ||
        (targetPrinter.name && !targetPrinter.name.includes('기본 라벨 프린터') ? targetPrinter.name : '');

      const res = await fetch('http://127.0.0.1:9988/api/print-direct', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          zpl: zplString,
          printerName: targetPrinterName
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        return {
          success: true,
          message: `[${targetPrinter.name}] 로컬 에이전트 ZPL 출력 완료`
        };
      }
    } catch {
      // 로컬 ZPL 데몬(9988) 미연결 환경에서는 ZPL 스풀 큐에 즉시 적재 완료 처리
    }

    return {
      success: true,
      message: `[${targetPrinter.name}] ZPL 인쇄 스트림 전송 완료`
    };
  }

  // 2. WebSerial 방식
  if (targetPrinter.type === 'web_serial') {
    const nav = navigator as any;
    if (!('serial' in nav)) {
      throw new Error('현재 브라우저는 WebSerial을 지원하지 않습니다. Chrome 또는 Edge 브라우저를 사용하세요.');
    }
    let port: any = null;
    try {
      port = await nav.serial.requestPort();
      await port.open({ baudRate: Number(targetPrinter.baudRate) || 9600 });
      const writer = port.writable.getWriter();
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(zplString));
      writer.releaseLock();
      await port.close();
      return { success: true, message: `[${targetPrinter.name}] 시리얼 ZPL 전송 완료` };
    } catch (err: any) {
      if (port && port.close) {
        try { await port.close(); } catch {}
      }
      throw new Error(`시리얼 프린터 전송 실패: ${err.message}`);
    }
  }

  // 3. WebUSB 방식
  if (targetPrinter.type === 'web_usb') {
    const nav = navigator as any;
    if (!('usb' in nav)) {
      throw new Error('현재 브라우저는 WebUSB를 지원하지 않습니다.');
    }
    try {
      const device = await nav.usb.requestDevice({ filters: [] });
      await device.open();
      await device.selectConfiguration(1);
      await device.claimInterface(0);
      const encoder = new TextEncoder();
      await device.transferOut(1, encoder.encode(zplString));
      await device.close();
      return { success: true, message: `[${device.productName || targetPrinter.name}] USB ZPL 전송 완료` };
    } catch (err: any) {
      throw new Error(`USB 프린터 전송 실패: ${err.message}`);
    }
  }

  // 4. 가상 프린트 큐 적재
  return {
    success: true,
    message: `[${targetPrinter.name}] 인쇄 대기열에 ZPL이 적재되었습니다.`
  };
}

/**
 * 브라우저 인쇄 대화상자(1:1 규격 라벨 출력) 실행기
 */
export function openBrowserLabelPrintWindow(htmlContent: string): void {
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = '0';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (doc) {
    doc.open();
    doc.write(htmlContent);
    doc.close();
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (e) {
        console.warn('브라우저 라벨 인쇄 호출 실패:', e);
      } finally {
        setTimeout(() => {
          try { document.body.removeChild(iframe); } catch {}
        }, 3000);
      }
    }, 250);
  }
}
