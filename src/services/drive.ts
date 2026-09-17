// d:\Kiyeun_Lift\src\services\drive.ts

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size: string;
  folderId: string;
  webViewLink: string;
  createdAt: string;
}

export interface DriveFolder {
  id: string;
  name: string;
  parentId?: string;
  createdAt: string;
}

const SEED_FOLDERS: DriveFolder[] = [
  { id: 'root', name: '렌탈ERP_구글드라이브_루트', createdAt: new Date().toISOString() },
  { id: 'folder-hdec-123', name: '현대건설(주)_업무폴더', parentId: 'root', createdAt: new Date().toISOString() },
  { id: 'folder-samsung-456', name: '삼성물산(주)_업무폴더', parentId: 'root', createdAt: new Date().toISOString() },
  { id: 'folder-ct-001', name: '계약_CT-260301-001_첨부', parentId: 'folder-hdec-123', createdAt: new Date().toISOString() },
  { id: 'folder-ct-002', name: '계약_CT-260510-002_첨부', parentId: 'folder-samsung-456', createdAt: new Date().toISOString() }
];

const SEED_FILES: DriveFile[] = [
  {
    id: 'f-1', name: '2026년도_임대계약서_날인본.pdf', mimeType: 'application/pdf', size: '1.2 MB',
    folderId: 'folder-ct-001', webViewLink: 'https://drive.google.com/mock/file/1', createdAt: new Date().toISOString()
  },
  {
    id: 'f-2', name: '장비인수도증.jpg', mimeType: 'image/jpeg', size: '850 KB',
    folderId: 'folder-ct-001', webViewLink: 'https://drive.google.com/mock/file/2', createdAt: new Date().toISOString()
  },
  {
    id: 'f-3', name: '사업자등록증_현대건설.pdf', mimeType: 'application/pdf', size: '420 KB',
    folderId: 'folder-hdec-123', webViewLink: 'https://drive.google.com/mock/file/3', createdAt: new Date().toISOString()
  },
  {
    id: 'f-4', name: '임대차계약서_삼성물산.pdf', mimeType: 'application/pdf', size: '1.5 MB',
    folderId: 'folder-ct-002', webViewLink: 'https://drive.google.com/mock/file/4', createdAt: new Date().toISOString()
  },
  {
    id: 'f-5', name: '고소작업대_안전점검표_공용.pdf', mimeType: 'application/pdf', size: '250 KB',
    folderId: 'root', webViewLink: 'https://drive.google.com/mock/file/5', createdAt: new Date().toISOString()
  }
];

class MockGoogleDrive {
  private getFolders(): DriveFolder[] {
    const val = localStorage.getItem('drive_folders');
    if (!val) {
      localStorage.setItem('drive_folders', JSON.stringify(SEED_FOLDERS));
      return SEED_FOLDERS;
    }
    return JSON.parse(val);
  }

  private setFolders(data: DriveFolder[]) {
    localStorage.setItem('drive_folders', JSON.stringify(data));
  }

  private getFiles(): DriveFile[] {
    const val = localStorage.getItem('drive_files');
    if (!val) {
      localStorage.setItem('drive_files', JSON.stringify(SEED_FILES));
      return SEED_FILES;
    }
    return JSON.parse(val);
  }

  private setFiles(data: DriveFile[]) {
    localStorage.setItem('drive_files', JSON.stringify(data));
  }

  // 폴더 생성
  createFolder(name: string, parentId: string = 'root'): DriveFolder {
    const folders = this.getFolders();
    const id = `folder-${Math.random().toString(36).substr(2, 9)}`;
    const newFolder: DriveFolder = {
      id,
      name,
      parentId,
      createdAt: new Date().toISOString()
    };
    folders.push(newFolder);
    this.setFolders(folders);
    return newFolder;
  }

  // 폴더 목록 조회
  listFolders(parentId?: string): DriveFolder[] {
    const folders = this.getFolders();
    if (!parentId) return folders;
    return folders.filter(f => f.parentId === parentId);
  }

  // 특정 폴더의 파일 조회
  listFiles(folderId: string): DriveFile[] {
    const files = this.getFiles();
    return files.filter(f => f.folderId === folderId);
  }

  // 전체 파일 조회 (공용 파일 선택 등)
  listAllFiles(): DriveFile[] {
    return this.getFiles();
  }

  // 파일 업로드
  uploadFile(name: string, mimeType: string, size: string, folderId: string, customLink?: string): DriveFile {
    const files = this.getFiles();
    const id = `file-${Math.random().toString(36).substr(2, 9)}`;
    const newFile: DriveFile = {
      id,
      name,
      mimeType,
      size,
      folderId,
      webViewLink: customLink || `https://drive.google.com/mock/file/${id}`,
      createdAt: new Date().toISOString()
    };
    files.push(newFile);
    this.setFiles(files);
    return newFile;
  }

  // 파일 삭제
  deleteFile(id: string): boolean {
    const files = this.getFiles();
    const filtered = files.filter(f => f.id !== id);
    if (filtered.length === files.length) return false;
    this.setFiles(filtered);
    return true;
  }
}

export const drive = new MockGoogleDrive();
