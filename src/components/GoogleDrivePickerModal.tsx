import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { drive, DriveFile, DriveFolder } from '../services/drive';
import {
  Folder,
  File,
  ArrowLeft,
  Search,
  X,
  Check,
  Clipboard,
  Link,
  ChevronRight,
  FolderPlus,
  ExternalLink,
  FileText,
  Image as ImageIcon
} from 'lucide-react';

export interface GoogleDrivePickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (pathOrLink: string, item?: DriveFile | DriveFolder) => void;
  mode?: 'file' | 'folder' | 'both';
  title?: string;
  initialValue?: string;
  initialFolderId?: string;
}

export const GoogleDrivePickerModal: React.FC<GoogleDrivePickerModalProps> = ({
  isOpen,
  onClose,
  onSelect,
  mode = 'both',
  title = '구글 드라이브 스마트 탐색기',
  initialValue = '',
  initialFolderId
}) => {
  const { googleConfigs } = useApp();
  const defaultRoot = 'root';

  const [activeTab, setActiveTab] = useState<'browse' | 'url'>('browse');
  const [currentFolderId, setCurrentFolderId] = useState<string>(initialFolderId || 'root');

  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // URL 입력 탭 상태
  const [rawUrlInput, setRawUrlInput] = useState<string>(initialValue);
  const [urlPasteNotice, setUrlPasteNotice] = useState<string>('');

  // 현재 폴더의 하위 폴더 및 파일
  const [driveFolders, setDriveFolders] = useState<DriveFolder[]>([]);
  const [driveFiles, setDriveFiles] = useState<DriveFile[]>([]);

  useEffect(() => {
    if (isOpen) {
      if (!initialFolderId && defaultRoot && currentFolderId === 'root') {
        // 구글 연동 설정에 기본 루트 폴더가 설정되어 있으면 그 폴더부터 탐색 시작
        const targetId = defaultRoot.includes('/') ? defaultRoot.split('/').pop() || 'root' : defaultRoot;
        setCurrentFolderId(targetId);
      }
      loadCurrentFolderContent();
    }
  }, [isOpen, currentFolderId, defaultRoot]);

  const loadCurrentFolderContent = () => {
    try {
      const folders = drive.listFolders(currentFolderId);
      const files = drive.listFiles(currentFolderId);
      setDriveFolders(folders);
      setDriveFiles(files);
    } catch (e) {
      console.error('Failed to load drive content', e);
    }
  };

  // 브레드크럼(Breadcrumb) 경로 계산
  const breadcrumbs = useMemo(() => {
    const allFolders = drive.listFolders();
    const trail: DriveFolder[] = [];
    let curr: DriveFolder | undefined = allFolders.find(f => f.id === currentFolderId);
    
    while (curr) {
      trail.unshift(curr);
      if (curr.parentId && curr.parentId !== curr.id) {
        curr = allFolders.find(f => f.id === curr?.parentId);
      } else {
        break;
      }
    }
    return trail;
  }, [currentFolderId]);

  // 실시간 검색 필터링된 폴더 & 파일
  const filteredFolders = useMemo(() => {
    if (!searchQuery.trim()) return driveFolders;
    const q = searchQuery.toLowerCase();
    return driveFolders.filter(f => f.name.toLowerCase().includes(q));
  }, [driveFolders, searchQuery]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery.trim()) return driveFiles;
    const q = searchQuery.toLowerCase();
    return driveFiles.filter(f => f.name.toLowerCase().includes(q));
  }, [driveFiles, searchQuery]);

  // 구글 드라이브 복사 URL 정제 함수
  const cleanGoogleDriveUrl = (input: string): string => {
    let trimmed = input.trim();
    if (!trimmed) return '';

    // 구글 문서/드라이브 URL에서 파라미터 clean up
    // 예: https://docs.google.com/document/d/183zsUUNTpy5wF2.../edit?usp=drive_link... -> https://docs.google.com/document/d/183zsUUNTpy5wF2.../edit
    if (trimmed.includes('drive.google.com') || trimmed.includes('docs.google.com')) {
      try {
        const urlObj = new URL(trimmed);
        // ?usp=drive_link 등 지저분한 파라미터 중 필수 파라미터 외 정리
        return `${urlObj.origin}${urlObj.pathname}`;
      } catch (e) {
        return trimmed.split('?')[0]; // 단순 파싱 실패시 ? 전까지 잘라냄
      }
    }
    return trimmed;
  };

  const handleApplyUrlInput = () => {
    const cleaned = cleanGoogleDriveUrl(rawUrlInput);
    if (!cleaned) return;
    onSelect(cleaned);
    onClose();
  };

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRawUrlInput(text);
        const cleaned = cleanGoogleDriveUrl(text);
        if (cleaned !== text) {
          setUrlPasteNotice('✨ 복잡한 파라미터(?usp=drive_link...)가 깔끔하게 자동 정제되었습니다.');
        } else {
          setUrlPasteNotice('✓ 유효한 구글 드라이브 주소가 입력되었습니다.');
        }
      }
    } catch (err) {
      setUrlPasteNotice('⚠️ 클립보드 읽기 권한이 필요합니다. Ctrl+V로 직접 붙여넣어 주세요.');
    }
  };

  const handleSelectFolder = (folder: DriveFolder) => {
    // 폴더 선택
    const folderUrl = `https://drive.google.com/drive/folders/${folder.id}`;
    onSelect(folderUrl, folder);
    onClose();
  };

  const handleSelectCurrentFolder = () => {
    const allFolders = drive.listFolders();
    const current = allFolders.find(f => f.id === currentFolderId);
    const folderUrl = currentFolderId === 'root'
      ? 'https://drive.google.com/drive/my-drive'
      : `https://drive.google.com/drive/folders/${currentFolderId}`;
    onSelect(folderUrl, current);
    onClose();
  };

  const handleSelectFile = (file: DriveFile) => {
    onSelect(file.webViewLink || `https://drive.google.com/file/d/${file.id}/view`, file);
    onClose();
  };

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('pdf')) return <FileText size={18} style={{ color: '#ef4444' }} />;
    if (mimeType.includes('image')) return <ImageIcon size={18} style={{ color: '#3b82f6' }} />;
    return <File size={18} style={{ color: '#6b7280' }} />;
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '16px'
      }}
      onClick={onClose}
    >
      <div
        className="card"
        style={{
          width: '100%',
          maxWidth: '720px',
          maxHeight: '90vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: 'var(--bg-card)',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)'
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: 'var(--bg-sidebar)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <Folder size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '700', color: 'var(--text-main)' }}>
                {title}
              </h3>
              <p style={{ margin: 0, fontSize: '12px', color: 'var(--text-muted)' }}>
                구글 드라이브 내 파일/폴더를 쉽게 탐색하거나 웹 URL을 정제하여 입력하세요.
              </p>
            </div>
          </div>
          <button
            className="btn-secondary"
            onClick={onClose}
            style={{ padding: '6px', borderRadius: '50%', border: 'none' }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 탭 헤더 */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-app)' }}>
          <button
            type="button"
            onClick={() => setActiveTab('browse')}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13.5px',
              fontWeight: '600',
              border: 'none',
              borderBottom: activeTab === 'browse' ? '2px solid var(--primary)' : '2px solid transparent',
              backgroundColor: activeTab === 'browse' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'browse' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Folder size={15} /> 드라이브 내장 탐색
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('url')}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13.5px',
              fontWeight: '600',
              border: 'none',
              borderBottom: activeTab === 'url' ? '2px solid var(--primary)' : '2px solid transparent',
              backgroundColor: activeTab === 'url' ? 'var(--bg-card)' : 'transparent',
              color: activeTab === 'url' ? 'var(--primary)' : 'var(--text-muted)',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Link size={15} /> 웹 URL 스마트 정제 붙여넣기
          </button>
        </div>

        {/* 모달 바디 - 1. 드라이브 내장 탐색 탭 */}
        {activeTab === 'browse' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1, overflow: 'hidden' }}>
            {/* 검색창 & 내비게이션 바 */}
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div style={{ position: 'relative', flex: 1 }}>
                <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input
                  type="text"
                  placeholder="파일명 또는 폴더명 실시간 검색..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ width: '100%', paddingLeft: '32px', height: '34px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)', boxSizing: 'border-box' }}
                />
                {searchQuery && (
                  <X
                    size={13}
                    onClick={() => setSearchQuery('')}
                    style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: 'var(--text-muted)' }}
                  />
                )}
              </div>

              {(mode === 'folder' || mode === 'both') && (
                <button
                  type="button"
                  className="btn-success"
                  onClick={handleSelectCurrentFolder}
                  style={{ padding: '0 12px', height: '34px', fontSize: '12.5px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px', whiteSpace: 'nowrap' }}
                  title="현재 폴더 전체 주소를 선택합니다"
                >
                  <Check size={14} /> 현재 폴더 선택
                </button>
              )}
            </div>

            {/* 클릭 가능한 브레드크럼 (Breadcrumb) */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '12.5px',
                padding: '6px 10px',
                backgroundColor: 'var(--bg-app)',
                borderRadius: '6px',
                overflowX: 'auto',
                whiteSpace: 'nowrap'
              }}
            >
              <span style={{ color: 'var(--text-muted)', fontWeight: '600' }}>위치:</span>
              <span
                onClick={() => setCurrentFolderId('root')}
                style={{ cursor: 'pointer', color: currentFolderId === 'root' ? 'var(--primary)' : 'var(--text-main)', fontWeight: currentFolderId === 'root' ? 'bold' : 'normal' }}
              >
                루트
              </span>
              {breadcrumbs.map((b, idx) => (
                <React.Fragment key={b.id}>
                  <ChevronRight size={12} style={{ color: 'var(--text-muted)' }} />
                  <span
                    onClick={() => setCurrentFolderId(b.id)}
                    style={{
                      cursor: 'pointer',
                      color: b.id === currentFolderId ? 'var(--primary)' : 'var(--text-main)',
                      fontWeight: b.id === currentFolderId ? 'bold' : 'normal'
                    }}
                  >
                    {b.name}
                  </span>
                </React.Fragment>
              ))}
            </div>

            {/* 폴더 / 파일 파일 리스트 영역 */}
            <div style={{ flex: 1, minHeight: '260px', maxHeight: '340px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '6px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              
              {filteredFolders.length === 0 && filteredFiles.length === 0 && (
                <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '50px 0', fontSize: '13px' }}>
                  {searchQuery ? '🔍 검색 조건에 맞는 파일/폴더가 없습니다.' : '📭 이 폴더는 비어 있습니다.'}
                </div>
              )}

              {/* 폴더목록 */}
              {filteredFolders.map(folder => (
                <div
                  key={folder.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid transparent',
                    transition: 'background-color 0.15s ease'
                  }}
                >
                  <div
                    onClick={() => setCurrentFolderId(folder.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
                  >
                    <Folder size={18} style={{ color: '#f59e0b' }} />
                    <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-main)' }}>{folder.name}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)', backgroundColor: 'rgba(245,158,11,0.1)', padding: '1px 6px', borderRadius: '4px' }}>폴더</span>
                  </div>

                  {(mode === 'folder' || mode === 'both') && (
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => handleSelectFolder(folder)}
                      style={{ padding: '3px 8px', fontSize: '11.5px', whiteSpace: 'nowrap' }}
                    >
                      폴더 선택
                    </button>
                  )}
                </div>
              ))}

              {/* 파일목록 */}
              {filteredFiles.map(file => (
                <div
                  key={file.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    backgroundColor: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, minWidth: 0 }}>
                    {getFileIcon(file.mimeType)}
                    <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                      <span style={{ fontSize: '13px', fontWeight: '500', color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {file.name}
                      </span>
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {file.size} | {file.mimeType.split('/')[1] || 'file'}
                      </span>
                    </div>
                  </div>

                  {(mode === 'file' || mode === 'both') && (
                    <button
                      type="button"
                      className="btn-primary"
                      onClick={() => handleSelectFile(file)}
                      style={{ padding: '4px 10px', fontSize: '11.5px', whiteSpace: 'nowrap', marginLeft: '10px' }}
                    >
                      파일 선택
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 모달 바디 - 2. 웹 URL 스마트 정제 붙여넣기 탭 */}
        {activeTab === 'url' && (
          <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: 'rgba(59, 130, 246, 0.08)', padding: '12px 14px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)', fontSize: '12.5px', color: 'var(--text-main)' }}>
              💡 구글 드라이브 웹사이트 주소창이나 [링크 복사]로 복사해 온 복잡한 URL을 아래에 넣으면, 불필요한 파라미터(`?usp=drive_link...`)를 <strong>자동으로 정제</strong>하여 적용합니다.
            </div>

            <div>
              <label style={{ fontSize: '12px', fontWeight: 'bold', marginBottom: '6px', display: 'block' }}>
                구글 드라이브 URL / 링크 주소
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  type="text"
                  value={rawUrlInput}
                  onChange={e => {
                    setRawUrlInput(e.target.value);
                    setUrlPasteNotice('');
                  }}
                  placeholder="예: https://docs.google.com/document/d/.../edit?usp=drive_link..."
                  style={{ flex: 1, padding: '8px 12px', fontSize: '13px', borderRadius: '6px', border: '1px solid var(--border-color)' }}
                />
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePasteClipboard}
                  style={{ padding: '0 14px', fontSize: '12.5px', display: 'flex', alignItems: 'center', gap: '6px', whiteSpace: 'nowrap' }}
                >
                  <Clipboard size={14} /> 클립보드 붙여넣기
                </button>
              </div>
              {urlPasteNotice && (
                <div style={{ fontSize: '12px', marginTop: '6px', color: urlPasteNotice.startsWith('✨') || urlPasteNotice.startsWith('✓') ? 'var(--success)' : 'var(--warning)', fontWeight: '600' }}>
                  {urlPasteNotice}
                </div>
              )}
            </div>

            {/* 정제된 예시 미리보기 */}
            {rawUrlInput && (
              <div style={{ padding: '12px', backgroundColor: 'var(--bg-app)', borderRadius: '6px', fontSize: '12px' }}>
                <div style={{ color: 'var(--text-muted)', marginBottom: '4px', fontWeight: '600' }}>[정제 후 최종 입력될 URL 주소]</div>
                <div style={{ color: 'var(--primary)', fontWeight: 'bold', wordBreak: 'break-all', fontFamily: 'monospace' }}>
                  {cleanGoogleDriveUrl(rawUrlInput)}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '10px' }}>
              <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '8px 16px', fontSize: '13px' }}>
                취소
              </button>
              <button
                type="button"
                className="btn-primary"
                onClick={handleApplyUrlInput}
                disabled={!rawUrlInput.trim()}
                style={{ padding: '8px 20px', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Check size={15} /> 정제된 주소 적용
              </button>
            </div>
          </div>
        )}

        {/* 모달 푸터 */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', backgroundColor: 'var(--bg-sidebar)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
            선택 모드: <strong>{mode === 'file' ? '파일 전용' : mode === 'folder' ? '폴더 전용' : '파일 & 폴더'}</strong>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose} style={{ padding: '4px 12px', fontSize: '12px' }}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
